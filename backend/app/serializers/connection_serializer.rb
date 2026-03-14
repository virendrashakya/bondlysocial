class ConnectionSerializer
  include JSONAPI::Serializer

  attributes :status, :created_at

  attribute :other_user do |connection, params|
    current_user = params[:current_user]
    other        = connection.other_participant(current_user)
    profile      = other&.profile
    next nil unless profile

    {
      user_id:    other.id,
      name:       profile.name,
      city:       profile.city,
      intent:     profile.intent,
      avatar_url: profile.avatar_url,
      verified:   other.verified?
    }
  end
end
