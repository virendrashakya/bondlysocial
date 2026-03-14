module Api
  module V1
    class NotificationsController < BaseController
      # GET /notifications
      def index
        notifications = current_user.notifications.recent
        render json: { notifications: NotificationSerializer.new(notifications).serializable_hash,
                       unread_count: current_user.notifications.unread.count }
      end

      # PATCH /notifications/:id/read
      def mark_read
        notification = current_user.notifications.find(params[:id])
        notification.mark_read!
        head :no_content
      end

      # PATCH /notifications/read_all
      def mark_all_read
        current_user.notifications.unread.update_all(read: true)
        head :no_content
      end
    end
  end
end
