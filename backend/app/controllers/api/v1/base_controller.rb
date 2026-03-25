module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::MimeResponds

      before_action :authenticate_user!

      rescue_from StandardError,                      with: :internal_error
      rescue_from ActiveRecord::RecordNotFound,       with: :not_found
      rescue_from ActiveRecord::RecordInvalid,        with: :unprocessable
      rescue_from ActiveRecord::StatementInvalid,     with: :db_error
      rescue_from Auth::Errors::TokenExpired,         with: :token_expired
      rescue_from Auth::Errors::TokenInvalid,         with: :unauthorized
      rescue_from ActionController::ParameterMissing, with: :bad_request

      private

      def authenticate_user!
        header = request.headers["Authorization"]
        token  = header&.split(" ")&.last
        raise Auth::Errors::TokenInvalid unless token

        payload       = Auth::TokenService.decode(token)
        @current_user = User.find(payload[:sub])

        raise Auth::Errors::TokenInvalid unless @current_user&.active?

        @current_user.touch_active!
      end

      def current_user
        @current_user
      end

      def not_found(e)
        render json: { error: "Not found", detail: e.message }, status: :not_found
      end

      def unprocessable(e)
        render json: { error: "Unprocessable", detail: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def token_expired(_e)
        render json: { error: "Token expired" }, status: :unauthorized
      end

      def unauthorized(_e)
        render json: { error: "Unauthorized" }, status: :unauthorized
      end

      def bad_request(e)
        render json: { error: "Bad request", detail: e.message }, status: :bad_request
      end

      def db_error(e)
        Rails.logger.error "[DB ERROR] #{e.class}: #{e.message}"
        render json: { error: "Database error", detail: e.message }, status: :internal_server_error
      end

      def internal_error(e)
        Rails.logger.error "[INTERNAL ERROR] #{e.class}: #{e.message}"
        Rails.logger.error e.backtrace.first(10).join("\n")
        render json: { error: "Internal server error", detail: e.message }, status: :internal_server_error
      end

      def paginate(scope)
        page     = (params[:page] || 1).to_i
        per_page = params[:per_page] ? params[:per_page].to_i : 20
        per_page = [[per_page, 1].max, 50].min
        scope.offset((page - 1) * per_page).limit(per_page)
      end
    end
  end
end
