require "administrate/base_dashboard"

class ConnectionDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    requester: Field::BelongsTo,
    receiver: Field::BelongsTo,
    status: Field::String,
    messages: Field::HasMany,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    requester
    receiver
    status
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    requester
    receiver
    status
    messages
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    requester
    receiver
    status
  ].freeze

  COLLECTION_FILTERS = {
    pending: ->(resources) { resources.where(status: "pending") },
    accepted: ->(resources) { resources.where(status: "accepted") },
    rejected: ->(resources) { resources.where(status: "rejected") },
  }.freeze

  def display_resource(connection)
    "Connection ##{connection.id} (#{connection.status})"
  end
end
