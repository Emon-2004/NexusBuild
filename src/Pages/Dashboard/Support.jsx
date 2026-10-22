import { useState, useMemo } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, HelpCircle, Phone, Mail, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, AlertTriangle } from 'lucide-react';
import { useClientData } from '../../Context/ClientDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { showToast } from '../../Components/Toast/globalToast';
import { Table, Modal, Button, Badge } from '../../Components/UI';

const Support = () => {
    const { loading, support, submitTicket, deleteTicket } = useClientData();
    const { exec, faqs, tickets } = support;

    const db = useDatabase();
    const [openFaq, setOpenFaq] = useState(0);
    const [inquiryType, setInquiryType] = useState('General Question');
    const [subject, setSubject] = useState('');
    const [replyText, setReplyText] = useState('');

    // Table search, sorting & pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modals
    const [viewingTicket, setViewingTicket] = useState(null);
    const [deletingTicket, setDeletingTicket] = useState(null);

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            showToast('Please enter a subject for your ticket.', 'warning', 'Missing Subject');
            return;
        }
        await submitTicket(inquiryType, subject, '');
        setSubject('');
        showToast('Your support ticket has been registered.', 'success', 'Ticket Opened');
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

    const handleConfirmDelete = async () => {
        if (!deletingTicket) return;
        try {
            await deleteTicket(deletingTicket.id);
            showToast(`Ticket ${deletingTicket.id} removed.`, 'info', 'Ticket Deleted');
            setDeletingTicket(null);
        } catch (err) {
            showToast('Failed to delete ticket: ' + err.message, 'error', 'Error');
        }
    };

    const parseTicketMessages = (t) => {
        try {
            if (t.message && t.message.trim().startsWith('[')) {
                return JSON.parse(t.message);
            }
            const msgs = [];
            if (t.message) {
                msgs.push({ sender: 'client', text: t.message, date: t.date || 'Original Date' });
            }
            if (t.adminReply || t.admin_reply) {
                msgs.push({ sender: 'admin', text: t.adminReply || t.admin_reply, date: t.date || 'Original Date' });
            }
            return msgs;
        } catch {
            return [{ sender: 'client', text: t.message, date: t.date }];
        }
    };

    const filteredTickets = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return tickets.filter(t => {
            const matchesSearch = !term ||
                (t.id && t.id.toLowerCase().includes(term)) ||
                (t.subject && t.subject.toLowerCase().includes(term)) ||
                (t.status && t.status.toLowerCase().includes(term));
            return matchesSearch;
        });
    }, [tickets, searchTerm]);

    const sortedTickets = useMemo(() => {
        return [...filteredTickets].sort((a, b) => {
            let valA = '';
            let valB = '';
            if (sortKey === 'id') {
                valA = a.id || '';
                valB = b.id || '';
            } else if (sortKey === 'subject') {
                valA = (a.subject || '').toLowerCase();
                valB = (b.subject || '').toLowerCase();
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
    }, [filteredTickets, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedTickets.length / itemsPerPage));
    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedTickets.slice(start, start + itemsPerPage);
    }, [sortedTickets, currentPage, itemsPerPage]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-5xl animate-pulse">
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                    <div className="skeleton h-6 w-48 rounded bg-base-300" />
                    <div className="skeleton h-32 w-full rounded bg-base-200" />
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                    <div className="skeleton h-6 w-48 rounded bg-base-300" />
                    <div className="skeleton h-48 w-full rounded bg-base-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
            
            {/* ══ LEFT COLUMN: Contact & Form ════════════════════════════════ */}
            <div className="w-full lg:w-[340px] lg:flex-shrink-0 flex flex-col gap-4">
                
                {/* Account Exec Contact Card */}
                <div className="bg-primary rounded-lg shadow-sm p-4 sm:p-6 text-primary-content">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-content border-2 border-primary-content/50 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-primary text-lg">
                            {exec.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm sm:text-[16px] truncate">{exec.name}</div>
                            <div className="text-primary-content/80 text-xs mt-0.5">{exec.role}</div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary-content/80 text-xs sm:text-sm min-w-0">
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate">{exec.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-content/80 text-xs sm:text-sm">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{exec.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Submit Formal Inquiry Form */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    <div className="p-4 border-b border-base-300 flex items-center gap-3">
                        <MessageSquare size={18} className="text-primary flex-shrink-0" />
                        <h3 className="font-bold text-sm sm:text-[16px] text-primary">Submit Support Ticket</h3>
                    </div>
                    <form className="p-4 flex flex-col gap-3" onSubmit={handleTicketSubmit}>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Inquiry Type</label>
                            <select 
                                value={inquiryType}
                                onChange={(e) => setInquiryType(e.target.value)}
                                className="w-full bg-base-200 border border-base-300 rounded-lg p-2.5 text-sm text-base-content focus:outline-none focus:border-primary focus:bg-base-100 transition-colors"
                            >
                                <option>General Question</option>
                                <option>Change Order Request</option>
                                <option>Billing & Finance</option>
                                <option>Technical Support</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Subject</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief summary of your request"
                                className="w-full bg-base-200 border border-base-300 rounded-lg p-2.5 text-sm text-base-content focus:outline-none focus:border-primary focus:bg-base-100 transition-colors"
                            />
                        </div>

                        <button type="submit" className="mt-1 w-full flex items-center justify-center gap-2 bg-primary text-primary-content px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-[13px] font-bold uppercase tracking-wider shadow-sm cursor-pointer">
                            <Send size={14} /> Open Ticket
                        </button>
                    </form>
                </div>

            </div>

            {/* ══ RIGHT COLUMN: Tickets & FAQs ═══════════════════════════════ */}
            <div className="w-full lg:flex-1 flex flex-col gap-4 min-w-0">
                
                {/* Active Tickets Table */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-base-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-lg text-primary">Recent Tickets</h3>
                            <p className="text-xs text-base-content/60 mt-0.5">
                                Showing {sortedTickets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTickets.length)} of {sortedTickets.length} tickets
                            </p>
                        </div>
                        <div className="relative w-full sm:w-60">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                            <input 
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="input input-sm input-bordered w-full pl-9 text-xs bg-base-100 text-base-content"
                            />
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <Table variant="zebra" size="sm" containerClassName="border border-base-300">
                            <thead>
                                <tr className="bg-base-200 text-[11px] font-bold text-base-content/70 uppercase tracking-wider">
                                    <th className="py-3 px-4">
                                        <button onClick={() => handleSort('id')} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer">
                                            Ticket ID {sortKey === 'id' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button onClick={() => handleSort('subject')} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer">
                                            Subject & Date {sortKey === 'subject' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button onClick={() => handleSort('status')} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer">
                                            Status {sortKey === 'status' ? (sortDirection === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />) : <ArrowUpDown size={12} className="opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300">
                                {paginatedTickets.map((t) => {
                                    const msgs = parseTicketMessages(t);
                                    return (
                                        <tr key={t.id} className="hover:bg-base-200/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs font-bold text-primary align-middle">
                                                {t.id}
                                            </td>
                                            <td className="py-3 px-4 align-middle">
                                                <div className="text-xs font-bold text-base-content">{t.subject}</div>
                                                <div className="text-[10px] text-base-content/60 mt-0.5">{t.date} • {msgs.length} message{msgs.length !== 1 ? 's' : ''}</div>
                                            </td>
                                            <td className="py-3 px-4 align-middle">
                                                <Badge 
                                                    variant={t.status === 'Resolved' ? 'neutral' : 'primary'} 
                                                    size="sm"
                                                >
                                                    {t.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right align-middle">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => setViewingTicket(t)}
                                                        title="View Conversation Thread"
                                                        className="p-1.5 text-base-content/60 hover:text-primary hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingTicket(t)}
                                                        title="Delete Ticket"
                                                        className="p-1.5 text-base-content/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginatedTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-xs text-base-content/50">
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-3 border-t border-base-300 bg-base-200/50 flex items-center justify-between">
                            <div className="text-xs text-base-content/60 font-medium">
                                Page <span className="font-bold text-base-content">{currentPage}</span> of <span className="font-bold text-base-content">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-base-300 rounded-lg text-xs font-semibold text-base-content bg-base-100 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                                            currentPage === page
                                                ? 'bg-primary text-primary-content'
                                                : 'border border-base-300 bg-base-100 text-base-content hover:bg-base-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-base-300 rounded-lg text-xs font-semibold text-base-content bg-base-100 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQs */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden flex-1">
                    <div className="p-6 border-b border-base-300 flex items-center gap-3">
                        <HelpCircle size={18} className="text-primary" />
                        <h3 className="font-bold text-[18px] text-primary">Frequently Asked Questions</h3>
                    </div>
                    <div className="divide-y divide-base-300">
                        {faqs.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div key={i} className="transition-colors">
                                    <button 
                                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                                        className={`w-full p-6 flex items-start justify-between text-left transition-colors ${isOpen ? 'bg-primary/5' : 'hover:bg-base-200/50'}`}
                                    >
                                        <span className={`font-bold text-[15px] pr-8 ${isOpen ? 'text-primary' : 'text-base-content'}`}>
                                            {faq.q}
                                        </span>
                                        {isOpen ? (
                                            <ChevronUp size={20} className="text-primary flex-shrink-0" />
                                        ) : (
                                            <ChevronDown size={20} className="text-base-content/40 flex-shrink-0" />
                                        )}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-[14px] text-base-content/80 leading-relaxed pt-2 bg-primary/5">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* ── View Ticket Modal ── */}
            {viewingTicket && (
                <Modal
                    isOpen={!!viewingTicket}
                    onClose={() => setViewingTicket(null)}
                    title={`Ticket ${viewingTicket.id}: ${viewingTicket.subject}`}
                    size="lg"
                    actions={
                        <Button variant="primary" size="sm" onClick={() => setViewingTicket(null)}>
                            Close
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl border border-base-300 text-xs">
                            <span className="font-medium text-base-content/70">Opened: {viewingTicket.date}</span>
                            <Badge variant={viewingTicket.status === 'Resolved' ? 'neutral' : 'primary'} size="sm">
                                {viewingTicket.status}
                            </Badge>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto p-3 bg-base-200/30 rounded-xl border border-base-300 flex flex-col">
                            {parseTicketMessages(viewingTicket).map((m, idx) => {
                                const isClient = m.sender === 'client';
                                return (
                                    <div key={idx} className={`flex flex-col mb-2 ${isClient ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-xl text-xs max-w-md ${isClient ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-200 text-base-content rounded-bl-none border border-base-300'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                        </div>
                                        <span className="text-[9px] text-base-content/60 mt-1 font-mono">
                                            {isClient ? 'You' : 'Official Support Officer'} • {m.date}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {viewingTicket.status !== 'Resolved' && (
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!replyText.trim()) return;
                                    await db.replyToTicket(viewingTicket.id, replyText.trim(), false, 'client');
                                    showToast('Reply sent successfully!', 'success', 'Reply Sent');
                                    setReplyText('');
                                    setViewingTicket(null);
                                }} 
                                className="flex gap-2 pt-2"
                            >
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply to support..."
                                    className="input input-sm input-bordered flex-1 text-xs bg-base-100 text-base-content"
                                />
                                <button type="submit" className="btn btn-sm btn-primary">
                                    <Send size={12} /> Send
                                </button>
                            </form>
                        )}
                    </div>
                </Modal>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deletingTicket && (
                <Modal
                    isOpen={!!deletingTicket}
                    onClose={() => setDeletingTicket(null)}
                    title="Confirm Ticket Deletion"
                    size="md"
                    actions={
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => setDeletingTicket(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                                Yes, Delete Ticket
                            </Button>
                        </div>
                    }
                >
                    <div className="flex items-start gap-3.5 py-1">
                        <div className="p-2.5 bg-error/15 text-error rounded-xl flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-base-content text-sm">
                                Delete ticket <span className="font-mono text-error">{deletingTicket.id}</span>?
                            </h4>
                            <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                                Are you sure you want to permanently delete ticket "{deletingTicket.subject}" and its message history?
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default Support;
