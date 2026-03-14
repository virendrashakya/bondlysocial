class Group < ApplicationRecord
  belongs_to :creator, class_name: "User"
  has_many   :group_memberships, dependent: :destroy
  has_many   :members, through: :group_memberships, source: :user

  validates :title,       presence: true, length: { maximum: 100 }
  validates :city,        presence: true
  validates :max_members, numericality: { greater_than: 1, less_than_or_equal_to: 200 }

  scope :active,   -> { where(status: "active") }
  scope :in_city,  ->(city) { where(city: city) }

  def full?
    group_memberships.count >= max_members
  end

  def member?(user)
    group_memberships.exists?(user: user)
  end
end
