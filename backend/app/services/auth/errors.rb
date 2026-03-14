module Auth
  module Errors
    class TokenExpired < StandardError; end
    class TokenInvalid < StandardError; end
  end
end
