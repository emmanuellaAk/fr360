import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  Loader2,
  FolderKanban,
  DollarSign,
  TrendingDown,
  Clock,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
        setDashboard(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center text-slate-500 mt-10">
        Failed to load dashboard data.
      </div>
    );
  }

  const statsData = [
    {
      icon: FolderKanban,
      label: "Total Portfolios",
      value: dashboard.totalPortfolios,
      color: "blue",
    },
    {
      icon: DollarSign,
      label: "Total Value",
      value: `$${dashboard.totalValue.toFixed(2)}`,
      color: "emerald",
    },
    {
      icon: TrendingDown,
      label: "Value at Risk (95%)",
      value: `$${dashboard.latestVar95?.toFixed(2) || "0.00"}`,
      color: "rose",
    },
    {
      icon: Clock,
      label: "Last Updated",
      value: new Date(dashboard.lastUpdated).toLocaleString(),
      color: "amber",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    rose: { bg: "bg-rose-100", text: "text-rose-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">
          Welcome back! Here’s a snapshot of your portfolios and risk metrics.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100"
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-12 h-12 ${colorClasses[stat.color].bg} flex items-center justify-center rounded-lg`}
              >
                <stat.icon className={`w-6 h-6 ${colorClasses[stat.color].text}`} />
              </div>
              <div className="ml-4 min-w-0">
                <div className="text-sm font-medium text-slate-500 truncate">
                  {stat.label}
                </div>
                <div className="text-xl font-bold text-slate-900 break-words">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Market Summary
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Track how your portfolio value and market risk change over time.
        </p>
        <div className="h-60 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400">
          📈 Chart coming soon
        </div>
      </div>

      {/* Recent VaR Runs */}
      <div className="w-full bg-white border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent VaR Calculations
          </h3>
          <Button variant="ghost" onClick={() => navigate("/portfolio")}>
            View Portfolios
          </Button>
        </div>

        {dashboard.recentVarRuns?.length > 0 ? (
          <div className="w-[90vw] overflow-x-auto md:w-auto">
            <table className="w-full min-w-[700px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Date", "Portfolio", "Portfolio Value", "VaR (95%)", "Method"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {dashboard.recentVarRuns.map((r, index) => (
                  <tr key={index} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {r.portfolio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      ${r.value?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      ${r.var95?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {r.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <TrendingDown className="w-8 text-slate-400 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Recent VaR Data
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              Run a portfolio risk analysis to view recent results here.
            </p>
            <Button onClick={() => navigate("/portfolio/new")} icon={Plus}>
              New Portfolio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;