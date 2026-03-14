import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Camera, ShieldCheck, AlertCircle, Lock, Eye, EyeOff, Bell, Trash2, Ruler, Dumbbell, Wine, Cigarette, Heart, Globe2, BookOpen, Users } from "lucide-react";
import { profilesService, Profile } from "../services/profiles.service";
import { useAuthStore } from "../store/authStore";
import { IntentBadge } from "../components/shared/IntentBadge";
import { AuroraBg } from "../components/ui/AuroraBg";
import toast from "react-hot-toast";
import clsx from "clsx";

const INTENTS = [
  "friendship", "activity_partner", "networking",
  "emotional_support", "serious_relationship", "marriage",
];

const INTERESTS = [
  "Reading", "Hiking", "Cooking", "Music", "Travel", "Fitness",
  "Movies", "Yoga", "Gaming", "Art", "Tech", "Startup",
  "Spirituality", "Photography", "Dance", "Writing",
];

const CULTURAL_BACKGROUNDS = [
  { value: "north_indian", label: "North Indian" },
  { value: "south_indian", label: "South Indian" },
  { value: "east_indian", label: "East Indian" },
  { value: "west_indian", label: "West Indian" },
  { value: "north_east_indian", label: "North East Indian" },
  { value: "mixed_indian", label: "Mixed Indian" },
  { value: "indian_origin_abroad", label: "Indian Origin (Abroad)" },
  { value: "international", label: "International" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const RELIGIONS = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "christian", label: "Christian" },
  { value: "sikh", label: "Sikh" },
  { value: "jain", label: "Jain" },
  { value: "buddhist", label: "Buddhist" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const BODY_TYPES = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "heavy", label: "Heavy" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const DRINKING_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "social", label: "Social" },
  { value: "often", label: "Often" },
];

const SMOKING_OPTIONS = [
  { value: "no", label: "No" },
  { value: "occasionally", label: "Occasionally" },
  { value: "yes", label: "Yes" },
];

