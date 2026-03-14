class Rack::Attack
  # Allow all localhost in development
  safelist("allow-localhost") { |req| req.ip == "127.0.0.1" && Rails.env.development? }

  # Throttle OTP requests: 5 per phone per 10 minutes
  throttle("otp/phone", limit: 5, period: 10.minutes) do |req|
    if req.path == "/api/v1/auth/verify_otp" && req.post?
      req.params["phone"]
    end
  end

  # Throttle signup: 10 per IP per hour
  throttle("signup/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/auth/signup" && req.post?
  end

  # Throttle login: 20 per IP per hour
  throttle("login/ip", limit: 20, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/auth/login" && req.post?
  end

  self.throttled_responder = lambda do |env|
    [429, { "Content-Type" => "application/json" },
     ['{"error":"Too many requests. Please wait before trying again."}']]
  end
end
