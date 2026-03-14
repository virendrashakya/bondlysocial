import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, X, Users, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupsService } from "../services/groups.service";
import { AuroraBg } from "../components/ui/AuroraBg";
import { Shimmer } from "../components/ui/Shimmer";
import toast from "react-hot-toast";
import clsx from "clsx";

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

const CATEGORY_COLORS: Record<string, string> = {
  fitness:   "text-emerald-400 bg-emerald-900/30 border-emerald-800/30",
  social:    "text-violet-400  bg-violet-900/30  border-violet-800/30",
  tech:      "text-cyan-400    bg-cyan-900/30    border-cyan-800/30",
  arts:      "text-pink-400    bg-pink-900/30    border-pink-800/30",
  outdoors:  "text-lime-400    bg-lime-900/30    border-lime-800/30",
  food:      "text-amber-400   bg-amber-900/30   border-amber-800/30",
  spiritual: "text-purple-400  bg-purple-900/30  border-purple-800/30",
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
    <div className="card p-5 space-y-3">
      <Shimmer className="h-4 w-3/4 rounded" />
      <Shimmer className="h-3 w-1/2 rounded" />
      <Shimmer className="h-8 w-24 rounded-xl" />
    </div>
  );
}

export function GroupsPage() {
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
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Could not join"),
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
    onError: (err: any) => toast.error(err.response?.data?.errors?.[0] ?? "Failed to create"),
  });

  const groups = (data ?? []).filter((g: any) => !category || g.attributes.category === category);

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
        <button
          onClick={() => setShowCreate(true)}
          aria-label="Create a new group"
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <Plus size={15} aria-hidden="true" /> New Group
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* City search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Search by city…"
            aria-label="Filter groups by city"
            className="input pl-9"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              aria-pressed={category === cat.value}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0",
                category === cat.value
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "border-dark-border text-zinc-400 hover:border-zinc-600 hover:text-white"
              )}
            >
              <i className={`${cat.icon} text-[10px]`} aria-hidden="true" />
              {cat.label}
            </button>
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
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create group</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g: any) => {
          const a = g.attributes;
          const catColor = CATEGORY_COLORS[a.category] ?? "text-zinc-400 bg-dark-hover border-dark-border";
          const catDef   = CATEGORIES.find((c) => c.value === a.category);
          const fill  = Math.min(100, Math.round(((a.members_count ?? 0) / (a.max_members ?? 20)) * 100));

          return (
            <article key={g.id} className="card p-5 flex flex-col gap-3 hover:border-brand/30 transition-all group">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-brand transition-colors">{a.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 flex-wrap">
                    <MapPin size={11} aria-hidden="true" />
                    <span>{a.city}</span>
                    {a.category && catDef && (
                      <span className={clsx("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium", catColor)}>
                        <i className={`${catDef.icon} text-[9px]`} aria-hidden="true" />
                        {catDef.label}
                      </span>
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
                    className={clsx("h-full rounded-full transition-all", fill >= 80 ? "bg-rose-500" : fill >= 50 ? "bg-amber-400" : "bg-brand")}
                    style={{ width: `${fill}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => join.mutate(Number(g.id))}
                disabled={join.isPending || fill >= 100}
                aria-label={`Join ${a.title}`}
                className="text-sm px-4 py-2 mt-auto bg-brand-muted text-brand border border-brand-border rounded-xl font-semibold hover:bg-brand hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-user-plus text-[11px]" aria-hidden="true" />
                {fill >= 100 ? "Group full" : "Join"}
              </button>
            </article>
          );
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-group-title"
        >
          <div className="card-modal shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
              <h2 id="create-group-title" className="font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-people-group text-brand" aria-hidden="true" />
                Create a group
              </h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close" className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => create.mutate(d))} className="px-6 py-4 space-y-3">
              <div className="space-y-1">
                <label htmlFor="group-title" className="text-sm font-medium text-zinc-300">Group name <span className="text-brand" aria-hidden="true">*</span></label>
                <input id="group-title" {...register("title")} placeholder="Morning Runners Bangalore" className="input" aria-required="true" />
                {errors.title && <p role="alert" className="text-xs text-rose-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="group-city" className="text-sm font-medium text-zinc-300">City <span className="text-brand" aria-hidden="true">*</span></label>
                <input id="group-city" {...register("city")} placeholder="Bangalore" className="input" aria-required="true" />
                {errors.city && <p role="alert" className="text-xs text-rose-400">{errors.city.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="group-category" className="text-sm font-medium text-zinc-300">Category</label>
                  <select id="group-category" {...register("category")} className="input bg-dark-input">
                    <option value="">General</option>
                    {CATEGORIES.filter((c) => c.value).map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="group-max" className="text-sm font-medium text-zinc-300">Max members</label>
                  <input id="group-max" {...register("max_members")} type="number" placeholder="20" className="input" />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="group-desc" className="text-sm font-medium text-zinc-300">Description</label>
                <textarea id="group-desc" {...register("description")} rows={2} placeholder="What's this group about?" className="input resize-none" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={create.isPending} className="btn-primary flex-1">
                  {create.isPending ? "Creating…" : "Create group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
