class PostSerializer
  include JSONAPI::Serializer

  attributes :caption, :likes_count, :comments_count, :visibility, :location, :created_at

  attribute :author_name do |post|
    post.user.profile&.name || post.user.email
  end

  attribute :author_avatar do |post|
    post.user.profile&.avatar_url
  end

  attribute :author_id do |post|
    post.user_id
  end

  # Multiple media (Instagram carousel)
  attribute :media do |post|
    post.all_media_urls
  end

  # Legacy single media fields for backward compat
  attribute :media_url do |post|
    post.all_media_urls.first&.dig(:url)
  end

  attribute :media_type do |post|
    post.all_media_urls.first&.dig(:type)
  end

  attribute :media_count do |post|
    post.all_media_urls.size
  end

  attribute :liked_by_me do |post, params|
    current_user = params[:current_user]
    current_user ? post.liked_by?(current_user) : false
  end

  attribute :is_own do |post, params|
    current_user = params[:current_user]
    current_user ? post.user_id == current_user.id : false
  end
end
