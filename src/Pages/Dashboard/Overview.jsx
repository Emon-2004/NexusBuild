import { useState } from 'react';
import { Download, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import heroImg from '../../assets/pics/hero_pic.png';
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
                    {systemSettings?.companyLogo ? (
                        <img src={systemSettings.companyLogo} alt="" className="h-10 w-auto object-contain" />
                    ) : (
                        <div className="w-10 h-10 bg-[#003178] rounded flex items-center justify-center font-black text-xl text-white">
                            {(systemSettings?.companyName || 'R').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="font-extrabold text-2xl tracking-wider text-[#003178] leading-none uppercase">
                            {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                        </h1>
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
                    <p className="text-sm font-bold text-slate-800">{financials.unitName || 'Pending Unit Assignment'}</p>
                    <p className="text-xs text-slate-500 mt-1">Project Name: Sardar Tower Block-A</p>
                    <p className="text-xs text-slate-500">Scheduled Handover: Jan 2027</p>
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
                        {financials.installments.map((t) => (
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

const Overview = () => {
    const navigate = useNavigate();
    const { loading, userProfile, financials, activeProject, downloadStatement, addInstallment } = useClientData();
    const { systemSettings } = useDatabase();

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [numInstallments, setNumInstallments] = useState(12);
    const [freq, setFreq] = useState('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleGenerateSchedule = async (e) => {
        e.preventDefault();
        const valuationStr = financials.totalValuation || '10000000';
        const valuation = parseFloat(valuationStr.replace(/,/g, '')) || 10000000;
        const installmentAmount = Math.round(valuation / numInstallments);

        let currentD = new Date(startDate);
        for (let i = 1; i <= numInstallments; i++) {
            const installmentName = `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Installment`;
            const dateStr = currentD.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            await addInstallment({
                propertyId: financials.propertyId,
                installment: installmentName,
                dueDate: dateStr,
                amount: installmentAmount.toLocaleString('en-IN'),
                status: 'Pending',
                statusPill: 'bg-amber-100 text-amber-700',
                active: i === 1
            });

            if (freq === 'Monthly') {
                currentD.setMonth(currentD.getMonth() + 1);
            } else if (freq === 'Quarterly') {
                currentD.setMonth(currentD.getMonth() + 3);
            } else if (freq === 'Semi-Annually') {
                currentD.setMonth(currentD.getMonth() + 6);
            }
        }
        setShowScheduleModal(false);
        showToast('Installment schedule generated successfully!', 'success', 'Installment Schedule');
    };

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
    
    if (loading) {
        return (
            <div className="flex flex-col lg:flex-row gap-6 items-start animate-pulse">
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 pb-8 flex flex-col gap-4">
                        <div className="skeleton h-6 w-64 rounded bg-base-300" />
                        <div className="skeleton h-16 w-full rounded-lg bg-base-200" />
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                        <div className="skeleton h-6 w-48 rounded bg-base-300" />
                        <div className="skeleton h-32 w-full rounded bg-base-200" />
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                        <div className="skeleton h-6 w-48 rounded bg-base-300" />
                        <div className="skeleton h-48 w-full rounded bg-base-200" />
                    </div>
                </div>
                <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                        <div className="skeleton h-48 w-full rounded-lg bg-base-300" />
                        <div className="skeleton h-12 w-full rounded bg-base-200" />
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                        <div className="skeleton h-6 w-40 rounded bg-base-300" />
                        <div className="skeleton h-32 w-full rounded bg-base-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PrintView financials={financials} userProfile={userProfile} systemSettings={systemSettings} />
            <div className="flex flex-col lg:flex-row gap-6 w-full items-start print:hidden">
            {/* ══ CENTER COLUMN (Flexible Main Content) ════════════════════════ */}
            <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
                
                {/* 1. Construction Progress Card */}
                <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4 sm:p-6 pb-8">
                    <h2 className="text-primary font-bold text-base sm:text-[18px] mb-6 sm:mb-10 truncate">{activeProject?.name || 'Project'} Construction Progress</h2>
                    
                    <div className="relative mt-8 sm:mt-12 pb-4">
                        {(() => {
                            const oPhases = activeProject?.phases || [
                                { id: 1, name: 'Piling & Foundation', date: 'Completed Dec 23', progress: 100 },
                                { id: 2, name: 'Structural Basement & Columns', date: 'Target: Feb 24', progress: 50 },
                                { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: May 26', progress: 0 },
                                { id: 4, name: 'Finishing & Handover', date: 'Target: Dec 26', progress: 0 }
                            ];
                            const currentP = activeProject?.progressPhase || activeProject?.progress_phase || 1;
                            const progressPercentage = Math.min(100, (Math.max(0, (currentP - 1)) / (oPhases.length - 1 || 3)) * 100);
                            
                            return (
                                <>
                                    {/* Mobile Vertical Line */}
                                    <div className="absolute left-[17px] top-[24px] bottom-[24px] w-1 bg-base-300 z-0 rounded-full overflow-hidden sm:hidden">
                                        <div className="w-full bg-[#006E1C] transition-all duration-500 ease-out" style={{ height: `${progressPercentage}%` }} />
                                    </div>
                                    
                                    {/* Desktop Horizontal Line */}
                                    <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-base-300 z-0 rounded-full overflow-hidden hidden sm:block">
                                        <div className="h-full bg-[#006E1C] transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-between items-start relative z-10 gap-8 sm:gap-0">
                                        {oPhases.map(step => {
                                             const isCurrent = step.id === currentP;
                                             const isCompleted = step.id < currentP;
                                             return (
                                                 <div key={step.id} className="flex flex-row sm:flex-col items-center sm:flex-1 gap-4 sm:gap-0 w-full sm:w-auto text-left sm:text-center">
                                                     <div className="flex-shrink-0 flex justify-center w-9">
                                                         {isCompleted ? (
                                                             <div className="w-9 h-9 rounded-full bg-[#006E1C] border-2 border-[#006E1C] flex items-center justify-center text-white z-10 relative shadow-sm">
                                                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                 </svg>
                                                             </div>
                                                         ) : isCurrent ? (
                                                             <div className="w-9 h-9 rounded-full bg-base-100 border-4 border-primary flex items-center justify-center z-10 relative shadow-md">
                                                                 <div className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse" />
                                                             </div>
                                                         ) : (
                                                             <div className="w-9 h-9 rounded-full bg-base-100 border-2 border-base-300 flex items-center justify-center text-base-content/40 font-bold text-xs z-10 relative">
                                                                 {step.id}
                                                             </div>
                                                         )}
                                                     </div>
                                                     <div className="flex flex-col sm:items-center flex-1">
                                                         <div className={`text-[11px] uppercase tracking-wider sm:mt-4 whitespace-pre-line ${
                                                             isCurrent 
                                                                 ? 'font-bold text-primary' 
                                                                 : isCompleted 
                                                                 ? 'font-semibold text-[#006E1C]' 
                                                                 : 'font-medium text-base-content/50'
                                                         }`}>
                                                             {step.name}
                                                         </div>
                                                         {step.date && (
                                                             <div className={`text-[10px] mt-0.5 sm:mt-1 font-medium ${isCurrent ? 'text-primary font-bold' : 'text-base-content/50'}`}>
                                                                 {step.date}
                                                             </div>
                                                         )}
                                                         {step.progress > 0 && step.progress < 100 && (
                                                             <div className="mt-1.5 sm:mt-2">
                                                                 <span className="px-2 py-0.5 bg-primary/10 text-primary font-extrabold text-[9px] rounded-full border border-primary/20">
                                                                     {step.progress}% COMPLETE
                                                                 </span>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 </>
                             );
                         })()}
                     </div>
                 </div>
 
                 {/* 2. Financial Ledger Overview */}
                 <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                     <div className="p-6 pb-2 flex justify-between items-center">
                         <h2 className="text-primary font-bold text-[18px]">Financial Ledger Overview</h2>
                         <button onClick={downloadStatement} className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors">
                             Statement <Download size={16} />
                         </button>
                     </div>
                     
                     <div className="p-4 sm:p-6 pt-2">
                         <div className="border-t border-base-300" />
                         
                         <div className="py-3 sm:py-4 flex flex-wrap gap-2 justify-between items-center">
                             <span className="text-xs sm:text-sm text-base-content/70 font-medium">Total Property Valuation</span>
                             <span className="text-base-content font-bold text-sm sm:text-[15px] whitespace-nowrap">৳ {financials.totalValuation}</span>
                         </div>
                         <div className="border-t border-base-300" />
 
                         <div className="py-3 sm:py-4 flex flex-wrap gap-2 justify-between items-center">
                             <span className="text-xs sm:text-sm text-base-content/70 font-medium">Total Amount Paid to Date</span>
                             <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-[15px] whitespace-nowrap">৳ {financials.totalPaid}</span>
                         </div>
                         <div className="border-t border-base-300" />
 
                         <div className="py-3 sm:py-4 flex flex-wrap gap-2 justify-between items-center">
                             <span className="text-xs sm:text-sm text-base-content/70 font-medium">Utility/Other Charges</span>
                             <span className="text-base-content font-bold text-sm sm:text-[15px] whitespace-nowrap">৳ {financials.otherCharges}</span>
                         </div>
                         
                         {/* Highlighted Row for Due Balance */}
                         <div className="py-3 px-3 sm:py-4 sm:px-4 -mx-3 sm:-mx-4 bg-error/10 flex flex-wrap gap-2 justify-between items-center border-y border-error/20 mt-2">
                             <span className="text-base-content font-medium text-xs sm:text-sm">Current Due Balance</span>
                             <span className="text-error font-bold text-base sm:text-[16px] whitespace-nowrap">৳ {financials.dueBalance}</span>
                         </div>
                     </div>
                 </div>

                {/* 3. Installment Schedule Table */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    <div className="p-6">
                        <h2 className="text-primary font-bold text-[18px]">Installment Schedule</h2>
                    </div>
                    
                    {(!financials.installments || financials.installments.length === 0) ? (
                        <div className="p-8 text-center flex flex-col items-center gap-4">
                            <Calendar size={48} className="text-primary opacity-40" />
                            <div>
                                <h3 className="font-bold text-base-content">No Installment Schedule Set</h3>
                                <p className="text-base-content/70 text-sm mt-1 max-w-sm mx-auto">
                                    An installment schedule has not been configured for your property yet. Please contact the administrator to setup your payment schedule.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-base-200 border-y border-base-300">
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
                                }).map((inst) => (
                                    <tr key={inst.id} className={inst.active ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-base-200/50"}>
                                        <td className={`py-4 px-6 text-sm ${inst.active ? 'text-base-content font-bold pl-5' : 'text-base-content font-medium'}`}>
                                            {inst.installment}
                                        </td>
                                        <td className={`py-4 px-6 text-sm ${inst.active ? 'text-primary font-bold' : 'text-base-content/70'}`}>
                                            {inst.dueDate}
                                        </td>
                                        <td className={`py-4 px-6 text-sm text-right ${inst.active ? 'text-base-content font-bold' : 'text-base-content font-bold'}`}>
                                            {inst.amount}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${inst.statusPill}`}>
                                                {inst.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>


            {/* ══ RIGHT COLUMN (Widgets - Fixed 360px) ═════════════════════════ */}
            <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
                
                {/* 1. Property Hero Card */}
                <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden flex flex-col">
                    {/* Image Area with Gradient */}
                    <div className="h-52 relative overflow-hidden flex items-end p-5">
                        <img 
                            src={userProfile.projectImage || heroImg} 
                            alt={userProfile.propertyName} 
                            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-90 z-10" />
                        <div className="relative z-20 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded">
                                {userProfile.projectName}
                            </span>
                            <h3 className="text-white font-extrabold text-[18px] leading-snug">{userProfile.propertyName}</h3>
                            <p className="text-blue-100 text-xs font-medium">{userProfile.propertyLoc}</p>
                        </div>
                    </div>
                    {/* Info Pills */}
                    <div className="p-5 flex gap-4 text-sm bg-base-100 border-b border-base-300">
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-base-content/60 text-xs font-bold uppercase tracking-wider">Area</span>
                            <span className="text-base-content font-extrabold text-sm">{userProfile.area}</span>
                        </div>
                        <div className="w-[1px] bg-base-300"></div>
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-base-content/60 text-xs font-bold uppercase tracking-wider">Target Handover</span>
                            <span className="text-base-content font-extrabold text-sm">{userProfile.handoverDate}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Recent Transactions List */}
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[16px] text-base-content">Recent Transactions</h3>
                        <button onClick={() => navigate('/dashboard/financials')} className="text-primary text-sm font-bold hover:underline">
                            View All
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {financials.transactions.slice(0, 3).map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors border border-transparent hover:border-base-300 gap-2">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-base-content truncate">{tx.type}</div>
                                        <div className="text-xs text-base-content/60 truncate">{tx.date}</div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-bold text-sm text-base-content">৳ {tx.amount}</div>
                                    <button 
                                        onClick={() => handleDownloadReceipt(tx)}
                                        className="text-[10px] uppercase tracking-wider font-bold text-primary mt-0.5 hover:underline flex items-center justify-end gap-1 cursor-pointer"
                                    >
                                        <Download size={10} /> Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 text-primary font-bold text-sm text-center hover:underline">
                        View All History
                    </button>
                </div>

                {/* Dedicated Account Exec card removed */}
            </div>

            {/* Installment Scheduler Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-neutral/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                        <div className="bg-primary text-primary-content p-6">
                            <h3 className="text-xl font-bold">Configure Installment Schedule</h3>
                            <p className="text-primary-content/80 text-sm mt-1">
                                Setup installment payments based on your property valuation: ৳ {financials.totalValuation || '10,00,000'}
                            </p>
                        </div>
                        <form onSubmit={handleGenerateSchedule} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">Number of Installments</label>
                                <select 
                                    value={numInstallments} 
                                    onChange={(e) => setNumInstallments(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-base-300 bg-base-200 text-base-content rounded-md focus:outline-none focus:border-primary"
                                >
                                    <option value={6}>6 Installments</option>
                                    <option value={12}>12 Installments (1 Year)</option>
                                    <option value={18}>18 Installments</option>
                                    <option value={24}>24 Installments (2 Years)</option>
                                    <option value={36}>36 Installments (3 Years)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">Payment Frequency</label>
                                <select 
                                    value={freq} 
                                    onChange={(e) => setFreq(e.target.value)}
                                    className="w-full px-4 py-2 border border-base-300 bg-base-200 text-base-content rounded-md focus:outline-none focus:border-primary"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Semi-Annually">Semi-Annually</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">First Payment Start Date</label>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="w-full px-4 py-2 border border-base-300 bg-base-200 text-base-content rounded-md focus:outline-none focus:border-primary"
                                    required 
                                />
                            </div>
                            <div className="flex gap-4 mt-4 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2 border border-base-300 text-base-content rounded-md hover:bg-base-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-content font-semibold rounded-md transition-colors cursor-pointer"
                                >
                                    Generate Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default Overview;
