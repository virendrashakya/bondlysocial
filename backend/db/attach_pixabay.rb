#!/usr/bin/env ruby
# Attach local Pixabay images to profiles that were seeded with remote URLs.
# Run with: rails runner db/attach_pixabay.rb

require 'uri'

puts "Attaching downloaded Pixabay images to profiles..."

profiles = Profile.where("remote_avatar_url LIKE ?", "%pixabay.com%")
puts "Found #{profiles.count} profiles with Pixabay remote URLs."

success_count = 0

profiles.each do |profile|
  begin
    filename = File.basename(URI.parse(profile.remote_avatar_url).path)
    local_path = "/tmp/pixabay_avatars/#{filename}"

    if File.exist?(local_path)
      # Attach via ActiveStorage
      profile.avatar.attach(
        io: File.open(local_path),
        filename: filename,
        content_type: "image/jpeg"
      )
      
      # Clear the remote URL so the app starts using the local attached avatar
      profile.update_column(:remote_avatar_url, nil)
      
      success_count += 1
      puts "Attached #{filename} to profile #{profile.id} (#{profile.name})"
    else
      puts "Missing local file for #{profile.name}: #{local_path}"
    end
  rescue => e
    puts "Error on profile #{profile.id}: #{e.message}"
  end
end

puts "\nDone! Successfully attached #{success_count} local images to profiles."
