import { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit2, Trash2, AlertTriangle, Calendar, Home, Sparkles } from 'lucide-react';
import { useAdminData } from '../../Context/AdminDataContext';
import { Table, Modal, Button, Badge } from '../../Components/UI';
import { showToast } from '../../Components/Toast/globalToast';

const AdminLeads = () => {
    const { leads, addLead, updateLeadStatus, updateLead, deleteLead } = useAdminData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Sorting & Pagination
    const [sortKey, setSortKey] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', phone: '', interest: '', source: 'Manual Entry', status: 'New' });

    const [viewingLead, setViewingLead] = useState(null);
    const [editingLead, setEditingLead] = useState(null);
    const [deletingLead, setDeletingLead] = useState(null);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handleAddLead = (e) => {
        e.preventDefault();
        addLead(newLead);
        setIsAddModalOpen(false);
        showToast(`Lead for ${newLead.name} created!`, 'success', 'Lead Added');
        setNewLead({ name: '', phone: '', interest: '', source: 'Manual Entry', status: 'New' });
    };

    const handleUpdateStatus = (id, currentStatus) => {
        const flow = ['New', 'Contacted', 'Qualified', 'Converted'];
        const currentIndex = flow.indexOf(currentStatus);
        if (currentIndex < flow.length - 1) {
            const nextStatus = flow[currentIndex + 1];
            updateLeadStatus(id, nextStatus);
            showToast(`Lead status advanced to ${nextStatus}`, 'success', 'Status Updated');
            if (viewingLead && viewingLead.id === id) {
                setViewingLead(prev => ({ ...prev, status: nextStatus }));
            }
        }
    };

    const handleSaveEditLead = async (e) => {
        e.preventDefault();
        if (!editingLead) return;
        try {
            if (updateLead) {
                await updateLead(editingLead.id, {
                    name: editingLead.name,
                    phone: editingLead.phone,
                    interest: editingLead.interest,
                    status: editingLead.status,
                    source: editingLead.source
                });
            } else {
                updateLeadStatus(editingLead.id, editingLead.status);
            }
            showToast(`Lead ${editingLead.name} updated successfully!`, 'success', 'Lead Saved');
            setEditingLead(null);
        } catch (err) {
            showToast('Failed to update lead: ' + err.message, 'error', 'Error');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingLead) return;
        try {
            await deleteLead(deletingLead.id);
            showToast(`Lead ${deletingLead.name} deleted.`, 'success', 'Lead Deleted');
            setDeletingLead(null);
        } catch (err) {
            showToast('Failed to delete lead: ' + err.message, 'error', 'Error');
        }
    };

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Name,Phone,Interest,Source,Status,Date\n"
            + leads.map(l => `${l.id},${l.name},${l.phone},${l.interest},${l.source},${l.status},${l.date}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return leads.filter(l => {
            const matchesSearch = !term ||
                (l.name && l.name.toLowerCase().includes(term)) || 
                (l.phone && l.phone.includes(term)) ||
                (l.interest && l.interest.toLowerCase().includes(term)) ||
                (l.source && l.source.toLowerCase().includes(term));
            const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [leads, searchTerm, selectedStatus]);

    const sortedLeads = useMemo(() => {
        return [...filteredLeads].sort((a, b) => {
            let valA = '';
            let valB = '';
            if (sortKey === 'name') {
                valA = (a.name || '').toLowerCase();
                valB = (b.name || '').toLowerCase();
            } else if (sortKey === 'interest') {
                valA = (a.interest || '').toLowerCase();
                valB = (b.interest || '').toLowerCase();
            } else if (sortKey === 'source') {
                valA = (a.source || '').toLowerCase();
                valB = (b.source || '').toLowerCase();
            } else if (sortKey === 'date') {
                valA = new Date(a.date || 0).getTime() || 0;
                valB = new Date(b.date || 0).getTime() || 0;
            } else if (sortKey === 'status') {
                valA = (a.status || '').toLowerCase();
                valB = (b.status || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredLeads, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedLeads.length / itemsPerPage));
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedLeads.slice(start, start + itemsPerPage);
    }, [sortedLeads, currentPage, itemsPerPage]);

    const getBadgeVariant = (status) => {
        switch(status) {
            case 'New': return 'primary';
            case 'Contacted': return 'warning';
            case 'Qualified': return 'secondary';
            case 'Converted': return 'success';
            default: return 'neutral';
        }
    };

    const newLeadsCount = leads.filter(l => l.status === 'New').length;
    const pipelineCount = leads.filter(l => ['Contacted', 'Meeting Scheduled', 'Qualified'].includes(l.status)).length;
    const convertedCount = leads.filter(l => l.status === 'Converted').length;

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 lg:px-0 text-slate-800">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
                <div>
                    <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">Sales Pipeline</div>
                    <h1 className="text-2xl font-bold text-slate-800">Lead Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage potential clients across all projects.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-between gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 shadow-sm text-xs text-slate-600">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent font-medium outline-none cursor-pointer text-slate-700"
                        >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Converted">Converted</option>
                        </select>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-[#1A4B9C] text-white rounded-lg hover:bg-[#153B7C] text-sm font-medium shadow-sm transition-colors cursor-pointer flex-shrink-0">
                        <Plus size={14} /> Add Lead
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</div>
                    <div className="text-2xl font-extrabold text-[#1A4B9C] mt-1">{leads.length}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Across all sources</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">New (Uncontacted)</div>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">{newLeadsCount}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Requires immediate action</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">In Pipeline</div>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">{pipelineCount}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Actively engaged</div>
                </div>
                <div className="bg-[#1A4B9C] p-4 rounded-xl border border-[#153B7C] shadow-sm text-white">
                    <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Converted (Total)</div>
                    <div className="text-2xl font-extrabold mt-1">{convertedCount}</div>
                    <div className="text-[10px] text-emerald-300 mt-1 font-bold uppercase">Awaiting Approval</div>
                </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Active Leads</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Showing {sortedLeads.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, phone, interest..."
                                value={searchTerm}
                                onChange={(e) => {
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
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Lead Info {sortKey === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('interest')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Interest {sortKey === 'interest' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('source')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Source {sortKey === 'source' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">
                                    <button onClick={() => handleSort('date')} className="flex items-center gap-1.5 text-left font-bold hover:text-[#1A4B9C] transition-colors cursor-pointer">
                                        Date Added {sortKey === 'date' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#1A4B9C]" /> : <ArrowDown size={12} className="text-[#1A4B9C]" />) : <ArrowUpDown size={12} className="opacity-40" />}
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
                            {paginatedLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-800 text-xs">{lead.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                        {lead.interest}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {lead.source}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {lead.date}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getBadgeVariant(lead.status)} size="sm">
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {lead.status !== 'Converted' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(lead.id, lead.status)} 
                                                    title="Advance Stage"
                                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1A4B9C] rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 mr-1"
                                                >
                                                    Advance <ChevronRight size={11} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setViewingLead(lead)} 
                                                title="View Lead"
                                                className="p-1.5 text-slate-500 hover:text-[#1A4B9C] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button 
                                                onClick={() => setEditingLead({ ...lead })} 
                                                title="Edit Lead"
                                                className="p-1.5 text-slate-500 hover:text-[#1A4B9C] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingLead(lead)} 
                                                title="Delete Lead"
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedLeads.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                                        No active leads found. Click "Add Lead" to register a new prospect.
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

            {/* ── View Lead Modal ── */}
            {viewingLead && (
                <Modal
                    isOpen={!!viewingLead}
                    onClose={() => setViewingLead(null)}
                    title="Lead Snapshot & Pipeline"
                    size="md"
                    actions={
                        <div className="flex items-center justify-between w-full">
                            {viewingLead.status !== 'Converted' ? (
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => handleUpdateStatus(viewingLead.id, viewingLead.status)}
                                >
                                    Advance Status
                                </Button>
                            ) : <div />}
                            <Button variant="outline" size="sm" onClick={() => setViewingLead(null)}>
                                Close
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                                <h4 className="font-bold text-slate-800 text-base">{viewingLead.name}</h4>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{viewingLead.phone}</div>
                            </div>
                            <Badge variant={getBadgeVariant(viewingLead.status)} size="md">
                                {viewingLead.status}
                            </Badge>
                        </div>

                        <div className="space-y-2.5 text-xs text-slate-700">
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Home size={14} className="text-[#1A4B9C]" /> Target Interest
                                </span>
                                <span className="font-bold text-slate-800">{viewingLead.interest || 'General Inquiry'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-[#1A4B9C]" /> Lead Source
                                </span>
                                <span className="font-bold text-slate-800">{viewingLead.source}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Calendar size={14} className="text-[#1A4B9C]" /> Date Added
                                </span>
                                <span className="font-medium text-slate-600">{viewingLead.date || 'Recent'}</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Edit Lead Modal ── */}
            {editingLead && (
                <Modal
                    isOpen={!!editingLead}
                    onClose={() => setEditingLead(null)}
                    title="Edit Lead Information"
                    size="md"
                    actions={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => setEditingLead(null)}>
                                Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleSaveEditLead}>
                                Save Changes
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={handleSaveEditLead} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={editingLead.name} 
                                onChange={e => setEditingLead({ ...editingLead, name: e.target.value })} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                            <input 
                                type="text" 
                                required 
                                value={editingLead.phone} 
                                onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Property Interest</label>
                            <input 
                                type="text" 
                                required 
                                value={editingLead.interest} 
                                onChange={e => setEditingLead({ ...editingLead, interest: e.target.value })} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Pipeline Status</label>
                            <select
                                value={editingLead.status}
                                onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800 cursor-pointer"
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Converted">Converted</option>
                            </select>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deletingLead && (
                <Modal
                    isOpen={!!deletingLead}
                    onClose={() => setDeletingLead(null)}
                    title="Confirm Lead Deletion"
                    size="md"
                    actions={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => setDeletingLead(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                                Yes, Delete Lead
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
                                Are you sure you want to delete lead <span className="text-red-600">{deletingLead.name}</span>?
                            </h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                This will remove the lead and any attached conversation history permanently. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Add Lead Modal ── */}
            {isAddModalOpen && (
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add New Lead"
                    size="md"
                >
                    <form onSubmit={handleAddLead} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={newLead.name} 
                                onChange={e => setNewLead({...newLead, name: e.target.value})} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                            <input 
                                type="text" 
                                required 
                                value={newLead.phone} 
                                onChange={e => setNewLead({...newLead, phone: e.target.value})} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Property Interest</label>
                            <input 
                                type="text" 
                                required 
                                value={newLead.interest} 
                                onChange={e => setNewLead({...newLead, interest: e.target.value})} 
                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C] bg-white text-slate-800" 
                                placeholder="e.g. Sardar Tower - 5A" 
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm">
                                Save Lead
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default AdminLeads;
