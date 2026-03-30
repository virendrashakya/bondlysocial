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

# ─── Realistic seed profiles ─────────────────────────────────────────────────
FREEPIK_FEMALE = [
  "https://img.freepik.com/free-photo/smiling-businesswoman-talking-mobile-phone_1262-5760.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/studio-portrait-young-woman-wearing-traditional-sari-garment_23-2149565127.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/medium-shot-girl-posing-pink-dress_23-2149537505.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/full-shot-smiley-woman-with-cocktail-outdoors_23-2150166218.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/smiling-young-businesswoman-talking-phone_1262-5801.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/portrait-young-model-plaid-shirt-posing-near-lamps_114579-81047.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/portrait-beautiful-lady-sporty-top-with-glass-water_1153-4633.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/beautiful-woman-near-fireplace_114579-85114.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/beautiful-woman-near-fireplace-looking-front_114579-85106.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/brunette-model-girl-dress-with-stripes-background-cian-wooden-background_627829-12444.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/side-view-woman-dress_23-2148266015.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/young-beautiful-woman-drinks-coffee-cafe-has-breakfast-with-healthy-food-cafe_1321-3901.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/outdoor-fashion-image-pretty-graceful-woman-stylish-velvet-dress_273443-1579.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/girl-sitting-near-window-looking-her-smartphone_1157-1533.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/lovely-swimmer-looking-away-medium-shot_23-2148393543.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/brunette-smiley-woman-holding-her-smartphone-outdoors_23-2148728652.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/front-view-smiley-girl-posing-studio_23-2149451744.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/sideways-woman-white-pants-floral-shirt_23-2148286140.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/enjoying-day-park_181624-43831.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/woman-sitting-happily-stairs_1150-19394.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/expressive-woman-posing-outdoor_344912-3095.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/beautiful-lonely-girl-sitting-city-with-light-back_158595-4496.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/beautiful-lonely-girl-sitting-city-with-light-back_158595-4495.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/side-view-woman-outdoors-swing_23-2148629830.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/woman-sitting-tree-trunk-meditating-with-mudra-gesture_23-2148186021.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/young-woman-with-bottle-water-training-stadium_169016-22816.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/glamour-woman-black-top-sitting-white-carpet-showing-wooden-star_114579-84809.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/filipino-female-with-umbrella-speaking-phone_1098-22142.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/portrait-sexy-brunette-girl-women-s-jeans-shorts-white-blouse-against-blue-wooden-house_627829-11859.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/closeup-smiling-young-beautiful-indian-woman_1262-2261.jpg?w=740&q=80",
].freeze

FREEPIK_MALE = [
  "https://img.freepik.com/free-photo/portrait-young-entrepreneur-man_23-2148898745.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/indian-man-wear-traditional-clothes-with-white-scarf-posed-outdoor_627829-12650.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/young-indian-student-man-checkered-shirt-jeans-sitting-handrails-against-lake_627829-12794.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/young-man-looking-camera-funfair_23-2148281684.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/asian-man-holidays-barcelona_657883-575.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/vertical-shot-serious-young-man-wearing-turtleneck-leather-jacket-necklace-watch_181624-38927.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/close-up-man-wearing-hat_23-2148895168.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/handsome-man-portrait-funfair_23-2148281678.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/handsome-man-thinking-with-concentration_23-2147805628.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/close-up-modern-man-portrait_23-2148895216.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/indian-man-student-shirt-posed-outdoor_627829-12758.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/stylish-indian-model-man-casual-clothes-sunglasses-posed-outdoor-street-india-speaking-mobile-phone_627829-12959.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/young-man-beach_23-2147645586.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/beautiful-young-person-shirt-street_23-2148163330.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/indian-man-wear-traditional-clothes-with-white-scarf-posed-outdoor_627829-12642.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/stylish-indian-beard-man-sunglasses-pink-tshirt-india-model-posed-outdoor-streets-city_627829-12693.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/selective-focus-shot-young-asian-male-blurry-background_181624-55767.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/handsome-man-funfair-looking-camera_23-2148281640.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/man-with-smartphone-looking-away_23-2147747853.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/boy-playing-ukelele-by-fountain_23-2148006419.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/serious-handsome-man-standing-outdoors-with-his-arms-crossed_1262-19022.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/close-up-handsome-man-posing_23-2148895180.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/medium-shot-man-traveling-by-train_23-2150520142.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/pensive-man-standing-balcony_74855-20335.jpg?w=740&q=80",
  "https://img.freepik.com/free-photo/attractive-south-asian-male-posing-front-brick-wall-wearing-jean-jacket_181624-57845.jpg?w=740&q=80",
].freeze

