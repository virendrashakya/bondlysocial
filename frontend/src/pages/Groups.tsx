import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, X, Users, Search, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AxiosError } from "axios";
import { groupsService } from "@/services/groups.service";
import type { JsonApiResource, GroupAttributes } from "@/types";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { Shimmer } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassModal } from "@/components/ui/GlassModal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "",           label: "All",       icon: "fa-solid fa-th" },
  { value: "fitness",    label: "Fitness",   icon: "fa-solid fa-dumbbell" },
  { value: "social",     label: "Social",    icon: "fa-solid fa-people-group" },
  { value: "tech",       label: "Tech",      icon: "fa-solid fa-microchip" },
  { value: "arts",       label: "Arts",      icon: "fa-solid fa-palette" },
  { value: "outdoors",   label: "Outdoors",  icon: "fa-solid fa-mountain-sun" },
  { value: "food",       label: "Food",      icon: "fa-solid fa-utensils" },
  { value: "spiritual",  label: "Spiritual", icon: "fa-solid fa-om" },
];

const CATEGORY_BADGE_VARIANT: Record<string, "brand" | "success" | "violet" | "info" | "warning" | "danger" | "default"> = {
  fitness:   "success",
  social:    "violet",
  tech:      "info",
  arts:      "brand",
  outdoors:  "success",
  food:      "warning",
  spiritual: "violet",
};

const createSchema = z.object({
  title:       z.string().min(3, "Title required"),
  description: z.string().optional(),
  city:        z.string().min(2, "City required"),
  category:    z.string().optional(),
  max_members: z.coerce.number().min(2).max(500),
});
type CreateForm = z.infer<typeof createSchema>;

function GroupSkeleton() {
  return (
    <GlassCard padding="default" className="space-y-3">
      <Shimmer className="h-4 w-3/4 rounded" />
      <Shimmer className="h-3 w-1/2 rounded" />
      <Shimmer className="h-8 w-24 rounded-xl" />
    </GlassCard>
  );
}

export function GroupsPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [category, setCategory]     = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["groups", cityFilter, category],
    queryFn:  () => groupsService.getAll(cityFilter || undefined).then((r) => r.data.groups?.data ?? []),
  });

  const join = useMutation({
    mutationFn: (id: number) => groupsService.join(id),
    onSuccess: () => {
      toast.success("Joined group!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (err: AxiosError<{ error?: string }>) => toast.error(err.response?.data?.error ?? "Could not join"),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { max_members: 20 },
  });

  const create = useMutation({
    mutationFn: (d: CreateForm) => groupsService.create(d),
    onSuccess: () => {
      toast.success("Group created!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreate(false);
      reset();
    },
    onError: (err: AxiosError<{ errors?: string[] }>) => toast.error(err.response?.data?.errors?.[0] ?? "Failed to create"),
  });

  const groups = (data ?? []).filter((g: JsonApiResource<GroupAttributes>) => !category || g.attributes.category === category);

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-people-group text-brand" aria-hidden="true" />
            Activity Groups
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Find your tribe in your city</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          aria-label="Create a new group"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus size={15} aria-hidden="true" /> New Group
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* City search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" aria-hidden="true" />
          <Input
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Search by city…"
            aria-label="Filter groups by city"
            className="pl-9"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              active={category === cat.value}
              aria-pressed={category === cat.value}
              className="flex-shrink-0"
            >
              <i className={`${cat.icon} text-[10px]`} aria-hidden="true" />
              {cat.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <GroupSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-dark-hover border border-dark-border flex items-center justify-center">
            <Users size={28} className="text-zinc-600" aria-hidden="true" />
          </div>
          <p className="text-sm text-zinc-500 max-w-xs">
            No groups found. Be the first to create one in your city!
          </p>
          <Button onClick={() => setShowCreate(true)}>Create group</Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g: JsonApiResource<GroupAttributes>) => {
          const a = g.attributes;
          const catDef   = CATEGORIES.find((c) => c.value === a.category);
          const badgeVar = (a.category ? CATEGORY_BADGE_VARIANT[a.category] : undefined) ?? "default";
          const fill  = Math.min(100, Math.round(((a.members_count ?? 0) / (a.max_members ?? 20)) * 100));

          return (
            <GlassCard
              key={g.id}
              variant="interactive"
              padding="default"
              className="flex flex-col gap-3 group cursor-pointer"
              role="article"
              onClick={() => navigate(`/groups/${g.id}`)}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-brand transition-colors">{a.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 flex-wrap">
                    <MapPin size={11} aria-hidden="true" />
                    <span>{a.city}</span>
                    {a.category && catDef && (
                      <Badge variant={badgeVar} size="sm">
                        <i className={`${catDef.icon} text-[9px]`} aria-hidden="true" />
                        {catDef.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {a.description && (
                <p className="text-sm text-zinc-400 line-clamp-2">{a.description}</p>
              )}

              {/* Member capacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Users size={11} aria-hidden="true" />
                    {a.members_count ?? 0} / {a.max_members} members
                  </span>
                  <span className="text-[10px] text-zinc-600">{fill}% full</span>
                </div>
                <div className="h-1 bg-dark-hover rounded-full overflow-hidden" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-label={`${fill}% capacity`}>
                  <div
                    className={cn("h-full rounded-full transition-all", fill >= 80 ? "bg-rose-500" : fill >= 50 ? "bg-amber-400" : "bg-brand")}
                    style={{ width: `${fill}%` }}
                  />
                </div>
              </div>

              {a.is_member ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/groups/${g.id}`); }}
                  aria-label={`Open ${a.title}`}
                  className="mt-auto gap-1.5 text-green-400 border-green-800/30"
                >
                  <Check size={13} />
                  Joined
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); join.mutate(Number(g.id)); }}
                  disabled={join.isPending || fill >= 100}
                  aria-label={`Join ${a.title}`}
                  className="mt-auto"
                >
                  <i className="fa-solid fa-user-plus text-[11px]" aria-hidden="true" />
                  {fill >= 100 ? "Group full" : "Join"}
                </Button>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Create modal */}
      <GlassModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create a group"
      >
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="group-title">Group name <span className="text-brand" aria-hidden="true">*</span></Label>
            <Input id="group-title" {...register("title")} placeholder="Morning Runners Bangalore" aria-required="true" />
            {errors.title && <p role="alert" className="text-xs text-rose-400">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="group-city">City <span className="text-brand" aria-hidden="true">*</span></Label>
            <Input id="group-city" {...register("city")} placeholder="Bangalore" aria-required="true" />
            {errors.city && <p role="alert" className="text-xs text-rose-400">{errors.city.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="group-category">Category</Label>
              <select id="group-category" {...register("category")} className="flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all">
                <option value="">General</option>
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="group-max">Max members</Label>
              <Input id="group-max" {...register("max_members")} type="number" placeholder="20" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="group-desc">Description</Label>
            <Textarea id="group-desc" {...register("description")} rows={2} placeholder="What's this group about?" />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={create.isPending} className="flex-1">
              {create.isPending ? "Creating…" : "Create group"}
            </Button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
