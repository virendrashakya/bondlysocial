require "administrate/base_dashboard"

class ProfileDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    user: Field::BelongsTo,
    name: Field::String,
    bio: Field::Text,
    age: Field::Number,
    gender: Field::String,
    city: Field::String,
    intent: Field::String,
    occupation: Field::String,
    interests: Field::String.with_options(searchable: false),
    hidden: Field::Boolean,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    name
    user
    city
    gender
    age
    intent
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    user
    name
    bio
    age
    gender
    city
    intent
    occupation
    interests
    hidden
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    user
    name
    bio
    age
    gender
    city
    intent
    occupation
    interests
    hidden
  ].freeze

  COLLECTION_FILTERS = {
    hidden: ->(resources) { resources.where(hidden: true) },
  }.freeze

  def display_resource(profile)
    profile.name || "Profile ##{profile.id}"
  end
end
