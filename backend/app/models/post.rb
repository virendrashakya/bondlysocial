class Post < ApplicationRecord
  belongs_to :user
  has_many_attached :media_files  # Instagram-style: multiple images/videos
  has_one_attached :media         # Legacy single media (kept for backward compat)
  has_many :post_likes, dependent: :destroy

  VISIBILITIES = %w[public connections].freeze

  validates :caption, length: { maximum: 500 }
  validates :visibility, inclusion: { in: VISIBILITIES }
  validate  :caption_or_media_required

  scope :visible_to, ->(user) {
    where(visibility: "public")
      .or(where(visibility: "connections", user_id: user.accepted_connections.select(:requester_id))
      .or(where(visibility: "connections", user_id: user.accepted_connections.select(:receiver_id)))
      .or(where(user_id: user.id)))
  }

  # --- Media helpers ---

  def all_media_urls
    if media_files.attached?
      media_files.map do |file|
        {
          url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: true),
          type: file.content_type.start_with?("video/") ? "video" : "image",
          id: file.id
        }
      end
    elsif media.attached?
      [{ url: media_url, type: media_type, id: media.id }]
    else
      []
    end
  end

  def media_url
    return nil unless media.attached?
    Rails.application.routes.url_helpers.rails_blob_url(media, only_path: true)
  end

  def media_type
    return nil unless media.attached?
    media.content_type.start_with?("video/") ? "video" : "image"
  end

  def liked_by?(user)
    post_likes.exists?(user: user)
  end

  def toggle_like!(user)
    like = post_likes.find_by(user: user)
    if like
      like.destroy
      decrement!(:likes_count)
      false
    else
      post_likes.create!(user: user)
      increment!(:likes_count)
      true
    end
  end

  private

  def caption_or_media_required
    has_media = media.attached? || media_files.attached?
    errors.add(:base, "Post must have a caption or media") if caption.blank? && !has_media
  end
end
