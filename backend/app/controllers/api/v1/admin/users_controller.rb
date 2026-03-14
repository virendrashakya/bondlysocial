module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :require_admin!

        # GET /admin/users?search=&page=&status=
        def index
          users = User.includes(:profile).order(created_at: :desc)
          users = users.where(status: params[:status]) if params[:status].present?

          if params[:search].present?
            term = "%#{params[:search].downcase}%"
            users = users.left_joins(:profile).where(
              "LOWER(users.email) LIKE ? OR LOWER(profiles.name) LIKE ?", term, term
            )
          end

          users = paginate(users)

          render json: {
            users: users.map { |u|
              {
                id: u.id,
                email: u.email,
                phone: u.phone,
                role: u.role,
                status: u.status,
                phone_verified: u.phone_verified,
                selfie_verified: u.selfie_verified,
                last_active_at: u.last_active_at&.iso8601,
                created_at: u.created_at.iso8601,
                profile: u.profile ? { name: u.profile.name, city: u.profile.city, avatar_url: u.profile.avatar_url } : nil
              }
            }
          }
        end

        # PATCH /admin/users/:id/suspend
        def suspend
          user = User.find(params[:id])
          user.update!(status: "suspended")
          render json: { message: "User suspended" }
        end

        # PATCH /admin/users/:id/unsuspend
        def unsuspend
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
