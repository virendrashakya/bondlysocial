require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module IntentConnect
  class Application < Rails::Application
    config.load_defaults 7.1

    # API only mode
    config.api_only = true

    # Middleware needed by Administrate (admin panel)
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: "_intent_admin_session"
    config.middleware.use ActionDispatch::Flash

    # ActionCable adapter
    config.action_cable.mount_path = "/cable"

    # Time zone
    config.time_zone = "Asia/Kolkata"

    # ActiveJob backend
    config.active_job.queue_adapter = :sidekiq

    # ActiveStorage variant processor
    config.active_storage.variant_processor = :mini_magick

    # CORS — set origins in initializers/cors.rb
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins *ENV.fetch("ALLOWED_ORIGINS", "http://localhost:8080").split(",").map(&:strip)
        resource "*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose:  ["Authorization"]
      end
    end
  end
end
