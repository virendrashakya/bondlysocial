#!/usr/bin/env ruby
# Extra seed profiles to populate the Discover feed
# Run with: rails runner db/seeds_extra.rb

puts "Seeding 50 extra profiles..."

INDIAN_CITIES = %w[Bangalore Mumbai Delhi Pune Hyderabad Chennai Kolkata Jaipur Ahmedabad Goa].freeze

INTENTS = %w[friendship serious_relationship networking activity_partner emotional_support marriage].freeze

INTERESTS_POOL = [
  "Photography", "Travel", "Cooking", "Fitness", "Reading", "Music", "Movies",
  "Art", "Dance", "Yoga", "Hiking", "Gaming", "Tech", "Startup", "Writing",
  "Spirituality", "Cricket", "Swimming", "Cycling", "Running", "Meditation",
  "Fashion", "Investing", "Singing", "Poetry", "Theatre", "Volunteering",
  "Dogs", "Cats", "Coffee", "Tea", "Wine", "Baking"
].freeze

BODY_TYPES = %w[slim athletic average curvy].freeze
DRINKING   = %w[never social often].freeze
SMOKING    = %w[no occasionally yes].freeze
WORKOUT    = %w[none weekly daily].freeze
REL_STATUS = %w[single divorced separated prefer_not_to_say].freeze
CULTURAL   = %w[north_indian south_indian east_indian west_indian north_east_indian].freeze
RELIGIONS  = %w[hindu muslim christian sikh buddhist jain].freeze
LANGUAGES  = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi"].freeze
TAGS       = %w[glasses bearded tattoos fitness_focused minimalist artist traveler traditional long_hair short_hair].freeze

FEMALE_NAMES = [
  "Aarohi Deshmukh", "Pooja Reddy", "Divya Menon", "Tanvi Kulkarni", "Shruti Jain",
  "Neha Agarwal", "Aditi Saxena", "Mansi Thakur", "Sakshi Chandra", "Pallavi Hegde",
  "Kritika Bansal", "Disha Pandit", "Swati Mishra", "Radhika Srinivasan", "Ankita Bhatt",
  "Megha Kapoor", "Sonal Deshpande", "Aisha Khan", "Trisha Venkatesh", "Isha Trivedi",
  "Nisha Rajan", "Vidya Suresh", "Janvi Oberoi", "Kavitha Sundaram", "Zara Patel"
].freeze

MALE_NAMES = [
  "Harsh Trivedi", "Manav Chauhan", "Yash Gokhale", "Pranav Desai", "Kartik Nambiar",
  "Deepak Yadav", "Rohan Kulkarni", "Aryan Bhatia", "Varun Pillai", "Sameer Joshi",
  "Suresh Naik", "Tarun Malhotra", "Ajay Shetty", "Kunal Agrawal", "Ankit Rathore",
  "Gaurav Khanna", "Vivek Iyer", "Rishabh Tiwari", "Mohit Grover", "Akash Dutta",
  "Jay Raghavan", "Vishal Rawat", "Arnav Sethi", "Kabir Bajaj", "Dhruv Bose"
].freeze

FEMALE_OCCUPATIONS = [
  "Software Engineer", "Content Creator", "Nutritionist", "Interior Designer", "HR Manager",
  "Dentist", "Journalist", "Teacher", "Chartered Accountant", "Physiotherapist",
  "Clinical Psychologist", "Architect", "Brand Strategist", "Film Editor", "Veterinarian",
  "Data Analyst", "Event Planner", "Biotech Researcher", "Fashion Designer", "Social Worker",
  "Pharmacist", "Digital Marketer", "Flight Attendant", "Chef", "Lawyer"
].freeze

MALE_OCCUPATIONS = [
  "Backend Developer", "Civil Engineer", "Investment Banker", "Surgeon", "Pilot",
  "Mechanical Engineer", "AI Researcher", "Chartered Accountant", "Architect", "Police Officer",
  "Professor", "Filmmaker", "Graphic Designer", "Entrepreneur", "Dentist",
  "Marketing Lead", "Supply Chain Manager", "Sports Coach", "Journalist", "Naval Officer",
  "Pharmacist", "Data Scientist", "Wildlife Photographer", "Musician", "Lawyer"
].freeze

