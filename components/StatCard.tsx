import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
  "data-testid"?: string;
}

const COLOR_MAP = {
  blue:   "bg-blue-50 text-blue-600",
  green:  "bg-green-50 text-green-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red:    "bg-red-50 text-red-600",
};

export default function StatCard({ label, value, icon, color = "blue", "data-testid": testId }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
      data-testid={testId}
    >
      <div className={clsx("p-3 rounded-xl", COLOR_MAP[color])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
