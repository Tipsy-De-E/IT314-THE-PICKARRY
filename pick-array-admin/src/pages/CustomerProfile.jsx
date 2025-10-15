import React from 'react';
import { ArrowLeft, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const customerData = {
    id: id || 'CUS_01',
    name: 'James Kie Baby',
    status: 'Active',
    phone: '+639123456789',
    email: 'JamesKie2@gmail.com',
    address: 'Kimaya, Jasaan, Misamis Oriental'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-red-500';
      case 'Pending':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 p-6 border-b border-teal-500">
        <button
          onClick={() => navigate('/admin/customer')}
          className="text-teal-400 hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-3xl font-bold text-teal-400">Profile</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{customerData.name}</h2>
              <p className="text-gray-400 mb-1">{customerData.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(customerData.status)}`}></div>
                <span className="text-white font-medium">{customerData.status}</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border-b border-gray-600">
              <Phone className="w-5 h-5 text-teal-400" />
              <span className="text-white">{customerData.phone}</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border-b border-gray-600">
              <Mail className="w-5 h-5 text-teal-400" />
              <span className="text-white">{customerData.email}</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span className="text-white">{customerData.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;