FEMALE_BIOS = [
  "Chai over coffee, always. Looking for meaningful conversations and real connections.",
  "Weekend trekker, weekday coder. Let's explore hidden trails together!",
  "Old Bollywood songs and new friendships — that's my vibe.",
  "Believe in slow living and deep connections. Swipe culture exhausted me.",
  "Book nerd who occasionally socializes. Currently reading Murakami.",
  "Dog mom, plant parent, eternal optimist. Let's go on a food walk!",
  "Dancing through life — literally. Bharatanatyam + contemporary fusion.",
  "Startup energy but with a soul. Looking for people who get it.",
  "Morning yoga, evening chai, midnight conversations about the universe.",
  "Foodie who'll judge you by your biryani preferences. Just saying.",
  "Watercolor artist looking for inspiration and good company.",
  "Solo travel enthusiast. 20 countries and counting. Where should I go next?",
  "Sustainability nerd. Let's talk about conscious living over filter coffee.",
  "Music teacher by day, singer-songwriter by night.",
  "History buff who loves walking through old cities. Join me?",
  "Feminist, foodie, and fierce about friendships. Let's vibe!",
  "Introvert who's great one-on-one. Not a party person, and proud of it.",
  "Looking for a gym buddy who won't cancel at 5am.",
  "Love languages: quality time and home-cooked meals.",
  "Amateur astronomer. Let's stargaze from Nandi Hills.",
  "Cat lover and crime thriller addict. Let's discuss the latest podcast!",
  "Working on my second novel. Need someone to proofread and argue with.",
  "Tech PM by week, potter by weekend. My hands are always dirty.",
  "Just moved to this city. Show me the local gems!",
  "Life's too short for small talk. Let's discuss the big questions."
].freeze

MALE_BIOS = [
  "Weekend cyclist, weekday warrior. Looking for riding buddies.",
  "Chai at 4am hits different. Early risers, where are you?",
  "Building my startup while learning to cook dal properly.",
  "Rock climbing and reading philosophy. Yes, I contain multitudes.",
  "Cricket fanatic looking for net practice partners.",
  "Foodie who can't cook but appreciates a good thali.",
  "Quiet corners, good books, and meaningful conversations — that's my speed.",
  "Runner training for my first marathon. Need an accountability partner.",
  "Amateur photographer chasing golden hour across India.",
  "Board game enthusiast. Will crush you at Settlers, buy you chai after.",
  "Finance guy who'd rather talk about travel and music.",
  "Love cooking South Indian food. Will make you the best dosa ever.",
  "Biker who rides solo but wants company for breakfast stops.",
  "Into sustainable farming and weekend permaculture workshops.",
  "Musician who jams on weekends. Guitar, ukulele, and bad singing.",
  "Minimalist lifestyle, maximalist friendships.",
  "Night owl who somehow became a morning person. Still confused.",
  "Looking for a co-founder... or at least someone who gets founder life.",
  "Documentary addict. Let's watch and debate over popcorn.",
  "Old soul in a millennial body. Vinyl records and handwritten letters.",
  "Mountain person trapped in a metro city. Weekend getaway partner needed.",
  "Dog dad to a golden retriever named Mango.",
  "Learning pottery because my therapist said I need a hobby.",
  "History nerd. Can give you a 3-hour walking tour of old Delhi.",
  "Just want genuine friendships. No games, no drama, just good vibes."
].freeze

(FEMALE_NAMES + MALE_NAMES).each_with_index do |name, i|
  is_female  = i < FEMALE_NAMES.length
  gender     = is_female ? "female" : "male"
  email      = "#{name.downcase.gsub(' ', '.')}@generated.com"
  phone      = "+9188#{format('%08d', i + 100)}"

  next if User.exists?(email: email)

  user = User.create!(
    email:           email,
    phone:           phone,
    password:        "password123",
    role:            "member",
    status:          "active",
    phone_verified:  true,
    selfie_verified: [true, true, false].sample,
    last_active_at:  rand(0..120).minutes.ago
  )

  portrait_id = is_female ? rand(1..99) : rand(1..99)
  gender_path = is_female ? "women" : "men"

  Profile.create!(
    user:                user,
    name:                name,
    age:                 rand(22..35),
    gender:              gender,
    city:                INDIAN_CITIES.sample,
    occupation:          is_female ? FEMALE_OCCUPATIONS[i % FEMALE_OCCUPATIONS.length] : MALE_OCCUPATIONS[(i - FEMALE_NAMES.length) % MALE_OCCUPATIONS.length],
    intent:              INTENTS.sample,
    bio:                 is_female ? FEMALE_BIOS[i % FEMALE_BIOS.length] : MALE_BIOS[(i - FEMALE_NAMES.length) % MALE_BIOS.length],
    interests:           INTERESTS_POOL.sample(rand(3..6)),
    hidden:              false,
    remote_avatar_url:   "https://randomuser.me/api/portraits/#{gender_path}/#{portrait_id}.jpg",
    height_cm:           is_female ? rand(155..175) : rand(168..190),
    body_type:           BODY_TYPES.sample,
    drinking:            DRINKING.sample,
    smoking:             SMOKING.sample,
    workout_frequency:   WORKOUT.sample,
    relationship_status: REL_STATUS.sample,
    cultural_background: CULTURAL.sample,
    religion:            RELIGIONS.sample,
    religion_visibility: "visible",
    languages_spoken:    (["English", "Hindi"] + LANGUAGES.sample(rand(0..2))).uniq,
    appearance_tags:     TAGS.sample(rand(1..3))
  )

  puts "  #{name} (#{gender}, #{user.profile.city})"
end

puts "\nDone! Total: #{User.count} users, #{Profile.count} profiles."
