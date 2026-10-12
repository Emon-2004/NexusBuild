import { useState } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, HelpCircle, Phone, Mail, Trash2 } from 'lucide-react';
import { useClientData } from '../../Context/ClientDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { showToast } from '../../Components/Toast/globalToast';

const Support = () => {
    const { loading, support, submitTicket, deleteTicket } = useClientData();
    const { exec, faqs, tickets } = support;

    // ── All hooks must be declared before any early returns ──
    const db = useDatabase();
    const [openFaq, setOpenFaq] = useState(0);
    const [inquiryType, setInquiryType] = useState('General Question');
    const [subject, setSubject] = useState('');
    const [expandedTicketId, setExpandedTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            showToast('Please enter a subject for your ticket.', 'warning', 'Missing Subject');
            return;
        }
        await submitTicket(inquiryType, subject, '');
        setSubject('');
    };

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
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    <div className="p-6 border-b border-base-300 flex items-center justify-between">
                        <h3 className="font-bold text-[18px] text-primary">Recent Tickets</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-base-200 border-b border-base-300">
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Ticket ID</th>
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Subject & Date</th>
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300">
                                {tickets.map((t) => {
                                    const isExpanded = expandedTicketId === t.id;
                                    
                                    // Parse thread messages
                                    let msgs = [];
                                    try {
                                        if (t.message && t.message.trim().startsWith('[')) {
                                            msgs = JSON.parse(t.message);
                                        } else {
                                            msgs = [];
                                            if (t.message) {
                                                msgs.push({ sender: 'client', text: t.message, date: t.date || 'Original Date' });
                                            }
                                            if (t.adminReply || t.admin_reply) {
                                                msgs.push({ sender: 'admin', text: t.adminReply || t.admin_reply, date: t.date || 'Original Date' });
                                            }
                                        }
                                    } catch(e) {
                                        msgs = [{ sender: 'client', text: t.message, date: t.date }];
                                    }

                                    return (
                                        <tr key={t.id} className="hover:bg-base-200/50 transition-colors">
                                            <td className="py-4 px-6 font-mono text-sm font-bold text-primary align-top">{t.id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-between items-start gap-4 cursor-pointer" onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}>
                                                    <div>
                                                        <div className="text-sm font-bold text-base-content">{t.subject}</div>
                                                        <div className="text-xs text-base-content/60 mt-1">{t.date}</div>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5">
                                                        {isExpanded ? 'Hide Thread' : 'View Thread'} ({msgs.length})
                                                    </span>
                                                </div>

                                                {/* Expanded Thread Conversation */}
                                                {isExpanded && (
                                                    <div className="mt-4 border-t border-base-300 pt-4 space-y-4">
                                                        <div className="text-[10px] font-bold text-base-content/70 uppercase tracking-wider">Message Conversation:</div>
                                                        <div className="space-y-3 max-h-60 overflow-y-auto p-3 bg-base-200/50 rounded-lg border border-base-300 flex flex-col">
                                                            {msgs.map((m, idx) => {
                                                                const isClient = m.sender === 'client';
                                                                return (
                                                                    <div key={idx} className={`flex flex-col mb-2 ${isClient ? 'items-end' : 'items-start'}`}>
                                                                        <div className={`p-3 rounded-lg text-xs max-w-md ${isClient ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-200 text-base-content rounded-bl-none border border-base-300'}`}>
                                                                            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                                                        </div>
                                                                        <span className="text-[9px] text-base-content/60 mt-1 font-mono">{isClient ? 'You' : 'Official Support'} • {m.date}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {t.status !== 'Resolved' && (
                                                            <form onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                if (!replyText.trim()) return;
                                                                await db.replyToTicket(t.id, replyText.trim(), false, 'client');
                                                                setReplyText('');
                                                                showToast('Reply sent successfully!', 'success', 'Reply Sent');
                                                            }} className="flex gap-2 mt-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    placeholder="Type your response to support..."
                                                                    className="flex-1 bg-base-100 border border-base-300 rounded-lg px-3 py-2 text-xs text-base-content focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                                />
                                                                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-content px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                                                                    <Send size={12} /> Send
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right align-top">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                                                        t.status === 'Resolved' 
                                                            ? 'bg-base-200 text-base-content/70 border border-base-300' 
                                                            : 'bg-primary/10 text-primary border border-primary/20'
                                                    }`}>
                                                        {t.status}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            if (window.confirm(`Are you sure you want to delete ticket ${t.id}?`)) {
                                                                await deleteTicket(t.id);
                                                                showToast(`Ticket ${t.id} deleted successfully!`, 'info', 'Ticket Deleted');
                                                            }
                                                        }}
                                                        className="p-1.5 text-base-content/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Ticket"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
        </div>
    );
};

export default Support;
