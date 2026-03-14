class Message < ApplicationRecord
  belongs_to :connection
  belongs_to :sender, class_name: "User"
  belongs_to :referenced_post, class_name: "Post", optional: true

  validates :body, length: { maximum: 2000 }
  validate  :body_or_post_reference_required
  validate  :sender_must_be_participant

  after_create_commit :broadcast_to_channel
  after_create_commit :enqueue_notification

  private

  def body_or_post_reference_required
    errors.add(:base, "Message must have a body or a post reference") if body.blank? && referenced_post_id.blank?
  end

  def sender_must_be_participant
    return if [connection.requester_id, connection.receiver_id].include?(sender_id)
    errors.add(:sender_id, "is not a participant in this connection")
  end

  def broadcast_to_channel
    ActionCable.server.broadcast(
      "conversation_#{connection_id}",
      MessageSerializer.new(self).serializable_hash
    )
  end

  def enqueue_notification
    recipient_id = sender_id == connection.requester_id ? connection.receiver_id : connection.requester_id
    NotificationJob.perform_later(
      user_id:  recipient_id,
      kind:     "message",
      title:    "New message",
      body:     notification_body,
      metadata: { connection_id: connection_id, sender_id: sender_id }
    )
  end

  def notification_body
    if referenced_post_id.present? && body.blank?
      "Shared a post with you"
    else
      body.truncate(80)
    end
  end
end
