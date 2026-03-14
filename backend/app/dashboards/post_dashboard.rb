require "administrate/base_dashboard"

class PostDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    user: Field::BelongsTo,
    caption: Field::Text,
    likes_count: Field::Number,
    comments_count: Field::Number,
    post_likes: Field::HasMany,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    user
    caption
    likes_count
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    user
    caption
    likes_count
    comments_count
    post_likes
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    user
    caption
  ].freeze

  COLLECTION_FILTERS = {}.freeze

  def display_resource(post)
    "Post ##{post.id}"
  end
end
