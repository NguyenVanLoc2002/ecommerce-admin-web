export function VoidedWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center rotate-[-15deg]"
      aria-hidden
    >
      <span className="select-none text-6xl font-bold uppercase tracking-widest text-danger-200 opacity-40">
        VOIDED
      </span>
    </div>
  );
}
