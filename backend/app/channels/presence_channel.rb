class PresenceChannel < ApplicationCable::Channel
  def subscribed
    stream_from "presence"
    current_user.touch_active!
    broadcast_status("online")
  end

  def unsubscribed
    broadcast_status("offline")
  end

  def heartbeat
    current_user.touch_active!
  end

  private

  def broadcast_status(status)
    return unless current_user.profile&.show_online_status

    ActionCable.server.broadcast("presence", {
      type: "presence",
      user_id: current_user.id,
      status: status,
      last_active_at: current_user.last_active_at&.iso8601
    })
  end
end
