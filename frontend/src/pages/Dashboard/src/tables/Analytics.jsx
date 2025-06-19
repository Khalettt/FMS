import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "./../hooks/use-theme";
import ProfileImage from "../../../../images/uploads/profImg.jpg";
 const overviewData = [
    {
      name: "Jan",
      total: 1500,
    },
    {
      name: "Feb",
      total: 2000,
    },
    {
      name: "Mar",
      total: 1000,
    },
    {
      name: "Apr",
      total: 5000,
    },
    {
      name: "May",
      total: 2000,
    },
    {
      name: "Jun",
      total: 5900,
    },
    {
      name: "Jul",
      total: 2000,
    },
    {
      name: "Aug",
      total: 5500,
    },
    {
      name: "Sep",
      total: 2000,
    },
    {
      name: "Oct",
      total: 4000,
    },
    {
      name: "Nov",
      total: 1500,
    },
    {
      name: "Dec",
      total: 2500,
    },
  ];

  const recentSalesData = [
    {
      id: 1,
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      image: ProfileImage,
      total: 1500,
    },
    {
      id: 2,
      name: "James Smith",
      email: "james.smith@email.com",
      image: ProfileImage,
      total: 2000,
    },
    {
      id: 3,
      name: "Sophia Brown",
      email: "sophia.brown@email.com",
      image: ProfileImage,
      total: 4000,
    },
    {
      id: 4,
      name: "Noah Wilson",
      email: "noah.wilson@email.com",
      image: ProfileImage,
      total: 3000,
    },
    {
      id: 5,
      name: "Emma Jones",
      email: "emma.jones@email.com",
      image: ProfileImage,
      total: 2500,
    },
    {
      id: 6,
      name: "William Taylor",
      email: "william.taylor@email.com",
      image: ProfileImage,
      total: 4500,
    },
    {
      id: 7,
      name: "Isabella Johnson",
      email: "isabella.johnson@email.com",
      image: ProfileImage,
      total: 5300,
    },
  ];

function Analytics() {
        const { theme } = useTheme();
  return (
    <div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="card-header">
                        <p className="card-title">Overview</p>
                    </div>
                    <div className="card-body p-0">
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <AreaChart
                                data={overviewData}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorTotal"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#2563eb"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    cursor={false}
                                    formatter={(value) => `$${value}`}
                                />

                                <XAxis
                                    dataKey="name"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickMargin={6}
                                />
                                <YAxis
                                    dataKey="total"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickFormatter={(value) => `$${value}`}
                                    tickMargin={6}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Recent Sales</p>
                    </div>
                    <div className="card-body h-[300px] overflow-auto p-0">
                        {recentSalesData.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between gap-x-4 py-2 pr-2"
                            >
                                <div className="flex items-center gap-x-4">
                                    <img
                                        src={sale.image}
                                        alt={sale.name}
                                        className="size-10 flex-shrink-0 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col gap-y-2">
                                        <p className="font-medium text-slate-900 dark:text-slate-50">{sale.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-slate-900 dark:text-slate-50">${sale.total}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
    </div>
  )
}

export default Analytics