SEED_USERS = [
  # ── Women ──────────────────────────────────────────────────────────────────
  { name: "Priya Sharma",    age: 26, gender: "female", city: "Bangalore",
    occupation: "UX Designer",       intent: "friendship",
    bio: "Into design, matcha and long walks through Cubbon Park. Looking for genuine friendships — not networking in disguise.",
    interests: ["Design", "Coffee", "Hiking", "Reading", "Photography"],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    height_cm: 163, body_type: "slim", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Kannada"],
    appearance_tags: ["glasses", "minimalist"] },

  { name: "Sneha Iyer",      age: 28, gender: "female", city: "Mumbai",
    occupation: "Marketing Manager", intent: "networking",
    bio: "Building in the D2C ecosystem. I live for pitch decks and filter coffee. Let's exchange ideas over chai at Prithvi.",
    interests: ["Startup", "Marketing", "Travel", "Music", "Writing"],
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    height_cm: 158, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Tamil", "Malayalam"],
    appearance_tags: ["fitness_focused", "traveler"] },

  { name: "Kavya Nair",      age: 30, gender: "female", city: "Bangalore",
    occupation: "Therapist",         intent: "emotional_support",
    bio: "I listen, I hold space, I share. Looking for a community that values depth over small talk.",
    interests: ["Yoga", "Spirituality", "Reading", "Music", "Art"],
    avatar: "https://randomuser.me/api/portraits/women/85.jpg",
    height_cm: 165, body_type: "average", drinking: "never", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Malayalam"],
    appearance_tags: ["traditional", "long_hair"] },

  { name: "Ananya Bose",     age: 25, gender: "female", city: "Bangalore",
    occupation: "Product Manager",   intent: "friendship",
    bio: "New to Bangalore. Looking for book clubs, sunrise hikes, and honest conversations over cold brew.",
    interests: ["Reading", "Hiking", "Photography", "Travel", "Tech"],
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    height_cm: 160, body_type: "slim", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "east_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Bengali"],
    appearance_tags: ["glasses", "traveler"] },

  { name: "Meera Pillai",    age: 31, gender: "female", city: "Delhi",
    occupation: "Architect",         intent: "serious_relationship",
    bio: "Intentional, thoughtful, ready. Values over vibes. Looking for a partner who believes in growing together.",
    interests: ["Art", "Design", "Travel", "Yoga", "Cooking"],
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    height_cm: 168, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "south_indian", religion: "christian",
    languages_spoken: ["English", "Hindi", "Malayalam"],
    appearance_tags: ["fitness_focused", "artist"] },

  { name: "Riya Malhotra",   age: 27, gender: "female", city: "Mumbai",
    occupation: "Fashion Stylist",   intent: "friendship",
    bio: "Bollywood obsessed. Weekend brunch enthusiast. Let's explore hidden gems in Bandra and Versova together.",
    interests: ["Art", "Photography", "Dance", "Travel", "Music"],
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    height_cm: 170, body_type: "slim", drinking: "social", smoking: "occasionally",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Punjabi"],
    appearance_tags: ["tattoos", "artist", "long_hair"] },

  { name: "Ishita Gupta",    age: 29, gender: "female", city: "Delhi",
    occupation: "Data Analyst",      intent: "activity_partner",
    bio: "Looking for a running buddy and someone to share museum visits with. I speak fluent Python and terrible Hindi jokes.",
    interests: ["Fitness", "Tech", "Reading", "Music", "Travel"],
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    height_cm: 162, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi"],
    appearance_tags: ["fitness_focused", "short_hair"] },

  { name: "Nandini Rao",     age: 33, gender: "female", city: "Bangalore",
    occupation: "Founder & CEO",     intent: "networking",
    bio: "Building a health-tech startup. Angel investor on the side. Looking to connect with ambitious, kind humans.",
    interests: ["Startup", "Tech", "Fitness", "Reading", "Travel"],
    avatar: "https://randomuser.me/api/portraits/women/57.jpg",
    height_cm: 166, body_type: "slim", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "divorced",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Telugu", "Kannada"],
    appearance_tags: ["minimalist", "glasses"] },

  { name: "Tara Krishnan",   age: 24, gender: "female", city: "Mumbai",
    occupation: "Graphic Designer",  intent: "serious_relationship",
    bio: "Old soul in a gen-Z body. I paint, I cook, I believe in love letters. Swipe culture exhausted me, so here I am.",
    interests: ["Art", "Cooking", "Music", "Writing", "Movies"],
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    height_cm: 157, body_type: "curvy", drinking: "never", smoking: "no",
    workout_frequency: "none", relationship_status: "single",
    cultural_background: "south_indian", religion: "christian",
    languages_spoken: ["English", "Hindi", "Malayalam"],
    appearance_tags: ["traditional", "artist", "long_hair"] },

  { name: "Simran Kaur",     age: 28, gender: "female", city: "Delhi",
    occupation: "Yoga Instructor",   intent: "marriage",
    bio: "Family-first values with a modern mindset. 5am sun salutations, home-cooked dal, and dreams of a warm, rooted life.",
    interests: ["Yoga", "Spirituality", "Cooking", "Music", "Fitness"],
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    height_cm: 164, body_type: "athletic", drinking: "never", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "north_indian", religion: "sikh",
    languages_spoken: ["English", "Hindi", "Punjabi"],
    appearance_tags: ["fitness_focused", "long_hair", "traditional"] },

  # ── Men ────────────────────────────────────────────────────────────────────
  { name: "Arjun Mehta",     age: 31, gender: "male",   city: "Bangalore",
    occupation: "Software Engineer", intent: "activity_partner",
    bio: "Morning runner and weekend cyclist. 6am Cubbon Park laps are my therapy. Need a trail buddy who won't cancel.",
    interests: ["Fitness", "Cycling", "Tech", "Gaming", "Cooking"],
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    height_cm: 178, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Gujarati"],
    appearance_tags: ["fitness_focused", "bearded"] },

  { name: "Rohit Kapoor",    age: 34, gender: "male",   city: "Mumbai",
    occupation: "Entrepreneur",      intent: "networking",
    bio: "Bootstrapped two companies. Third time's the charm. Happy to mentor, invest, or just talk about what keeps you up at night.",
    interests: ["Startup", "Investing", "Tech", "Reading", "Travel"],
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    height_cm: 175, body_type: "average", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "divorced",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi"],
    appearance_tags: ["glasses", "bearded"] },

  { name: "Vikram Singh",    age: 33, gender: "male",   city: "Delhi",
    occupation: "Lawyer",            intent: "serious_relationship",
    bio: "Values-driven, family oriented. Weekend cook, weekday warrior. Looking for something real — not another dating loop.",
    interests: ["Cooking", "Travel", "Music", "Fitness", "Reading"],
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    height_cm: 182, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "north_indian", religion: "sikh",
    languages_spoken: ["English", "Hindi", "Punjabi"],
    appearance_tags: ["bearded", "fitness_focused"] },

  { name: "Rahul Verma",     age: 30, gender: "male",   city: "Mumbai",
    occupation: "Finance Analyst",   intent: "activity_partner",
    bio: "Weekend cricketer, occasional runner, full-time foodie. Looking for someone who'll join me for Marine Drive runs.",
    interests: ["Fitness", "Cricket", "Travel", "Cooking", "Movies"],
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    height_cm: 173, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Marathi"],
    appearance_tags: ["short_hair", "fitness_focused"] },

  { name: "Dev Krishnan",    age: 29, gender: "male",   city: "Bangalore",
    occupation: "Data Scientist",    intent: "friendship",
    bio: "Into board games, sci-fi, and terrible puns. Looking for my people — the kind who debate Star Wars vs. Star Trek at 2am.",
    interests: ["Gaming", "Tech", "Reading", "Music", "Movies"],
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    height_cm: 176, body_type: "average", drinking: "social", smoking: "no",
    workout_frequency: "none", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Tamil"],
    appearance_tags: ["glasses", "bearded"] },

  { name: "Karan Patel",     age: 27, gender: "male",   city: "Mumbai",
    occupation: "Photographer",      intent: "friendship",
    bio: "Street photographer by passion, IT consultant by paycheck. Let's explore the lanes of Dharavi or Chor Bazaar together.",
    interests: ["Photography", "Travel", "Art", "Music", "Movies"],
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    height_cm: 171, body_type: "slim", drinking: "social", smoking: "occasionally",
    workout_frequency: "none", relationship_status: "single",
    cultural_background: "west_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Gujarati"],
    appearance_tags: ["tattoos", "artist"] },

  { name: "Aditya Joshi",    age: 32, gender: "male",   city: "Bangalore",
    occupation: "Product Lead",      intent: "serious_relationship",
    bio: "Done with the apps. Here for intent. I cook a mean biryani and believe in morning chai over morning texts.",
    interests: ["Cooking", "Tech", "Fitness", "Travel", "Reading"],
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    height_cm: 180, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Marathi"],
    appearance_tags: ["bearded", "fitness_focused", "short_hair"] },

  { name: "Nikhil Reddy",    age: 26, gender: "male",   city: "Bangalore",
    occupation: "Frontend Developer", intent: "activity_partner",
    bio: "React by day, rock climbing by weekend. Always up for a hackathon or a trek to Nandi Hills at 4am.",
    interests: ["Tech", "Fitness", "Hiking", "Gaming", "Music"],
    avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    height_cm: 174, body_type: "athletic", drinking: "social", smoking: "no",
    workout_frequency: "daily", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Telugu"],
    appearance_tags: ["fitness_focused", "short_hair"] },

  { name: "Siddharth Menon", age: 35, gender: "male",   city: "Delhi",
    occupation: "Doctor",            intent: "marriage",
    bio: "Cardiologist who still believes in the heart. Family man at core. Looking for a partner to build a life with, not just a lifestyle.",
    interests: ["Reading", "Travel", "Cooking", "Music", "Yoga"],
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    height_cm: 177, body_type: "average", drinking: "never", smoking: "no",
    workout_frequency: "weekly", relationship_status: "single",
    cultural_background: "south_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi", "Malayalam"],
    appearance_tags: ["glasses", "traditional"] },

  { name: "Aman Bhatt",      age: 28, gender: "male",   city: "Mumbai",
    occupation: "Music Producer",    intent: "emotional_support",
    bio: "Late night studio sessions, early morning existential crises. Looking for someone who gets that creative life is a rollercoaster.",
    interests: ["Music", "Art", "Writing", "Movies", "Spirituality"],
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    height_cm: 169, body_type: "slim", drinking: "social", smoking: "occasionally",
    workout_frequency: "none", relationship_status: "single",
    cultural_background: "north_indian", religion: "hindu",
    languages_spoken: ["English", "Hindi"],
    appearance_tags: ["tattoos", "long_hair", "artist"] },
].freeze

