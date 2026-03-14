module Api
  module V1
    class MessagesController < BaseController
      before_action :set_connection

      # GET /messages/:connection_id
      def index
        messages = @connection.messages
                              .includes(:referenced_post, :reactions)
                              .order(created_at: :asc)
                              .then { |s| paginate(s) }

        # Mark received messages as read
        updated = @connection.messages
                   .where.not(sender_id: current_user.id)
                   .where(read: false)
                   .update_all(read: true, updated_at: Time.current)

        # Broadcast read receipt if any messages were marked
        if updated > 0
          ActionCable.server.broadcast(
            "conversation_#{@connection.id}",
            { type: "messages_read", reader_id: current_user.id }
          )
        end

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

      # POST /messages/:id/react
      def react
        message = @connection.messages.find(params[:id])
        reaction = message.reactions.find_or_initialize_by(user: current_user, emoji: params[:emoji])

        if reaction.persisted?
          reaction.destroy!
          head :no_content
        elsif reaction.save
          render json: { reaction: reaction.as_broadcast }, status: :created
        else
          render json: { errors: reaction.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /messages/:id/pin
      def pin
        message = @connection.messages.find(params[:id])

        if message.pinned?
          message.update!(pinned: false, pinned_at: nil, pinned_by: nil)
        else
          message.update!(pinned: true, pinned_at: Time.current, pinned_by: current_user)
        end

        ActionCable.server.broadcast(
          "conversation_#{@connection.id}",
          { type: "pin_updated", message_id: message.id, pinned: message.pinned? }
        )

        render json: { pinned: message.pinned? }
      end

      # GET /messages/:connection_id/pinned
      def pinned
        messages = @connection.messages.where(pinned: true).includes(:reactions).order(pinned_at: :desc)
        render json: { messages: MessageSerializer.new(messages).serializable_hash }
      end

      # POST /messages/:connection_id/typing
      def typing
        ActionCable.server.broadcast(
          "conversation_#{@connection.id}",
          { type: "typing", user_id: current_user.id, user_name: current_user.profile&.name }
        )
        head :ok
      end

      # POST /messages/:connection_id/mark_read
      def mark_read
        updated = @connection.messages
                   .where.not(sender_id: current_user.id)
                   .where(read: false)
                   .update_all(read: true, updated_at: Time.current)

        if updated > 0
          ActionCable.server.broadcast(
            "conversation_#{@connection.id}",
            { type: "messages_read", reader_id: current_user.id }
          )
        end

        head :ok
      end

      private

      def set_connection
        conn_id = params[:connection_id] || params[:id]&.then { |_| nil }
        # For nested actions, connection_id comes from the route
        if params[:connection_id]
          @connection = current_user.accepted_connections.find(params[:connection_id])
        else
          # For react/pin on individual messages, find connection through message
          message = Message.find(params[:id])
          @connection = current_user.accepted_connections.find(message.connection_id)
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Connection not found or not accepted" }, status: :not_found
      end
    end
  end
end
