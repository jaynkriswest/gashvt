'use client'

interface MetricsCardProps {
  label: string;
  value: number;
  colorClass?: string;
}

export default function MetricsCard({ label, value, colorClass = "text-white" }: MetricsCardProps) {
  return (
    <div className="bg-[#1e2129] p-6 rounded-xl border border-slate-800 shadow-sm">
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}