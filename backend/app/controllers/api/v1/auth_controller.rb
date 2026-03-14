module Api
  module V1
    class AuthController < ActionController::API
      rescue_from Auth::Errors::TokenExpired,     with: -> { render json: { error: "Token expired" }, status: :unauthorized }
      rescue_from Auth::Errors::TokenInvalid,     with: -> { render json: { error: "Unauthorized" }, status: :unauthorized }
      rescue_from ActiveRecord::StatementInvalid, with: ->(e) {
        Rails.logger.error "[AUTH DB ERROR] #{e.message}"
        render json: { error: "Database error", detail: e.message }, status: :internal_server_error
      }
      rescue_from StandardError, with: ->(e) {
        Rails.logger.error "[AUTH ERROR] #{e.class}: #{e.message}\n#{e.backtrace.first(5).join("\n")}"
        render json: { error: "Internal error", detail: e.message }, status: :internal_server_error
      }

      # POST /auth/signup
      def signup
        result = Auth::SignupService.call(signup_params)

        if result.success?
          render json: { message: "OTP sent to your phone" }, status: :created
        else
          render json: { errors: result.errors }, status: :unprocessable_entity
        end
      end

      # POST /auth/verify_otp
      def verify_otp
        user = User.find_by(phone: params[:phone])
        return render json: { error: "User not found" }, status: :not_found unless user

        if user.verify_otp!(params[:otp])
          tokens = Auth::TokenService.issue_tokens(user)
          render json: { user: UserSerializer.new(user).serializable_hash, **tokens }
        else
          render json: { error: "Invalid or expired OTP" }, status: :unprocessable_entity
        end
      end

      # POST /auth/login
      def login
        user = User.find_by(email: params[:email]&.downcase)
        return render json: { error: "Invalid credentials" }, status: :unauthorized unless user&.authenticate(params[:password])
        return render json: { error: "Account suspended" }, status: :forbidden if user.suspended?

        tokens = Auth::TokenService.issue_tokens(user)
        render json: { user: UserSerializer.new(user).serializable_hash, **tokens }
      end

      # POST /auth/refresh
      def refresh
        payload = Auth::TokenService.decode(params[:refresh_token])
        raise Auth::Errors::TokenInvalid unless payload[:type] == "refresh"

        user = User.find(payload[:sub])
        raise Auth::Errors::TokenInvalid unless BCrypt::Password.new(user.refresh_token) == params[:refresh_token]

        tokens = Auth::TokenService.issue_tokens(user)
        render json: tokens
      end

      # DELETE /auth/logout
      def logout
        user = authenticate_from_header
        user&.update_column(:refresh_token, nil)
        head :no_content
      end

      private

      def signup_params
        params.permit(:email, :phone, :password)
      end

      def authenticate_from_header
        header  = request.headers["Authorization"]
        token   = header&.split(" ")&.last
        return nil unless token

        payload = Auth::TokenService.decode(token)
        User.find_by(id: payload[:sub])
      rescue Auth::Errors::TokenExpired, Auth::Errors::TokenInvalid
        nil
      end
    end
  end
end
