module Api
  module V1
    class SafetyController < BaseController
      # GET /blocks
      def index
        blocks = current_user.blocks_as_blocker.includes(blocked: :profile).order(created_at: :desc)
        render json: {
          blocks: blocks.map { |b|
            {
              id: b.id,
              blocked_id: b.blocked_id,
              blocked_name: b.blocked.profile&.name || b.blocked.email,
              blocked_avatar_url: b.blocked.profile&.avatar_url,
              created_at: b.created_at.iso8601
            }
          }
        }
      end

      # POST /reports
      def report
        reported_user = User.active.find(params[:reported_id])

        report = Report.new(
          reporter: current_user,
          reported: reported_user,
          reason:   params[:reason],
          details:  params[:details]
        )

        if report.save
          render json: { message: "Report submitted" }, status: :created
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /blocks
      def block
        blocked_user = User.find(params[:blocked_id])

        block = Block.find_or_initialize_by(blocker: current_user, blocked: blocked_user)

        if block.new_record? && block.save
          # Destroy any existing connection
          Connection.where(
            "(requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)",
            current_user.id, blocked_user.id,
            blocked_user.id, current_user.id
          ).destroy_all

          render json: { message: "User blocked" }, status: :created
        else
          render json: { errors: block.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /blocks/:id
      def unblock
        block = current_user.blocks_as_blocker.find_by(blocked_id: params[:id])
        return render json: { error: "Block not found" }, status: :not_found unless block

        block.destroy!
        head :no_content
      end
    end
  end
end
