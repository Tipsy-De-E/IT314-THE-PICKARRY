import React from 'react';
import { ArrowLeft, Phone, Mail, MapPin, CreditCard, Car, Palette, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const CourierProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const courierData = {
    id: id || 'COU_01',
    name: 'James Kie Baby',
    status: 'Active',
    vehicle: 'Motorcycle',
    phone: '+639123456789',
    email: 'JamesKie2@gmail.com',
    address: 'Kimaya, Jasaan, Misamis Oriental',
    orderSummary: {
      total: 12,
      completed: 10,
      canceled: 10,
      pending: 0
    },
    recentOrders: [
      {
        orderId: 'ORD-1001',
        courier: 'Juan Luna',
        amount: '₱850',
        date: 'Aug 20',
        status: 'Delivered'
      },
      {
        orderId: 'ORD-1001',
        courier: 'Juan Luna',
        amount: '₱850',
        date: 'Aug 20',
        status: 'Canceled'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Delivered':
        return 'text-green-400';
      case 'Canceled':
        return 'text-red-400';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 p-6 border-b border-teal-500">
        <button
          onClick={() => navigate('/admin/courier')}
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
              <h2 className="text-2xl font-bold text-white mb-2">{courierData.name}</h2>
              <p className="text-gray-400 mb-1">{courierData.id}</p>
              <p className="text-gray-400">{courierData.vehicle}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(courierData.status)}`}></div>
                <span className="text-white font-medium">{courierData.status}</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border-b border-gray-600">
                <Phone className="w-5 h-5 text-teal-400" />
                <span className="text-white">{courierData.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border-b border-gray-600">
                <Mail className="w-5 h-5 text-teal-400" />
                <span className="text-white">{courierData.email}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                <MapPin className="w-5 h-5 text-teal-400" />
                <span className="text-white">{courierData.address}</span>
              </div>
            </div>
          </div>

          {/* Driver's License & Vehicle Details */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Driver's Licence</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors w-full justify-center">
                <CreditCard className="w-5 h-5" />
                <span>[View Licence]</span>
              </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-400 text-sm">Type of Vehicle:</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-400 text-sm">Plate number:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-400 text-sm">Vehicle Brand:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-400 text-sm">Vehicle color:</span>
                </div>
              </div>
              <button className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
                Other Details ...
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.total}</p>
              <p className="text-gray-400 text-sm">Total Orders:</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.completed}</p>
              <p className="text-gray-400 text-sm">Completed:</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.canceled}</p>
              <p className="text-gray-400 text-sm">Canceled:</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{courierData.orderSummary.pending}</p>
              <p className="text-gray-400 text-sm">Pending:</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Recent Orders</h4>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">OrderID</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Courier</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courierData.recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-gray-700 last:border-b-0">
                      <td className="py-3 px-4 text-white">{order.orderId}</td>
                      <td className="py-3 px-4 text-white">{order.courier}</td>
                      <td className="py-3 px-4 text-white">{order.amount}</td>
                      <td className="py-3 px-4 text-white">{order.date}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierProfile;