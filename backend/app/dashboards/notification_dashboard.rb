require "administrate/base_dashboard"

class NotificationDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    user: Field::BelongsTo,
    title: Field::String,
    body: Field::Text,
    kind: Field::String,
    read: Field::Boolean,
    metadata: Field::String.with_options(searchable: false),
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    user
    title
    kind
    read
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    user
    title
    body
    kind
    read
    metadata
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    user
    title
    body
    kind
    read
  ].freeze

  COLLECTION_FILTERS = {
    unread: ->(resources) { resources.where(read: false) },
  }.freeze
end
