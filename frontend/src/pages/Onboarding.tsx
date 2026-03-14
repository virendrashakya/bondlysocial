import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { profilesService } from "@/services/profiles.service";
import { useNavigate } from "react-router-dom";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { Camera, Check, ChevronRight, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "About you",   icon: "fa-solid fa-user"     },
  { id: 2, label: "Intent",      icon: "fa-solid fa-heart"    },
  { id: 3, label: "Interests",   icon: "fa-solid fa-star"     },
  { id: 4, label: "Photo",       icon: "fa-solid fa-camera"   },
];

const INTENTS: { value: string; label: string; icon: string; color: string }[] = [
  { value: "friendship",          label: "Friendship",         icon: "fa-solid fa-handshake",      color: "text-sky-400 bg-sky-900/30 border-sky-700/40"       },
  { value: "activity_partner",    label: "Activity Partner",   icon: "fa-solid fa-person-running",  color: "text-emerald-400 bg-emerald-900/30 border-emerald-700/40" },
  { value: "networking",          label: "Networking",         icon: "fa-solid fa-network-wired",  color: "text-violet-400 bg-violet-900/30 border-violet-700/40" },
  { value: "emotional_support",   label: "Emotional Support",  icon: "fa-solid fa-hands-holding-heart", color: "text-pink-400 bg-pink-900/30 border-pink-700/40" },
  { value: "serious_relationship",label: "Serious Relationship",icon: "fa-solid fa-rings-wedding", color: "text-rose-400 bg-rose-900/30 border-rose-700/40"     },
  { value: "marriage",            label: "Marriage",           icon: "fa-solid fa-house-heart",    color: "text-amber-400 bg-amber-900/30 border-amber-700/40"  },
];

const INTERESTS = [
  { value: "Reading",       icon: "fa-solid fa-book"          },
  { value: "Hiking",        icon: "fa-solid fa-mountain-sun"  },
  { value: "Cooking",       icon: "fa-solid fa-utensils"      },
  { value: "Music",         icon: "fa-solid fa-music"         },
  { value: "Travel",        icon: "fa-solid fa-plane"         },
  { value: "Fitness",       icon: "fa-solid fa-dumbbell"      },
  { value: "Movies",        icon: "fa-solid fa-clapperboard"  },
  { value: "Yoga",          icon: "fa-solid fa-spa"           },
  { value: "Gaming",        icon: "fa-solid fa-gamepad"       },
  { value: "Art",           icon: "fa-solid fa-palette"       },
  { value: "Tech",          icon: "fa-solid fa-microchip"     },
  { value: "Startup",       icon: "fa-solid fa-rocket"        },
  { value: "Spirituality",  icon: "fa-solid fa-om"            },
  { value: "Photography",   icon: "fa-solid fa-camera"        },
  { value: "Dance",         icon: "fa-solid fa-music"         },
  { value: "Writing",       icon: "fa-solid fa-pen-nib"       },
];

const schema = z.object({
  name:       z.string().min(2, "Name must be at least 2 characters"),
  age:        z.coerce.number().min(18, "Must be 18+").max(99),
  gender:     z.enum(["male", "female", "non_binary", "prefer_not_to_say"]),
  city:       z.string().min(2, "City is required"),
  occupation: z.string().optional(),
  bio:        z.string().max(300, "Bio max 300 characters").optional(),
  intent:     z.string().min(1, "Please choose your intent"),
  interests:  z.array(z.string()).min(1, "Pick at least one interest"),
});
type FormData = z.infer<typeof schema>;

