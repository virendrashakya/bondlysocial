module Auth
  class TokenService
    SECRET      = ENV.fetch("SECRET_KEY_BASE")
    ALGORITHM   = "HS256"
    ACCESS_TTL  = 24.hours
    REFRESH_TTL = 30.days

    def self.encode_access(user_id)
      payload = {
        sub:  user_id,
        iat:  Time.current.to_i,
        exp:  ACCESS_TTL.from_now.to_i,
        type: "access"
      }
      JWT.encode(payload, SECRET, ALGORITHM)
    end

    def self.encode_refresh(user_id)
      payload = {
        sub:  user_id,
        iat:  Time.current.to_i,
        exp:  REFRESH_TTL.from_now.to_i,
        type: "refresh"
      }
      JWT.encode(payload, SECRET, ALGORITHM)
    end

    def self.decode(token)
      decoded = JWT.decode(token, SECRET, true, algorithm: ALGORITHM)
      decoded.first.with_indifferent_access
    rescue JWT::ExpiredSignature
      raise Auth::Errors::TokenExpired
    rescue JWT::DecodeError
      raise Auth::Errors::TokenInvalid
    end

    def self.issue_tokens(user)
      access  = encode_access(user.id)
      refresh = encode_refresh(user.id)
      user.update_column(:refresh_token, BCrypt::Password.create(refresh))
      { access_token: access, refresh_token: refresh }
    end
  end
end
