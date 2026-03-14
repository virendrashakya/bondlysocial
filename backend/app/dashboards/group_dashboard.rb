require "administrate/base_dashboard"

class GroupDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    title: Field::String,
    description: Field::Text,
    city: Field::String,
    status: Field::String,
    max_members: Field::Number,
    creator: Field::BelongsTo,
    members: Field::HasMany,
    group_memberships: Field::HasMany,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    title
    city
    status
    creator
    max_members
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    title
    description
    city
    status
    max_members
    creator
    members
    group_memberships
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    title
    description
    city
    status
    max_members
    creator
  ].freeze

  COLLECTION_FILTERS = {}.freeze

  def display_resource(group)
    group.title
  end
end
