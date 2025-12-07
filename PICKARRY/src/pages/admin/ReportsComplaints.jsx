import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    MessageCircle,
    User,
    Calendar,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ChevronDown,
    Ban,
    ArrowRight
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import notificationService from '../../hooks/notificationService';
import '../../index.css';
const ReportsComplaints = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [userTypeFilter, setUserTypeFilter] = useState('All');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [suspensionDuration, setSuspensionDuration] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSupportComplaints();
    }, []);

    const fetchSupportComplaints = async () => {
        try {
            setLoading(true);

            // First, fetch the support complaints
            const { data: complaints, error } = await supabase
                .from('support_complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!complaints || complaints.length === 0) {
                setReports([]);
                return;
            }

            // Fetch user details separately
            const processedReports = await Promise.all(
                complaints.map(async (report) => {
                    let reporterDetails = {};
                    let reportedUserDetails = {};

                    // Fetch reporter details
                    if (report.reporter_type === 'customer') {
                        const { data: customer } = await supabase
                            .from('customers')
                            .select('id, full_name, email, phone')
                            .eq('id', report.reporter_id)
                            .single();
                        reporterDetails = customer || {};
                    } else if (report.reporter_type === 'courier') {
                        const { data: courier } = await supabase
                            .from('couriers')
                            .select('id, full_name, email, phone')
                            .eq('id', report.reporter_id)
                            .single();
                        reporterDetails = courier || {};
                    }

                    // Fetch reported user details
                    if (report.reported_user_type === 'customer') {
                        const { data: customer } = await supabase
                            .from('customers')
                            .select('id, full_name, email, phone')
                            .eq('id', report.reported_user_id)
                            .single();
                        reportedUserDetails = customer || {};
                    } else if (report.reported_user_type === 'courier') {
                        const { data: courier } = await supabase
                            .from('couriers')
                            .select('id, full_name, email, phone')
                            .eq('id', report.reported_user_id)
                            .single();
                        reportedUserDetails = courier || {};
                    }

                    return {
                        ...report,
                        reporter_name: reporterDetails.full_name || report.reporter_name || `Unknown ${report.reporter_type}`,
                        reporter_email: reporterDetails.email || report.reporter_email || 'No email',
                        reported_user_name: reportedUserDetails.full_name || report.reported_user_name || `Unknown ${report.reported_user_type}`,
                        reported_user_email: reportedUserDetails.email || report.reported_user_email || 'No email'
                    };
                })
            );

            setReports(processedReports);
        } catch (error) {
            console.error('Error fetching support complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = ['All', 'open', 'in_progress', 'resolved', 'closed'];
    const typeOptions = ['All', 'support', 'complaint'];
    const userTypeOptions = ['All', 'customer', 'courier'];

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reported_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
        const matchesType = typeFilter === 'All' || report.ticket_type === typeFilter;
        const matchesUserType = userTypeFilter === 'All' || report.reported_user_type === userTypeFilter;

        return matchesSearch && matchesStatus && matchesType && matchesUserType;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'in_progress': return <MessageCircle className="w-4 h-4 text-blue-400" />;
            case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'closed': return <XCircle className="w-4 h-4 text-gray-400" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-700/30';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
            case 'low': return 'text-green-400 bg-green-900/20 border-green-700/30';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
        }
    };

    const getTicketTypeColor = (type) => {
        switch (type) {
            case 'complaint': return 'bg-red-900/20 text-red-400 border-red-700/30';
            case 'support': return 'bg-blue-900/20 text-blue-400 border-blue-700/30';
            default: return 'bg-gray-900/20 text-gray-400 border-gray-700/30';
        }
    };

    const openReportDetails = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
    };

    const handleSuspendUser = async () => {
        if (!suspensionReason || !selectedReport) return;

        try {
            // First, create a suspension record
            const suspensionData = {
                user_id: selectedReport.reported_user_id,
                user_type: selectedReport.reported_user_type,
                reason: suspensionReason,
                duration: suspensionDuration,
                suspended_by: 'admin',
                suspended_at: new Date().toISOString(),
                status: 'active'
            };

            const { error: suspensionError } = await supabase
                .from('courier_suspensions')
                .insert([suspensionData]);

            if (suspensionError) throw suspensionError;

            // Update the user's status in their respective table
            const userTable = selectedReport.reported_user_type === 'customer' ? 'customers' : 'couriers';
            const { error: userUpdateError } = await supabase
                .from(userTable)
                .update({
                    status: 'suspended',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedReport.reported_user_id);

            if (userUpdateError) throw userUpdateError;

            // Update the complaint status
            const { error: updateError } = await supabase
                .from('support_complaints')
                .update({
                    status: 'resolved',
                    admin_notes: `User suspended. Reason: ${suspensionReason}${suspensionDuration ? ` Duration: ${suspensionDuration}` : ''}`,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', selectedReport.id);

            if (updateError) throw updateError;

            // Send suspension notification to the reported user
            await notificationService.notifyUserSuspension(
                selectedReport.reported_user_id,
                selectedReport.reported_user_type,
                suspensionReason,
                suspensionDuration
            );

            // Update local state
            setReports(prev => prev.map(report =>
                report.id === selectedReport.id
                    ? { ...report, status: 'resolved', admin_notes: `User suspended. Reason: ${suspensionReason}` }
                    : report
            ));

            alert(`User ${selectedReport.reported_user_name} has been suspended and notified.`);
            setShowSuspendModal(false);
            setShowDetailModal(false);
            setSuspensionReason('');
            setSuspensionDuration('');

        } catch (error) {
            console.error('Error suspending user:', error);
            alert('Failed to suspend user. Please try again.');
        }
    };

    const updateComplaintStatus = async (status) => {
        if (!selectedReport) return;

        try {
            const { error } = await supabase
                .from('support_complaints')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedReport.id);

            if (error) throw error;

            // Update local state
            setReports(prev => prev.map(report =>
                report.id === selectedReport.id
                    ? { ...report, status: status }
                    : report
            ));

            setSelectedReport(prev => ({ ...prev, status: status }));
            alert(`Complaint status updated to ${status}`);
        } catch (error) {
            console.error('Error updating complaint status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters and Search */}
            <div className="">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search reports, users, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <select
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value)}
                                className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 cursor-pointer"
                            >
                                {userTypeOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option === 'All' ? 'All Users' : `${option.charAt(0).toUpperCase() + option.slice(1)} Reports`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 cursor-pointer"
                            >
                                {statusOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option === 'All' ? 'All Status' : option.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 cursor-pointer"
                            >
                                {typeOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option === 'All' ? 'All Types' : option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading complaints...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-800 rounded-xl">
                        <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-semibold mb-2">No complaints found</h3>
                        <p className="text-gray-400">No support requests or complaints match your current filters.</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs ${getTicketTypeColor(report.ticket_type)}`}>
                                            {report.ticket_type?.charAt(0).toUpperCase() + report.ticket_type?.slice(1)}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${report.reported_user_type === 'customer' ? 'bg-blue-900/20 text-blue-400 border border-blue-700/30' : 'bg-green-900/20 text-green-400 border border-green-700/30'}`}>
                                            {report.reported_user_type?.charAt(0).toUpperCase() + report.reported_user_type?.slice(1)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(report.status)}
                                            <span className="text-sm text-gray-300 capitalize">{report.status?.replace('_', ' ')}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(report.priority)}`}>
                                            {report.priority} Priority
                                        </span>
                                    </div>

                                    <h3 className="text-white font-semibold text-lg mb-1">{report.subject}</h3>
                                    <p className="text-gray-400 mb-3">{report.message?.substring(0, 150)}...</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-400" />
                                            <span className="text-blue-400">{report.reporter_name}</span>
                                            <span>({report.reporter_type})</span>
                                            <ArrowRight className="w-4 h-4 text-gray-500" />
                                            <User className="w-4 h-4 text-red-400" />
                                            <span className="text-red-400">{report.reported_user_name}</span>
                                            <span>({report.reported_user_type})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {report.order_id && (
                                            <span>Order: {report.order_id.slice(-8)}</span>
                                        )}
                                        <span>Category: {report.category}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openReportDetails(report)}
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white transition-colors"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Report Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Report Details</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm">Report ID</label>
                                    <p className="text-white font-semibold">{selectedReport.id.slice(-8)}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Type</label>
                                    <p className="text-white capitalize">{selectedReport.ticket_type}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Status</label>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedReport.status)}
                                        <span className="text-white capitalize">{selectedReport.status?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Priority</label>
                                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedReport.priority)}`}>
                                        {selectedReport.priority}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Category</label>
                                    <p className="text-white">{selectedReport.category}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Created</label>
                                    <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Reporter and Reported User Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-400" />
                                        Reporter Information
                                    </h3>
                                    <div className="bg-gray-750 rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-gray-400 text-sm">Name</label>
                                                <p className="text-white font-medium">{selectedReport.reporter_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-sm">Type</label>
                                                <span className={`px-2 py-1 rounded text-xs ${selectedReport.reporter_type === 'customer' ? 'bg-blue-900/20 text-blue-400 border border-blue-700/30' : 'bg-green-900/20 text-green-400 border border-green-700/30'}`}>
                                                    {selectedReport.reporter_type}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-sm">Email</label>
                                                <p className="text-white">{selectedReport.reporter_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <User className="w-5 h-5 text-red-400" />
                                        Reported User
                                    </h3>
                                    <div className="bg-gray-750 rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-gray-400 text-sm">Name</label>
                                                <p className="text-white font-medium">{selectedReport.reported_user_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-sm">Type</label>
                                                <span className={`px-2 py-1 rounded text-xs ${selectedReport.reported_user_type === 'customer' ? 'bg-blue-900/20 text-blue-400 border border-blue-700/30' : 'bg-green-900/20 text-green-400 border border-green-700/30'}`}>
                                                    {selectedReport.reported_user_type}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-sm">Email</label>
                                                <p className="text-white">{selectedReport.reported_user_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">Report Details</h3>
                                <div className="bg-gray-750 rounded-lg p-4">
                                    <h4 className="text-white font-medium mb-2">{selectedReport.subject}</h4>
                                    <p className="text-gray-300 whitespace-pre-wrap">{selectedReport.message}</p>
                                </div>
                            </div>

                            {/* Order Information */}
                            {selectedReport.order_id && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Related Order</h3>
                                    <div className="bg-gray-750 rounded-lg p-4">
                                        <p className="text-white">Order ID: {selectedReport.order_id}</p>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {selectedReport.admin_notes && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Admin Notes</h3>
                                    <div className="bg-gray-750 rounded-lg p-4">
                                        <p className="text-gray-300 whitespace-pre-wrap">{selectedReport.admin_notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => updateComplaintStatus('in_progress')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                                >
                                    Mark In Progress
                                </button>
                                <button
                                    onClick={() => updateComplaintStatus('resolved')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    onClick={() => setShowSuspendModal(true)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors flex items-center gap-2"
                                >
                                    <Ban size={16} />
                                    Suspend User
                                </button>
                                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors">
                                    Contact Users
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend User Modal */}
            {showSuspendModal && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <Ban className="w-6 h-6 text-red-400" />
                                <h2 className="text-xl font-bold text-white">Suspend User</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm block mb-2">
                                    User to Suspend
                                </label>
                                <p className="text-white font-medium">
                                    {selectedReport.reported_user_name} ({selectedReport.reported_user_type})
                                </p>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm block mb-2">
                                    Suspension Reason *
                                </label>
                                <textarea
                                    value={suspensionReason}
                                    onChange={(e) => setSuspensionReason(e.target.value)}
                                    placeholder="Enter the reason for suspension..."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm block mb-2">
                                    Duration (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={suspensionDuration}
                                    onChange={(e) => setSuspensionDuration(e.target.value)}
                                    placeholder="e.g., 7 days, 1 month, permanent..."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSuspendUser}
                                    disabled={!suspensionReason}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                                >
                                    Confirm Suspension
                                </button>
                                <button
                                    onClick={() => setShowSuspendModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsComplaints;