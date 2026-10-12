import { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { useClientData } from '../../Context/ClientDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { showToast } from '../../Components/Toast/globalToast';

const PrintView = ({ financials, userProfile, systemSettings }) => (
    <div id="print-area" className="hidden print:block bg-white text-slate-800 p-12 font-sans max-w-4xl mx-auto border border-slate-300 rounded shadow-sm">
        {/* Corporate Header Banner */}
        <div className="flex justify-between items-start border-b border-slate-350 pb-8 mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003178] rounded flex items-center justify-center font-black text-xl text-white">R</div>
                    <div>
                        <h1 className="font-extrabold text-2xl tracking-wider text-[#003178] leading-none uppercase">{systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Premier Property & Infrastructure Solutions</p>
                    </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                    {systemSettings?.headOfficeAddress || DEFAULT_SYSTEM_SETTINGS.headOfficeAddress} • {systemSettings?.supportEmail || DEFAULT_SYSTEM_SETTINGS.supportEmail} • {systemSettings?.supportPhone || DEFAULT_SYSTEM_SETTINGS.supportPhone}
                </div>
            </div>
            <div className="text-right space-y-1">
                <span className="px-3 py-1 bg-slate-100 text-[#003178] text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">
                    Client Copy
                </span>
                <h2 className="text-xl font-black text-slate-800 tracking-wide mt-3 uppercase">STATEMENT OF ACCOUNT</h2>
                <div className="text-[11px] text-slate-500 font-medium">Issue Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
        </div>

        {/* Client & Allocation Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-8">
            <div className="space-y-2">
                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Prepared For</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/60">
                    <p className="text-sm font-bold text-slate-800">{userProfile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Email: {userProfile.email || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Phone: {userProfile.phone || 'N/A'}</p>
                </div>
            </div>
            <div className="space-y-2 text-right">
                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Allocation Reference</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/60 text-right">
                    <p className="text-sm font-bold text-slate-800">{userProfile.propertyName}</p>
                    <p className="text-xs text-slate-500 mt-1">Project Name: {userProfile.projectName}</p>
                    <p className="text-xs text-slate-500">Scheduled Handover: {userProfile.handoverDate}</p>
                </div>
            </div>
        </div>

        {/* Financial Summary KPI Cards */}
        <div className="mb-10">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Financial Standing</h3>
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Contract Value</span>
                    <span className="text-base font-bold text-slate-800 mt-1 block">৳ {financials.totalValuation}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Other charges</span>
                    <span className="text-base font-bold text-slate-800 mt-1 block">৳ {financials.otherCharges}</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 text-center">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Total Settled</span>
                    <span className="text-base font-extrabold text-emerald-700 mt-1 block">৳ {financials.totalPaid}</span>
                </div>
                <div className="bg-red-50/50 border border-red-200 rounded-lg p-4 text-center">
                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider block">Due Balance</span>
                    <span className="text-base font-extrabold text-red-700 mt-1 block">৳ {financials.dueBalance}</span>
                </div>
            </div>
        </div>

        {/* Installment Breakdown Ledger */}
        <div className="space-y-3">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Installment Breakdown</h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                        <tr className="border-b border-gray-300 bg-slate-100">
                            <th className="py-2.5 px-4 font-bold text-gray-600">Installment No.</th>
                            <th className="py-2.5 px-4 font-bold text-gray-600">Due Date</th>
                            <th className="py-2.5 px-4 font-bold text-gray-600 text-right">Amount</th>
                            <th className="py-2.5 px-4 font-bold text-gray-600 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[...financials.installments].sort((a, b) => {
                            const aPaid = (a.status || '').toLowerCase() === 'paid';
                            const bPaid = (b.status || '').toLowerCase() === 'paid';
                            if (aPaid && !bPaid) return 1;
                            if (!aPaid && bPaid) return -1;
                            return new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date);
                        }).map((t) => (
                            <tr key={t.id}>
                                <td className="py-2 px-4 font-semibold text-gray-700">{t.installment}</td>
                                <td className="py-2 px-4 text-gray-500">{t.dueDate}</td>
                                <td className="py-2 px-4 font-bold text-gray-800 text-right">৳ {t.amount}</td>
                                <td className={`py-2 px-4 font-bold text-right ${t.status === 'Paid' ? 'text-emerald-600' : t.status === 'Overdue' ? 'text-red-600' : 'text-blue-600'}`}>{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
            <div className="text-center">
                <div className="w-32 border-b border-gray-400 mb-1 mx-auto"></div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Client Signature</span>
            </div>
            <div className="text-center">
                <div className="w-32 border-b border-gray-400 mb-1 mx-auto"></div>
                <span className="text-[9px] font-bold text-[#1A4B9C] uppercase tracking-wider">Authorized Officer</span>
            </div>
        </div>
    </div>
);

const FinancialLedger = () => {
    const { loading, financials, userProfile, downloadStatement } = useClientData();
    const { systemSettings } = useDatabase();

    const handleDownloadReceipt = (tx) => {
        const generatePDF = () => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'letter'
                });

                // 1. Header Banner (Navy)
                doc.setFillColor(0, 34, 82);
                doc.rect(0, 0, 216, 42, 'F'); // Letter width is 216mm

                // Gold accent line
                doc.setFillColor(254, 118, 42);
                doc.rect(0, 42, 216, 3, 'F');

                // Logo Box
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(20, 11, 14, 14, 2.5, 2.5, 'F');
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(0, 34, 82);
                doc.text("R", 25, 21.5);

                // Company Info
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(13);
                doc.text(systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName, 39, 18);
                
                doc.setTextColor(254, 118, 42);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(6.5);
                doc.text("BUILDING TRUST, DELIVERING EXCELLENCE", 39, 23);

                doc.setTextColor(190, 210, 240);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                const sysContact = `${systemSettings?.headOfficeAddress || DEFAULT_SYSTEM_SETTINGS.headOfficeAddress} | ${systemSettings?.supportEmail || DEFAULT_SYSTEM_SETTINGS.supportEmail} | ${systemSettings?.supportPhone || DEFAULT_SYSTEM_SETTINGS.supportPhone}`;
                doc.text(sysContact, 39, 28);

                // Official Receipt Badge
                doc.setFillColor(209, 250, 229);
                doc.roundedRect(152, 10, 44, 7, 1.2, 1.2, 'F');
                doc.setFont("helvetica", "bold");
                doc.setFontSize(6.5);
                doc.setTextColor(6, 95, 70);
                doc.text("OFFICIAL RECEIPT", 160, 14.8);

                // Date & Ref
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8.5);
                doc.text(`Date: ${tx.date || 'N/A'}`, 152, 25);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.text(`Ref: ${tx.id ? tx.id.substring(0, 18) + '...' : 'N/A'}`, 152, 30);

                // Title
                doc.setTextColor(0, 34, 82);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(13);
                doc.text("PAYMENT RECEIPT", 20, 56);
                
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.3);
                doc.line(20, 59, 196, 59);

                // Client & Allocation Details Grid
                // Client (Left)
                doc.setTextColor(148, 163, 184);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("PREPARED FOR", 20, 67);

                doc.setTextColor(15, 23, 42);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9.5);
                doc.text(userProfile.name || 'Client Name', 20, 73);
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(71, 85, 105);
                doc.text(`Email: ${userProfile.email || 'N/A'}`, 20, 79);
                doc.text(`Phone: ${userProfile.phone || 'N/A'}`, 20, 84);

                // Property (Right)
                doc.setTextColor(148, 163, 184);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("PROPERTY DETAILS", 115, 67);

                doc.setTextColor(15, 23, 42);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9.5);
                doc.text(userProfile.propertyName || 'Property Unit', 115, 73);
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(71, 85, 105);
                doc.text(`Project: ${userProfile.projectName || 'N/A'}`, 115, 79);
                doc.text(`Handover Date: ${userProfile.handoverDate || 'Dec 2026'}`, 115, 84);

                // 3. Table Header
                doc.setFillColor(248, 250, 252);
                doc.rect(20, 95, 176, 8, 'F');
                doc.setDrawColor(226, 232, 240);
                doc.rect(20, 95, 176, 8, 'D');

                doc.setTextColor(100, 116, 139);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("ITEM DESCRIPTION", 24, 100.5);
                doc.text("PAYMENT DETAILS", 100, 100.5);
                doc.text("TOTAL AMOUNT", 192, 100.5, { align: 'right' });

                // Table Row Content
                doc.setTextColor(15, 23, 42);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.text(tx.type || 'Bank Transfer Payment', 24, 112);
                
                doc.setFont("courier", "bold");
                doc.setFontSize(7);
                doc.setTextColor(100, 116, 139);
                doc.text(`TXN ID: ${tx.id || 'N/A'}`, 24, 117);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(71, 85, 105);
                doc.text("Direct Bank Transfer", 100, 112);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.text("Cleared & Confirmed", 100, 117);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(0, 34, 82);
                doc.text(`BDT ${tx.amount}`, 192, 114, { align: 'right' });

                doc.setDrawColor(241, 245, 249);
                doc.line(20, 123, 196, 123);

                // 4. Highlight Summary Banner
                doc.setFillColor(239, 246, 255);
                doc.rect(20, 130, 176, 20, 'F');
                doc.setFillColor(254, 118, 42);
                doc.rect(20, 130, 1.5, 20, 'F');

                doc.setTextColor(0, 49, 120);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.text("TOTAL CONFIRMED PAID", 26, 137);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`BDT ${tx.amount}`, 26, 145);

                doc.setTextColor(4, 120, 87);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.text("PAYMENT STATUS: CLEARED SUCCESS", 115, 142);

                // 5. Signatures Section
                doc.setDrawColor(203, 213, 225);
                doc.setLineWidth(0.3);
                doc.line(20, 190, 65, 190);
                doc.setTextColor(148, 163, 184);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("CLIENT SIGNATURE", 20, 195);

                // Stamp in center
                doc.setDrawColor(254, 118, 42);
                doc.roundedRect(88, 168, 40, 15, 1.5, 1.5, 'D');
                doc.setTextColor(254, 118, 42);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text((systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName).toUpperCase(), 108, 174, { align: 'center' });
                doc.setFont("helvetica", "bold");
                doc.setFontSize(6.5);
                doc.text("VERIFIED SECURE", 108, 179, { align: 'center' });

                doc.setDrawColor(203, 213, 225);
                doc.line(151, 190, 196, 190);
                doc.setTextColor(0, 34, 82);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("AUTHORIZED REPRESENTATIVE", 151, 195);

                // Footer System generated disclaimer
                doc.setDrawColor(226, 232, 240);
                doc.line(20, 215, 196, 215);
                
                doc.setTextColor(148, 163, 184);
                doc.setFont("helvetica", "italic");
                doc.setFontSize(6.5);
                doc.text(`This receipt is electronically generated and verified by ${systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName} database records. No physical signature is required.`, 20, 221);

                // Save PDF
                doc.save(`Receipt_${tx.id || 'txn'}.pdf`);
            } catch (err) {
                console.error("PDF generation failed:", err);
                showToast("Receipt download failed. Please try again.", 'error', 'Download Failed');
            }
        };

        if (!window.jspdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = generatePDF;
            document.head.appendChild(script);
        } else {
            generatePDF();
        }
    };

    const exportStatementCSV = () => {
        const sorted = [...financials.installments].sort((a, b) => {
            const aPaid = (a.status || '').toLowerCase() === 'paid';
            const bPaid = (b.status || '').toLowerCase() === 'paid';
            if (aPaid && !bPaid) return 1;
            if (!aPaid && bPaid) return -1;
            return new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date);
        });
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Installment No,Due Date,Amount (BDT),Status\n"
            + sorted.map(i => `"${i.installment}","${i.dueDate}","${i.amount}","${i.status}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Statement_${userProfile.name?.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-5xl animate-pulse">
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                    <div className="skeleton h-6 w-56 rounded bg-base-300" />
                    <div className="skeleton h-36 w-full rounded bg-base-200" />
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                    <div className="skeleton h-6 w-48 rounded bg-base-300" />
                    <div className="skeleton h-48 w-full rounded bg-base-200" />
                </div>
            </div>
        );
    }

    return (
        <>
            <PrintView financials={financials} userProfile={userProfile} systemSettings={systemSettings} />
            
            <div className="flex flex-col gap-6 print:hidden w-full max-w-5xl text-base-content">
                
                {/* ── Financial Ledger Overview (Center Column matching Figma) ── */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-base-300 gap-4">
                        <h2 className="text-primary font-bold text-base sm:text-[18px]">Financial Ledger Overview</h2>
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            <button 
                                onClick={exportStatementCSV}
                                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 border border-base-300 hover:bg-base-200 rounded-lg font-bold text-xs cursor-pointer text-base-content"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                            <button 
                                onClick={downloadStatement}
                                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-content rounded-lg font-bold text-xs cursor-pointer"
                            >
                                <Download size={14} /> Print Statement
                            </button>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-base-300 px-4 sm:px-6 py-2">
                        <div className="flex flex-wrap justify-between items-center py-3 sm:py-4 gap-2">
                            <span className="text-xs sm:text-sm text-base-content/70 font-medium">Total Property Valuation</span>
                            <span className="text-base-content font-bold text-sm sm:text-base whitespace-nowrap">৳ {financials.totalValuation}</span>
                        </div>
                        <div className="flex flex-wrap justify-between items-center py-3 sm:py-4 gap-2">
                            <span className="text-xs sm:text-sm text-base-content/70 font-medium">Total Amount Paid to Date</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-base whitespace-nowrap">৳ {financials.totalPaid}</span>
                        </div>
                        <div className="flex flex-wrap justify-between items-center py-3 sm:py-4 gap-2">
                            <span className="text-xs sm:text-sm text-base-content/70 font-medium">Utility/Other Charges</span>
                            <span className="text-base-content font-bold text-sm sm:text-base whitespace-nowrap">৳ {financials.otherCharges}</span>
                        </div>
                        <div className="flex flex-wrap justify-between items-center p-3 sm:p-4 bg-error/10 rounded my-2 border border-error/20 gap-2">
                            <span className="text-error font-bold text-xs sm:text-sm">Current Due Balance</span>
                            <span className="text-error font-bold text-base sm:text-lg whitespace-nowrap">৳ {financials.dueBalance}</span>
                        </div>
                    </div>
                </div>

                {/* ── Installment Schedule Table ── */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    <div className="p-6 border-b border-base-300">
                        <h2 className="text-primary font-bold text-[18px]">Installment Schedule</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-base-200 border-b border-base-300">
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Installment No.</th>
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider">Due Date</th>
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider text-right">Amount (৳)</th>
                                    <th className="py-3 px-6 text-[11px] font-bold text-base-content/70 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300">
                                {[...financials.installments].sort((a, b) => {
                                    const aPaid = (a.status || '').toLowerCase() === 'paid';
                                    const bPaid = (b.status || '').toLowerCase() === 'paid';
                                    if (aPaid && !bPaid) return 1;
                                    if (!aPaid && bPaid) return -1;
                                    return new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date);
                                }).map((t) => (
                                    <tr key={t.id} className={`hover:bg-base-200/50 ${t.active ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}>
                                        <td className={`py-4 px-6 text-sm font-medium ${t.active ? 'text-base-content font-bold' : 'text-base-content'}`}>
                                            {t.installment}
                                        </td>
                                        <td className={`py-4 px-6 text-sm ${t.active ? 'text-primary font-bold' : 'text-base-content/70'}`}>
                                            {t.dueDate}
                                        </td>
                                        <td className={`py-4 px-6 text-sm font-bold text-right text-base-content`}>
                                            ৳ {t.amount}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${t.statusPill}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Recent Transactions ── */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6">
                    <h2 className="text-primary font-bold text-[18px] mb-5">Recent Transactions</h2>
                    
                    <div className="flex flex-col gap-5">
                        {financials.transactions.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-4 border-b border-base-300 pb-4 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                    <CheckCircle size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-base-content text-sm">৳ {item.amount}</div>
                                    <div className="text-xs text-base-content/60 mt-0.5 truncate">{item.date} • {item.type}</div>
                                </div>
                                <button 
                                    onClick={() => handleDownloadReceipt(item)}
                                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                                >
                                    <FileText size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
};

export default FinancialLedger;