SEED_USERS.each_with_index do |attrs, i|
  email = "#{attrs[:name].downcase.gsub(' ', '.')}@seed.com"
  phone = "+9199#{format('%08d', i + 1)}"

  user = User.find_or_create_by!(email: email) do |u|
    u.phone           = phone
    u.password        = "password123"
    u.role            = "member"
    u.status          = "active"
    u.phone_verified  = true
    u.selfie_verified = [true, true, true, false].sample
    u.last_active_at  = rand(0..60).minutes.ago  # recent activity for presence
  end

  profile = Profile.find_or_initialize_by(user: user)
  profile.assign_attributes(
    name:                 attrs[:name],
    age:                  attrs[:age],
    gender:               attrs[:gender],
    city:                 attrs[:city],
    occupation:           attrs[:occupation],
    intent:               attrs[:intent],
    bio:                  attrs[:bio],
    interests:            attrs[:interests],
    hidden:               false,
    remote_avatar_url:    (attrs[:gender] == "female" ? FREEPIK_FEMALE[i % FREEPIK_FEMALE.length] : FREEPIK_MALE[i % FREEPIK_MALE.length]),
    height_cm:            attrs[:height_cm],
    body_type:            attrs[:body_type],
    drinking:             attrs[:drinking],
    smoking:              attrs[:smoking],
    workout_frequency:    attrs[:workout_frequency],
    relationship_status:  attrs[:relationship_status],
    cultural_background:  attrs[:cultural_background],
    religion:             attrs[:religion],
    languages_spoken:     attrs[:languages_spoken],
    appearance_tags:      attrs[:appearance_tags]
  )
  profile.save!

  print "  #{attrs[:name]} (#{attrs[:intent]}, #{attrs[:city]})... "
  puts "ok"
