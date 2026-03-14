module Admin
  class ApplicationController < Administrate::ApplicationController
    prepend_view_path Rails.root.join("app", "views")
    layout "admin/application"
    before_action :authenticate_admin

    def records_per_page
      params[:per_page] || 25
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
