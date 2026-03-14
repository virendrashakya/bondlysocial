module Api
  module V1
    module Admin
      class StatsController < BaseController
        before_action :require_admin!

        # GET /admin/stats
        def index
          render json: {
            open_reports: Report.open.count,
            pending_reviews: Report.open.count,
            active_users: User.active.count,
            total_users: User.count,
            suspended_users: User.where(status: "suspended").count,
            total_groups: Group.where(status: "active").count,
            total_connections: Connection.accepted.count,
            total_messages: Message.count
          }
        end

        private

        def require_admin!
          render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
        end
      end
    end
  end
end
