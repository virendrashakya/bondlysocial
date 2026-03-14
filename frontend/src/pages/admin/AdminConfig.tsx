import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { appConfigService } from "../../services/appConfig.service";
import toast from "react-hot-toast";
import { Settings2, Save, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface ConfigRow {
  id: string;
  attributes: {
    key: string;
    value: string;
    value_type: string;
    description: string;
    updated_at: string;
  };
}

export function AdminConfigPage() {
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-app-configs"],
    queryFn: () =>
      appConfigService.adminGetAll().then((r: any) => r.data.configs.data as ConfigRow[]),
  });

  const save = useMutation({
    mutationFn: ({ key, value, value_type }: { key: string; value: string; value_type: string }) =>
      appConfigService.adminUpdate(key, value, value_type),
    onSuccess: (_, { key }) => {
      toast.success(`Saved "${key}"`);
      setEdits((e) => { const c = { ...e }; delete c[key]; return c; });
      queryClient.invalidateQueries({ queryKey: ["admin-app-configs"] });
      queryClient.invalidateQueries({ queryKey: ["app-config"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  const configs = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-900/30 border border-rose-800/30 flex items-center justify-center">
            <Settings2 size={18} className="text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">App Configuration</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Live feature flags — changes apply instantly</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>

      {/* Config table */}
      <GlassCard padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading configuration...</div>
        ) : configs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No config records found. They'll appear after first use.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-48">Key</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {configs.map((row) => {
                const { key, value, value_type, description } = row.attributes;
                const currentVal = edits[key] ?? value;
                const isDirty = edits[key] !== undefined && edits[key] !== value;

                return (
                  <tr key={key} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-4">
                      <code className="text-xs text-brand font-mono">{key}</code>
                      <p className="text-[10px] text-zinc-600 mt-0.5 uppercase">{value_type}</p>
                    </td>
                    <td className="px-5 py-4">
                      {value_type === "boolean" ? (
                        <Switch
                          checked={currentVal === "true"}
                          onCheckedChange={(checked) =>
                            setEdits((e) => ({ ...e, [key]: checked ? "true" : "false" }))
                          }
                        />
                      ) : (
                        <Input
                          value={currentVal}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="max-w-[280px] py-1.5 text-sm"
                          placeholder="Enter value..."
                        />
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 hidden lg:table-cell max-w-[200px]">
                      {description}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="xs"
                        variant={isDirty ? "default" : "ghost"}
                        onClick={() => save.mutate({ key, value: currentVal, value_type })}
                        disabled={!isDirty || save.isPending}
                        className="ml-auto"
                      >
                        <Save size={11} />
                        {save.isPending ? "..." : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>

      <p className="mt-4 text-xs text-zinc-600 text-center">
        Changes to boolean flags take effect immediately for all users. String configs (like banners) refresh every 5 minutes.
      </p>
    </div>
  );
}
