import React from 'react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
            <Navbar />
            <div className="flex-grow max-w-4xl mx-auto px-6 py-12 bg-base-100 border border-base-300 my-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
                <div className="prose text-base-content/80 space-y-4">
                    <p>At NexusBuild, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.</p>
                    
                    <h2 className="text-xl font-semibold text-base-content mt-6">1. Information We Collect</h2>
                    <p>We collect information that you provide directly to us when registering, onboarding, or communicating. This includes name, email address, phone number, financial details, property choices, and KYC verification documents.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">2. How We Use Your Information</h2>
                    <p>We use the collected information to process registrations, verify identity (KYC), coordinate installments/transactions, send updates, offer customer support, and ensure platform security.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">3. Sharing and Disclosing Information</h2>
                    <p>We do not sell or rent your personal information to third parties. We may share information with trusted third-party service providers (like payment processors, database services) only as necessary to perform operations on our behalf.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">4. Data Security</h2>
                    <p>We implement a variety of industry-standard security measures (including secure servers and encryption) to maintain the safety of your personal information. However, no transmission method over the internet is 100% secure.</p>

                    <h2 className="text-xl font-semibold text-base-content mt-6">5. Your Rights</h2>
                    <p>You have the right to request access to, correction of, or deletion of your personal data stored in our system. You can update your profile information directly from the Client Portal dashboard or contact support for assistance.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
