class GroupSerializer
  include JSONAPI::Serializer

  attributes :title, :description, :city, :category, :max_members, :status, :created_at

  attribute :members_count do |group|
    group.group_memberships.count
  end

  attribute :creator_name do |group|
    group.creator.profile&.name
  end

  attribute :is_member do |group, params|
    current_user = params[:current_user]
    current_user ? group.member?(current_user) : false
  end

  attribute :members do |group|
    group.group_memberships.includes(user: :profile).map do |membership|
      profile = membership.user.profile
      {
        id: membership.user.id,
        name: profile&.name,
        avatar_url: profile&.avatar_url,
        city: profile&.city,
        interests: profile&.interests || [],
        intent: profile&.intent,
        role: membership.role,
        joined_at: membership.created_at
      }
    end
  end
end
