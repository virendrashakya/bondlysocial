class AppConfig < ApplicationRecord
  DEFAULTS = {
    "maintenance_mode"       => { value: "false", type: "boolean", description: "Take the app offline for all users" },
    "signups_enabled"        => { value: "true",  type: "boolean", description: "Allow new user registrations" },
    "announcement_banner"    => { value: "",      type: "string",  description: "Global banner text shown to all users (blank = hidden)" },
    "max_daily_connects"     => { value: "10",    type: "integer", description: "Max connection requests a user can send per day" },
    "discover_enabled"       => { value: "true",  type: "boolean", description: "Show the Discover / suggestions feed" },
    "groups_enabled"         => { value: "true",  type: "boolean", description: "Enable the Groups feature" },
    "min_profile_complete_pct" => { value: "0",   type: "integer", description: "Min profile completion % to appear in suggestions (0 = off)" },
  }.freeze

  validates :key,        presence: true, uniqueness: true
  validates :value_type, inclusion: { in: %w[string boolean integer json] }

  def self.[](key)
    record = find_by(key: key)
    return cast_default(key.to_s) unless record
    record.cast_value
  end

  def self.cast_default(key)
    meta = DEFAULTS[key]
    return nil unless meta
    case meta[:type]
    when "boolean" then meta[:value] == "true"
    when "integer" then meta[:value].to_i
    else meta[:value]
    end
  end

  def self.all_as_hash
    DEFAULTS.each do |k, meta|
      find_or_create_by!(key: k) do |r|
        r.value       = meta[:value]
        r.value_type  = meta[:type]
        r.description = meta[:description]
      end
    end
    all.order(:key)
  end

  def cast_value
    case value_type
    when "boolean" then value == "true"
    when "integer" then value.to_i
    when "json"    then JSON.parse(value) rescue {}
    else value
    end
  end
end
