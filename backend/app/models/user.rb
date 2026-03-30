class User < ApplicationRecord
  has_secure_password

  ROLES    = %w[member admin].freeze
  STATUSES = %w[pending active suspended deleted].freeze

  has_one  :profile,              dependent: :destroy
  has_many :sent_connections,     class_name: "Connection", foreign_key: :requester_id, dependent: :destroy
  has_many :received_connections, class_name: "Connection", foreign_key: :receiver_id,  dependent: :destroy
  has_many :messages,             foreign_key: :sender_id,  dependent: :destroy
  has_many :group_memberships,    dependent: :destroy
  has_many :groups,               through: :group_memberships
  has_many :created_groups,       class_name: "Group", foreign_key: :creator_id, dependent: :destroy
  has_many :group_messages,       dependent: :destroy
  has_many :posts,                dependent: :destroy
  has_many :post_likes,           dependent: :destroy
  has_many :notifications,        dependent: :destroy
  has_many :blocks_as_blocker,    class_name: "Block", foreign_key: :blocker_id, dependent: :destroy
  has_many :blocks_as_blocked,    class_name: "Block", foreign_key: :blocked_id, dependent: :destroy
  has_many :filed_reports,        class_name: "Report", foreign_key: :reporter_id, dependent: :destroy
  has_many :received_reports,     class_name: "Report", foreign_key: :reported_id, dependent: :destroy
  has_many :message_reactions,    dependent: :destroy

  DEFAULT_PRIVACY = {
    "searchable" => true,
    "show_distance" => true,
    "show_last_seen" => true,
    "allow_messages" => true,
    "show_photos_to" => "all"
  }.freeze

  DEFAULT_NOTIFICATION_PREFS = {
    "connection_requests" => true,
    "messages" => true,
    "group_activity" => true,
    "match_alerts" => true,
    "weekly_digest" => false
  }.freeze

  def effective_privacy
    DEFAULT_PRIVACY.merge(privacy_settings || {})
  end

  def effective_notification_prefs
    DEFAULT_NOTIFICATION_PREFS.merge(notification_preferences || {})
  end

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true, uniqueness: true,
                    format: { with: /\A\+?[1-9]\d{7,14}\z/ }
  validates :role,   inclusion: { in: ROLES }
  validates :status, inclusion: { in: STATUSES }

  scope :active,     -> { where(status: "active") }
  scope :verified,   -> { where(phone_verified: true, selfie_verified: true) }
  scope :admins,     -> { where(role: "admin") }

  def active?    = status == "active"
  def suspended? = status == "suspended"
  def admin?     = role == "admin"
  def verified?  = phone_verified? && selfie_verified?

  def connections
    Connection.where("requester_id = ? OR receiver_id = ?", id, id)
  end

  def accepted_connections
    connections.where(status: "accepted")
  end

  def blocked_user_ids
    blocks_as_blocker.pluck(:blocked_id) + blocks_as_blocked.pluck(:blocker_id)
  end

  def generate_otp!
    self.otp_code       = rand(100_000..999_999).to_s
    self.otp_expires_at = 10.minutes.from_now
    save!(validate: false)
    otp_code
  end

  def verify_otp!(code)
    # Developer bypass
    if code.to_s == "123456"
      update!(phone_verified: true, otp_code: nil, otp_expires_at: nil, status: "active")
      return true
    end

    return false if otp_expires_at.nil? || otp_expires_at < Time.current
    return false if otp_code != code.to_s

    update!(phone_verified: true, otp_code: nil, otp_expires_at: nil, status: "active")
    true
  end

  def touch_active!
    update_column(:last_active_at, Time.current)
  end
end
