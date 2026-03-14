class MessageSerializer
  include JSONAPI::Serializer

  attributes :body, :read, :created_at

  attribute :sender_id do |message|
    message.sender_id
  end

  attribute :sender_name do |message|
    message.sender.profile&.name
  end

  # Post reference (when someone shares a post in chat)
  attribute :referenced_post do |message|
    next nil unless message.referenced_post

    post = message.referenced_post
    {
      id: post.id,
      caption: post.caption&.truncate(100),
      author_name: post.user.profile&.name || post.user.email,
      author_id: post.user_id,
      media_url: post.all_media_urls.first&.dig(:url),
      media_type: post.all_media_urls.first&.dig(:type),
      media_count: post.all_media_urls.size
    }
  end

  attribute :image_url do |message|
    if message.image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(message.image, only_path: false)
    end
  end

  attribute :message_type do |message|
    if message.image.attached?
      message.body.present? ? "image_with_text" : "image"
    elsif message.referenced_post_id.present?
      message.body.present? ? "post_share_with_text" : "post_share"
    else
      "text"
    end
  end

  attribute :pinned do |message|
    message.pinned?
  end

  attribute :pinned_at do |message|
    message.pinned_at&.iso8601
  end

  attribute :reactions do |message|
    message.reactions.map { |r| { id: r.id, emoji: r.emoji, user_id: r.user_id, user_name: r.user.profile&.name } }
  end
end
