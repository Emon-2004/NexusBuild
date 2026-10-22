import { useState, useMemo } from 'react';
import { Search, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAdminData } from '../../Context/AdminDataContext';
import { showToast } from '../../Components/Toast/globalToast';
import { Table, Modal, Button, Badge } from '../../Components/UI';

const AdminInstallments = () => {
    const { installments, properties, clients, updateInstallment, deleteInstallment } = useAdminData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Sorting & Pagination
    const [sortKey, setSortKey] = useState('dueDate');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [viewingInstallment, setViewingInstallment] = useState(null);
    const [editingInstallment, setEditingInstallment] = useState(null);
    const [deletingInstallment, setDeletingInstallment] = useState(null);

    // Map propertyId to actual property and client
    const enrichedInstallments = useMemo(() => {
        return installments.map(inst => {
            const prop = properties.find(p => p.id === inst.propertyId);
            const client = prop ? clients.find(c => c.id === prop.clientId) : null;
            return {
                ...inst,
                client: client ? client.name : 'Unknown Client',
                unit: prop ? prop.unitName : 'Unknown Unit'
            };
        });
    }, [installments, properties, clients]);

    const formatBDT = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-IN').format(parseInt(String(amount).replace(/,/g, '')));
    };

    let totalExpected = 0;
    let totalCollected = 0;
    let totalOverdue = 0;
    let totalUpcoming = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    installments.forEach(inst => {
        const amt = parseInt(String(inst.amount).replace(/,/g, '')) || 0;
        if (inst.status === 'Paid') {
            totalCollected += amt;
            totalExpected += amt;
        } else if (inst.status === 'Overdue') {
            totalOverdue += amt;
            totalExpected += amt;
            overdueCount++;
        } else if (inst.status === 'Pending' || inst.status === 'Upcoming') {
            totalUpcoming += amt;
            totalExpected += amt;
            upcomingCount++;
        }
    });

    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    const getBadgeVariant = (status) => {
        switch(status) {
            case 'Paid': return 'success';
            case 'Pending': return 'primary';
            case 'Upcoming': return 'neutral';
            case 'Overdue': return 'danger';
            default: return 'neutral';
        }
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Client,Unit,Amount,DueDate,Status\n"
            + enrichedInstallments.map(i => `${i.id},${i.client},${i.unit},${i.amount},${i.dueDate},${i.status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "installments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredInstallments = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return enrichedInstallments.filter(inst => {
            const matchesSearch = !term ||
                (inst.client && inst.client.toLowerCase().includes(term)) ||
                (inst.unit && inst.unit.toLowerCase().includes(term)) ||
                (inst.id && inst.id.toLowerCase().includes(term));
            const matchesStatus = statusFilter === 'All' || inst.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [enrichedInstallments, searchTerm, statusFilter]);

    const sortedInstallments = useMemo(() => {
        return [...filteredInstallments].sort((a, b) => {
            let valA = '';
            let valB = '';
            if (sortKey === 'client') {
                valA = (a.client || '').toLowerCase();
                valB = (b.client || '').toLowerCase();
            } else if (sortKey === 'id') {
                valA = a.id || '';
                valB = b.id || '';
            } else if (sortKey === 'dueDate') {
                valA = new Date(a.dueDate || a.due_date || 0).getTime() || 0;
                valB = new Date(b.dueDate || b.due_date || 0).getTime() || 0;
            } else if (sortKey === 'amount') {
                valA = parseInt(String(a.amount || 0).replace(/,/g, '')) || 0;
                valB = parseInt(String(b.amount || 0).replace(/,/g, '')) || 0;
            } else if (sortKey === 'status') {
                valA = (a.status || '').toLowerCase();
                valB = (b.status || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredInstallments, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedInstallments.length / itemsPerPage));
    const paginatedInstallments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedInstallments.slice(start, start + itemsPerPage);
    }, [sortedInstallments, currentPage, itemsPerPage]);

    const handleMarkAsPaid = async (inst) => {
        try {
            await updateInstallment(inst.id, {
                status: 'Paid',
                statusPill: 'bg-[#DEF7EC] text-[#03543F]',
                active: false
            });
            showToast('Installment marked as Paid and ledger updated successfully!', 'success', 'Payment Recorded');
            setViewingInstallment(null);
            setEditingInstallment(null);
        } catch (err) {
            showToast('Failed to update installment: ' + err.message, 'error', 'Error');
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingInstallment) return;
        try {
            await updateInstallment(editingInstallment.id, {
                dueDate: editingInstallment.dueDate,
                amount: editingInstallment.amount,
                status: editingInstallment.status,
                installment: editingInstallment.installment || editingInstallment.id
            });
            showToast('Installment updated successfully.', 'success', 'Saved');
            setEditingInstallment(null);
        } catch (err) {
            showToast('Failed to save installment: ' + err.message, 'error', 'Error');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingInstallment) return;
        try {
            if (deleteInstallment) {
                await deleteInstallment(deletingInstallment.id);
            }
            showToast(`Installment ${deletingInstallment.id.slice(0, 8)} removed.`, 'success', 'Installment Deleted');
            setDeletingInstallment(null);
        } catch (err) {
            showToast('Failed to delete installment: ' + err.message, 'error', 'Error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 lg:px-0 text-slate-800">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
                <div>
                    <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">Financial Operations</div>
                    <h1 className="text-2xl font-bold text-slate-800">Installments Manager</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor upcoming collections, overdue accounts, and payment schedules.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-between gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 shadow-sm text-xs text-slate-600">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent font-medium outline-none cursor-pointer text-slate-700"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Expected</div>
                    <div className="text-2xl font-extrabold text-[#1A4B9C] mt-1">৳{formatBDT(totalExpected)}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Across All Properties</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Collected</div>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">৳{formatBDT(totalCollected)}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">{collectionRate}% Recovery Rate</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Total Overdue</div>
                    <div className="text-2xl font-extrabold text-red-600 mt-1">৳{formatBDT(totalOverdue)}</div>
                    <div className="text-[10px] text-red-500 font-bold mt-1 uppercase">{overdueCount} Critical Overdue</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Upcoming Scheduled</div>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">৳{formatBDT(totalUpcoming)}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">{upcomingCount} Slated Collections</div>
                </div>
            </div>

            {/* Installments Table Container */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Master Installment Ledger</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Showing {sortedInstallments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedInstallments.length)} of {sortedInstallments.length} entries
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search client, unit..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9 pr-4 py-1.5 border border-[#E2E8F0] rounded-lg text-xs w-full sm:w-64 outline-none focus:border-[#1A4B9C] bg-white text-slate-800"
                            />
                        </div>
                        <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition-colors text-xs cursor-pointer w-full sm:w-auto flex-shrink-0">
                            <Download size={12} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <Table variant="zebra" size="sm" containerClassName="border border-[#E2E8F0]">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-[#E2E8F0] text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('client')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Client & Unit {sortKey === 'client' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('id')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Installment Ref {sortKey === 'id' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Due Date {sortKey === 'dueDate' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <button onClick={() => handleSort('amount')} className="inline-flex items-center gap-1.5 font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer ml-auto">
                                        Amount (BDT) {sortKey === 'amount' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('status')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Status {sortKey === 'status' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {paginatedInstallments.map(inst => (
                                <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-800 text-xs">{inst.client}</div>
                                        <div className="text-[10px] text-slate-500">{inst.unit}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                                        {inst.id?.slice(0, 10)}...
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {inst.dueDate}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-slate-800 text-right">
                                        ৳{formatBDT(inst.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getBadgeVariant(inst.status)} size="sm">
                                            {inst.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                                onClick={() => setViewingInstallment(inst)} 
                                                title="View Details"
                                                className="p-1.5 text-slate-500 hover:text-[#1A4B9C] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button 
                                                onClick={() => setEditingInstallment({ ...inst })} 
                                                title="Edit Installment"
                                                className="p-1.5 text-slate-500 hover:text-[#1A4B9C] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingInstallment(inst)} 
                                                title="Delete Installment"
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedInstallments.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                                        No installments matched your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-medium">
                            Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                                        currentPage === page
                                            ? 'bg-[#1A4B9C] text-white'
                                            : 'border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── View Installment Modal ── */}
            {viewingInstallment && (
                <Modal
                    isOpen={!!viewingInstallment}
                    onClose={() => setViewingInstallment(null)}
                    title="Installment Record Details"
                    size="md"
                    actions={
                        <div className="flex items-center justify-between w-full">
                            {viewingInstallment.status !== 'Paid' ? (
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => handleMarkAsPaid(viewingInstallment)}
                                >
                                    Mark as Paid
                                </Button>
                            ) : <div />}
                            <Button variant="outline" size="sm" onClick={() => setViewingInstallment(null)}>
                                Close
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reference</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">{viewingInstallment.id}</span>
                            </div>
                            <Badge variant={getBadgeVariant(viewingInstallment.status)} size="md">
                                {viewingInstallment.status}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-slate-700">
                            <div className="flex justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="text-slate-500 font-medium">Client</span>
                                <span className="font-bold text-slate-800">{viewingInstallment.client}</span>
                            </div>
                            <div className="flex justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="text-slate-500 font-medium">Assigned Unit</span>
                                <span className="font-bold text-slate-800">{viewingInstallment.unit}</span>
                            </div>
                            <div className="flex justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="text-slate-500 font-medium">Amount Due</span>
                                <span className="font-bold text-[#1A4B9C] text-sm">৳{formatBDT(viewingInstallment.amount)}</span>
                            </div>
                            <div className="flex justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="text-slate-500 font-medium">Scheduled Due Date</span>
                                <span className="font-bold text-slate-800">{viewingInstallment.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Edit Installment Modal ── */}
            {editingInstallment && (
                <Modal
                    isOpen={!!editingInstallment}
                    onClose={() => setEditingInstallment(null)}
                    title="Edit Installment Schedule"
                    size="md"
                    actions={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => setEditingInstallment(null)}>
                                Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                                Save Changes
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={handleSaveEdit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Due Date</label>
                            <input 
                                type="date" 
                                required 
                                value={editingInstallment.dueDate} 
                                onChange={e => setEditingInstallment({ ...editingInstallment, dueDate: e.target.value })} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Amount (BDT)</label>
                            <input 
                                type="text" 
                                required 
                                value={editingInstallment.amount} 
                                onChange={e => setEditingInstallment({ ...editingInstallment, amount: e.target.value })} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Status</label>
                            <select
                                value={editingInstallment.status}
                                onChange={e => setEditingInstallment({ ...editingInstallment, status: e.target.value })}
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800 cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deletingInstallment && (
                <Modal
                    isOpen={!!deletingInstallment}
                    onClose={() => setDeletingInstallment(null)}
                    title="Confirm Installment Deletion"
                    size="md"
                    actions={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => setDeletingInstallment(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                                Yes, Delete Installment
                            </Button>
                        </div>
                    }
                >
                    <div className="flex items-start gap-3.5 py-1">
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                                Delete installment for <span className="text-red-600">{deletingInstallment.client}</span>?
                            </h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                This will remove the installment requirement of ৳{deletingInstallment.amount} due on {deletingInstallment.dueDate}. This action cannot be reversed.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default AdminInstallments;
