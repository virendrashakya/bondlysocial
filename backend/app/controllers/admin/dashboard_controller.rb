module Admin
  class DashboardController < ActionController::Base
    prepend_view_path Rails.root.join("app", "views")
    layout "admin/application"
    before_action :authenticate_admin

    def index
      @total_users      = User.count
      @active_users     = User.where(status: "active").count
      @suspended_users  = User.where(status: "suspended").count
      @verified_users   = User.where(phone_verified: true, selfie_verified: true).count

      @total_connections = Connection.count
      @accepted_connections = Connection.where(status: "accepted").count
      @pending_connections  = Connection.where(status: "pending").count

      @total_messages   = Message.count
      @total_posts      = Post.count
      @total_groups     = Group.count
      @total_reports    = Report.count
      @pending_reports  = Report.where(status: "pending").count
      @total_blocks     = Block.count

      # Users registered per day (last 30 days)
      @users_by_day = User
        .where("created_at >= ?", 30.days.ago)
        .group("DATE(created_at)")
        .order("DATE(created_at)")
        .count

      # Connections by status
      @connections_by_status = Connection.group(:status).count

      # Recent users
      @recent_users = User.order(created_at: :desc).limit(8).includes(:profile)

      # Recent reports
      @recent_reports = Report.order(created_at: :desc).limit(5)

      render "admin/dashboard/index"
    end

    private

    def authenticate_admin
      authenticate_or_request_with_http_basic("IntentConnect Admin") do |email, password|
        user = User.find_by(email: email)
        user&.authenticate(password) && user.admin?
      end
    end
  end
end
