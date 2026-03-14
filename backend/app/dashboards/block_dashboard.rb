require "administrate/base_dashboard"

class BlockDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    blocker: Field::BelongsTo,
    blocked: Field::BelongsTo,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    blocker
    blocked
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    blocker
    blocked
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    blocker
    blocked
  ].freeze

  COLLECTION_FILTERS = {}.freeze
end
