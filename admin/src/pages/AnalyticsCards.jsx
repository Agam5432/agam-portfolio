import { useNavigate } from "react-router-dom";
import { Users, Activity, Eye } from "lucide-react";

export default function AnalyticsCards({ stats }) {
  const navigate = useNavigate();

  const cards = [
    {
      label: "Unique Visitors",
      value: stats.uniqueVisitors || 0,
      icon: Users,
      color: "#f59e0b",
      path: "/admin/analytics/visitors",
    },
    {
      label: "Sessions",
      value: stats.sessions || 0,
      icon: Activity,
      color: "#ef4444",
      path: "/admin/analytics/sessions",
    },
    {
      label: "Page Views",
      value: stats.pageViews || 0,
      icon: Eye,
      color: "#00d4ff",
      path: "/admin/analytics/pageviews",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          onClick={() => navigate(c.path)}
          className="p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition"
          style={{ background: "#14141e", border: "1px solid #2a2a3a" }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase text-gray-400">
              {c.label}
            </span>
            <c.icon size={18} style={{ color: c.color }} />
          </div>

          <div className="text-3xl font-bold">{c.value}</div>

          <p className="text-xs mt-3 text-gray-500">
            Click to view details →
          </p>
        </div>
      ))}
    </div>
  );
}