export function OnboardingPage() {
  const navigate    = useNavigate();
  const [step, setStep]     = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interests: [], intent: "" },
    mode: "onChange",
  });

  const selectedIntent    = watch("intent");
  const selectedInterests = watch("interests") ?? [];

  const create = useMutation({
    mutationFn: profilesService.createProfile,
    onSuccess: async (res) => {
      if (avatar) {
        try { await profilesService.uploadAvatar(avatar); } catch { /* non-fatal */ }
      }
      navigate("/discover");
    },
    onError: () => toast.error("Failed to save profile. Please try again."),
  });

  const goNext = async (fieldsToValidate?: (keyof FormData)[]) => {
    if (fieldsToValidate) {
      const ok = await trigger(fieldsToValidate);
      if (!ok) return;
    }
    setStep((s) => s + 1);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <AuroraBg />

      <div className="w-full max-w-lg animate-page-enter">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-brand font-black text-lg tracking-tight">IntentConnect</span>
          <p className="text-xs text-zinc-500 mt-0.5">Let's set up your profile</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all flex-shrink-0",
                step > s.id
                  ? "bg-brand text-white"
                  : step === s.id
                  ? "bg-brand/20 border-2 border-brand text-brand"
                  : "bg-dark-hover border border-dark-border text-zinc-600"
              )}>
                {step > s.id ? <Check size={12} /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1 rounded-full transition-all", step > s.id ? "bg-brand" : "bg-dark-border")} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-5 px-0.5">
          {STEPS.map((s) => (
            <span key={s.id} className={cn("text-[10px] font-medium flex-1 text-center transition-colors", step >= s.id ? "text-zinc-300" : "text-zinc-700")}>
              {s.label}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-dark-border rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <form onSubmit={handleSubmit((d) => create.mutate(d))}>
          <GlassCard padding="lg">

            {/* -- Step 1: Basic info -- */}
            {step === 1 && (
              <fieldset className="space-y-4 border-none p-0">
                <legend className="sr-only">Basic information</legend>
                <div>
                  <h2 className="text-xl font-bold text-white">Tell us about yourself</h2>
                  <p className="text-sm text-zinc-500 mt-1">This is how others will see you.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="name">Full name <span className="text-brand" aria-hidden="true">*</span></Label>
                    <Input id="name" {...register("name")} placeholder="Your first name" aria-required="true" aria-describedby="name-err" />
                    {errors.name && <p id="name-err" role="alert" className="text-xs text-rose-400">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="age">Age <span className="text-brand" aria-hidden="true">*</span></Label>
                    <Input id="age" {...register("age")} type="number" min={18} max={99} placeholder="25" aria-required="true" aria-describedby="age-err" />
                    {errors.age && <p id="age-err" role="alert" className="text-xs text-rose-400">{errors.age.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gender">Gender <span className="text-brand" aria-hidden="true">*</span></Label>
                    <select id="gender" {...register("gender")} className="flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" aria-required="true">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="city">City <span className="text-brand" aria-hidden="true">*</span></Label>
                    <Input id="city" {...register("city")} placeholder="Mumbai" aria-required="true" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" {...register("occupation")} placeholder="Engineer" />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="bio">
                      Short bio <span className="text-zinc-600 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      rows={3}
                      maxLength={300}
                      placeholder="A little about who you are…"
                    />
                    <p className="text-[10px] text-zinc-600 text-right">{watch("bio")?.length ?? 0}/300</p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => goNext(["name", "age", "gender", "city"])}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={16} />
                </Button>
              </fieldset>
            )}

            {/* -- Step 2: Intent -- */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">What are you here for?</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Our AI uses this to find your most compatible matches.
                  </p>
                </div>

                <Controller
                  name="intent"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Select your intent">
                      {INTENTS.map((intent) => {
                        const active = field.value === intent.value;
                        return (
                          <button
                            key={intent.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => field.onChange(intent.value)}
                            className={cn(
                              "p-3.5 rounded-xl border text-left transition-all",
                              active
                                ? "border-brand bg-brand-muted shadow-sm shadow-brand/20"
                                : "border-dark-border hover:border-zinc-600 bg-dark-hover"
                            )}
                          >
                            <i className={cn(intent.icon, "text-lg mb-1.5 block", active ? "text-brand" : "text-zinc-500")} aria-hidden="true" />
                            <p className={cn("text-xs font-semibold", active ? "text-white" : "text-zinc-400")}>{intent.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.intent && <p role="alert" className="text-xs text-rose-400">{errors.intent.message}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedIntent}
                    onClick={() => goNext(["intent"])}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* -- Step 3: Interests -- */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Your interests</h2>
                  <p className="text-sm text-zinc-500 mt-1">Pick at least 1. More = better matches.</p>
                </div>

                <Controller
                  name="interests"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Select your interests">
                      {INTERESTS.map((interest) => {
                        const active = field.value.includes(interest.value);
                        return (
                          <Chip
                            key={interest.value}
                            active={active}
                            aria-pressed={active}
                            onClick={() =>
                              field.onChange(
                                active
                                  ? field.value.filter((i: string) => i !== interest.value)
                                  : [...field.value, interest.value]
                              )
                            }
                          >
                            <i className={cn(interest.icon, "text-[10px]")} aria-hidden="true" />
                            {interest.value}
                          </Chip>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.interests && <p role="alert" className="text-xs text-rose-400">{errors.interests.message}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button
                    type="button"
                    disabled={selectedInterests.length === 0}
                    onClick={() => goNext(["interests"])}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* -- Step 4: Photo -- */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Add a profile photo</h2>
                  <p className="text-sm text-zinc-500 mt-1">Profiles with photos get 3x more connections.</p>
                </div>

                {/* Photo upload area */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="relative w-36 h-36 rounded-3xl overflow-hidden bg-dark-hover border-2 border-dashed border-dark-border cursor-pointer hover:border-brand transition-colors group"
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload profile photo"
                    onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 group-hover:text-brand transition-colors">
                        <Camera size={32} />
                        <p className="text-xs mt-1.5">Upload photo</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    aria-label="Select profile photo"
                    onChange={handleAvatarChange}
                  />
                  {preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => { setAvatar(null); setPreview(null); }}
                    >
                      Remove photo
                    </Button>
                  )}
                </div>

                <GlassCard variant="brand" padding="sm" className="text-xs text-zinc-400 flex gap-2">
                  <i className="fa-solid fa-shield-halved text-brand mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>Your photo is only visible to verified users who match your intent. You can change it anytime in Settings.</span>
                </GlassCard>

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {create.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Setting up…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                        Start connecting
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </form>
      </div>
    </div>
  );
}
