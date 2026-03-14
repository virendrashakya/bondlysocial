puts "Seeding IntentConnect..."

# ─── Admin user ───────────────────────────────────────────────────────────────
admin = User.find_or_create_by!(email: "admin@intentconnect.com") do |u|
  u.phone            = "+910000000000"
  u.password         = "admin1234"
  u.role             = "admin"
  u.status           = "active"
  u.phone_verified   = true
  u.selfie_verified  = true
end
puts "  Admin: #{admin.email}"

# ─── Sample members ───────────────────────────────────────────────────────────
SEED_USERS = [
  { name: "Priya Sharma",   age: 28, gender: "female", city: "Bangalore",
    occupation: "UX Designer",   intent: "friendship",
    bio: "Into design, coffee and long walks. Looking for genuine friendships.",
    interests: ["Design", "Coffee", "Hiking", "Reading"] },

  { name: "Arjun Mehta",    age: 31, gender: "male",   city: "Bangalore",
    occupation: "Software Engineer", intent: "activity_partner",
    bio: "Morning runner and weekend cyclist. Would love a gym or trail buddy.",
    interests: ["Fitness", "Cycling", "Tech", "Gaming"] },

  { name: "Sneha Iyer",     age: 26, gender: "female", city: "Mumbai",
    occupation: "Marketing Manager", intent: "networking",
    bio: "Building in the startup ecosystem. Let's exchange ideas over chai.",
    interests: ["Startup", "Marketing", "Tech", "Travel"] },

  { name: "Rohit Kapoor",   age: 34, gender: "male",   city: "Mumbai",
    occupation: "Entrepreneur",  intent: "networking",
    bio: "Bootstrapped two companies. Happy to mentor and collaborate.",
    interests: ["Startup", "Investing", "Tech", "Reading"] },

  { name: "Kavya Nair",     age: 29, gender: "female", city: "Bangalore",
    occupation: "Therapist",     intent: "emotional_support",
    bio: "I listen, I share. Looking for a community that values depth.",
    interests: ["Yoga", "Spirituality", "Reading", "Music"] },

  { name: "Vikram Singh",   age: 33, gender: "male",   city: "Delhi",
    occupation: "Lawyer",        intent: "serious_relationship",
    bio: "Values-driven, family oriented. Looking for something real.",
    interests: ["Cooking", "Travel", "Music", "Fitness"] },

  { name: "Ananya Bose",    age: 27, gender: "female", city: "Bangalore",
    occupation: "Product Manager", intent: "friendship",
    bio: "New to Bangalore. Looking for book clubs, hikes and honest conversations.",
    interests: ["Reading", "Hiking", "Photography", "Travel"] },

  { name: "Rahul Verma",    age: 30, gender: "male",   city: "Mumbai",
    occupation: "Finance Analyst", intent: "activity_partner",
    bio: "Weekend cricketer and occasional runner. Looking for a workout crew.",
    interests: ["Fitness", "Cricket", "Travel", "Cooking"] },

  { name: "Meera Pillai",   age: 32, gender: "female", city: "Delhi",
    occupation: "Architect",     intent: "serious_relationship",
    bio: "Intentional, thoughtful, ready. Looking for a partner who values depth.",
    interests: ["Art", "Design", "Travel", "Yoga"] },

  { name: "Dev Krishnan",   age: 29, gender: "male",   city: "Bangalore",
    occupation: "Data Scientist", intent: "friendship",
    bio: "Into board games, sci-fi and terrible puns. Looking for my people.",
    interests: ["Gaming", "Tech", "Reading", "Music"] },
].freeze

SEED_USERS.each_with_index do |attrs, i|
  email = "#{attrs[:name].downcase.gsub(' ', '.')}@seed.com"
  phone = "+9198#{format('%08d', i + 1)}"

  user = User.find_or_create_by!(email: email) do |u|
    u.phone           = phone
    u.password        = "password123"
    u.role            = "member"
    u.status          = "active"
    u.phone_verified  = true
    u.selfie_verified = [true, true, true, false].sample  # some verified
  end

  Profile.find_or_create_by!(user: user) do |p|
    p.name       = attrs[:name]
    p.age        = attrs[:age]
    p.gender     = attrs[:gender]
    p.city       = attrs[:city]
    p.occupation = attrs[:occupation]
    p.intent     = attrs[:intent]
    p.bio        = attrs[:bio]
    p.interests  = attrs[:interests]
    p.hidden     = false
  end

  print "  #{attrs[:name]} (#{attrs[:intent]}, #{attrs[:city]})... "
  puts "ok"
end

# ─── Sample connections ────────────────────────────────────────────────────────
users = User.joins(:profile).where.not(email: "admin@intentconnect.com").limit(6).to_a

if users.length >= 2
  c = Connection.find_or_create_by!(requester: users[0], receiver: users[1]) do |conn|
    conn.status = "accepted"
  end

  Connection.find_or_create_by!(requester: users[2], receiver: users[3]) do |conn|
    conn.status = "pending"
  end

  # Sample messages on the accepted connection
  if c.status == "accepted" && c.messages.empty?
    c.messages.create!(sender: users[0], body: "Hey! Nice to connect with you here.")
    c.messages.create!(sender: users[1], body: "Hi! Yes, I noticed we're both in Bangalore. What are you into these days?")
    c.messages.create!(sender: users[0], body: "Mostly hiking and reading. You?")
  end
  puts "  Sample connections + messages seeded"
end

# ─── Activity groups ──────────────────────────────────────────────────────────
GROUPS = [
  { title: "Morning Runners Bangalore", city: "Bangalore", max_members: 30,
    description: "5:30am runs around Cubbon Park. All paces welcome." },
  { title: "Book Club Mumbai",           city: "Mumbai",    max_members: 15,
    description: "Monthly fiction meetup in Bandra. One book, real conversations." },
  { title: "Startup Networking Delhi",   city: "Delhi",     max_members: 50,
    description: "Founders, PMs, and investors. Quarterly mixers." },
  { title: "Yoga & Mindfulness Bangalore", city: "Bangalore", max_members: 20,
    description: "Weekly evening sessions + discussions on inner work." },
].freeze

creator = User.find_by(email: "admin@intentconnect.com")
GROUPS.each do |attrs|
  g = Group.find_or_create_by!(title: attrs[:title]) do |group|
    group.city        = attrs[:city]
    group.max_members = attrs[:max_members]
    group.description = attrs[:description]
    group.creator     = creator
    group.status      = "active"
  end
  GroupMembership.find_or_create_by!(group: g, user: creator) { |m| m.role = "admin" }
  puts "  Group: #{attrs[:title]}"
end

puts "\nDone! #{User.count} users, #{Profile.count} profiles, #{Group.count} groups seeded."
