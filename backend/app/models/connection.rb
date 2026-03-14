class Connection < ApplicationRecord
  STATUSES = %w[pending accepted rejected].freeze

  belongs_to :requester, class_name: "User"
  belongs_to :receiver,  class_name: "User"
  has_many   :messages,  dependent: :destroy

  validates :status, inclusion: { in: STATUSES }
  validates :requester_id, uniqueness: { scope: :receiver_id }
  validate  :cannot_connect_to_self

  scope :pending,  -> { where(status: "pending") }
  scope :accepted, -> { where(status: "accepted") }

  def accept!  = update!(status: "accepted")
  def reject!  = update!(status: "rejected")

  def other_participant(user)
    user.id == requester_id ? receiver : requester
  end

  private

  def cannot_connect_to_self
    errors.add(:receiver_id, "can't connect to yourself") if requester_id == receiver_id
  end
end
