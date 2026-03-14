require "administrate/base_dashboard"

class GroupMembershipDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    user: Field::BelongsTo,
    group: Field::BelongsTo,
    role: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    user
    group
    role
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    user
    group
    role
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    user
    group
    role
  ].freeze

  COLLECTION_FILTERS = {}.freeze
end
