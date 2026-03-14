require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.log_level = :info
  config.log_tags  = [:request_id]
  config.logger    = ActiveSupport::Logger.new($stdout)

  config.active_storage.service = :amazon

  config.force_ssl = ENV["FORCE_SSL"] == "true"

  config.action_cable.url = ENV["ACTION_CABLE_URL"]
  config.action_cable.allowed_request_origins = [ENV["FRONTEND_URL"]].compact

  config.action_mailer.default_url_options = { host: ENV["APP_HOST"], protocol: "https" }
end
