module Api
  module V1
    class SubscriptionsController < BaseController
      # POST /subscriptions/upgrade
      def upgrade
        coupon_code = params[:coupon_code].to_s.strip.upcase

        if coupon_code == "EARLYADOPTER"
          current_user.update!(subscription_tier: "premium")
          render json: { success: true, message: "Welcome to Premium! Unlimited browsing unlocked." }, status: :ok
        else
          render json: { error: "Invalid or expired coupon code." }, status: :unprocessable_entity
        end
      end
    end
  end
end
