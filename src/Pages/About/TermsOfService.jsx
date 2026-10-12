import React from 'react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useDatabase } from '../../Context/DatabaseContext';
import DEFAULT_SYSTEM_SETTINGS from '../../config/defaultSettings';

const TermsOfService = () => {
    const { systemSettings } = useDatabase();
    const company = systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName;

    return (
        <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
            <Navbar />
            <div className="flex-grow max-w-4xl mx-auto px-6 py-12 bg-base-100 my-8 rounded-lg shadow-md border border-base-300">
                <h1 className="text-3xl font-bold text-primary mb-6">Terms of Service</h1>
                <div className="prose text-base-content/80 space-y-4">
                    <p>Welcome to NexusBuild (operated by {company}). By accessing or using our website, portal, and services, you agree to comply with and be bound by the following terms and conditions.</p>
                    
                    <h2 className="text-xl font-semibold text-base-content mt-6">1. Acceptance of Terms</h2>
                    <p>By registering an account, purchasing properties, or accessing any service provided by us, you accept these terms in full. If you disagree with any part of these terms, you must not use our services.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">2. Registration and Accounts</h2>
                    <p>To access certain features including the Client Portal, you must register for an account. You agree to provide accurate, current, and complete information. Registration does not guarantee immediate access; accounts are subject to administrative review, verification, and KYC approval.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">3. Financial Transactions and Payments</h2>
                    <p>All property purchases, installment schedules, and transactional records are managed in accordance with official sale agreements. Installment payments must be paid on or before their respective due dates. Late payments may attract interest or penalties as specified in individual contract agreements.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">4. Intellectual Property</h2>
                    <p>All content, designs, GIS maps, logo, and graphics on this platform are intellectual property of {company} and NexusBuild. Unauthorized duplication, modification, or distribution is strictly prohibited.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">5. Limitation of Liability</h2>
                    <p>{company} shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services, or any unauthorized access to your account.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">6. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated modification date.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfService;
