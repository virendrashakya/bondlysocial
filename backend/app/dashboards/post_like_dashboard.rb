require "administrate/base_dashboard"

class PostLikeDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    post: Field::BelongsTo,
    user: Field::BelongsTo,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    post
    user
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    post
    user
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    post
    user
  ].freeze

  COLLECTION_FILTERS = {}.freeze
end
