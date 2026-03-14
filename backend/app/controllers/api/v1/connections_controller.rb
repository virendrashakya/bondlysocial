module Api
  module V1
    class ConnectionsController < BaseController
      before_action :set_connection, only: [:accept, :reject]

      # GET /connections
      def index
        connections = current_user.accepted_connections
                                  .includes(:requester, :receiver)
                                  .order(updated_at: :desc)
        render json: { connections: ConnectionSerializer.new(connections, { params: { current_user: current_user } }).serializable_hash }
      end

      # GET /connections/requests
      def requests
        pending = current_user.received_connections.pending.includes(:requester)
        render json: { requests: ConnectionSerializer.new(pending, { params: { current_user: current_user } }).serializable_hash }
      end

      # POST /connections
      def create
        receiver = User.active.find(params[:receiver_id])

        # Safety: block check
        if current_user.blocked_user_ids.include?(receiver.id)
          return render json: { error: "Cannot connect" }, status: :forbidden
        end

        connection = Connection.new(requester: current_user, receiver: receiver)

        if connection.save
          NotificationJob.perform_later(
            user_id:  receiver.id,
            kind:     "connection_request",
            title:    "#{current_user.profile&.name} wants to connect",
            metadata: { connection_id: connection.id, requester_id: current_user.id }
          )
          render json: { connection: ConnectionSerializer.new(connection).serializable_hash }, status: :created
        else
          render json: { errors: connection.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /connections/:id/accept
      def accept
        @connection.accept!
        render json: { connection: ConnectionSerializer.new(@connection).serializable_hash }
      end

      # POST /connections/:id/reject
      def reject
        @connection.reject!
        head :no_content
      end

      private

      def set_connection
        @connection = current_user.received_connections.pending.find(params[:id])
      end
    end
  end
end
