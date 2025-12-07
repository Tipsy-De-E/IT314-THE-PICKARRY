import React, { useState } from 'react';
import { CheckCircle, User, ShoppingBag, MapPin, Star, X } from 'lucide-react';
import { setUserSession, getUserSession } from '../../../utils/auth';

const SwitchToCustomer = ({ onBack, isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSwitching, setIsSwitching] = useState(false);

    const handleSwitch = async () => {
        setIsSwitching(true);

        // Simulate switching process
        setTimeout(() => {
            setCurrentStep(2); // Success step
            setTimeout(() => {
                // Switch user type to customer and navigate
                const currentSession = getUserSession();
                if (currentSession) {
                    // Keep the same user data but change the user type to customer
                    setUserSession('customer', currentSession.userData);
                }
                // Use window.location.href to force a full page reload and proper authentication check
                window.location.href = '/customer/home';
            }, 2000);
        }, 2000);
    };

    const handleClose = () => {
        setCurrentStep(1);
        setIsSwitching(false);
        onClose();
    };
    const renderConfirmationStep = () => (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-[#1f2937] border border-[rgba(75,85,99,0.5)] rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[rgba(75,85,99,0.5)]">
                    <div className="flex items-center gap-3">
                        {/* <div className="p-2 bg-[#14b8a6] rounded-lg">
                            <User size={24} className="text-white" />
                        </div> */}
                        <div>
                            <h2 className="text-xl font-semibold text-white">Switch to Customer Mode</h2>
                            <p className="text-[#9ca3af] text-sm">Experience Pickarry from the customer's perspective</p>
                        </div>
                    </div>
                    <button
                        className="p-1 hover:bg-[rgba(55,65,81,0.8)] rounded-lg transition-colors duration-200"
                        onClick={handleClose}
                    >
                        <X size={20} className="text-[#9ca3af]" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Switch Details */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[#d1d5db]">Current Mode:</span>
                            <span className="bg-[#14b8a6] text-white px-3 py-1 rounded-full text-sm font-medium">Courier</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#d1d5db]">Switching To:</span>
                            <span className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-sm font-medium">Customer</span>
                        </div>
                    </div>

                    {/* Feature Section (commented out but styled) */}
                    {/* <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">You'll get access to:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[#d1d5db]">
              <ShoppingBag size={20} className="text-[#22c55e]" />
              <span>Place and track orders in real-time</span>
            </div>
            <div className="flex items-center gap-3 text-[#d1d5db]">
              <MapPin size={20} className="text-[#22c55e]" />
              <span>Real-time delivery tracking</span>
            </div>
            <div className="flex items-center gap-3 text-[#d1d5db]">
              <Star size={20} className="text-[#22c55e]" />
              <span>Rate and review services</span>
            </div>
          </div>
        </div> */}

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            className="w-full bg-[#14b8a6] hover:bg-[#0d9488] disabled:bg-[#0d9488] disabled:opacity-70 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                            onClick={handleSwitch}
                            disabled={isSwitching}
                        >
                            {isSwitching ? 'Switching...' : 'Switch to Customer Mode'}
                        </button>
                        {/* <button
                            className="w-full bg-[rgba(31,41,55,0.8)] hover:bg-[rgba(31,41,55,1)] disabled:opacity-70 text-[#9ca3af] hover:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 border border-[rgba(75,85,99,0.5)]"
                            onClick={handleClose}
                            disabled={isSwitching}
                        >
                            Cancel
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSuccessStep = () => (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-[#1f2937] border border-[rgba(75,85,99,0.5)] rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Success Content */}
                <div className="p-8 text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={64} className="text-[#10b981]" />
                    </div>

                    {/* Success Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Successfully Switched!
                    </h3>

                    {/* Success Description */}
                    <p className="text-[#d1d5db] mb-6 leading-relaxed">
                        Welcome to Customer mode! You now have access to all customer features.
                    </p>

                    {/* Success Features */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-[#d1d5db]">
                            <ShoppingBag size={20} className="text-[#22c55e]" />
                            <span>Place orders and track deliveries</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#d1d5db]">
                            <MapPin size={20} className="text-[#22c55e]" />
                            <span>Real-time delivery tracking</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#d1d5db]">
                            <Star size={20} className="text-[#22c55e]" />
                            <span>Rate and review services</span>
                        </div>
                    </div>

                    {/* Loading Container */}
                    <div className="space-y-3">
                        <div className="w-full bg-[rgba(75,85,99,0.3)] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#10b981] h-full rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-[#9ca3af] text-sm">
                            Redirecting to customer dashboard...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="switch-customer-modal">
                {currentStep === 1 && renderConfirmationStep()}
                {currentStep === 2 && renderSuccessStep()}
            </div>
        </div>
    );
};

export default SwitchToCustomer;