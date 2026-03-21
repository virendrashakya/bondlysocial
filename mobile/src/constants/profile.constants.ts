export const INTENTS = [
  "friendship",
  "activity_partner",
  "networking",
  "emotional_support",
  "serious_relationship",
  "marriage",
] as const;

export type Intent = (typeof INTENTS)[number];

export const INTERESTS = [
  "Reading", "Hiking", "Cooking", "Music", "Travel", "Fitness",
  "Movies", "Yoga", "Gaming", "Art", "Tech", "Startup",
  "Spirituality", "Photography", "Dance", "Writing",
] as const;

export const CULTURAL_BACKGROUNDS = [
  { value: "north_indian", label: "North Indian" },
  { value: "south_indian", label: "South Indian" },
  { value: "east_indian", label: "East Indian" },
  { value: "west_indian", label: "West Indian" },
  { value: "north_east_indian", label: "North East Indian" },
  { value: "mixed_indian", label: "Mixed Indian" },
  { value: "indian_origin_abroad", label: "Indian Origin (Abroad)" },
  { value: "international", label: "International" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const RELIGIONS = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "christian", label: "Christian" },
  { value: "sikh", label: "Sikh" },
  { value: "jain", label: "Jain" },
  { value: "buddhist", label: "Buddhist" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const BODY_TYPES = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "heavy", label: "Heavy" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const DRINKING_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "social", label: "Social" },
  { value: "often", label: "Often" },
] as const;

export const SMOKING_OPTIONS = [
  { value: "no", label: "No" },
  { value: "occasionally", label: "Occasionally" },
  { value: "yes", label: "Yes" },
] as const;

export const WORKOUT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
] as const;

export const RELATIONSHIP_STATUSES = [
  { value: "single", label: "Single" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const APPEARANCE_TAGS = [
  "bearded", "glasses", "tattoos", "long_hair", "short_hair",
  "fitness_focused", "minimalist", "traditional", "traveler", "artist",
] as const;

export const LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Urdu",
  "Assamese", "Sanskrit", "Konkani", "Nepali", "French", "Spanish",
] as const;
