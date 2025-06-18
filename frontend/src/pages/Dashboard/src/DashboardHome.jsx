import {
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Famers",
    value: "25",
    change: "25%",
    icon: <Package size={26} />,
  },
  {
    title: "Total Paid Crops",
    value: "$16",
    change: "12%",
    icon: <DollarSign size={26} />,
  },
  {
    title: "Total Equipments",
    value: "1500k",
    change: "15%",
    icon: <Users size={26} />,
  },
  {
    title: "Sales",
    value: "12,340",
    change: "19%",
    icon: <CreditCard size={26} />,
  },
];

const DashboardHome = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                {stat.icon}
              </div>
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                {stat.title}
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <span className="flex items-center gap-1 rounded-full border border-blue-500 px-3 py-1 text-sm font-medium text-blue-500 dark:border-blue-400 dark:text-blue-400">
                <TrendingUp size={16} />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
