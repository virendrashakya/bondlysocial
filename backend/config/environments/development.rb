require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  # Storage (use local disk in dev, not S3)
  config.active_storage.service = :local

  # Logging — tails at: tail -f log/development.log
  config.log_level  = :debug
  config.log_tags   = [:request_id]
  config.logger     = ActiveSupport::Logger.new($stdout).tap do |l|
    l.formatter = proc do |severity, _time, _prog, msg|
      color = { "DEBUG" => "\e[37m", "INFO" => "\e[36m",
                "WARN"  => "\e[33m", "ERROR" => "\e[31m", "FATAL" => "\e[35m" }[severity] || ""
      "#{color}[#{severity}]\e[0m #{msg}\n"
    end
  end
  # Also mirror to log/development.log for tail -f
  config.logger = ActiveSupport::BroadcastLogger.new(
    ActiveSupport::Logger.new($stdout),
    ActiveSupport::Logger.new(Rails.root.join("log/development.log"))
  )

  # Cache store — use Redis so OTP payloads survive across Puma workers
  config.cache_store = :redis_cache_store, {
    url: ENV.fetch("REDIS_URL", "redis://localhost:6379/1"),
    error_handler: ->(method:, returning:, exception:) {
      Rails.logger.warn "[CACHE] Redis error (#{method}): #{exception.message}"
    }
  }

  # ActionCable
  config.action_cable.url = "ws://localhost:3000/cable"
  config.action_cable.allowed_request_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    /http:\/\/192\.168\.\d+\.\d+:\d+/
  ]

  # URL options (needed by ActiveStorage blob URLs)
  # Use APP_HOST env to generate URLs reachable from other devices (phones on LAN, Docker, etc.)
  _host = ENV.fetch("APP_HOST", "localhost")
  _port = ENV.fetch("APP_PORT", "3000").to_i
  Rails.application.routes.default_url_options = { host: _host, port: _port }

  # Mailer
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.perform_caching       = false
  config.action_mailer.default_url_options   = { host: "localhost", port: 3000 }
end
