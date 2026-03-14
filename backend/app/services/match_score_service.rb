class MatchScoreService
  def self.call(current_user, profile)
    new(current_user, profile).score
  end

  def initialize(current_user, profile)
    @me   = current_user.profile
    @them = profile
  end

  def score
    return 0 unless @me
    total = 0

    # Intent compatibility: 40 pts
    total += 40 if @me.compatible_intents.include?(@them.intent)

    # Shared interests: 10 pts each, max 40
    shared = ((@me.interests || []) & (@them.interests || [])).length
    total += [shared, 4].min * 10

    # Same city: 20 pts
    total += 20 if @me.city.to_s.downcase == @them.city.to_s.downcase

    total
  end
end
