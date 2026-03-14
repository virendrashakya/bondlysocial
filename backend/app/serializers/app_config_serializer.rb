class AppConfigSerializer
  include JSONAPI::Serializer
  attributes :key, :value, :value_type, :description, :updated_at
end
