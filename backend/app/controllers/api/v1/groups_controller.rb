module Api
  module V1
    class GroupsController < BaseController
      before_action :set_group, only: [:show, :join, :leave]

      # GET /groups
      def index
        groups = Group.active.order(created_at: :desc).then { |s| paginate(s) }
        groups = groups.in_city(params[:city]) if params[:city].present?
        render json: { groups: GroupSerializer.new(groups).serializable_hash }
      end

      # GET /groups/:id
      def show
        render json: { group: GroupSerializer.new(@group).serializable_hash }
      end

      # POST /groups
      def create
        group = current_user.created_groups.build(group_params)

        if group.save
          # Auto-join creator as admin
          group.group_memberships.create!(user: current_user, role: "admin")
          render json: { group: GroupSerializer.new(group).serializable_hash }, status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /groups/:id/join
      def join
        return render json: { error: "Group is full" }, status: :forbidden if @group.full?
        return render json: { error: "Already a member" }, status: :conflict if @group.member?(current_user)

        @group.group_memberships.create!(user: current_user)
        head :created
      end

      # DELETE /groups/:id/leave
      def leave
        membership = @group.group_memberships.find_by(user: current_user)
        return render json: { error: "Not a member" }, status: :not_found unless membership

        membership.destroy!
        head :no_content
      end

      private

      def set_group
        @group = Group.active.find(params[:id])
      end

      def group_params
        params.require(:group).permit(:title, :description, :city, :max_members)
      end
    end
  end
end
