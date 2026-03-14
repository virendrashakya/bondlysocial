require "administrate/base_dashboard"

class MessageDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    sender: Field::BelongsTo,
    connection: Field::BelongsTo,
    body: Field::Text,
    read: Field::Boolean,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    sender
    connection
    body
    read
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    sender
    connection
    body
    read
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    sender
    connection
    body
    read
  ].freeze

  COLLECTION_FILTERS = {}.freeze
end
