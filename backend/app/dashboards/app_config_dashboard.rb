require "administrate/base_dashboard"

class AppConfigDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    key: Field::String,
    value: Field::Text,
    value_type: Field::String,
    description: Field::Text,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    key
    value
    value_type
    description
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    key
    value
    value_type
    description
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    key
    value
    value_type
    description
  ].freeze

  COLLECTION_FILTERS = {}.freeze

  def display_resource(config)
    config.key
  end
end
