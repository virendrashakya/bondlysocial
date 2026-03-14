class UserMatcherService
  CACHE_TTL       = 24.hours
  RESULTS_PER_DAY = 10

  SCORE_CITY      = 40
  SCORE_INTENT    = 30
  SCORE_INTEREST  = 5   # per shared interest, max 40 (8 shared)
  SCORE_AGE       = 10  # within 5 year window

  def self.call(user)
    new(user).call
  end

  def initialize(user)
    @user    = user
    @profile = user.profile
  end

  def call
    cache_key = "matches:user:#{@user.id}:#{Date.current}"
    cached    = Rails.cache.read(cache_key)
    return cached if cached

    results = compute_matches
    Rails.cache.write(cache_key, results, expires_in: CACHE_TTL)
    results
  end

  private

  def compute_matches
    return [] unless @profile

    candidates = candidate_profiles
    scored     = candidates.map { |p| [p, score(p)] }
    scored.sort_by { |_, s| -s }
          .first(RESULTS_PER_DAY)
          .map(&:first)
  end

  def candidate_profiles
    return Profile.none unless @profile

    excluded_ids = @user.blocked_user_ids +
                   connected_user_ids +
                   [@user.id]

    Profile
      .joins(:user)
      .where(users: { status: "active", phone_verified: true })
      .where.not(user_id: excluded_ids)
      .where(hidden: false)
      .where(intent: @profile.compatible_intents)
      .where(city: @profile.city)
  end

  def connected_user_ids
    @user.connections.pluck(:requester_id, :receiver_id).flatten.uniq
  end

  def score(candidate)
    total = 0
    total += SCORE_CITY    if candidate.city == @profile.city
    total += SCORE_INTENT  if candidate.compatible_intents.include?(@profile.intent)
    total += age_score(candidate)
    total += interest_score(candidate)
    total
  end

  def age_score(candidate)
    diff = (@profile.age - candidate.age).abs
    diff <= 5 ? SCORE_AGE : 0
  end

  def interest_score(candidate)
    shared = (Array(@profile.interests) & Array(candidate.interests)).length
    [shared * SCORE_INTEREST, 40].min
  end
end
