module Api
  module V1
    module Admin
      class AppConfigsController < BaseController
        before_action :require_admin!

        def index
          configs = AppConfig.all_as_hash
          render json: {
            configs: AppConfigSerializer.new(configs).serializable_hash
          }
        end

        def update
          config = AppConfig.find_or_initialize_by(key: params[:key])
          config.assign_attributes(app_config_params)
          config.save!
          render json: { config: AppConfigSerializer.new(config).serializable_hash }
        end

        private

        def require_admin!
          render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
        end

        def app_config_params
          params.require(:app_config).permit(:value, :value_type, :description)
        end
      end
    end
  end
end
