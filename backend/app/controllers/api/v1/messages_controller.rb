module Api
  module V1
    class MessagesController < BaseController
      before_action :set_connection

      # GET /messages/:connection_id
      def index
        messages = @connection.messages
                              .includes(:referenced_post)
                              .order(created_at: :asc)
                              .then { |s| paginate(s) }

        # Mark received messages as read
        @connection.messages
                   .where.not(sender_id: current_user.id)
                   .where(read: false)
                   .update_all(read: true)

        render json: { messages: MessageSerializer.new(messages).serializable_hash }
      end

      # POST /messages
      def create
        message = @connection.messages.build(
          sender:            current_user,
          body:              params[:body],
          referenced_post_id: params[:referenced_post_id]
        )

        message.image.attach(params[:image]) if params[:image].present?

        if message.save
          render json: { message: MessageSerializer.new(message).serializable_hash }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_connection
        @connection = current_user.accepted_connections.find(params[:connection_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Connection not found or not accepted" }, status: :not_found
      end
    end
  end
end
