require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.cache_store = :null_store
  config.active_storage.service = :local
  config.action_mailer.perform_deliveries = false
  config.active_support.deprecation = :stderr
end
