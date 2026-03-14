class MessageReaction < ApplicationRecord
  ALLOWED_EMOJIS = %w[❤️ 😂 😮 😢 😡 👍 👎 🔥 🎉 💯].freeze

  belongs_to :message
  belongs_to :user

  validates :emoji, presence: true, inclusion: { in: ALLOWED_EMOJIS }
  validates :user_id, uniqueness: { scope: [:message_id, :emoji] }

  after_create_commit  :broadcast_reaction
  after_destroy_commit :broadcast_reaction_removed

  private

  def broadcast_reaction
    ActionCable.server.broadcast(
      "conversation_#{message.connection_id}",
      { type: "reaction_added", message_id: message_id, reaction: as_broadcast }
    )
  end

  def broadcast_reaction_removed
    ActionCable.server.broadcast(
      "conversation_#{message.connection_id}",
      { type: "reaction_removed", message_id: message_id, user_id: user_id, emoji: emoji }
    )
  end

  def as_broadcast
    { id: id, emoji: emoji, user_id: user_id, user_name: user.profile&.name }
  end
end
