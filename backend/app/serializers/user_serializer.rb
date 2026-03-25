class UserSerializer
  include JSONAPI::Serializer

  attributes :email, :phone, :role, :status, :phone_verified, :selfie_verified, :subscription_tier

  attribute :profile do |user|
    next nil unless user.profile

    {
      name:   user.profile.name,
      city:   user.profile.city,
      intent: user.profile.intent,
      gender: user.profile.gender
    }
  end
end
