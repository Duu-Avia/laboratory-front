export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  subtext,
}: {
  title: string;
  value: number;
  icon: any;
  colorClass: string;
  subtext?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
            {subtext && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {subtext}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 opacity-50 blur-xl" />
    </div>
  );
}
