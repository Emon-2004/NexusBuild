import React, { useState } from 'react';
import { useAdminData } from '../../Context/AdminDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { Search, Download, Filter, Eye, Plus, X, Building2, CreditCard, CheckCircle } from 'lucide-react';
import { showToast } from '../../Components/Toast/globalToast';

const AdminFinancials = () => {
    const { 
        properties, clients, transactions, installments,
        addTransaction, updateInstallment, updateProperty 
    } = useAdminData();
    const { systemSettings } = useDatabase();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReceiptProp, setSelectedReceiptProp] = useState(null);

    // Record Bank Payment Modal state
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedInstallmentId, setSelectedInstallmentId] = useState('');
    const [paymentType, setPaymentType] = useState('Bank Transfer');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const cleanInt = (val) => {
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9.]/g, '');
        const parsed = parseInt(clean);
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatBDT = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-IN').format(cleanInt(amount));
    };

    // Global Stats
    const totalRevenue = (transactions || []).reduce((sum, tx) => sum + cleanInt(tx.amount), 0);
    const netOutstanding = (properties || []).reduce((sum, p) => sum + cleanInt(p.dueBalance), 0);
    const totalOverdue = (installments || []).filter(i => i.status === 'Overdue').reduce((sum, i) => sum + cleanInt(i.amount), 0);

    const enrichedProperties = properties.map(prop => {
        const client = clients.find(c => c.id === prop.clientId);
        return {
            ...prop,
            clientName: client ? client.name : 'Unknown Client',
            projectName: prop.projectId === 'p1' ? 'Sardar Tower' : 'Green Valley'
        };
    });

    const filteredProperties = enrichedProperties.filter(p => 
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.unitName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Selected client's property & installment details
    const selectedProperty = selectedClientId ? properties.find(p => p.clientId === selectedClientId) : null;
    const clientInstallments = selectedProperty ? installments.filter(i => i.propertyId === selectedProperty.id) : [];

    const handleSelectClient = (clientId) => {
        setSelectedClientId(clientId);
        const prop = properties.find(p => p.clientId === clientId);
        if (prop) {
            const insts = installments.filter(i => i.propertyId === prop.id);
            const pendingInst = insts.find(i => i.status === 'Pending' || i.status === 'Overdue') || insts[0];
            if (pendingInst) {
                setSelectedInstallmentId(pendingInst.id);
                setPaymentAmount(pendingInst.amount || '0');
            } else {
                setSelectedInstallmentId('');
                setPaymentAmount('0');
            }
        }
    };

    const handleSelectInstallment = (instId) => {
        setSelectedInstallmentId(instId);
        const inst = installments.find(i => i.id === instId);
        if (inst) {
            setPaymentAmount(inst.amount || '0');
        }
    };

    const handleRecordPaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClientId || !selectedProperty) {
            showToast('Please select a client from the dropdown.', 'warning', 'Missing Selection');
            return;
        }
        if (!paymentAmount || parseFloat(paymentAmount.replace(/,/g, '')) <= 0) {
            showToast('Please enter a valid payment amount.', 'warning', 'Invalid Amount');
            return;
        }

        const numericPayment = parseFloat(paymentAmount.replace(/,/g, '')) || 0;

        // 1. Add Transaction
        const fullRefType = paymentRef ? `${paymentType} (${paymentRef})` : paymentType;
        await addTransaction({
            propertyId: selectedProperty.id,
            date: paymentDate,
            type: fullRefType,
            amount: paymentAmount
        });

        // 2. Mark installment as Paid if selected
        if (selectedInstallmentId) {
            await updateInstallment(selectedInstallmentId, {
                status: 'Paid',
                statusPill: 'bg-[#DEF7EC] text-[#03543F]',
                active: false
            });
        }

        // 3. Update Property Balances
        const currentPaid = parseFloat(String(selectedProperty.totalPaid || 0).replace(/,/g, '')) || 0;
        const currentDue = parseFloat(String(selectedProperty.dueBalance || 0).replace(/,/g, '')) || 0;
        const newPaid = (currentPaid + numericPayment).toLocaleString('en-IN');
        const newDue = Math.max(0, currentDue - numericPayment).toLocaleString('en-IN');

        await updateProperty(selectedProperty.id, {
            totalPaid: newPaid,
            dueBalance: newDue
        });

        showToast('Bank Payment recorded and client ledger updated successfully!', 'success', 'Payment Recorded');
        setIsRecordPaymentOpen(false);
        setSelectedClientId('');
        setSelectedInstallmentId('');
        setPaymentRef('');
        setPaymentAmount('');
    };

    const exportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Client Name,Project,Unit Name,Total Value (BDT),Other Charges (BDT),Total Paid (BDT),Net Due (BDT)\n"
            + filteredProperties.map(p => `"${p.clientName}","${p.projectName}","${p.unitName}","${p.totalValuation}","${p.otherCharges}","${p.totalPaid}","${p.dueBalance}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_ledgers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 lg:px-0 text-slate-800">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
                <div>
                    <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">Financial Ledgers</div>
                    <h1 className="text-2xl font-bold text-slate-800">Master Financial Ledgers</h1>
                    <p className="text-slate-500 text-sm mt-1">Overview of all client financial records and project revenues.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <button onClick={exportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors cursor-pointer flex-shrink-0">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => setIsRecordPaymentOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-[#1A4B9C] text-white rounded-lg hover:bg-[#153B7C] text-sm font-medium shadow-sm transition-colors cursor-pointer flex-shrink-0">
                        <Plus size={14} /> Record Bank Payment
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1A4B9C]"></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">৳{formatBDT(totalRevenue)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Total confirmed payments</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Outstanding</div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">৳{formatBDT(netOutstanding)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Current pending dues</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Overdue</div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">৳{formatBDT(totalOverdue)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Needs immediate attention</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Active Ledgers</div>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-700">{properties.length}</div>
                    <div className="text-[10px] text-blue-600 mt-1 font-medium">Across all projects</div>
                </div>
            </div>

            {/* Ledgers Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800">Client Accounts ({filteredProperties.length})</h3>
                    <div className="relative w-full sm:w-auto">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by client or unit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-[#E2E8F0] rounded-lg text-xs w-full sm:w-64 outline-none focus:border-[#1A4B9C] bg-white text-slate-800"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-[#E2E8F0] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Client & Unit</th>
                            <th className="px-6 py-3">Project</th>
                            <th className="px-6 py-3 text-right">Total Valuation</th>
                            <th className="px-6 py-3 text-right">Total Paid</th>
                            <th className="px-6 py-3 text-right">Due Balance</th>
                            <th className="px-6 py-3 text-center">Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredProperties.map(prop => (
                            <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="font-bold text-slate-800 text-xs">{prop.clientName}</div>
                                    <div className="text-[10px] text-slate-500">{prop.unitName}</div>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-600">{prop.projectName}</td>
                                <td className="px-6 py-3 text-xs font-bold text-slate-800 text-right">৳ {prop.totalValuation}</td>
                                <td className="px-6 py-3 text-xs font-bold text-emerald-600 text-right">৳ {prop.totalPaid}</td>
                                <td className="px-6 py-3 text-xs font-bold text-red-600 text-right">৳ {prop.dueBalance}</td>
                                <td className="px-6 py-3 text-center">
                                    <button 
                                        onClick={() => setSelectedReceiptProp(prop)}
                                        className="p-1.5 bg-blue-50 text-[#1A4B9C] rounded-lg hover:bg-blue-100 transition-colors"
                                        title="View Official Receipt"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* Record Bank Payment Modal */}
            {isRecordPaymentOpen && (
                <div className="fixed inset-0 bg-[#000f22]/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
                        <div className="bg-[#1A4B9C] text-white p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Record Bank Payment</h3>
                                <p className="text-blue-200 text-xs mt-0.5">Select a client to update their installment and payment ledger</p>
                            </div>
                            <button onClick={() => setIsRecordPaymentOpen(false)} className="text-blue-200 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleRecordPaymentSubmit} className="p-6 flex flex-col gap-4 text-xs">
                            {/* Client Dropdown Selector */}
                            <div>
                                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Client</label>
                                <select 
                                    value={selectedClientId} 
                                    onChange={(e) => handleSelectClient(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] font-semibold text-slate-800 text-sm"
                                    required
                                >
                                    <option value="">-- Choose Client from Dropdown --</option>
                                    {clients.map(c => {
                                        const prop = properties.find(p => p.clientId === c.id);
                                        return (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {prop ? `(${prop.unitName})` : ''} - {c.phone || c.email || ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Property Ledger Summary Card */}
                            {selectedProperty && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Unit</span>
                                        <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">{selectedProperty.unitName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Settled</span>
                                        <span className="text-xs font-bold text-emerald-600 mt-0.5 block">৳ {selectedProperty.totalPaid}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Due Balance</span>
                                        <span className="text-xs font-bold text-red-600 mt-0.5 block">৳ {selectedProperty.dueBalance}</span>
                                    </div>
                                </div>
                            )}

                            {/* Installment Dropdown Selector */}
                            {selectedProperty && (
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Installment to Settle</label>
                                    <select 
                                        value={selectedInstallmentId} 
                                        onChange={(e) => handleSelectInstallment(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] text-xs font-medium text-slate-800"
                                    >
                                        <option value="">-- General Payment (No Installment linked) --</option>
                                        {clientInstallments.map(inst => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.installment} • Due: {inst.dueDate} • ৳ {inst.amount} [{inst.status}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Payment Method & Bank Ref */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Method</label>
                                    <select 
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] text-xs font-medium"
                                    >
                                        <option value="Bank Transfer">Bank Transfer (EFT/NPSB)</option>
                                        <option value="Cheque Deposit">Cheque Deposit</option>
                                        <option value="Cash Payment">Cash Deposit</option>
                                        <option value="Online Banking">Online Banking</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bank / Cheque Ref No.</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. DBBL-TXN-99401"
                                        value={paymentRef}
                                        onChange={(e) => setPaymentRef(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] text-xs"
                                    />
                                </div>
                            </div>

                            {/* Amount & Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Amount Received (৳)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Amount in BDT"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] text-xs font-bold text-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Date</label>
                                    <input 
                                        type="date" 
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1A4B9C] text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
                                <button 
                                    type="button"
                                    onClick={() => setIsRecordPaymentOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 bg-[#1A4B9C] hover:bg-[#153B7C] text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                                >
                                    Record Payment & Update Ledger
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Official Receipt Modal */}
            {selectedReceiptProp && (
                <div className="fixed inset-0 bg-[#000f22]/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 bg-[#1A4B9C] text-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold">Official Payment Receipt</h3>
                                <p className="text-blue-200 text-xs mt-0.5">{systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName} • Client Copy</p>
                            </div>
                            <button onClick={() => setSelectedReceiptProp(null)} className="text-blue-200 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto font-sans bg-white text-slate-800">
                            <div id="receipt-print-area" className="space-y-6">
                                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                                    <div>
                                        <div className="font-extrabold text-xl text-[#1A4B9C] uppercase">{systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}</div>
                                        <div className="text-xs text-slate-500">{systemSettings?.headOfficeAddress || DEFAULT_SYSTEM_SETTINGS.headOfficeAddress}</div>
                                        <div className="text-xs text-slate-500">{systemSettings?.supportEmail || DEFAULT_SYSTEM_SETTINGS.supportEmail}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Receipt No</div>
                                        <div className="font-bold text-sm text-slate-800">REC-2026-{selectedReceiptProp.id}</div>
                                        <div className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div>
                                        <div className="text-slate-400 font-bold uppercase text-[9px]">Received From</div>
                                        <div className="font-bold text-sm text-slate-800 mt-0.5">{selectedReceiptProp.clientName}</div>
                                        <div className="text-slate-600 mt-0.5">Account ID: {selectedReceiptProp.clientId}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-400 font-bold uppercase text-[9px]">Property Unit</div>
                                        <div className="font-bold text-sm text-slate-800 mt-0.5">{selectedReceiptProp.unitName}</div>
                                        <div className="text-slate-600 mt-0.5">{selectedReceiptProp.projectName}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Breakdown</div>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-200 pb-2">
                                                    <th className="font-bold pb-2">Description</th>
                                                    <th className="font-bold text-right pb-2">Amount (BDT)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-2">Property Base Valuation</td>
                                                    <td className="text-right font-semibold py-2">৳ {selectedReceiptProp.totalValuation}</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-2">Utility & Other Charges</td>
                                                    <td className="text-right font-semibold py-2">৳ {selectedReceiptProp.otherCharges}</td>
                                                </tr>
                                                <tr className="bg-slate-50 font-bold border-b border-slate-200">
                                                    <td className="py-2.5 px-2">Total Amount Paid</td>
                                                    <td className="text-right py-2.5 px-2 text-emerald-700">৳ {selectedReceiptProp.totalPaid}</td>
                                                </tr>
                                                <tr className="font-bold text-slate-800">
                                                    <td className="py-2.5 px-2">Remaining Balance Due</td>
                                                    <td className="text-right py-2.5 px-2 text-red-600">৳ {selectedReceiptProp.dueBalance}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminFinancials;
