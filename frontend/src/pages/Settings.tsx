import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Camera, ShieldCheck, AlertCircle, Lock, Eye, EyeOff, Bell, Trash2, Ruler, Dumbbell, Wine, Cigarette, Heart, Globe2, BookOpen, Users, LogOut } from "lucide-react";
import type { Profile } from "@/types";
import {
  INTENTS, INTERESTS, CULTURAL_BACKGROUNDS, RELIGIONS, BODY_TYPES,
  DRINKING_OPTIONS, SMOKING_OPTIONS, WORKOUT_OPTIONS, RELATIONSHIP_STATUSES,
  APPEARANCE_TAGS, LANGUAGES,
} from "@/constants";
import { useMyProfile, useUpdateProfile, useUploadAvatar, useUploadSelfie, usePreferences, useUpdatePrivacy, useUpdateNotificationPrefs } from "@/hooks/queries";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Chip, ButtonGroup } from "@/components/ui/chip";
import { ToggleRow } from "@/components/ui/toggle-row";
import { SectionHeader } from "@/components/ui/section-header";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const user          = useAuthStore((s) => s.user);
  const logout        = useAuthStore((s) => s.logout);
  const navigate      = useNavigate();

  const { data: profileData } = useMyProfile();
  const update       = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const uploadSelfie = useUploadSelfie();

  const { register, handleSubmit, control, watch, formState: { isDirty } } = useForm<Partial<Profile>>({
    values: profileData,
  });

  const { data: prefs } = usePreferences();
  const updatePrivacy = useUpdatePrivacy();
  const updateNotifPrefs = useUpdateNotificationPrefs();

  const privacy = prefs?.privacy ?? {
    hidden: profileData?.hidden ?? false,
    show_online: true,
    show_last_seen: true,
    allow_messages: true,
    show_photos_to: "all" as const,
    searchable: true,
    show_distance: true,
  };

  const notifPrefs = prefs?.notifications ?? {
    connection_requests: true,
    messages: true,
    group_activity: true,
    match_alerts: true,
    weekly_digest: false,
  };

  const setP = (key: string, val: boolean | string) => updatePrivacy.mutate({ [key]: val });
  const setN = (key: string, val: boolean) => updateNotifPrefs.mutate({ [key]: val });

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate("/login");
  };

  return (
    <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <AuroraBg />

      {/* ── Profile header card (mobile) ── */}
      <GlassCard padding="sm" className="mb-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              {profileData?.avatar_url && (
                <AvatarImage src={profileData.avatar_url} alt={profileData?.name ?? "Profile"} />
              )}
              <AvatarFallback className="text-sm font-bold">
                {profileData?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profileData?.name ?? user?.email ?? "Complete profile"}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">
              {profileData?.intent ? profileData.intent.replace(/_/g, " ") : user?.email}
            </p>
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="relative h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.06] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
        </div>

        {/* Quick action row */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigate("/nearby")}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-white py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] transition-colors"
          >
            <i className="fa-solid fa-location-crosshairs text-[10px] text-brand" aria-hidden="true" />
            Nearby
          </button>
          <button
            onClick={() => navigate("/groups")}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-white py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] transition-colors"
          >
            <i className="fa-solid fa-people-group text-[10px] text-brand" aria-hidden="true" />
            Groups
          </button>
          <button
            onClick={() => navigate("/blocked-users")}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-white py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] transition-colors"
          >
            <i className="fa-solid fa-ban text-[10px] text-zinc-500" aria-hidden="true" />
            Blocked
          </button>
        </div>
      </GlassCard>

      {/* Page heading — mobile shows compact, desktop shows full */}
      <h1 className="text-lg font-bold text-gradient mb-4 flex items-center gap-2 md:text-xl md:mb-5">
        <i className="fa-solid fa-sliders text-brand" aria-hidden="true" />
        Settings
      </h1>

      {/* Tab bar */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full mb-6 overflow-x-auto scrollbar-hide" aria-label="Settings sections">
          <TabsTrigger value="profile">
            <i className="fa-solid fa-user text-[10px]" aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <i className="fa-solid fa-shield-halved text-[10px]" aria-hidden="true" />
            Account
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <i className="fa-solid fa-lock text-[10px]" aria-hidden="true" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <i className="fa-solid fa-bell text-[10px]" aria-hidden="true" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* ── Profile tab ── */}
        <TabsContent value="profile">
          <form
            onSubmit={handleSubmit((d) => update.mutate(d))}
            className="space-y-5"
          >
            {/* Avatar */}
            <GlassCard>
              <SectionHeader
                icon={<i className="fa-solid fa-image text-sm" aria-hidden="true" />}
                title="Profile photo"
              />
              <div className="flex items-center gap-4 mt-4">
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
                  {uploadAvatar.isPending && <p className="text-xs text-brand mt-1">Uploading...</p>}
                </div>
              </div>
            </GlassCard>

            {/* Basic info */}
            <GlassCard className="space-y-4">
              <SectionHeader
                icon={<i className="fa-solid fa-pen text-sm" aria-hidden="true" />}
                title="Basic info"
              />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "name",       label: "Name",       col: 2 },
                  { name: "age",        label: "Age",        type: "number" },
                  { name: "city",       label: "City" },
                  { name: "occupation", label: "Occupation", col: 2 },
                ].map(({ name, label, col, type }) => (
                  <div key={name} className={cn("space-y-1", col === 2 ? "col-span-2" : "")}>
                    <Label htmlFor={`profile-${name}`}>{label}</Label>
                    <Input
                      id={`profile-${name}`}
                      {...register(name as keyof Profile)}
                      type={type ?? "text"}
                    />
                  </div>
                ))}
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea id="profile-bio" {...register("bio")} rows={3} placeholder="A little about you..." maxLength={300} />
                  <p className="text-[10px] text-zinc-600 text-right">{watch("bio")?.length ?? 0}/300</p>
                </div>
              </div>
            </GlassCard>

            {/* Intent */}
            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<i className="fa-solid fa-heart text-sm" aria-hidden="true" />}
                title="Looking for"
              />
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
                        className={cn("transition-all rounded-full", field.value === intent ? "ring-2 ring-brand ring-offset-2 ring-offset-dark-bg" : "opacity-60 hover:opacity-100")}
                      >
                        <IntentBadge intent={intent} size="sm" />
                      </button>
                    ))}
                  </div>
                )}
              />
            </GlassCard>

            {/* Interests */}
            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<i className="fa-solid fa-star text-sm" aria-hidden="true" />}
                title="Interests"
              />
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Your interests">
                    {INTERESTS.map((interest) => {
                      const active = (field.value ?? []).includes(interest);
                      return (
                        <Chip
                          key={interest}
                          active={active}
                          aria-pressed={active}
                          onClick={() =>
                            field.onChange(
                              active
                                ? (field.value ?? []).filter((i: string) => i !== interest)
                                : [...(field.value ?? []), interest]
                            )
                          }
                        >
                          {interest}
                        </Chip>
                      );
                    })}
                  </div>
                )}
              />
            </GlassCard>

            {/* Cultural Background */}
            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<Globe2 size={15} />}
                title="Cultural background"
              />
              <Controller
                name="cultural_background"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cultural background">
                    {CULTURAL_BACKGROUNDS.map((o) => (
                      <Chip
                        key={o.value}
                        active={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                )}
              />
              {watch("cultural_background") === "international" && (
                <Input {...register("cultural_background_custom")} className="mt-2" placeholder="e.g. British Indian" maxLength={50} />
              )}
            </GlassCard>

            {/* Religion */}
            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<BookOpen size={15} />}
                title="Religion"
              />
              <Controller
                name="religion"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Religion">
                    {RELIGIONS.map((o) => (
                      <Chip
                        key={o.value}
                        active={field.value === o.value}
                        onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                      >
                        {o.label}
                      </Chip>
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
                    checked={field.value !== "hidden"}
                    onCheckedChange={(v) => field.onChange(v ? "visible" : "hidden")}
                    icon={<Eye size={14} className="text-zinc-500" />}
                  />
                )}
              />
            </GlassCard>

            {/* Languages Spoken */}
            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<Users size={15} />}
                title="Languages spoken"
                description="Select up to 5 languages."
              />
              <Controller
                name="languages_spoken"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Languages spoken">
                    {LANGUAGES.map((lang) => {
                      const active = (field.value ?? []).includes(lang);
                      const atLimit = (field.value ?? []).length >= 5 && !active;
                      return (
                        <Chip
                          key={lang}
                          active={active}
                          disabled={atLimit}
                          aria-pressed={active}
                          onClick={() =>
                            field.onChange(
                              active
                                ? (field.value ?? []).filter((l: string) => l !== lang)
                                : [...(field.value ?? []), lang]
                            )
                          }
                        >
                          {lang}
                        </Chip>
                      );
                    })}
                  </div>
                )}
              />
            </GlassCard>

            {/* Physical Appearance */}
            <GlassCard className="space-y-4">
              <SectionHeader
                icon={<Ruler size={15} />}
                title="Physical appearance"
              />

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
                          <Label>Height</Label>
                          {hasValue ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-brand">{val} cm <span className="text-zinc-500 font-normal">({feet}'{inches}")</span></span>
                              <Button type="button" variant="ghost" size="xs" onClick={() => field.onChange(null)}>Clear</Button>
                            </div>
                          ) : (
                            <Button type="button" variant="link" size="xs" onClick={() => field.onChange(170)}>Set height</Button>
                          )}
                        </div>
                        {hasValue && (
                          <>
                            <Slider
                              min={120}
                              max={230}
                              step={1}
                              value={[val]}
                              onValueChange={([v]) => field.onChange(v)}
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
                <Label>Body type</Label>
                <Controller
                  name="body_type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Body type">
                      {BODY_TYPES.map((o) => (
                        <Chip
                          key={o.value}
                          active={field.value === o.value}
                          onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Appearance tags <span className="text-zinc-600 font-normal">(up to 5)</span></Label>
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
                          <Chip
                            key={tag}
                            active={active}
                            activeVariant="activeViolet"
                            disabled={atLimit}
                            aria-pressed={active}
                            className="capitalize"
                            onClick={() =>
                              field.onChange(
                                active
                                  ? (field.value ?? []).filter((t: string) => t !== tag)
                                  : [...(field.value ?? []), tag]
                              )
                            }
                          >
                            {label}
                          </Chip>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </GlassCard>

            {/* Lifestyle */}
            <GlassCard className="space-y-5">
              <SectionHeader
                icon={<Dumbbell size={15} />}
                title="Lifestyle"
              />

              {/* Drinking */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Wine size={13} className="text-zinc-500" /> Drinking
                </Label>
                <Controller
                  name="drinking"
                  control={control}
                  render={({ field }) => (
                    <ButtonGroup
                      options={DRINKING_OPTIONS}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      ariaLabel="Drinking"
                    />
                  )}
                />
              </div>

              {/* Smoking */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Cigarette size={13} className="text-zinc-500" /> Smoking
                </Label>
                <Controller
                  name="smoking"
                  control={control}
                  render={({ field }) => (
                    <ButtonGroup
                      options={SMOKING_OPTIONS}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      ariaLabel="Smoking"
                    />
                  )}
                />
              </div>

              {/* Workout */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Dumbbell size={13} className="text-zinc-500" /> Workout
                </Label>
                <Controller
                  name="workout_frequency"
                  control={control}
                  render={({ field }) => (
                    <ButtonGroup
                      options={WORKOUT_OPTIONS}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      ariaLabel="Workout frequency"
                    />
                  )}
                />
              </div>

              {/* Relationship Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Heart size={13} className="text-zinc-500" /> Relationship status
                </Label>
                <Controller
                  name="relationship_status"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship status">
                      {RELATIONSHIP_STATUSES.map((o) => (
                        <Chip
                          key={o.value}
                          active={field.value === o.value}
                          onClick={() => field.onChange(field.value === o.value ? "" : o.value)}
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </div>
                  )}
                />
              </div>
            </GlassCard>

            {/* Profile Privacy Controls */}
            <GlassCard className="space-y-1">
              <SectionHeader
                icon={<EyeOff size={15} />}
                title="Profile privacy"
                description="Choose what other users can see on your profile."
              />
              <div className="divide-y divide-white/[0.06]">
                <Controller
                  name="show_height"
                  control={control}
                  render={({ field }) => (
                    <ToggleRow
                      label="Show height on profile"
                      description="Others can see your height."
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
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
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
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
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      icon={<Eye size={14} className="text-zinc-500" />}
                    />
                  )}
                />
              </div>
            </GlassCard>

            <Button type="submit" disabled={update.isPending || !isDirty} className="w-full">
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </TabsContent>

        {/* ── Account tab ── */}
        <TabsContent value="account">
          <div className="space-y-4">
            <GlassCard className="space-y-4">
              <SectionHeader
                icon={<ShieldCheck size={15} />}
                title="Identity verification"
              />

              {[
                { label: "Phone verified", value: user?.phone_verified, icon: "fa-solid fa-mobile-screen" },
                { label: "Selfie verified", value: user?.selfie_verified, icon: "fa-solid fa-camera-retro" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {value
                      ? <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" />
                      : <AlertCircle size={16} className="text-amber-400" aria-hidden="true" />}
                    <span className="text-sm text-zinc-300">{label}</span>
                  </div>
                  <Badge variant={value ? "success" : "warning"} size="sm">
                    {value ? "Verified" : "Pending"}
                  </Badge>
                </div>
              ))}

              {!user?.selfie_verified && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-zinc-500 mb-3">
                    A selfie badge builds trust and increases your visibility in suggestions by up to 60%.
                  </p>
                  <Button variant="secondary" size="sm" asChild>
                    <label className="cursor-pointer inline-flex items-center gap-2">
                      <i className="fa-solid fa-camera-retro" aria-hidden="true" />
                      Upload selfie for review
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadSelfie.mutate(e.target.files[0])}
                      />
                    </label>
                  </Button>
                </div>
              )}
            </GlassCard>

            <GlassCard className="space-y-3">
              <SectionHeader
                icon={<i className="fa-solid fa-envelope text-sm" aria-hidden="true" />}
                title="Account details"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Email</span>
                <span className="text-sm text-zinc-300">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Member since</span>
                <span className="text-sm text-zinc-300">
                  {user?.id ? `ID #${user.id}` : "\u2014"}
                </span>
              </div>
            </GlassCard>

            <GlassCard variant="danger">
              <h2 className="font-semibold text-rose-400 flex items-center gap-2 mb-3">
                <Trash2 size={15} aria-hidden="true" />
                Danger zone
              </h2>
              <p className="text-xs text-zinc-500 mb-3">
                Deleting your account removes all your data, connections, and messages permanently.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => toast.error("Please contact support to delete your account.")}
              >
                Delete my account
              </Button>
            </GlassCard>
          </div>
        </TabsContent>

        {/* ── Privacy tab ── */}
        <TabsContent value="privacy">
          <div className="space-y-4">
            {/* Visibility */}
            <GlassCard>
              <SectionHeader
                icon={<Eye size={15} />}
                title="Profile visibility"
                description="Control who can find and view your profile."
              />
              <div className="divide-y divide-white/[0.06] mt-4">
                <ToggleRow
                  label="Hide my profile"
                  description="You won't appear in suggestions. Existing connections are unaffected."
                  checked={privacy.hidden}
                  onCheckedChange={(v) => { setP("hidden", v); update.mutate({ hidden: v }); }}
                  icon={<EyeOff size={15} className="text-zinc-500" />}
                  dangerous
                />
                <ToggleRow
                  label="Appear in searches"
                  description="Allow your profile to be found by other users."
                  checked={privacy.searchable}
                  onCheckedChange={(v) => setP("searchable", v)}
                  icon={<i className="fa-solid fa-magnifying-glass text-zinc-500 text-sm" />}
                />
                <ToggleRow
                  label="Show distance"
                  description="Let matches see your approximate distance."
                  checked={privacy.show_distance}
                  onCheckedChange={(v) => setP("show_distance", v)}
                  icon={<i className="fa-solid fa-location-dot text-zinc-500 text-sm" />}
                />
              </div>
            </GlassCard>

            {/* Online status */}
            <GlassCard>
              <SectionHeader
                icon={<i className="fa-solid fa-circle text-emerald-400 text-xs" aria-hidden="true" />}
                title="Activity status"
                description="Choose what others can see about your activity."
              />
              <div className="divide-y divide-white/[0.06] mt-4">
                <ToggleRow
                  label="Show online status"
                  description="Others see a green dot when you're active."
                  checked={privacy.show_online}
                  onCheckedChange={(v) => setP("show_online", v)}
                  icon={<i className="fa-solid fa-wifi text-zinc-500 text-sm" />}
                />
                <ToggleRow
                  label="Show last seen"
                  description="Others see when you were last active."
                  checked={privacy.show_last_seen}
                  onCheckedChange={(v) => setP("show_last_seen", v)}
                  icon={<i className="fa-regular fa-clock text-zinc-500 text-sm" />}
                />
              </div>
            </GlassCard>

            {/* Messaging */}
            <GlassCard>
              <SectionHeader
                icon={<i className="fa-solid fa-comment text-sm" aria-hidden="true" />}
                title="Messaging"
                description="Manage who can start conversations with you."
              />
              <div className="divide-y divide-white/[0.06] mt-4">
                <ToggleRow
                  label="Allow messages from connections"
                  description="Only accepted connections can send you messages."
                  checked={privacy.allow_messages}
                  onCheckedChange={(v) => setP("allow_messages", v)}
                  icon={<Lock size={14} className="text-zinc-500" />}
                />
              </div>
            </GlassCard>

            {/* Photo privacy */}
            <GlassCard>
              <SectionHeader
                icon={<i className="fa-solid fa-images text-sm" aria-hidden="true" />}
                title="Photo visibility"
              />
              <div className="space-y-2 mt-3" role="radiogroup" aria-label="Who can see my photos">
                {[
                  { value: "all",         label: "Everyone",          desc: "All verified users" },
                  { value: "connections", label: "Connections only",  desc: "People you've connected with" },
                  { value: "verified",    label: "Verified users",    desc: "Users with verified badge" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      privacy.show_photos_to === opt.value
                        ? "border-brand bg-brand/5"
                        : "border-white/[0.08] hover:border-zinc-600"
                    )}
                  >
                    <input
                      type="radio"
                      name="photo-visibility"
                      value={opt.value}
                      checked={privacy.show_photos_to === opt.value}
                      onChange={() => setP("show_photos_to", opt.value)}
                      className="accent-brand"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </GlassCard>

            {/* Safety */}
            <GlassCard>
              <SectionHeader
                icon={<i className="fa-solid fa-shield-halved text-sm" aria-hidden="true" />}
                title="Safety"
              />
              <p className="text-sm text-zinc-500 leading-relaxed mt-3">
                To block or report a specific user, visit their profile and tap the safety options at the bottom.
                Blocked users can't see your profile, send messages, or appear in your suggestions.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-3 py-2">
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                All reports are reviewed by our safety team within 24 hours.
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* ── Notifications tab ── */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <GlassCard>
              <SectionHeader
                icon={<Bell size={15} />}
                title="Push notifications"
                description="Choose which events send you notifications."
              />
              <div className="divide-y divide-white/[0.06] mt-4">
                <ToggleRow
                  label="Connection requests"
                  description="When someone sends you a connection request."
                  checked={notifPrefs.connection_requests}
                  onCheckedChange={(v) => setN("connection_requests", v)}
                  icon={<i className="fa-solid fa-user-plus text-brand text-sm" />}
                />
                <ToggleRow
                  label="Messages"
                  description="When you receive a new message from a connection."
                  checked={notifPrefs.messages}
                  onCheckedChange={(v) => setN("messages", v)}
                  icon={<i className="fa-solid fa-comment text-emerald-400 text-sm" />}
                />
                <ToggleRow
                  label="Group activity"
                  description="Updates from groups you've joined."
                  checked={notifPrefs.group_activity}
                  onCheckedChange={(v) => setN("group_activity", v)}
                  icon={<i className="fa-solid fa-people-group text-violet-400 text-sm" />}
                />
                <ToggleRow
                  label="New match alerts"
                  description="When IntentAI finds a high-compatibility match for you."
                  checked={notifPrefs.match_alerts}
                  onCheckedChange={(v) => setN("match_alerts", v)}
                  icon={<i className="fa-solid fa-bolt text-amber-400 text-sm" />}
                />
                <ToggleRow
                  label="Weekly digest"
                  description="A weekly email summary of your activity and top matches."
                  checked={notifPrefs.weekly_digest}
                  onCheckedChange={(v) => setN("weekly_digest", v)}
                  icon={<i className="fa-solid fa-envelope text-zinc-400 text-sm" />}
                />
              </div>
            </GlassCard>

            <GlassCard variant="subtle" padding="sm" className="flex items-start gap-2.5 text-xs text-zinc-500">
              <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p>Notification preferences are synced to your account. Full push notification support requires the installed PWA.</p>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sign out — mobile */}
      <div className="mt-6 md:hidden">
        <Button
          variant="glass"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400"
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </div>
  );
}
