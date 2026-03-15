module Api
  module V1
    class GroupsController < BaseController
      before_action :set_group, only: [:show, :join, :leave, :messages, :send_message]

      # GET /groups
      def index
        groups = Group.active.includes(:group_memberships, creator: :profile).order(created_at: :desc)
        groups = groups.in_city(params[:city]) if params[:city].present?
        groups = paginate(groups)
        render json: { groups: GroupSerializer.new(groups, params: { current_user: current_user }).serializable_hash }
      end

      # GET /groups/:id
      def show
        render json: { group: GroupSerializer.new(@group, params: { current_user: current_user }).serializable_hash }
      end

      # POST /groups
      def create
        group = current_user.created_groups.build(group_params)

        if group.save
          group.group_memberships.create!(user: current_user, role: "admin")
          render json: { group: GroupSerializer.new(group, params: { current_user: current_user }).serializable_hash }, status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /groups/:id/join
      def join
        return render json: { error: "Group is full" }, status: :forbidden if @group.full?
        return render json: { error: "Already a member" }, status: :conflict if @group.member?(current_user)

        @group.group_memberships.create!(user: current_user)
        render json: { group: GroupSerializer.new(@group.reload, params: { current_user: current_user }).serializable_hash }, status: :created
      end

      # DELETE /groups/:id/leave
      def leave
        membership = @group.group_memberships.find_by(user: current_user)
        return render json: { error: "Not a member" }, status: :not_found unless membership

        membership.destroy!
        head :no_content
      end

      # GET /groups/:id/messages
      def messages
        return render json: { error: "Not a member" }, status: :forbidden unless @group.member?(current_user)

        msgs = @group.group_messages
                     .includes(user: :profile)
                     .order(created_at: :asc)
                     .last(100)

        render json: {
          messages: msgs.map { |m| serialize_message(m) }
        }
      end

      # POST /groups/:id/messages
      def send_message
        return render json: { error: "Not a member" }, status: :forbidden unless @group.member?(current_user)

        msg = @group.group_messages.build(user: current_user, body: params[:body])

        if msg.save
          payload = serialize_message(msg)
          ActionCable.server.broadcast("group_#{@group.id}", { type: "message", message: payload })
          render json: { message: payload }, status: :created
        else
          render json: { errors: msg.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_group
        @group = Group.active.find(params[:id])
      end

      def group_params
        params.require(:group).permit(:title, :description, :city, :category, :max_members)
      end

      def serialize_message(msg)
        profile = msg.user.profile
        {
          id: msg.id,
          body: msg.body,
          user_id: msg.user_id,
          user_name: profile&.name || msg.user.email,
          user_avatar: profile&.avatar_url,
          created_at: msg.created_at
        }
      end
    end
  end
end
