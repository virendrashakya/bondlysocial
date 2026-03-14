# Scheduled daily via whenever / cron to pre-warm match caches
class MatchCacheWarmupJob < ApplicationJob
  queue_as :low

  def perform
    User.active.verified.find_each do |user|
      next unless user.profile

      UserMatcherService.call(user)
    end
  end
end
