import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../Context/ThemeContext';

const CustomTooltip = ({ active, payload, isDark, formatValue }) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md transition-all ${
                isDark 
                    ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/40' 
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/60'
            }`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload?.fill || item.color }} />
                    <span className="font-bold">{item.name}</span>
                </div>
                <div className="text-xs font-semibold text-base-content/80 pl-4.5">
                    {formatValue ? formatValue(item.value, item.payload) : `${item.value} units`}
                </div>
            </div>
        );
    }
    return null;
};

/**
 * StatusDonutChart
 * Displays distribution breakdown (property types, sales status, asset allocation)
 * Theme-aware for light and dark modes with responsive container and center label.
 */
export const StatusDonutChart = ({
    title = "Portfolio Distribution",
    subtitle = "Category breakdown and allocation",
    data = [],
    centerLabel = "Total",
    centerValue,
    formatValue,
    badgeText,
    actionButton
}) => {
    const { isDark } = useTheme();

    const computedTotal = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const displayCenter = centerValue !== undefined ? centerValue : computedTotal;

    // Default palette tailored for both dark and light modes
    const DEFAULT_COLORS = isDark
        ? ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e', '#a78bfa', '#fb923c']
        : ['#1A4B9C', '#059669', '#d97706', '#dc2626', '#7c3aed', '#ea580c'];

    return (
        <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between w-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-base-content">{title}</h3>
                        {badgeText && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {badgeText}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-base-content/65 mt-0.5">{subtitle}</p>
                    )}
                </div>
                {actionButton && <div>{actionButton}</div>}
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative w-full h-[260px] min-h-[260px] flex items-center justify-center">
                {data && data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="46%"
                                    innerRadius={58}
                                    outerRadius={82}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                            stroke={isDark ? "#0f172a" : "#ffffff"}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip isDark={isDark} formatValue={formatValue} />} />
                                <Legend
                                    verticalAlign="bottom"
                                    wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                                    iconType="circle"
                                    iconSize={8}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Metric */}
                        <div className="absolute top-[46%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-lg sm:text-xl font-extrabold text-base-content block leading-tight">
                                {displayCenter}
                            </span>
                            <span className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wider block">
                                {centerLabel}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-base-content/50">
                        No distribution data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusDonutChart;
