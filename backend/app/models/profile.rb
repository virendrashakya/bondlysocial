class Profile < ApplicationRecord
  INTENTS = %w[
    friendship
    activity_partner
    networking
    emotional_support
    serious_relationship
    marriage
  ].freeze

  GENDERS = %w[male female non_binary prefer_not_to_say].freeze

  COMPATIBLE_INTENTS = {
    "friendship"           => %w[friendship],
    "activity_partner"     => %w[activity_partner friendship],
    "networking"           => %w[networking],
    "emotional_support"    => %w[emotional_support friendship],
    "serious_relationship" => %w[serious_relationship marriage],
    "marriage"             => %w[marriage serious_relationship]
  }.freeze

  CULTURAL_BACKGROUNDS = %w[
    north_indian south_indian east_indian west_indian north_east_indian
    mixed_indian indian_origin_abroad international prefer_not_to_say
  ].freeze

  RELIGIONS = %w[hindu muslim christian sikh jain buddhist other prefer_not_to_say].freeze
  RELIGION_VISIBILITIES = %w[visible hidden].freeze

  BODY_TYPES = %w[slim athletic average curvy heavy prefer_not_to_say].freeze
  DRINKING_OPTIONS = %w[never social often].freeze
  SMOKING_OPTIONS = %w[no occasionally yes].freeze
  WORKOUT_OPTIONS = %w[none weekly daily].freeze
  RELATIONSHIP_STATUSES = %w[single divorced separated prefer_not_to_say].freeze

  APPEARANCE_TAG_OPTIONS = %w[
    bearded glasses tattoos long_hair short_hair
    fitness_focused minimalist traditional traveler artist
  ].freeze

  belongs_to :user

  has_one_attached :avatar
  has_one_attached :selfie

  validates :name,    presence: true
  validates :age,     presence: true, numericality: { greater_than: 17, less_than: 100 }
  validates :gender,  inclusion: { in: GENDERS }
  validates :city,    presence: true
  validates :intent,  inclusion: { in: INTENTS }

  validates :height_cm,           numericality: { in: 120..230 }, allow_nil: true
  validates :cultural_background, inclusion: { in: CULTURAL_BACKGROUNDS }, allow_nil: true
  validates :religion,            inclusion: { in: RELIGIONS }, allow_nil: true
  validates :religion_visibility, inclusion: { in: RELIGION_VISIBILITIES }
  validates :body_type,           inclusion: { in: BODY_TYPES }, allow_nil: true
  validates :drinking,            inclusion: { in: DRINKING_OPTIONS }, allow_nil: true
  validates :smoking,             inclusion: { in: SMOKING_OPTIONS }, allow_nil: true
  validates :workout_frequency,   inclusion: { in: WORKOUT_OPTIONS }, allow_nil: true
  validates :relationship_status, inclusion: { in: RELATIONSHIP_STATUSES }, allow_nil: true

  validate :appearance_tags_limit
  validate :languages_spoken_limit

  scope :visible,    -> { where(hidden: false) }
  scope :in_city,    ->(city) { where(city: city) }
  scope :with_intent, ->(intents) { where(intent: intents) }

  def compatible_intents
    COMPATIBLE_INTENTS[intent] || [intent]
  end

  def avatar_url
    return nil unless avatar.attached?
    Rails.application.routes.url_helpers.rails_blob_url(avatar, expires_in: 1.hour)
  end

  def selfie_url
    return nil unless selfie.attached?
    Rails.application.routes.url_helpers.rails_blob_url(selfie, expires_in: 1.hour)
  end

  def visible_height
    show_height? ? height_cm : nil
  end

  def visible_body_type
    show_body_type? ? body_type : nil
  end

  private

  def appearance_tags_limit
    errors.add(:appearance_tags, "can have at most 5 tags") if Array(appearance_tags).length > 5
  end

  def languages_spoken_limit
    errors.add(:languages_spoken, "can have at most 5 languages") if Array(languages_spoken).length > 5
  end
end
