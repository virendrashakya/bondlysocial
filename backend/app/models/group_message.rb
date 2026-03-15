class GroupMessage < ApplicationRecord
  belongs_to :group
  belongs_to :user

  validates :body, presence: true, length: { maximum: 1000 }

  scope :recent, -> { order(created_at: :desc) }
end
