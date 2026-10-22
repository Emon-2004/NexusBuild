import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useTheme } from '../../Context/ThemeContext';

const CustomTooltip = ({ active, payload, label, isDark, formatValue, unit = "" }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md transition-all ${
                isDark 
                    ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/40' 
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/60'
            }`}>
                <p className="font-bold mb-1.5 pb-1 border-b border-current/10">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                        </span>
                        <span className="font-bold">
                            {formatValue ? formatValue(entry.value, entry.name) : `${entry.value}${unit}`}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * MilestoneLineChart
 * Displays progress milestone completion or cash-flow trajectories over time.
 * Theme-aware for light and dark modes with responsive container.
 */
export const MilestoneLineChart = ({
    title = "Timeline & Trajectory",
    subtitle = "Milestone progress and cumulative cash flow",
    data = [],
    lines = [
        { dataKey: "progress", name: "Construction %", color: "#10b981" },
        { dataKey: "settled", name: "Settled %", color: "#1A4B9C" }
    ],
    formatValue,
    unit = "%",
    badgeText
}) => {
    const { isDark } = useTheme();

    const gridStroke = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const axisColor = isDark ? "#94A3B8" : "#64748B";

    return (
        <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between w-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-base-content">{title}</h3>
                        {badgeText && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {badgeText}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-base-content/65 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-[260px] min-h-[260px]">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={axisColor}
                                fontSize={11}
                                tickLine={false}
                                axisLine={{ stroke: gridStroke }}
                            />
                            <YAxis
                                stroke={axisColor}
                                fontSize={11}
                                tickLine={false}
                                axisLine={{ stroke: gridStroke }}
                                domain={[0, 'auto']}
                                tickFormatter={(val) => {
                                    if (unit === "%") return `${val}%`;
                                    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
                                    if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
                                    return val;
                                }}
                            />
                            <Tooltip content={<CustomTooltip isDark={isDark} formatValue={formatValue} unit={unit} />} />
                            <Legend
                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                iconType="plainline"
                                iconSize={12}
                            />
                            {lines.map((line, idx) => (
                                <Line
                                    key={line.dataKey}
                                    type="monotone"
                                    dataKey={line.dataKey}
                                    name={line.name}
                                    stroke={line.color || (idx === 0 ? "#10b981" : "#1A4B9C")}
                                    strokeWidth={2.5}
                                    dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-base-content/50">
                        No milestone timeline recorded yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default MilestoneLineChart;
