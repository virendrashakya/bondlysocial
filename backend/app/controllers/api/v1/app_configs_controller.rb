module Api
  module V1
    class AppConfigsController < ActionController::API
      PUBLIC_KEYS = %w[
        maintenance_mode signups_enabled announcement_banner
        discover_enabled groups_enabled
      ].freeze

      def index
        config = PUBLIC_KEYS.each_with_object({}) do |key, hash|
          hash[key] = AppConfig[key]
        end
        render json: { config: config }
      end
    end
  end
end
