class Notification < ApplicationRecord
  KINDS = %w[connection_request message group_invite system].freeze

  belongs_to :user

  validates :kind,  inclusion: { in: KINDS }
  validates :title, presence: true

  scope :unread, -> { where(read: false) }
  scope :recent, -> { order(created_at: :desc).limit(50) }

  def mark_read!
    update!(read: true)
  end
end
