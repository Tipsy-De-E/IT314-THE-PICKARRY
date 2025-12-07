import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, Download, Shield, User, CreditCard, Package, HelpCircle, Clock, Lock, Target, Bell, AlertTriangle, Globe } from 'lucide-react';

const CustomerPolicies = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState('terms-of-service');

    const policies = {
        'terms-of-service': {
            title: 'Terms of Service',
            icon: FileText,
            description: 'Agreement for using Pickarry services',
            color: 'from-blue-500 to-teal-400',
            content: [
                'By using Pickarry, you agree to our terms and conditions',
                'You must be at least 18 years old to use our services',
                'Provide accurate delivery information for successful deliveries',
                'Responsible for any additional charges due to incorrect address',
                'Cannot cancel orders once courier has accepted the delivery',
                'Pickarry is not liable for items prohibited by law',
                'Respect courier partners and maintain professional communication'
            ]
        },
        'privacy-policy': {
            title: 'Privacy Policy',
            icon: Lock,
            description: 'How we protect and use your data',
            color: 'from-purple-500 to-pink-400',
            content: [
                'We collect personal information for service delivery',
                'Payment details are encrypted and secured',
                'Location data is used only for delivery purposes',
                'Contact information is shared with courier partners for delivery coordination',
                'We do not sell your personal data to third parties',
                'You can request data deletion at any time',
                'Cookies are used to enhance user experience'
            ]
        },
        'delivery-policies': {
            title: 'Delivery Policies',
            icon: Package,
            description: 'Rules and guidelines for deliveries',
            color: 'from-amber-500 to-orange-400',
            content: [
                'Standard delivery: 1-3 hours within Metro Manila',
                'Express delivery: 30-60 minutes (additional fee applies)',
                'Delivery fees vary based on distance and package size',
                'Delivery times are estimates, not guarantees',
                'Cash on Delivery (COD) and GCash payments accepted',
                'Failed deliveries may incur restocking fees',
                'Contact support for delivery issues within 24 hours'
            ]
        },
        'payment-policies': {
            title: 'Payment Policies',
            icon: CreditCard,
            description: 'Billing, fees, and payment terms',
            color: 'from-emerald-500 to-green-400',
            content: [
                'Payments are due upon delivery completion',
                'Cancellation fees apply after courier acceptance',
                'Refunds processed within 7-14 business days',
                'Service fees are non-refundable',
                'Additional charges may apply for special requests',
                'Dispute charges within 48 hours of transaction',
                'Payment methods: Cash, GCash, Credit/Debit Cards'
            ]
        },
        'safety-security': {
            title: 'Safety & Security',
            icon: Shield,
            description: 'Customer safety guidelines',
            color: 'from-red-500 to-rose-400',
            content: [
                'Always verify courier identity through app',
                'Meet couriers in public areas when possible',
                'Do not share personal information unnecessarily',
                'Report suspicious activity immediately',
                'Use secure payment methods',
                'Track your delivery in real-time',
                'Contact emergency services if feeling unsafe'
            ]
        },
        'support-policy': {
            title: 'Support Policy',
            icon: HelpCircle,
            description: 'Customer support guidelines',
            color: 'from-indigo-500 to-purple-400',
            content: [
                '24/7 customer support available',
                'Response time: within 2 hours for urgent matters',
                'Email support: support@pickarry.com',
                'Hotline: 1-800-PICKARRY',
                'Live chat available in app',
                'Issue resolution within 24-48 hours',
                'Feedback and suggestions welcome'
            ]
        }
    };

    const PolicyIcon = policies[activeSection].icon;

    // Important notices for each policy section
    const importantNotices = {
        'terms-of-service': {
            title: 'Legal Agreement',
            description: 'By using our services, you enter into a legally binding agreement with Pickarry.',
            color: 'bg-gradient-to-r from-blue-500/20 to-teal-400/20 border-blue-500/30'
        },
        'privacy-policy': {
            title: 'Data Protection',
            description: 'Your privacy is our priority. We comply with all data protection regulations.',
            color: 'bg-gradient-to-r from-purple-500/20 to-pink-400/20 border-purple-500/30'
        },
        'delivery-policies': {
            title: 'Service Commitment',
            description: 'We strive for 100% delivery success while maintaining transparency.',
            color: 'bg-gradient-to-r from-amber-500/20 to-orange-400/20 border-amber-500/30'
        },
        'payment-policies': {
            title: 'Financial Security',
            description: 'All transactions are secured and monitored for your protection.',
            color: 'bg-gradient-to-r from-emerald-500/20 to-green-400/20 border-emerald-500/30'
        },
        'safety-security': {
            title: 'Your Safety First',
            description: 'We prioritize customer safety in every aspect of our service.',
            color: 'bg-gradient-to-r from-red-500/20 to-rose-400/20 border-red-500/30'
        },
        'support-policy': {
            title: 'Always Here to Help',
            description: 'Our support team is available round-the-clock to assist you.',
            color: 'bg-gradient-to-r from-indigo-500/20 to-purple-400/20 border-indigo-500/30'
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Customer Policies</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-400 ml-14">
                        Review our terms, policies, and guidelines for a secure delivery experience
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <div className="card p-4">
                                <h3 className="font-semibold text-gray-300 mb-4">Policies Menu</h3>
                                <div className="space-y-2">
                                    {Object.keys(policies).map((key) => {
                                        const IconComponent = policies[key].icon;
                                        const isActive = activeSection === key;
                                        return (
                                            <button
                                                key={key}
                                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-white'
                                                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                                    }`}
                                                onClick={() => setActiveSection(key)}
                                            >
                                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-left font-medium flex-1">{policies[key].title}</span>
                                                {isActive && (
                                                    <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Stats Card */}
                            <div className="card p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-teal-500/20 rounded-lg">
                                        <Bell className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">Important</h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    These policies are legally binding. Make sure to read and understand them thoroughly.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs text-gray-500">Last updated: December 1, 2025</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs text-gray-500">Version: 3.2.1</span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help Card */}
                            <div className="card p-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                                <h3 className="font-semibold mb-2">Need Help?</h3>
                                <p className="text-sm text-teal-100 mb-4">Contact our support team for any questions</p>
                                <button className="w-full bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Policy Header Card */}
                        <div className="card mb-6 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 bg-gradient-to-br ${policies[activeSection].color} rounded-xl`}>
                                            <PolicyIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">{policies[activeSection].title}</h2>
                                            <p className="text-gray-400">{policies[activeSection].description}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 self-start lg:self-center">
                                        <Download className="w-4 h-4" />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Policy Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Key Points */}
                            <div className="lg:col-span-2">
                                <div className="card p-6">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <div className="w-2 h-6 bg-gradient-to-b from-teal-400 to-blue-400 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-white">Key Points</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {policies[activeSection].content.map((item, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200 group">
                                                <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                                <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Important Notice */}
                            <div>
                                <div className={`card p-6 ${importantNotices[activeSection].color} border`}>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                                        <h3 className="font-semibold text-white">{importantNotices[activeSection].title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-6">
                                        {importantNotices[activeSection].description}
                                    </p>
                                    <div className="p-3 bg-black/20 rounded-lg">
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            By using Pickarry services, you acknowledge that you have read, understood, and agree to be bound by these policies.
                                            These policies are subject to change, and continued use of our services constitutes acceptance of any modifications.
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="card p-6 mt-6">
                                    <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                            <FileText className="w-4 h-4 text-teal-400" />
                                            <span className="text-gray-300">All Policies Document</span>
                                        </button>
                                        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                            <User className="w-4 h-4 text-blue-400" />
                                            <span className="text-gray-300">Account Settings</span>
                                        </button>
                                        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                            <HelpCircle className="w-4 h-4 text-purple-400" />
                                            <span className="text-gray-300">Frequently Asked Questions</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Policies Overview */}
                        <div className="card p-6 mt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-6 bg-gradient-to-b from-teal-400 to-blue-400 rounded-full"></div>
                                    <h3 className="text-lg font-semibold text-white">All Policies Overview</h3>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {Object.keys(policies).length} sections
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(policies).map((key) => {
                                    const Icon = policies[key].icon;
                                    const isActive = activeSection === key;
                                    return (
                                        <button
                                            key={key}
                                            className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ${isActive
                                                ? `bg-gradient-to-r ${policies[key].color} bg-opacity-20 border ${policies[key].color.split(' ')[1].replace('to-', 'border-')}/30`
                                                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                                }`}
                                            onClick={() => setActiveSection(key)}
                                        >
                                            <div className={`p-2 rounded-lg ${isActive
                                                ? 'bg-white text-gray-900'
                                                : `bg-gradient-to-br ${policies[key].color}`
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className="font-medium text-white">{policies[key].title}</div>
                                                <div className="text-xs text-gray-400">{policies[key].content.length} points</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="text-center text-gray-500 text-sm">
                        <p>
                            This Customer Policies document is legally binding. All changes are logged and timestamped.
                            It is recommended to review these policies regularly to stay informed about updates.
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                            <span>Version: 3.2.1</span>
                            <span>•</span>
                            <span>Document ID: CP-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}</span>
                            <span>•</span>
                            <span>Effective Date: December 1, 2025</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add CSS */}
            <style>{`
                .card {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(55, 65, 81, 0.5);
                    border-radius: 0.75rem;
                    backdrop-filter: blur(10px);
                }

                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    transition: all 0.2s ease;
                }
            `}</style>
        </div>
    );
};

export default CustomerPolicies;