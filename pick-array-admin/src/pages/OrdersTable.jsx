import React, { useState } from 'react';
import { MapPin, User, Truck } from 'lucide-react';
import SearchFilter from '../components/SearchFilter';
import StatusBadge from '../components/StatusBadge';
import ActionMenu from '../components/ActionMenu';

const OrdersTable = () => {
  const [searchValue, setSearchValue] = useState('');

  const orders = [
    {
      id: 'Pasugo',
      pickupLocation: 'Kimaya, Jasaan Misamis Oriental',
      deliveryLocation: 'Aplaya, Jasaan Misamis Oriental',
      courierId: 'Courier ID',
      clientId: 'Client ID',
      category: 'Food & Beverage',
      status: 'Delivered',
      date: '23 May 2024 19:21 - 20:12'
    },
    {
      id: 'Pasugo',
      pickupLocation: 'Kimaya, Jasaan Misamis Oriental',
      deliveryLocation: 'Aplaya, Jasaan Misamis Oriental',
      courierId: 'Courier ID',
      clientId: 'Client ID',
      category: 'Documents & Papers',
      status: 'Canceled',
      date: '23 May 2024 19:21 - 20:12'
    },
    {
      id: 'Pasugo',
      pickupLocation: 'Kimaya, Jasaan Misamis Oriental',
      deliveryLocation: 'Aplaya, Jasaan Misamis Oriental',
      courierId: 'Courier ID',
      clientId: 'Client ID',
      category: 'Household & Hardware',
      status: 'Pending',
      date: '23 May 2024 19:21 - 20:12'
    },
    {
      id: 'Pasugo',
      pickupLocation: 'Kimaya, Jasaan Misamis Oriental',
      deliveryLocation: 'Aplaya, Jasaan Misamis Oriental',
      courierId: 'Courier ID',
      clientId: 'Client ID',
      category: 'Other / Miscellaneous',
      status: 'Canceled',
      date: '23 May 2024 19:21 - 20:12'
    }
  ];

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.pickupLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.deliveryLocation.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders Table</h1>
      </div>

      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showCategoryFilter={true}
      />

      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-bold text-white">{order.id}</h3>
                <span className="text-gray-400 text-sm">{order.date}</span>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={order.status} />
                <ActionMenu />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Pickup Location</p>
                    <p className="text-white">{order.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Delivery Location</p>
                    <p className="text-white">{order.deliveryLocation}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-400 text-sm">{order.courierId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">{order.clientId}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white">{order.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTable;