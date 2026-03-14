module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token   = request.params[:token] || request.headers["Authorization"]&.split(" ")&.last
      return reject_unauthorized_connection unless token

      payload = Auth::TokenService.decode(token)
      user    = User.find_by(id: payload[:sub])
      return reject_unauthorized_connection unless user&.active?

      user
    rescue Auth::Errors::TokenExpired, Auth::Errors::TokenInvalid
      reject_unauthorized_connection
    end
  end
end
