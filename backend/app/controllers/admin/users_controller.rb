module Admin
  class UsersController < Admin::ApplicationController
    def suspend
      user = User.find(params[:id])
      user.update!(status: "suspended")
      redirect_to admin_user_path(user), notice: "User suspended."
    end

    def unsuspend
      user = User.find(params[:id])
      user.update!(status: "active")
      redirect_to admin_user_path(user), notice: "User reactivated."
    end
  end
end
