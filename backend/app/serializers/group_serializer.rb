class GroupSerializer
  include JSONAPI::Serializer

  attributes :title, :description, :city, :max_members, :status, :created_at

  attribute :member_count do |group|
    group.group_memberships.count
  end

  attribute :creator_name do |group|
    group.creator.profile&.name
  end
end
