import { ChartBar, Users, Handshake, Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Deals"
          value="34"
          icon={<Handshake className="text-brand-600" />}
          trend="+3.2%"
        />
        <StatCard
          title="New Contacts"
          value="186"
          icon={<Users className="text-brand-600" />}
          trend="+1.1%"
        />
        <StatCard
          title="Win Rate"
          value="27%"
          icon={<ChartBar className="text-brand-600" />}
          trend="+0.4%"
        />
        <StatCard
          title="Activities"
          value="71"
          icon={<Activity className="text-brand-600" />}
          trend="-0.8%"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold mb-3">Pipeline Snapshot</h3>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Deal</th>
                  <th className="py-2 pr-4">Stage</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Acme Onboarding",
                  "Globex Renewal",
                  "Umbrella Pilot",
                  "Soylent Upgrade",
                ].map((d, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-2 pr-4">{d}</td>
                    <td className="py-2 pr-4">
                      <span className="badge badge-amber">In Progress</span>
                    </td>
                    <td className="py-2 pr-4">A. Khan</td>
                    <td className="py-2 pl-4 text-right">
                      PKR {(100000 + i * 25000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <ul className="text-sm space-y-3">
            {[
              "Call scheduled with Globex",
              "Proposal sent to Umbrella",
              "Deal moved to Qualified",
              "New contact added: S. Ahmed",
            ].map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}) {
  const good = trend.startsWith("+");
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          {title}
        </div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className={`${good ? "text-green-600" : "text-rose-600"} text-xs`}>
          {trend} vs last week
        </div>
      </div>
      <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-slate-900 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
