class Message < ApplicationRecord
  belongs_to :connection
  belongs_to :sender, class_name: "User"
  belongs_to :referenced_post, class_name: "Post", optional: true
  belongs_to :pinned_by, class_name: "User", optional: true

  has_one_attached :image
  has_many :reactions, class_name: "MessageReaction", dependent: :destroy

  validates :body, length: { maximum: 2000 }
  validate  :image_format_and_size, if: :image_attached?
  validate  :body_or_post_or_image_required
  validate  :sender_must_be_participant

  after_create_commit :broadcast_to_channel
  after_create_commit :enqueue_notification

  private

  def body_or_post_or_image_required
    errors.add(:base, "Message must have a body, a post reference, or an image") if body.blank? && referenced_post_id.blank? && !image_attached?
  end

  def image_attached?
    image.attached?
  end

  def image_format_and_size
    unless image.content_type.in?(%w[image/png image/jpeg image/gif image/webp])
      errors.add(:image, "must be a PNG, JPEG, GIF, or WebP")
    end
    if image.byte_size > 10.megabytes
      errors.add(:image, "must be less than 10MB")
    end
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
    if image_attached? && body.blank?
      "Sent you an image"
    elsif referenced_post_id.present? && body.blank?
      "Shared a post with you"
    elsif body.present?
      body.truncate(80)
    else
      "Sent you a message"
    end
  end
end
