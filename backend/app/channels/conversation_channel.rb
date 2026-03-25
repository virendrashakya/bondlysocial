class ConversationChannel < ApplicationCable::Channel
  def subscribed
    connection_id = params[:connection_id]
    Rails.logger.info "[ActionCable] ConversationChannel subscribing connection_id: #{connection_id} for user: #{current_user.id}"

    # Authorize: user must be a participant
    conn = Connection.find_by(id: connection_id)
    unless conn
      Rails.logger.info "[ActionCable] Rejected! No connection found."
      reject and return
    end

    unless [conn.requester_id, conn.receiver_id].include?(current_user.id)
      Rails.logger.info "[ActionCable] Rejected! User not participant."
      reject and return
    end

    unless conn.status == "accepted"
      Rails.logger.info "[ActionCable] Rejected! Status not accepted. #{conn.status}"
      reject and return
    end

    Rails.logger.info "[ActionCable] SUCCESS! Streaming from conversation_#{connection_id}"
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
