module Api
  module V1
    class PreferencesController < BaseController
      # GET /preferences
      def show
        render json: {
          privacy: current_user.effective_privacy,
          notifications: current_user.effective_notification_prefs,
          discovery: current_user.discovery_preferences
        }
      end

      # PATCH /preferences
      def update
        if params[:privacy].present?
          merged = current_user.effective_privacy.merge(params[:privacy].to_unsafe_h)
          current_user.update!(privacy_settings: merged)
        end

        if params[:notifications].present?
          merged = current_user.effective_notification_prefs.merge(params[:notifications].to_unsafe_h)
          current_user.update!(notification_preferences: merged)
        end

        if params[:discovery].present?
          merged = (current_user.discovery_preferences || {}).merge(params[:discovery].to_unsafe_h)
          current_user.update!(discovery_preferences: merged)
        end

        render json: {
          privacy: current_user.effective_privacy,
          notifications: current_user.effective_notification_prefs,
          discovery: current_user.discovery_preferences
        }
      end
    end
  end
end
