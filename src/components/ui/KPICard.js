export default function KPICard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
