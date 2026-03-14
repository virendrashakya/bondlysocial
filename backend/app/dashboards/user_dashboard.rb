require "administrate/base_dashboard"

class UserDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    email: Field::String,
    phone: Field::String,
    role: Field::String,
    status: Field::String,
    phone_verified: Field::Boolean,
    selfie_verified: Field::Boolean,
    last_active_at: Field::DateTime,
    profile: Field::HasOne,
    posts: Field::HasMany,
    sent_connections: Field::HasMany,
    received_connections: Field::HasMany,
    messages: Field::HasMany,
    groups: Field::HasMany,
    notifications: Field::HasMany,
    filed_reports: Field::HasMany,
    received_reports: Field::HasMany,
    blocks_as_blocker: Field::HasMany,
    blocks_as_blocked: Field::HasMany,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    email
    phone
    role
    status
    phone_verified
    selfie_verified
    last_active_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    email
    phone
    role
    status
    phone_verified
    selfie_verified
    last_active_at
    profile
    posts
    sent_connections
    received_connections
    filed_reports
    received_reports
    blocks_as_blocker
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    email
    phone
    role
    status
    phone_verified
    selfie_verified
  ].freeze

  COLLECTION_FILTERS = {
    active: ->(resources) { resources.where(status: "active") },
    suspended: ->(resources) { resources.where(status: "suspended") },
    admins: ->(resources) { resources.where(role: "admin") },
    verified: ->(resources) { resources.where(phone_verified: true, selfie_verified: true) },
  }.freeze

  def display_resource(user)
    user.email
  end
end