const WORKOUT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const RELATIONSHIP_STATUSES = [
  { value: "single", label: "Single" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const APPEARANCE_TAGS = [
  "bearded", "glasses", "tattoos", "long_hair", "short_hair",
  "fitness_focused", "minimalist", "traditional", "traveler", "artist",
];

const LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Urdu",
  "Assamese", "Sanskrit", "Konkani", "Nepali", "French", "Spanish",
];

// ── Reusable toggle ─────────────────────────────────────────
function ToggleRow({
  label, description, value, onChange, icon, dangerous,
}: {
  label: string; description?: string; value: boolean;
  onChange: (v: boolean) => void; icon?: React.ReactNode; dangerous?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-2.5 flex-1">
        {icon && <div className="mt-0.5 flex-shrink-0">{icon}</div>}
        <div>
          <label htmlFor={id} className={clsx("text-sm font-medium cursor-pointer", dangerous ? "text-rose-400" : "text-white")}>
            {label}
          </label>
          {description && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={value}
        aria-label={label}
        type="button"
        onClick={() => onChange(!value)}
        className={clsx(
          "toggle flex-shrink-0",
          value ? (dangerous ? "bg-rose-500" : "bg-brand") : "bg-dark-border"
        )}
      >
        <span
          className="toggle-thumb"
          style={{ transform: value ? "translateX(1.25rem)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

type Tab = "profile" | "account" | "privacy" | "notifications";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const user          = useAuthStore((s) => s.user);
  const queryClient   = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn:  () =>
      profilesService.getProfile(user!.id).then((r) => r.data.profile.data?.attributes as Profile),
    enabled: !!user,
  });

  const { register, handleSubmit, control, watch, formState: { isDirty } } = useForm<Partial<Profile>>({
    values: profileData,
  });

  const update = useMutation({
    mutationFn: (d: Partial<Profile>) => profilesService.updateProfile(d),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => profilesService.uploadAvatar(file),
    onSuccess:  () => { toast.success("Photo updated"); queryClient.invalidateQueries({ queryKey: ["my-profile"] }); },
  });

  const uploadSelfie = useMutation({
    mutationFn: (file: File) => profilesService.uploadSelfie(file),
    onSuccess:  () => toast.success("Selfie submitted for review"),
  });

  // Local privacy prefs (would persist to backend in production)
  const [privacy, setPrivacy] = useState({
    hidden:           profileData?.hidden ?? false,
    show_online:      true,
    show_last_seen:   true,
    allow_messages:   true,    // anyone connected
    show_photos_to:   "all",   // all | connections | verified
    searchable:       true,
    show_distance:    true,
  });

  const [notifPrefs, setNotifPrefs] = useState({
    connection_requests: true,
    messages:            true,
    group_activity:      true,
    match_alerts:        true,
    weekly_digest:       false,
  });

  const setP = (key: string, val: boolean) => setPrivacy((p) => ({ ...p, [key]: val }));
  const setN = (key: string, val: boolean) => setNotifPrefs((p) => ({ ...p, [key]: val }));

  const TABS = [
    { key: "profile",       label: "Profile",       icon: "fa-solid fa-user"        },
    { key: "account",       label: "Account",       icon: "fa-solid fa-shield-halved" },
    { key: "privacy",       label: "Privacy",       icon: "fa-solid fa-lock"         },
    { key: "notifications", label: "Alerts",        icon: "fa-solid fa-bell"         },
  ] as const;

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      <AuroraBg />

      <h1 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <i className="fa-solid fa-sliders text-brand" aria-hidden="true" />
        Settings
      </h1>

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-dark-surface border border-dark-border p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`tab-panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
              tab === t.key ? "bg-brand text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <i className={`${t.icon} text-[10px]`} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === "profile" && (
        <form
          id="tab-panel-profile"
          role="tabpanel"
          aria-labelledby="tab-profile"
          onSubmit={handleSubmit((d) => update.mutate(d))}
          className="space-y-5"
        >
          {/* Avatar */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-image text-zinc-500 text-sm" aria-hidden="true" />
              Profile photo
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-brand-muted border-2 border-brand-border overflow-hidden flex-shrink-0">
                {profileData?.avatar_url ? (
                  <img src={profileData.avatar_url} alt="Your profile photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand">
                    {profileData?.name?.[0] ?? "?"}
                  </div>
                )}
                <label
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Change profile photo"
                >
                  <Camera size={18} className="text-white" aria-hidden="true" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadAvatar.mutate(e.target.files[0])}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{profileData?.name ?? "Your name"}</p>
                <p className="text-xs text-zinc-500 mt-0.5">JPG or PNG, max 5 MB. Hover to change.</p>
                {uploadAvatar.isPending && <p className="text-xs text-brand mt-1">Uploading…</p>}
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-pen text-zinc-500 text-sm" aria-hidden="true" />
              Basic info
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "name",       label: "Name",       col: 2 },
                { name: "age",        label: "Age",        type: "number" },
                { name: "city",       label: "City" },
                { name: "occupation", label: "Occupation", col: 2 },
              ].map(({ name, label, col, type }) => (
                <div key={name} className={clsx("space-y-1", col === 2 ? "col-span-2" : "")}>
                  <label htmlFor={`profile-${name}`} className="text-sm font-medium text-zinc-300">{label}</label>
                  <input
                    id={`profile-${name}`}
                    {...register(name as keyof Profile)}
                    type={type ?? "text"}
                    className="input"
                  />
                </div>
              ))}
              <div className="col-span-2 space-y-1">
                <label htmlFor="profile-bio" className="text-sm font-medium text-zinc-300">Bio</label>
                <textarea id="profile-bio" {...register("bio")} rows={3} className="input resize-none" placeholder="A little about you…" maxLength={300} />
                <p className="text-[10px] text-zinc-600 text-right">{watch("bio")?.length ?? 0}/300</p>
              </div>
            </div>
          </div>

          {/* Intent */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-heart text-zinc-500 text-sm" aria-hidden="true" />
              Looking for
            </h2>
            <Controller
              name="intent"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Your intent">
                  {INTENTS.map((intent) => (
                    <button
                      key={intent}
                      type="button"
                      role="radio"
                      aria-checked={field.value === intent}
                      onClick={() => field.onChange(intent)}
                      className={clsx("transition-all rounded-full", field.value === intent ? "ring-2 ring-brand ring-offset-2 ring-offset-dark-bg" : "opacity-60 hover:opacity-100")}
                    >
                      <IntentBadge intent={intent} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Interests */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-star text-zinc-500 text-sm" aria-hidden="true" />
              Interests
            </h2>
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Your interests">
                  {INTERESTS.map((interest) => {
                    const active = (field.value ?? []).includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          field.onChange(
                            active
                              ? (field.value ?? []).filter((i: string) => i !== interest)
                              : [...(field.value ?? []), interest]
                          )
                        }
                        className={clsx(
                          "px-3 py-1 text-xs rounded-full border transition-all",
                          active ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Cultural Background */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Globe2 size={15} className="text-zinc-500" />
              Cultural background
            </h2>
            <Controller
              name="cultural_background"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cultural background">
                  {CULTURAL_BACKGROUNDS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === o.value}
                      onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                      className={clsx(
                        "px-3 py-1.5 text-xs rounded-full border transition-all",
                        field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {watch("cultural_background") === "international" && (
              <input {...register("cultural_background_custom")} className="input mt-2" placeholder="e.g. British Indian" maxLength={50} />
            )}
          </div>

          {/* Religion */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BookOpen size={15} className="text-zinc-500" />
              Religion
            </h2>
            <Controller
              name="religion"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Religion">
                  {RELIGIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === o.value}
                      onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                      className={clsx(
                        "px-3 py-1.5 text-xs rounded-full border transition-all",
                        field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            />
            <Controller
              name="religion_visibility"
              control={control}
              render={({ field }) => (
                <ToggleRow
                  label="Show religion publicly"
                  description="Others can see your religion on your profile."
                  value={field.value !== "hidden"}
                  onChange={(v) => field.onChange(v ? "visible" : "hidden")}
                  icon={<Eye size={14} className="text-zinc-500" />}
                />
              )}
            />
          </div>

          {/* Languages Spoken */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users size={15} className="text-zinc-500" />
              Languages spoken
            </h2>
            <p className="text-xs text-zinc-500">Select up to 5 languages.</p>
            <Controller
              name="languages_spoken"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Languages spoken">
                  {LANGUAGES.map((lang) => {
                    const active = (field.value ?? []).includes(lang);
                    const atLimit = (field.value ?? []).length >= 5 && !active;
                    return (
                      <button
                        key={lang}
                        type="button"
                        disabled={atLimit}
                        aria-pressed={active}
                        onClick={() =>
                          field.onChange(
                            active
                              ? (field.value ?? []).filter((l: string) => l !== lang)
                              : [...(field.value ?? []), lang]
                          )
                        }
                        className={clsx(
                          "px-3 py-1 text-xs rounded-full border transition-all",
                          active ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white",
                          atLimit && "opacity-30 cursor-not-allowed"
                        )}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Physical Appearance */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Ruler size={15} className="text-zinc-500" />
              Physical appearance
            </h2>

            {/* Height slider */}
            <div className="space-y-2">
              <Controller
                name="height_cm"
                control={control}
                render={({ field }) => {
                  const hasValue = field.value != null;
                  const val = field.value || 170;
                  const feet = Math.floor(val / 30.48);
                  const inches = Math.round((val / 2.54) % 12);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-300">Height</label>
                        {hasValue ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-brand">{val} cm <span className="text-zinc-500 font-normal">({feet}'{inches}")</span></span>
                            <button type="button" onClick={() => field.onChange(null)} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">Clear</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => field.onChange(170)} className="text-xs text-brand hover:text-brand-hover transition-colors">Set height</button>
                        )}
                      </div>
                      {hasValue && (
                        <>
                          <input
                            type="range"
                            min={120}
                            max={230}
                            value={val}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full accent-brand h-2 bg-dark-hover rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg"
                            aria-label="Height in centimeters"
                          />
                          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                            <span>120 cm</span>
                            <span>175 cm</span>
                            <span>230 cm</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            {/* Body type chips */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Body type</p>
              <Controller
                name="body_type"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Body type">
                    {BODY_TYPES.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        className={clsx(
                          "px-3 py-1.5 text-xs rounded-full border transition-all",
                          field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Appearance tags <span className="text-zinc-600 font-normal">(up to 5)</span></p>
              <Controller
                name="appearance_tags"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Appearance tags">
                    {APPEARANCE_TAGS.map((tag) => {
                      const label = tag.replace(/_/g, " ");
                      const active = (field.value ?? []).includes(tag);
                      const atLimit = (field.value ?? []).length >= 5 && !active;
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={atLimit}
                          aria-pressed={active}
                          onClick={() =>
                            field.onChange(
                              active
                                ? (field.value ?? []).filter((t: string) => t !== tag)
                                : [...(field.value ?? []), tag]
                            )
                          }
                          className={clsx(
                            "px-3 py-1 text-xs rounded-full border transition-all capitalize",
                            active ? "bg-violet-600 text-white border-violet-500" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white",
                            atLimit && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Lifestyle */}
          <div className="card p-5 space-y-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Dumbbell size={15} className="text-zinc-500" />
              Lifestyle
            </h2>

            {/* Drinking */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Wine size={13} className="text-zinc-500" /> Drinking
              </p>
              <Controller
                name="drinking"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2" role="radiogroup" aria-label="Drinking">
                    {DRINKING_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        className={clsx(
                          "flex-1 py-2 text-xs rounded-xl border font-medium transition-all text-center",
                          field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Smoking */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Cigarette size={13} className="text-zinc-500" /> Smoking
              </p>
              <Controller
                name="smoking"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2" role="radiogroup" aria-label="Smoking">
                    {SMOKING_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        className={clsx(
                          "flex-1 py-2 text-xs rounded-xl border font-medium transition-all text-center",
                          field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Workout */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Dumbbell size={13} className="text-zinc-500" /> Workout
              </p>
              <Controller
                name="workout_frequency"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2" role="radiogroup" aria-label="Workout frequency">
                    {WORKOUT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        className={clsx(
                          "flex-1 py-2 text-xs rounded-xl border font-medium transition-all text-center",
                          field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Relationship Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Heart size={13} className="text-zinc-500" /> Relationship status
              </p>
              <Controller
                name="relationship_status"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship status">
                    {RELATIONSHIP_STATUSES.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        className={clsx(
                          "px-3 py-1.5 text-xs rounded-full border transition-all",
                          field.value === o.value ? "bg-brand text-white border-brand" : "border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Profile Privacy Controls */}
          <div className="card p-5 space-y-1">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
              <EyeOff size={15} className="text-zinc-500" />
              Profile privacy
            </h2>
            <p className="text-xs text-zinc-600 mb-3">Choose what other users can see on your profile.</p>
            <div className="divide-y divide-dark-border">
              <Controller
                name="show_height"
                control={control}
                render={({ field }) => (
                  <ToggleRow
                    label="Show height on profile"
                    description="Others can see your height."
                    value={field.value ?? true}
                    onChange={field.onChange}
                    icon={<Ruler size={14} className="text-zinc-500" />}
                  />
                )}
              />
              <Controller
                name="show_body_type"
                control={control}
                render={({ field }) => (
                  <ToggleRow
                    label="Show body type on profile"
                    description="Others can see your body type."
                    value={field.value ?? true}
                    onChange={field.onChange}
                    icon={<Users size={14} className="text-zinc-500" />}
                  />
                )}
              />
              <Controller
                name="show_online_status"
                control={control}
                render={({ field }) => (
                  <ToggleRow
                    label="Show online status"
                    description="Others see when you're active."
                    value={field.value ?? true}
                    onChange={field.onChange}
                    icon={<Eye size={14} className="text-zinc-500" />}
                  />
                )}
              />
            </div>
          </div>

          <button type="submit" disabled={update.isPending || !isDirty} className="btn-primary">
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {/* ── Account tab ── */}
      {tab === "account" && (
        <div id="tab-panel-account" role="tabpanel" aria-labelledby="tab-account" className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck size={15} className="text-zinc-500" aria-hidden="true" />
              Identity verification
            </h2>

            {[
              { label: "Phone verified", value: user?.phone_verified, icon: "fa-solid fa-mobile-screen" },
              { label: "Selfie verified", value: user?.selfie_verified, icon: "fa-solid fa-camera-retro" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {value
                    ? <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" />
                    : <AlertCircle size={16} className="text-amber-400" aria-hidden="true" />}
                  <span className="text-sm text-zinc-300">{label}</span>
                </div>
                <span className={clsx(
                  "text-xs font-medium px-2 py-0.5 rounded-full border",
                  value
                    ? "bg-emerald-900/40 text-emerald-400 border-emerald-700/40"
                    : "bg-amber-900/40 text-amber-400 border-amber-700/40"
                )}>
                  {value ? "Verified" : "Pending"}
                </span>
              </div>
            ))}

            {!user?.selfie_verified && (
              <div className="pt-3 border-t border-dark-border">
                <p className="text-xs text-zinc-500 mb-3">
                  A selfie badge builds trust and increases your visibility in suggestions by up to 60%.
                </p>
                <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
                  <i className="fa-solid fa-camera-retro" aria-hidden="true" />
                  Upload selfie for review
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadSelfie.mutate(e.target.files[0])}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-envelope text-zinc-500 text-sm" aria-hidden="true" />
              Account details
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Email</span>
              <span className="text-sm text-zinc-300">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Member since</span>
              <span className="text-sm text-zinc-300">
                {user?.id ? `ID #${user.id}` : "—"}
              </span>
            </div>
          </div>

          <div className="card p-5 border-rose-900/40 bg-rose-950/10">
            <h2 className="font-semibold text-rose-400 flex items-center gap-2 mb-3">
              <Trash2 size={15} aria-hidden="true" />
              Danger zone
            </h2>
            <p className="text-xs text-zinc-500 mb-3">
              Deleting your account removes all your data, connections, and messages permanently.
            </p>
            <button
              type="button"
              className="text-xs px-4 py-2 border border-rose-800/50 text-rose-400 rounded-xl hover:bg-rose-900/30 transition-colors"
              onClick={() => toast.error("Please contact support to delete your account.")}
            >
              Delete my account
            </button>
          </div>
        </div>
      )}

      {/* ── Privacy tab ── */}
      {tab === "privacy" && (
        <div id="tab-panel-privacy" role="tabpanel" aria-labelledby="tab-privacy" className="space-y-4">
          {/* Visibility */}
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
              <Eye size={15} className="text-zinc-500" aria-hidden="true" />
              Profile visibility
            </h2>
            <p className="text-xs text-zinc-600 mb-4">Control who can find and view your profile.</p>
            <div className="divide-y divide-dark-border">
              <ToggleRow
                label="Hide my profile"
                description="You won't appear in suggestions. Existing connections are unaffected."
                value={privacy.hidden}
                onChange={(v) => { setP("hidden", v); update.mutate({ hidden: v }); }}
                icon={<EyeOff size={15} className="text-zinc-500" />}
                dangerous
              />
              <ToggleRow
                label="Appear in searches"
                description="Allow your profile to be found by other users."
                value={privacy.searchable}
                onChange={(v) => setP("searchable", v)}
                icon={<i className="fa-solid fa-magnifying-glass text-zinc-500 text-sm" />}
              />
              <ToggleRow
                label="Show distance"
                description="Let matches see your approximate distance."
                value={privacy.show_distance}
                onChange={(v) => setP("show_distance", v)}
                icon={<i className="fa-solid fa-location-dot text-zinc-500 text-sm" />}
              />
            </div>
          </div>

          {/* Online status */}
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
              <i className="fa-solid fa-circle text-emerald-400 text-xs" aria-hidden="true" />
              Activity status
            </h2>
            <p className="text-xs text-zinc-600 mb-4">Choose what others can see about your activity.</p>
            <div className="divide-y divide-dark-border">
              <ToggleRow
                label="Show online status"
                description="Others see a green dot when you're active."
                value={privacy.show_online}
                onChange={(v) => setP("show_online", v)}
                icon={<i className="fa-solid fa-wifi text-zinc-500 text-sm" />}
              />
              <ToggleRow
                label="Show last seen"
                description="Others see when you were last active."
                value={privacy.show_last_seen}
                onChange={(v) => setP("show_last_seen", v)}
                icon={<i className="fa-regular fa-clock text-zinc-500 text-sm" />}
              />
            </div>
          </div>

          {/* Messaging */}
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
              <i className="fa-solid fa-comment text-zinc-500 text-sm" aria-hidden="true" />
              Messaging
            </h2>
            <p className="text-xs text-zinc-600 mb-4">Manage who can start conversations with you.</p>
            <div className="divide-y divide-dark-border">
              <ToggleRow
                label="Allow messages from connections"
                description="Only accepted connections can send you messages."
                value={privacy.allow_messages}
                onChange={(v) => setP("allow_messages", v)}
                icon={<Lock size={14} className="text-zinc-500" />}
              />
            </div>
          </div>

          {/* Photo privacy */}
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-3">
              <i className="fa-solid fa-images text-zinc-500 text-sm" aria-hidden="true" />
              Photo visibility
            </h2>
            <div className="space-y-2" role="radiogroup" aria-label="Who can see my photos">
              {[
                { value: "all",         label: "Everyone",          desc: "All verified users" },
                { value: "connections", label: "Connections only",  desc: "People you've connected with" },
                { value: "verified",    label: "Verified users",    desc: "Users with verified badge" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    privacy.show_photos_to === opt.value
                      ? "border-brand bg-brand-muted"
                      : "border-dark-border hover:border-zinc-600"
                  )}
                >
                  <input
                    type="radio"
                    name="photo-visibility"
                    value={opt.value}
                    checked={privacy.show_photos_to === opt.value}
                    onChange={() => setPrivacy((p) => ({ ...p, show_photos_to: opt.value }))}
                    className="accent-brand"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-zinc-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Safety */}
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-3">
              <i className="fa-solid fa-shield-halved text-zinc-500 text-sm" aria-hidden="true" />
              Safety
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              To block or report a specific user, visit their profile and tap the safety options at the bottom.
              Blocked users can't see your profile, send messages, or appear in your suggestions.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-3 py-2">
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              All reports are reviewed by our safety team within 24 hours.
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications tab ── */}
      {tab === "notifications" && (
        <div id="tab-panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
              <Bell size={15} className="text-zinc-500" aria-hidden="true" />
              Push notifications
            </h2>
            <p className="text-xs text-zinc-600 mb-4">Choose which events send you notifications.</p>
            <div className="divide-y divide-dark-border">
              <ToggleRow
                label="Connection requests"
                description="When someone sends you a connection request."
                value={notifPrefs.connection_requests}
                onChange={(v) => setN("connection_requests", v)}
                icon={<i className="fa-solid fa-user-plus text-brand text-sm" />}
              />
              <ToggleRow
                label="Messages"
                description="When you receive a new message from a connection."
                value={notifPrefs.messages}
                onChange={(v) => setN("messages", v)}
                icon={<i className="fa-solid fa-comment text-emerald-400 text-sm" />}
              />
              <ToggleRow
                label="Group activity"
                description="Updates from groups you've joined."
                value={notifPrefs.group_activity}
                onChange={(v) => setN("group_activity", v)}
                icon={<i className="fa-solid fa-people-group text-violet-400 text-sm" />}
              />
              <ToggleRow
                label="New match alerts"
                description="When IntentAI finds a high-compatibility match for you."
                value={notifPrefs.match_alerts}
                onChange={(v) => setN("match_alerts", v)}
                icon={<i className="fa-solid fa-bolt text-amber-400 text-sm" />}
              />
              <ToggleRow
                label="Weekly digest"
                description="A weekly email summary of your activity and top matches."
                value={notifPrefs.weekly_digest}
                onChange={(v) => setN("weekly_digest", v)}
                icon={<i className="fa-solid fa-envelope text-zinc-400 text-sm" />}
              />
            </div>
          </div>

          <div className="card p-4 flex items-start gap-2.5 text-xs text-zinc-500 border-zinc-800/50">
            <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p>Notification preferences are saved locally. Full push notification support requires the installed PWA.</p>
          </div>
        </div>
      )}
    </div>
  );
}
