export function AuroraBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full opacity-[0.06]
                   bg-brand blur-[130px] animate-drift"
      />
      <div
        className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full opacity-[0.04]
                   bg-violet-500 blur-[110px] animate-[drift_18s_ease-in-out_infinite_alternate-reverse]"
      />
      <div
        className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] rounded-full opacity-[0.035]
                   bg-pink-500 blur-[90px] animate-[drift_22s_ease-in-out_infinite_alternate]"
      />
    </div>
  );
}
