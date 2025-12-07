import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Save, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const AdminTermsConditions = ({ onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [termsContent, setTermsContent] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initial terms and conditions content
    const defaultTerms = `# Terms and Conditions for Pickarry Delivery Services

## 1. Acceptance of Terms
By accessing and using the Pickarry Delivery Services platform ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.

## 2. Service Description
Pickarry provides an online platform connecting customers with delivery couriers for various delivery services including but not limited to:
- Pasundo (Pick-up service)
- Pasugo (Delivery service)
- Scheduled deliveries
- Rush/Express deliveries

## 3. User Accounts
3.1 You must create an account to use our services
3.2 You are responsible for maintaining the confidentiality of your account credentials
3.3 You must provide accurate and complete information during registration
3.4 Pickarry reserves the right to suspend or terminate accounts that violate these terms

## 4. Delivery Services
4.1 Customers can book delivery services through the Platform
4.2 Pickarry acts as an intermediary between customers and couriers
4.3 Delivery times are estimates and not guaranteed
4.4 Customers must ensure delivery items comply with our Acceptable Use Policy

## 5. Payments and Fees
5.1 All fees are displayed during the booking process
5.2 Payment methods include Cash on Delivery (COD) and GCash
5.3 Service fees may include:
   - Base delivery fee
   - Distance charges
   - Time charges
   - Rush delivery surcharges
   - Platform commission
5.4 All fees are final and non-refundable except as specified in our Refund Policy

## 6. Courier Partners
6.1 Couriers are independent contractors, not employees of Pickarry
6.2 Couriers must pass background checks and verification
6.3 Pickarry is not liable for courier actions but maintains quality standards
6.4 Customers can rate and review courier services

## 7. Prohibited Items
The following items are strictly prohibited:
- Illegal substances
- Weapons or hazardous materials
- Perishable goods without proper packaging
- Live animals without special arrangement
- Items exceeding size/weight limits

## 8. Liability Limitations
8.1 Pickarry's liability is limited to the service fee paid
8.2 We are not liable for:
   - Delays due to traffic, weather, or unforeseen circumstances
   - Loss or damage to items improperly packaged
   - Acts or omissions of third parties
   - Items prohibited under Section 7

## 9. Intellectual Property
9.1 All Platform content, logos, and trademarks belong to Pickarry
9.2 Users grant Pickarry license to use submitted content for service provision
9.3 Unauthorized use of Platform content is prohibited

## 10. Privacy Policy
Your use of the Platform is subject to our Privacy Policy, which governs how we collect, use, and protect your personal information.

## 11. Modifications to Terms
Pickarry reserves the right to modify these Terms and Conditions at any time. Continued use of the Platform constitutes acceptance of modified terms.

## 12. Termination
Pickarry may terminate or suspend access to the Platform for violations of these terms, fraudulent activity, or any reason that threatens Platform integrity.

## 13. Governing Law
These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Manila.

## 14. Contact Information
For questions about these Terms and Conditions, contact:
- Email: legal@pickarry.com
- Phone: 1-800-PICKARRY
- Address: Manila, Philippines

---

**Last Updated:** ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}

By using Pickarry Delivery Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.`;

    useEffect(() => {
        // In a real app, you would fetch this from your backend
        const savedTerms = localStorage.getItem('pickarry_terms');
        const savedDate = localStorage.getItem('pickarry_terms_last_updated');

        if (savedTerms) {
            setTermsContent(savedTerms);
        } else {
            setTermsContent(defaultTerms);
        }

        if (savedDate) {
            setLastUpdated(savedDate);
        } else {
            setLastUpdated(new Date().toISOString());
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('pickarry_terms', termsContent);
            localStorage.setItem('pickarry_terms_last_updated', new Date().toISOString());
            setLastUpdated(new Date().toISOString());
            setIsSaving(false);
            setSaveSuccess(true);
            setIsEditing(false);

            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleCancel = () => {
        if (isEditing) {
            const confirmed = window.confirm('Discard changes?');
            if (confirmed) {
                const savedTerms = localStorage.getItem('pickarry_terms') || defaultTerms;
                setTermsContent(savedTerms);
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200 hover-lift"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-300" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {lastUpdated && (
                                <div className="text-sm text-gray-400 hidden md:block">
                                    Last updated: {formatDate(lastUpdated)}
                                </div>
                            )}

                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Terms</span>
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="loading-spinner w-4 h-4"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span>Terms & Conditions updated successfully!</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="mb-8 card bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2">Important Information</h3>
                            <p className="text-gray-300">
                                This Terms & Conditions document governs the use of Pickarry Delivery Services.
                                All users must agree to these terms before using our platform.
                                {isEditing && (
                                    <span className="block mt-2 text-amber-300 font-semibold">
                                        You are currently in edit mode. Changes will affect all users immediately upon saving.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editing Tools Bar */}
                {isEditing && (
                    <div className="mb-6 card bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center justify-between p-4">
                            <div className="text-sm text-gray-300">
                                <span className="font-semibold text-teal-400">Edit Mode Active</span> - Make your changes below
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        setTermsContent(defaultTerms);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Terms Content */}
                <div className="relative">
                    {isEditing ? (
                        <textarea
                            value={termsContent}
                            onChange={(e) => setTermsContent(e.target.value)}
                            className="w-full min-h-[600px] input-field font-mono text-sm resize-y"
                            style={{ minHeight: '600px' }}
                            spellCheck="false"
                        />
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="p-8">
                                <div className="prose prose-lg prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap font-sans">
                                        {termsContent.split('\n').map((line, index) => {
                                            if (line.startsWith('# ')) {
                                                return <h1 key={index} className="text-3xl font-bold text-white mt-6 mb-4">{line.substring(2)}</h1>;
                                            } else if (line.startsWith('## ')) {
                                                return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3 border-l-4 border-teal-500 pl-3">{line.substring(3)}</h2>;
                                            } else if (line.startsWith('### ')) {
                                                return <h3 key={index} className="text-xl font-bold text-white mt-4 mb-2">{line.substring(4)}</h3>;
                                            } else if (line.startsWith('- ')) {
                                                return <li key={index} className="ml-4 mb-2 text-gray-300">{line.substring(2)}</li>;
                                            } else if (line.match(/^\d+\.\d/)) {
                                                return <li key={index} className="ml-4 mb-2 text-gray-300">{line}</li>;
                                            } else if (line.trim() === '') {
                                                return <br key={index} />;
                                            } else {
                                                return <p key={index} className="mb-3 text-gray-300">{line}</p>;
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Character Count */}
                    {isEditing && (
                        <div className="absolute bottom-4 right-4 text-sm text-gray-400 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                            {termsContent.length} characters
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                {!isEditing && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card hover-lift cursor-pointer" onClick={handleEdit}>
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Edit Terms</h3>
                                    <p className="text-sm text-gray-400">Update terms and conditions</p>
                                </div>
                            </div>
                        </div>

                        <div className="card hover-lift">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">View History</h3>
                                    <p className="text-sm text-gray-400">Previous versions and changes</p>
                                </div>
                            </div>
                        </div>

                        <div className="card hover-lift">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">User Compliance</h3>
                                    <p className="text-sm text-gray-400">Check user acceptance status</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="text-center text-gray-500 text-sm">
                        <p>
                            This Terms & Conditions document is legally binding. All changes are logged and timestamped.
                            It is recommended to consult with legal counsel before making significant changes.
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                            <span>Version: 2.1.0</span>
                            <span>•</span>
                            <span>Document ID: TOS-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}</span>
                            <span>•</span>
                            <span>Effective Date: {formatDate(lastUpdated)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add CSS animation */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .prose-invert h1 {
                    color: #ffffff;
                }
                .prose-invert h2 {
                    color: #ffffff;
                }
                .prose-invert h3 {
                    color: #ffffff;
                }
                .prose-invert p {
                    color: #d1d5db;
                }
                .prose-invert li {
                    color: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default AdminTermsConditions;