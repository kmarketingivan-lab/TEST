"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  date: string;
  revenue: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface SalesChartProps {
  revenueData: RevenueData[];
  statusData: StatusData[];
}

function SalesChart({ revenueData, statusData }: SalesChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue line chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Revenue ultimi 30 giorni
        </h3>
        {revenueData.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun dato disponibile</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: unknown) => [`€${Number(value ?? 0).toFixed(2)}`, "Revenue"]}
                labelFormatter={(label: unknown) => String(label ?? "")}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#b91c1c"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders by status bar chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Ordini per stato
        </h3>
        {statusData.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun dato disponibile</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export { SalesChart };
