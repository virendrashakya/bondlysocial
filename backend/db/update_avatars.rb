#!/usr/bin/env ruby
# Update profile avatars with curated Freepik images
# Run with: rails runner db/update_avatars.rb

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

puts "Updating all profile avatars with Freepik images..."

female_profiles = Profile.where(gender: "female").order(:id)
male_profiles   = Profile.where(gender: "male").order(:id)

female_profiles.each_with_index do |profile, i|
  url = FREEPIK_FEMALE[i % FREEPIK_FEMALE.length]
  profile.update_column(:remote_avatar_url, url)
  puts "  ♀ #{profile.name} → image #{i % FREEPIK_FEMALE.length + 1}"
end

male_profiles.each_with_index do |profile, i|
  url = FREEPIK_MALE[i % FREEPIK_MALE.length]
  profile.update_column(:remote_avatar_url, url)
  puts "  ♂ #{profile.name} → image #{i % FREEPIK_MALE.length + 1}"
end

puts "\nDone! Updated #{female_profiles.count} female + #{male_profiles.count} male profiles."
