class GroupChannel < ApplicationCable::Channel
  def subscribed
    group = Group.find_by(id: params[:group_id])
    reject and return unless group
    reject and return unless group.member?(current_user)

    stream_from "group_#{params[:group_id]}"
  end

  def unsubscribed
    stop_all_streams
  end
end