end

# ─── Sample connections ────────────────────────────────────────────────────────
users = User.joins(:profile).where.not(email: "admin@intentconnect.com").to_a

if users.length >= 6
  # A few accepted connections
  [
    [0, 10], # Priya ↔ Arjun
    [1, 11], # Sneha ↔ Rohit
    [4, 12], # Meera ↔ Vikram
  ].each do |a, b|
    Connection.find_or_create_by!(requester: users[a], receiver: users[b]) do |c|
      c.status = "accepted"
    end
  end

  # Some pending requests
  [
    [3, 14], # Ananya → Dev
    [5, 13], # Riya → Rahul
    [9, 16], # Simran → Aditya
  ].each do |a, b|
    Connection.find_or_create_by!(requester: users[a], receiver: users[b]) do |c|
      c.status = "pending"
    end
  end

  # Sample messages on the first accepted connection (Priya ↔ Arjun)
  conn = Connection.find_by(requester: users[0], receiver: users[10])
  if conn && conn.messages.empty?
    conn.messages.create!(sender: users[0],  body: "Hey Arjun! Noticed we're both in Bangalore. Do you do the Cubbon Park runs?")
    conn.messages.create!(sender: users[10], body: "Hey Priya! Yes, every morning at 6. You should join sometime 🏃‍♂️")
    conn.messages.create!(sender: users[0],  body: "That sounds amazing. I usually walk there around 7. Maybe I'll try to run this weekend!")
    conn.messages.create!(sender: users[10], body: "Perfect — Saturday 6am? I'll be at the main gate. We have a small group that runs together.")
    conn.messages.create!(sender: users[0],  body: "Deal! See you Saturday ☀️")
  end

  # Messages on Sneha ↔ Rohit
  conn2 = Connection.find_by(requester: users[1], receiver: users[11])
  if conn2 && conn2.messages.empty?
    conn2.messages.create!(sender: users[1],  body: "Rohit, I saw you bootstrapped two companies — that's incredible. I'm building in D2C right now.")
    conn2.messages.create!(sender: users[11], body: "Thanks Sneha! D2C is hot right now. What category are you in?")
    conn2.messages.create!(sender: users[1],  body: "Beauty & wellness. We just crossed 10k orders. Would love your advice on scaling ops.")
  end

  puts "  Sample connections + messages seeded"
