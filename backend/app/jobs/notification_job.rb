class NotificationJob < ApplicationJob
  queue_as :default

  def perform(user_id:, kind:, title:, body: nil, metadata: {})
    user = User.find_by(id: user_id)
    return unless user&.active?

    notification = user.notifications.create!(
      kind:     kind,
      title:    title,
      body:     body,
      metadata: metadata
    )

    # Broadcast in-app notification via ActionCable
    ActionCable.server.broadcast(
      "notifications_#{user_id}",
      NotificationSerializer.new(notification).serializable_hash
    )
  end
end
