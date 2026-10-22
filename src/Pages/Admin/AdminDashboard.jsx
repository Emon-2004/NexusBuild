import React, { useState, useMemo } from 'react';
import { useAdminData } from '../../Context/AdminDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { 
    Download, TrendingUp, DollarSign, Building, AlertCircle,
    UserPlus, CreditCard, CheckSquare, Megaphone,
    FileText, UserCheck, Clock, Edit2, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { MonthlyBarChart, MilestoneLineChart, StatusDonutChart } from '../../Components/Charts';

const AdminPrintReport = ({ 
    isGlobal, currentProject, activeProjectsCount, totalRevenue, totalReceivables,
    unitsSold, totalUnitsCount, pendingApprovals, newLeads, activeClients,
    transactions, clients, properties, projects, formatBDT, collectionRate, revenueGrowth,
    systemSettings
}) => (
    <div id="print-area" className="hidden print:block bg-white text-slate-800 p-12 font-sans max-w-4xl mx-auto border border-slate-300 rounded shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-[#1A4B9C] pb-6 mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A4B9C] text-white flex items-center justify-center font-black text-xl rounded">
                        {(systemSettings?.companyName || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="font-extrabold text-2xl tracking-wider text-[#1A4B9C] leading-none uppercase">
                            {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Super Admin Executive Operational Report</p>
                    </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                    {systemSettings?.headOfficeAddress || DEFAULT_SYSTEM_SETTINGS.headOfficeAddress} • {systemSettings?.supportEmail || DEFAULT_SYSTEM_SETTINGS.supportEmail} • {systemSettings?.supportPhone || DEFAULT_SYSTEM_SETTINGS.supportPhone}
                </div>
            </div>
            <div className="text-right space-y-1">
                <span className="px-3 py-1 bg-slate-100 text-[#1A4B9C] text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">
                    Confidential
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-wide uppercase mt-3">PORTFOLIO SUMMARY</h2>
                <div className="text-[11px] text-slate-500 font-medium">Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
        </div>

        {/* Executive Meta */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 grid grid-cols-3 gap-4 text-xs">
            <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Portfolio Context</span>
                <span className="text-sm font-bold text-[#1A4B9C] mt-0.5 block">{isGlobal ? `All Projects (${activeProjectsCount} Active)` : currentProject?.name}</span>
            </div>
            <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Reporting Period</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">Fiscal Year 2023–2024</span>
            </div>
            <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Target Audience</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">Managing Director & Board</span>
            </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="mb-10">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Key Performance Indicators</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Revenue Collected</span>
                    <span className="text-xl font-extrabold text-slate-800 mt-1 block">৳{formatBDT(totalRevenue)}</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+{revenueGrowth}% Realized Revenue</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Net Receivables</span>
                    <span className="text-xl font-extrabold text-amber-700 mt-1 block">৳{formatBDT(totalReceivables)}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">{collectionRate}% Collection Rate</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Units Sold</span>
                    <span className="text-xl font-extrabold text-slate-800 mt-1 block">{unitsSold} / {totalUnitsCount}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">{Math.round((unitsSold / (totalUnitsCount || 1)) * 100)}% Inventory Conversion</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Clients</span>
                    <span className="text-base font-bold text-slate-800 mt-0.5 block">{activeClients}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
                    <span className="text-base font-bold text-red-600 mt-0.5 block">{pendingApprovals}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">New Public Leads</span>
                    <span className="text-base font-bold text-emerald-600 mt-0.5 block">{newLeads}</span>
                </div>
            </div>
        </div>

        {/* Project Pipeline Summary */}
        <div className="mb-10">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Active Development Portfolio</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-4">Project Name</th>
                            <th className="py-2.5 px-4">Total Units</th>
                            <th className="py-2.5 px-4">Construction Phase</th>
                            <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td className="py-2 px-4 font-bold text-slate-800">{p.name}</td>
                                <td className="py-2 px-4 font-medium">{p.totalUnits || p.total_units || 0} Units</td>
                                <td className="py-2 px-4 text-slate-600">Phase {p.progressPhase || p.progress_phase || 1}</td>
                                <td className="py-2 px-4 text-right font-bold text-emerald-600">Active</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Recent High-Value Transactions */}
        <div className="mb-10">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Recent Operational Transactions</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-4">Type & Reference</th>
                            <th className="py-2.5 px-4">Client Name</th>
                            <th className="py-2.5 px-4">Property Unit</th>
                            <th className="py-2.5 px-4">Date</th>
                            <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {transactions.slice(0, 5).map(tx => {
                            const client = clients.find(c => c.id === tx.clientId);
                            const property = properties.find(p => p.id === tx.propertyId);
                            return (
                                <tr key={tx.id}>
                                    <td className="py-2 px-4 font-semibold text-slate-800">{tx.type} ({tx.reference || 'Bank'})</td>
                                    <td className="py-2 px-4 font-medium text-slate-700">{client ? client.name : 'Unknown Client'}</td>
                                    <td className="py-2 px-4 text-slate-600">{property ? property.unitName : 'General'}</td>
                                    <td className="py-2 px-4 text-slate-500">{tx.date}</td>
                                    <td className="py-2 px-4 font-bold text-right text-slate-800">৳{tx.amount}</td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-400 italic">No transaction records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-16 pt-8 border-t border-slate-200">
            <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1 mx-auto"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Prepared By</span>
                <span className="text-[10px] font-bold text-slate-700">Super Admin (Operations)</span>
            </div>
            <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1 mx-auto"></div>
                <span className="text-[9px] font-bold text-[#1A4B9C] uppercase tracking-wider block">Approved By</span>
                <span className="text-[10px] font-bold text-[#1A4B9C]">Managing Director</span>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { clients, properties, transactions, applications, leads, projects, activeProject } = useAdminData();
    const { systemSettings, publicProjects } = useDatabase();
    const navigate = useNavigate();

    const isGlobal = activeProject === 'all';
    const currentProject = projects.find(p => p.id === activeProject);

    const getFlatsListForProject = (projectId) => {
        try {
            const stored = localStorage.getItem('flats_project_' + projectId);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch(e) {}
        // Fallback default list
        return [
            { id: 'f1', unit: 'Flat 1A', size: '1,200 sqft', price: '৳1.25Cr', status: 'AVAILABLE' },
            { id: 'f2', unit: 'Flat 1B', size: '1,500 sqft', price: '৳1.55Cr', status: 'SOLD' },
            { id: 'f3', unit: 'Flat 2A', size: '1,200 sqft', price: '৳1.25Cr', status: 'RESERVED' },
            { id: 'f4', unit: 'Flat 2B', size: '1,500 sqft', price: '৳1.55Cr', status: 'AVAILABLE' }
        ];
    };

    const getProjectStats = (projectId) => {
        const flats = getFlatsListForProject(projectId);
        return {
            total: flats.length,
            sold: flats.filter(f => f.status === 'SOLD').length
        };
    };

    // Calculate dynamic stats
    const totalRevenue = transactions.reduce((sum, tx) => sum + parseInt(tx.amount.replace(/,/g, '')), 0);
    const totalReceivables = properties.reduce((sum, p) => sum + parseInt(p.dueBalance.replace(/,/g, '')), 0);
    const totalContractVal = totalRevenue + totalReceivables;
    const collectionRate = totalContractVal > 0 ? Math.round((totalRevenue / totalContractVal) * 100) : 0;
    const revenueGrowth = totalContractVal > 0 ? ((totalRevenue / totalContractVal) * 100).toFixed(1) : '0.0';

    const activeClients = clients.length;
    const projectStatsList = projects.map(p => getProjectStats(p.id));
    const unitsSold = isGlobal
        ? projectStatsList.reduce((sum, s) => sum + s.sold, 0)
        : getProjectStats(activeProject).sold;
    const pendingApprovals = applications.filter(a => a.status === 'Pending').length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const activeProjectsCount = projects.length;
    
    const totalUnitsCount = isGlobal 
        ? projectStatsList.reduce((sum, s) => sum + s.total, 0)
        : getProjectStats(activeProject).total;

    // Format currency
    const formatBDT = (amount) => new Intl.NumberFormat('en-IN').format(amount);

    const [donutTab, setDonutTab] = useState('types'); // 'types' | 'status'

    // ── Live Charts Data Aggregation ──────────────────────────────────────────
    const monthlyAdminData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                month: monthNames[d.getMonth()],
                revenue: 0,
                inquiries: 0
            });
        }

        if (transactions && transactions.length > 0) {
            transactions.forEach(tx => {
                if (!tx.date) return;
                const d = new Date(tx.date);
                if (isNaN(d.getTime())) return;
                const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const match = months.find(m => m.key === mKey);
                const amt = parseInt(String(tx.amount || '0').replace(/[^\d]/g, ''), 10) || 0;
                if (match) match.revenue += amt;
            });
        }

        if (leads && leads.length > 0) {
            leads.forEach(l => {
                const dateVal = l.created_at || l.date;
                if (!dateVal) return;
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return;
                const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const match = months.find(m => m.key === mKey);
                if (match) match.inquiries += 1;
            });
        }

        const hasAnyRev = months.some(m => m.revenue > 0);
        const hasAnyInq = months.some(m => m.inquiries > 0);
        const baselineRev = [4500000, 7200000, 6100000, 8900000, 10500000, 12500000];
        const baselineInq = [12, 19, 15, 24, 28, 35];

        return months.map((m, idx) => ({
            month: m.month,
            revenue: hasAnyRev && m.revenue > 0 ? m.revenue : baselineRev[idx],
            inquiries: hasAnyInq && m.inquiries > 0 ? m.inquiries : baselineInq[idx],
        }));
    }, [transactions, leads]);

    const cashFlowLineData = useMemo(() => {
        let cumulative = 0;
        return monthlyAdminData.map((m, idx) => {
            cumulative += m.revenue;
            const target = Math.round((idx + 1) * (totalContractVal > 0 ? totalContractVal / 6 : 8000000));
            return {
                name: m.month,
                collected: cumulative,
                target: target
            };
        });
    }, [monthlyAdminData, totalContractVal]);

    const propertyTypeData = useMemo(() => {
        const counts = {};
        const list = (publicProjects && publicProjects.length > 0) ? publicProjects : projects;
        list.forEach(p => {
            const type = p.type || 'Residential';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
    }, [publicProjects, projects]);

    const salesStatusData = useMemo(() => {
        const sold = unitsSold || 18;
        const total = totalUnitsCount || 32;
        const available = Math.max(0, total - sold);
        const pending = pendingApprovals || 4;
        return [
            { name: 'Sold Units', value: sold, color: '#10b981' },
            { name: 'Available Units', value: available, color: '#3b82f6' },
            { name: 'Pending / Reserved', value: pending, color: '#f59e0b' }
        ];
    }, [unitsSold, totalUnitsCount, pendingApprovals]);

    return (
        <>
            <AdminPrintReport 
                isGlobal={isGlobal}
                currentProject={currentProject}
                activeProjectsCount={activeProjectsCount}
                totalRevenue={totalRevenue}
                totalReceivables={totalReceivables}
                unitsSold={unitsSold}
                totalUnitsCount={totalUnitsCount}
                pendingApprovals={pendingApprovals}
                newLeads={newLeads}
                activeClients={activeClients}
                transactions={transactions}
                clients={clients}
                properties={properties}
                projects={projects}
                formatBDT={formatBDT}
                collectionRate={collectionRate}
                revenueGrowth={revenueGrowth}
                systemSettings={systemSettings}
            />

            <div className="max-w-5xl mx-auto space-y-6 px-4 lg:px-0 print:hidden">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
                    <div>
                        <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">
                            {isGlobal ? "Global Portfolio Context" : "Project Portfolio Context"}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {isGlobal ? "All Projects" : currentProject?.name}{' '}
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {isGlobal ? `(${activeProjectsCount} Active)` : "Active"}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {isGlobal 
                                ? "Aggregate executive summary and operational metrics across all active developments."
                                : `Operational summary and key metrics specifically for ${currentProject?.name}.`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!isGlobal && (
                            <button onClick={() => navigate('/admin/website-projects')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1A4B9C] border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-bold shadow-sm transition-colors cursor-pointer">
                                <Edit2 size={14} /> Project Details
                            </button>
                        )}
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors cursor-pointer">
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Row: 2 Large Cards */}
                    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                <TrendingUp size={16} className="text-slate-400" />
                                <span>Total Revenue Collected</span>
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800 mb-2">৳{formatBDT(totalRevenue)}</div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-xs text-slate-500">
                                {isGlobal ? "Across all projects" : `For ${currentProject?.name}`} • Fiscal Year 2023-2024
                            </div>
                            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center gap-1">
                                <TrendingUp size={12} /> +{revenueGrowth}% Realized
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                <DollarSign size={16} className="text-slate-400" />
                                <span>Total Net Receivables</span>
                            </div>
                            <div className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                                {isGlobal ? "Global Outstanding" : "Project Outstanding"}
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800 mb-2">৳{formatBDT(totalReceivables)}</div>
                        <div className="mt-4">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                                <div className="bg-amber-500 h-full" style={{ width: `${collectionRate}%` }}></div>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">{collectionRate}% average collection rate on schedule</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Bottom Row: 3 Smaller Cards */}
                    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-4">
                            <Building size={16} className="text-[#1A4B9C]" />
                            <span>Units Sold</span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-800 mb-1">{unitsSold} <span className="text-slate-400 text-lg font-medium">/ {totalUnitsCount}</span></div>
                        <div className="text-xs text-slate-500">
                            {isGlobal ? `Across ${activeProjectsCount} Active Projects` : `For ${currentProject?.name}`}
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/admin/onboarding')}
                        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm cursor-pointer hover:shadow-md hover:border-[#1A4B9C] transition-all"
                    >
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-4">
                            <AlertCircle size={16} className="text-red-500" />
                            <span>Pending Approvals</span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-800 mb-1">{pendingApprovals}</div>
                        <div className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle size={12} /> Requires MD signature
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/admin/leads')}
                        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-500 transition-all"
                    >
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-4">
                            <UserPlus size={16} className="text-emerald-500" />
                            <span>New Public Leads</span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-800 mb-1">{newLeads}</div>
                        <div className="text-xs text-slate-500">Generated recently</div>
                    </div>
                </div>

                {/* Visual Analytics & Operational Vector Charts */}
                <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                            <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                                <BarChart2 size={20} className="text-primary" />
                                Operational Analytics &amp; Visual Intelligence
                            </h2>
                            <p className="text-xs text-base-content/65">
                                Real-time portfolio metrics, collections velocity, and inventory conversion
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 self-start sm:self-auto">
                            Vector Charts Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Bar Chart: Monthly Inquiries & Revenue */}
                        <div className="lg:col-span-7 flex">
                            <MonthlyBarChart
                                title="Monthly Revenue & Inquiries"
                                subtitle="Collection velocity and lead volume across recent months"
                                data={monthlyAdminData}
                                bars={[
                                    { dataKey: "revenue", name: "Revenue (৳)", color: "#1A4B9C" },
                                    { dataKey: "inquiries", name: "Inquiries", color: "#fe762a" }
                                ]}
                                formatValue={(val, name) => name.includes("Revenue") ? `৳ ${formatBDT(val)}` : `${val} leads`}
                                badgeText="Velocity"
                            />
                        </div>

                        {/* Donut Chart: Property Types / Sales Status */}
                        <div className="lg:col-span-5 flex">
                            <StatusDonutChart
                                title={donutTab === 'types' ? "Developments by Type" : "Inventory Sales Status"}
                                subtitle={donutTab === 'types' ? "Portfolio asset classification" : "Conversion of total development units"}
                                data={donutTab === 'types' ? propertyTypeData : salesStatusData}
                                centerLabel={donutTab === 'types' ? "Projects" : "Units"}
                                centerValue={donutTab === 'types' ? ((publicProjects && publicProjects.length > 0) ? publicProjects.length : projects.length) : totalUnitsCount}
                                badgeText={donutTab === 'types' ? "Mix" : "Status"}
                                actionButton={
                                    <div className="flex items-center gap-1 bg-base-200 p-0.5 rounded-lg border border-base-300 text-[10px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setDonutTab('types')}
                                            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                                donutTab === 'types' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/70 hover:text-base-content'
                                            }`}
                                        >
                                            Types
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDonutTab('status')}
                                            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                                donutTab === 'status' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/70 hover:text-base-content'
                                            }`}
                                        >
                                            Status
                                        </button>
                                    </div>
                                }
                            />
                        </div>

                        {/* Line Chart: Cash Flow & Collections Over Time */}
                        <div className="lg:col-span-12">
                            <MilestoneLineChart
                                title="Cumulative Cash Flow & Revenue Targets"
                                subtitle="Aggregate collections trajectory vs milestone target commitments"
                                data={cashFlowLineData}
                                lines={[
                                    { dataKey: "collected", name: "Realized Collections", color: "#10b981" },
                                    { dataKey: "target", name: "Target Commitment", color: "#1A4B9C" }
                                ]}
                                unit=""
                                formatValue={(val) => `৳ ${formatBDT(val)}`}
                                badgeText="Cash Flow Trend"
                            />
                        </div>
                    </div>
                </div>

                {/* All Projects Comparative Portfolio Matrix (Visible only in All Projects mode) */}
                {isGlobal && (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Projects Performance Comparison Matrix</h3>
                                <p className="text-xs text-slate-500">Executive comparison across all active {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName} developments</p>
                            </div>
                            <span className="text-xs bg-[#E1EFFE] text-[#1A4B9C] px-3 py-1 rounded-full font-bold">
                                {projects.length} Active Developments
                            </span>
                        </div>
                        <div className="divide-y divide-[#E2E8F0]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-white border-b border-[#E2E8F0] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Project Name</th>
                                        <th className="px-6 py-3 text-center">Total Units</th>
                                        <th className="px-6 py-3 text-center">Units Sold</th>
                                        <th className="px-6 py-3 text-right">Revenue Billed</th>
                                        <th className="px-6 py-3 text-right">Revenue Collected</th>
                                        <th className="px-6 py-3 text-right">Net Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                                    {projects.map(proj => {
                                        const projStats = getProjectStats(proj.id);
                                        const projProps = properties.filter(p => p.projectId === proj.id);
                                        const projTxs = transactions.filter(t => projProps.some(p => p.id === t.propertyId));
                                        
                                        const projRevenue = projTxs.reduce((sum, tx) => sum + parseInt(String(tx.amount).replace(/,/g, '') || 0), 0);
                                        const projDue = projProps.reduce((sum, p) => sum + parseInt(String(p.dueBalance).replace(/,/g, '') || 0), 0);
                                        const projValuation = projRevenue + projDue;
                                        
                                        return (
                                            <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="font-bold text-slate-800">{proj.name}</div>
                                                    <div className="text-[10px] text-slate-500">ID: {proj.id}</div>
                                                </td>
                                                <td className="px-6 py-3 text-center font-bold text-slate-700">{projStats.total}</td>
                                                <td className="px-6 py-3 text-center font-bold text-slate-700">{projStats.sold}</td>
                                                <td className="px-6 py-3 text-right font-bold text-slate-880">৳ {formatBDT(projValuation)}</td>
                                                <td className="px-6 py-3 text-right font-bold text-emerald-600">৳ {formatBDT(projRevenue)}</td>
                                                <td className="px-6 py-3 text-right font-bold text-red-600">৳ {formatBDT(projDue)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => navigate('/admin/management')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1A4B9C] text-white rounded-lg font-medium hover:bg-[#153B7C] transition-colors shadow-sm text-sm cursor-pointer">
                            <UserPlus size={16} /> Add Client
                        </button>
                        <button onClick={() => navigate('/admin/financials')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm cursor-pointer">
                            <CreditCard size={16} /> Record Payment
                        </button>
                        <button onClick={() => navigate('/admin/onboarding')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm cursor-pointer">
                            <CheckSquare size={16} /> Approve Registration
                        </button>
                        <button onClick={() => navigate('/admin/progress')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm cursor-pointer">
                            <Megaphone size={16} /> Publish Announcement
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#ffffff] border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden mb-10">
                    <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
                        <button onClick={() => navigate('/admin/financials')} className="text-[#1A4B9C] text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-[#E2E8F0]">
                        {transactions.slice(0, 3).map(tx => {
                            const client = clients.find(c => c.id === tx.clientId);
                            const property = properties.find(p => p.id === tx.propertyId);
                            const clientName = client ? client.name : 'Unknown Client';
                            const unitName = property ? property.unitName : 'Unknown Unit';
                            
                            return (
                                <div key={tx.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4 md:w-1/4">
                                        <div className="w-8 h-8 rounded bg-[#DEF7EC] text-[#03543F] flex items-center justify-center flex-shrink-0">
                                            <CreditCard size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{tx.type}</div>
                                            <div className="text-xs text-slate-500">{tx.reference || 'Bank Transfer'}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 md:w-1/4">{clientName}</div>
                                    <div className="text-sm text-slate-500 md:w-1/4">{unitName} Payment</div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/4">
                                        <div className="text-sm font-extrabold text-slate-800">৳{tx.amount}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> {tx.date}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {transactions.length === 0 && (
                            <div className="px-6 py-8 text-center text-slate-500 text-sm">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
