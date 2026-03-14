class Report < ApplicationRecord
  REASONS  = %w[harassment fake_profile inappropriate spam other].freeze
  STATUSES = %w[open reviewed dismissed].freeze

  belongs_to :reporter,    class_name: "User"
  belongs_to :reported,    class_name: "User"
  belongs_to :reviewed_by, class_name: "User", optional: true

  validates :reason, inclusion: { in: REASONS }
  validates :status, inclusion: { in: STATUSES }
  validates :reporter_id, uniqueness: { scope: :reported_id,
                                        message: "already filed a report against this user" }

  scope :open,     -> { where(status: "open") }
  scope :reviewed, -> { where(status: "reviewed") }

  def review!(admin, action)
    update!(status: action, reviewed_by: admin, reviewed_at: Time.current)
    reported.update!(status: "suspended") if action == "reviewed"
  end
end
