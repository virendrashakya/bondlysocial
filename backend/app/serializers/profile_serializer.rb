class ProfileSerializer
  include JSONAPI::Serializer

  attributes :name, :age, :gender, :city, :occupation, :bio, :intent, :interests, :hidden

  # Extended attributes (always visible)
  attributes :cultural_background, :cultural_background_custom,
             :languages_spoken, :appearance_tags,
             :drinking, :smoking, :workout_frequency, :relationship_status,
             :show_height, :show_body_type, :show_online_status

  attribute :avatar_url do |profile|
    profile.avatar_url
  end

  attribute :verified do |profile|
    profile.user.verified?
  end

  attribute :intent_label do |profile|
    profile.intent.humanize
  end

  attribute :last_seen_at do |profile|
    profile.user.last_active_at&.iso8601
  end

  attribute :match_score do |profile, params|
    next nil unless params && params[:current_user]
    MatchScoreService.call(params[:current_user], profile)
  end

  # Privacy-aware: respect show_height flag
  attribute :height_cm do |profile, params|
    current_user = params&.dig(:current_user)
    # Owner always sees their own height
    if current_user && profile.user_id == current_user.id
      profile.height_cm
    else
      profile.visible_height
    end
  end

  # Privacy-aware: respect show_body_type flag
  attribute :body_type do |profile, params|
    current_user = params&.dig(:current_user)
    if current_user && profile.user_id == current_user.id
      profile.body_type
    else
      profile.visible_body_type
    end
  end

  # Privacy-aware: respect religion_visibility
  attribute :religion do |profile, params|
    current_user = params&.dig(:current_user)
    if current_user && profile.user_id == current_user.id
      profile.religion
    elsif profile.religion_visibility == "hidden"
      nil
    else
      profile.religion
    end
  end

  attribute :religion_visibility do |profile|
    profile.religion_visibility
  end
end
