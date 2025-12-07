import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Edit,
    Save,
    X,
    FileText,
    CheckCircle,
    AlertCircle,
    Shield,
    Truck,
    DollarSign,
    AlertTriangle,
    Download,
    Plus,
    Trash2,
    Eye,
    History
} from 'lucide-react';

const AdminCourierPolicies = ({ onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [policies, setPolicies] = useState({});
    const [editedContent, setEditedContent] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [history, setHistory] = useState([]);

    // Initial policies data
    const defaultPolicies = {
        'code-of-conduct': {
            title: 'Code of Conduct',
            icon: Shield,
            description: 'Professional standards and behavioral expectations',
            content: [
                'Always maintain professional behavior with customers and colleagues',
                'Respect customer privacy and confidentiality',
                'No discrimination or harassment of any kind',
                'Follow all traffic laws and regulations',
                'Report any incidents or accidents immediately',
                'Maintain proper hygiene and professional appearance',
                'Provide accurate delivery time estimates'
            ]
        },
        'delivery-standards': {
            title: 'Delivery Standards',
            icon: Truck,
            description: 'Quality and service delivery requirements',
            content: [
                'Ensure timely delivery within promised timeframes',
                'Verify customer identity for age-restricted items',
                'Handle packages with care and professionalism',
                'Maintain proper temperature control for food items',
                'Use proper packaging materials when required',
                'Confirm delivery with customers when possible',
                'Follow specific customer delivery instructions'
            ]
        },
        'payment-policies': {
            title: 'Payment Policies',
            icon: DollarSign,
            description: 'Earnings, payments, and financial guidelines',
            content: [
                'Payments are processed weekly every Friday',
                'Minimum payout threshold: ₱500',
                'Service fees and commission rates apply',
                'Tips go directly to the courier',
                'Report payment issues within 7 days',
                'Detailed earnings breakdown available in app',
                'Tax responsibilities are courier\'s responsibility'
            ]
        },
        'safety-protocols': {
            title: 'Safety Protocols',
            icon: AlertTriangle,
            description: 'Health, safety, and emergency procedures',
            content: [
                'Always wear safety gear when required',
                'Conduct vehicle safety checks daily',
                'Avoid dangerous areas and report concerns',
                'Emergency contact: 1-800-PICKARRY',
                'Follow COVID-19 safety guidelines',
                'Carry personal protective equipment',
                'Report unsafe working conditions immediately'
            ]
        }
    };

    useEffect(() => {
        // Load policies from localStorage or use defaults
        const savedPolicies = localStorage.getItem('admin_courier_policies');
        const savedHistory = localStorage.getItem('admin_courier_policies_history');

        if (savedPolicies) {
            try {
                const parsedPolicies = JSON.parse(savedPolicies);
                // Restore icon component references after parsing
                const restoredPolicies = {};
                Object.keys(parsedPolicies).forEach(key => {
                    restoredPolicies[key] = {
                        ...parsedPolicies[key],
                        icon: defaultPolicies[key]?.icon || FileText
                    };
                });
                setPolicies(restoredPolicies);
            } catch (error) {
                // If parsing fails (corrupted data), use defaults and clear storage
                console.warn('Corrupted policies data in localStorage, using defaults');
                localStorage.removeItem('admin_courier_policies');
                setPolicies(defaultPolicies);
            }
        } else {
            setPolicies(defaultPolicies);
        }

        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.warn('Corrupted history data in localStorage, clearing');
                localStorage.removeItem('admin_courier_policies_history');
            }
        }
    }, []);

    const startEditing = (sectionKey) => {
        setEditingSection(sectionKey);
        setEditedContent([...policies[sectionKey].content]);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!editingSection) return;

        setIsSaving(true);

        // Create history record
        const historyRecord = {
            id: Date.now(),
            section: editingSection,
            oldContent: policies[editingSection].content,
            newContent: editedContent,
            timestamp: new Date().toISOString(),
            editor: 'Admin User' // In real app, get from auth context
        };

        // Update policies
        const updatedPolicies = {
            ...policies,
            [editingSection]: {
                ...policies[editingSection],
                content: editedContent,
                lastUpdated: new Date().toISOString()
            }
        };

        // Create serializable version for localStorage (without icon components)
        const serializablePolicies = {};
        Object.keys(updatedPolicies).forEach(key => {
            const { icon, ...policyWithoutIcon } = updatedPolicies[key];
            serializablePolicies[key] = policyWithoutIcon;
        });

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('admin_courier_policies', JSON.stringify(serializablePolicies));

            // Update history
            const updatedHistory = [historyRecord, ...history.slice(0, 9)]; // Keep last 10 records
            localStorage.setItem('admin_courier_policies_history', JSON.stringify(updatedHistory));

            setPolicies(updatedPolicies);
            setHistory(updatedHistory);
            setIsSaving(false);
            setSaveSuccess(true);
            setIsEditing(false);
            setEditingSection(null);

            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleCancel = () => {
        const confirmed = window.confirm('Discard changes?');
        if (confirmed) {
            setIsEditing(false);
            setEditingSection(null);
            setNewItem('');
        }
    };

    const addNewItem = () => {
        if (newItem.trim()) {
            setEditedContent([...editedContent, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItem = (index) => {
        const newContent = editedContent.filter((_, i) => i !== index);
        setEditedContent(newContent);
    };

    const moveItemUp = (index) => {
        if (index === 0) return;
        const newContent = [...editedContent];
        [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
        setEditedContent(newContent);
    };

    const moveItemDown = (index) => {
        if (index === editedContent.length - 1) return;
        const newContent = [...editedContent];
        [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
        setEditedContent(newContent);
    };

    const resetToDefault = (sectionKey) => {
        const confirmed = window.confirm(`Reset "${policies[sectionKey].title}" to default content?`);
        if (confirmed) {
            const updatedPolicies = {
                ...policies,
                [sectionKey]: {
                    ...policies[sectionKey],
                    content: [...defaultPolicies[sectionKey].content],
                    lastUpdated: new Date().toISOString()
                }
            };

            // Create serializable version for localStorage (without icon components)
            const serializablePolicies = {};
            Object.keys(updatedPolicies).forEach(key => {
                const { icon, ...policyWithoutIcon } = updatedPolicies[key];
                serializablePolicies[key] = policyWithoutIcon;
            });

            localStorage.setItem('admin_courier_policies', JSON.stringify(serializablePolicies));
            setPolicies(updatedPolicies);

            // Show success message
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never updated';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPolicyIcon = (sectionKey) => {
        return policies[sectionKey]?.icon || FileText;
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
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Courier Policies Management</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isEditing ? (
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
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {/* View courier app */ }}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View as Courier</span>
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
                        <span>Policies updated successfully!</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="mb-8 card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2">Admin Controls</h3>
                            <p className="text-gray-300">
                                Manage all courier policies and guidelines. Changes here will immediately affect what couriers see in their app.
                                {isEditing && (
                                    <span className="block mt-2 text-amber-300 font-semibold">
                                        You are currently editing: {policies[editingSection]?.title}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-6">
                        {/* Editing Header */}
                        <div className="card bg-gray-800/50 border border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                            {React.createElement(getPolicyIcon(editingSection), { className: "w-6 h-6 text-white" })}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {policies[editingSection]?.title}
                                            </h2>
                                            <p className="text-gray-400">{policies[editingSection]?.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => resetToDefault(editingSection)}
                                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Editing Content */}
                        <div className="card">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Policy Items</h3>

                                {/* Add New Item */}
                                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Add New Policy Item
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                                            placeholder="Enter new policy requirement..."
                                            className="flex-1 input-field"
                                        />
                                        <button
                                            onClick={addNewItem}
                                            disabled={!newItem.trim()}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    {editedContent.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => moveItemUp(index)}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={() => moveItemDown(index)}
                                                        disabled={index === editedContent.length - 1}
                                                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start space-x-2">
                                                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-300">{item}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {editedContent.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No policy items added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* View Mode */
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card hover-lift">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Total Policies</h3>
                                        <p className="text-2xl font-bold text-white">{Object.keys(policies).length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card hover-lift">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Total Items</h3>
                                        <p className="text-2xl font-bold text-white">
                                            {Object.values(policies).reduce((total, policy) => total + policy.content.length, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card hover-lift">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                                        <History className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Last Updated</h3>
                                        <p className="text-sm text-gray-300">
                                            {Object.values(policies).reduce((latest, policy) => {
                                                const policyDate = new Date(policy.lastUpdated || 0);
                                                const latestDate = new Date(latest || 0);
                                                return policyDate > latestDate ? policy.lastUpdated : latest;
                                            }, null) ? formatDate(Object.values(policies).reduce((latest, policy) => {
                                                const policyDate = new Date(policy.lastUpdated || 0);
                                                const latestDate = new Date(latest || 0);
                                                return policyDate > latestDate ? policy.lastUpdated : latest;
                                            }, null)) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card hover-lift">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                                        <Download className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Export</h3>
                                        <p className="text-sm text-gray-300">Download all policies</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Policies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.keys(policies).map((key) => {
                                const policy = policies[key];
                                const IconComponent = policy.icon;
                                const lastUpdated = policy.lastUpdated;

                                return (
                                    <div key={key} className="card hover-lift">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                                        {React.createElement(IconComponent, { className: "w-6 h-6 text-white" })}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{policy.title}</h3>
                                                        <p className="text-sm text-gray-400">{policy.description}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => startEditing(key)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                                                    Policy Items ({policy.content.length})
                                                </h4>
                                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {policy.content.slice(0, 4).map((item, index) => (
                                                        <li key={index} className="flex items-start space-x-2 text-sm">
                                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-400">{item}</span>
                                                        </li>
                                                    ))}
                                                    {policy.content.length > 4 && (
                                                        <li className="text-sm text-gray-500 pl-6">
                                                            +{policy.content.length - 4} more items...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                                <span className="text-xs text-gray-500">
                                                    Updated: {lastUpdated ? formatDate(lastUpdated) : 'Never'}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => resetToDefault(key)}
                                                        className="text-xs px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* History Section */}
                        {history.length > 0 && (
                            <div className="card">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Recent Changes</h3>
                                    <div className="space-y-3">
                                        {history.slice(0, 5).map((record) => (
                                            <div key={record.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                        <span className="font-medium text-white">
                                                            {policies[record.section]?.title || 'Unknown Section'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(record.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    Changed {record.oldContent.length} items to {record.newContent.length} items
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Edited by: {record.editor}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bulk Actions */}
                        <div className="card">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Bulk Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200">
                                        <Download className="w-4 h-4 inline mr-2" />
                                        Export All Policies
                                    </button>
                                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Generate Report
                                    </button>
                                    <button
                                        onClick={() => {
                                            const confirmed = window.confirm('Reset all policies to default?');
                                            if (confirmed) {
                                                // Create serializable version for localStorage (without icon components)
                                                const serializablePolicies = {};
                                                Object.keys(defaultPolicies).forEach(key => {
                                                    const { icon, ...policyWithoutIcon } = defaultPolicies[key];
                                                    serializablePolicies[key] = policyWithoutIcon;
                                                });

                                                localStorage.setItem('admin_courier_policies', JSON.stringify(serializablePolicies));
                                                setPolicies(defaultPolicies);
                                                setSaveSuccess(true);
                                                setTimeout(() => setSaveSuccess(false), 3000);
                                            }
                                        }}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors duration-200"
                                    >
                                        Reset All to Default
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add CSS */}
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

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .input-field {
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: white;
          width: 100%;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 1rem;
          height: 1rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default AdminCourierPolicies;