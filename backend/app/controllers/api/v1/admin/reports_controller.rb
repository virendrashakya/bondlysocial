module Api
  module V1
    module Admin
      class ReportsController < BaseController
        before_action :require_admin!

        # GET /admin/reports
        def index
          reports = Report.includes(:reporter, :reported)
                          .order(created_at: :desc)
          reports = reports.where(status: params[:status]) if params[:status].present?
          reports = paginate(reports)
          render json: { reports: AdminReportSerializer.new(reports).serializable_hash }
        end

        # PATCH /admin/reports/:id/review
        def review
          report = Report.find(params[:id])
          action = params[:action_taken]  # "reviewed" (suspend) or "dismissed"
          report.review!(current_user, action)
          render json: { message: "Report #{action}" }
        end

        # PATCH /admin/users/:id/suspend
        def suspend_user
          user = User.find(params[:id])
          user.update!(status: "suspended")
          render json: { message: "User suspended" }
        end

        # PATCH /admin/users/:id/unsuspend
        def unsuspend_user
          user = User.find(params[:id])
          user.update!(status: "active")
          render json: { message: "User reactivated" }
        end

        private

        def require_admin!
          render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
        end
      end
    end
  end
end
