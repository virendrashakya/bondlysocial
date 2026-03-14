class NotificationSerializer
  include JSONAPI::Serializer

  attributes :kind, :title, :body, :metadata, :read, :created_at
end
