class ConversationChannel < ApplicationCable::Channel
  def subscribed
    connection_id = params[:connection_id]

    # Authorize: user must be a participant
    conn = Connection.find_by(id: connection_id)
    reject and return unless conn
    reject and return unless [conn.requester_id, conn.receiver_id].include?(current_user.id)
    reject and return unless conn.status == "accepted"

    stream_from "conversation_#{connection_id}"
  end

  def unsubscribed
    stop_all_streams
  end

  # Client can call this directly via ActionCable perform
  def typing
    ActionCable.server.broadcast(
      "conversation_#{params[:connection_id]}",
      { type: "typing", user_id: current_user.id, user_name: current_user.profile&.name }
    )
  end
end