end

# ─── Activity groups ──────────────────────────────────────────────────────────
GROUPS = [
  { title: "Morning Runners Bangalore",    city: "Bangalore", max_members: 30, category: "fitness",
    description: "5:30am runs around Cubbon Park. All paces welcome. We don't judge, we just run." },
  { title: "Book Club Mumbai",             city: "Mumbai",    max_members: 15, category: "arts",
    description: "Monthly fiction meetup in Bandra. One book, real conversations, zero judgement." },
  { title: "Startup Networking Delhi",     city: "Delhi",     max_members: 50, category: "tech",
    description: "Founders, PMs, and investors. Quarterly mixers + monthly AMAs." },
  { title: "Yoga & Mindfulness BLR",      city: "Bangalore", max_members: 20, category: "spiritual",
    description: "Weekly evening sessions in Indiranagar + discussions on inner work." },
  { title: "Mumbai Street Photography",   city: "Mumbai",    max_members: 25, category: "arts",
    description: "Weekend photo walks through Mumbai's streets. Bring your camera, leave your ego." },
  { title: "BLR Board Game Nights",       city: "Bangalore", max_members: 20, category: "social",
    description: "Every Friday at Dice & Meeple. Settlers, Codenames, and questionable strategies." },
  { title: "Delhi Foodies Collective",    city: "Delhi",     max_members: 40, category: "food",
    description: "Chandni Chowk walks, hidden gem reviews, and monthly potlucks." },
  { title: "Weekend Trekkers Karnataka",  city: "Bangalore", max_members: 35, category: "outdoors",
    description: "Nandi Hills, Skandagiri, Savandurga. Pre-dawn starts, chai at the summit." },
].freeze

creator = User.find_by(email: "admin@intentconnect.com")
GROUPS.each do |attrs|
  g = Group.find_or_create_by!(title: attrs[:title]) do |group|
    group.city        = attrs[:city]
    group.max_members = attrs[:max_members]
    group.description = attrs[:description]
    group.category    = attrs[:category]
    group.creator     = creator
    group.status      = "active"
  end
  GroupMembership.find_or_create_by!(group: g, user: creator) { |m| m.role = "admin" }

  # Add random members to each group
  users.sample(rand(3..8)).each do |u|
    GroupMembership.find_or_create_by!(group: g, user: u) { |m| m.role = "member" }
  end

  puts "  Group: #{attrs[:title]} (#{g.group_memberships.count} members)"
end

puts "\nDone! #{User.count} users, #{Profile.count} profiles, #{Group.count} groups seeded."
