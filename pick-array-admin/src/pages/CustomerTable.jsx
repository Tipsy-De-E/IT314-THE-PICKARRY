import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, UserX } from 'lucide-react';
import '../styles/customer-table.css';

const CustomerTable = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const customers = [
    {
      id: '04',
      name: 'J.A. Juntilla',
      email: 'JamesAnt@gmail.com',
      phone: '+639616265275',
      totalOrders: 15,
      status: 'Active'
    },
    {
      id: '04',
      name: 'J.A. Juntilla',
      email: 'JamesAnt@gmail.com',
      phone: '+639616265275',
      totalOrders: 15,
      status: 'Inactive'
    },
    {
      id: '01',
      name: 'Scottie mafren',
      email: 'Scot2@gmail.com',
      phone: '+639616265275',
      totalOrders: 15,
      status: 'Pending'
    },
    {
      id: '02',
      name: 'Kuya Sam',
      email: 'Sammy@gmail.com',
      phone: '+639616265275',
      totalOrders: 15,
      status: 'Active'
    },
    {
      id: '03',
      name: 'Jerick Rival',
      email: 'Jerick01@gmail.com',
      phone: '+639616265275',
      totalOrders: 15,
      status: 'Inactive'
    }
  ];

  const filterOptions = ['All', 'Active', 'Inactive', 'Pending', 'Suspended'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || customer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });


  const handleAction = (action, customer) => {
    if (action === 'view') {
      navigate(`/admin/customer/profile/${customer.id}`);
    } else if (action === 'suspend') {
      console.log('Suspend customer:', customer);
    }
    setActionMenuOpen(null);
  };

  return (
    <div className="customer-table-content">
      <div className="customer-table-title-container">
        <h1 className="customer-table-title">Customer Table</h1>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="filter-button"
          >
            <span>Filter</span>
            <Filter className="w-4 h-4" />
          </button>

          {filterOpen && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-content">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedFilter(option);
                      setFilterOpen(false);
                    }}
                    className={`filter-option ${selectedFilter === option ? 'filter-option-selected' : 'filter-option-default'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-overflow">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-header-cell">ID</th>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Email/Contact</th>
                <th className="table-header-cell">Total Orders</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell-id">{customer.id}</td>
                  <td className="table-cell-name">{customer.name}</td>
                  <td className="table-cell-contact">
                    <div className="table-cell-email">{customer.email}</div>
                    <div className="table-cell-phone">{customer.phone}</div>
                  </td>
                  <td className="table-cell-orders">{customer.totalOrders}</td>
                  <td className="table-cell-status">
                    <span className={`status-text status-${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="table-cell-actions">
                    <div className="action-container">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)}
                        className="action-button"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === index && (
                        <div className="action-menu">
                          <div className="action-menu-content">
                            <button
                              onClick={() => handleAction('view', customer)}
                              className="action-menu-button"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleAction('suspend', customer)}
                              className="action-menu-button action-menu-button-suspend"
                            >
                              <UserX className="w-4 h-4" />
                              <span>Suspend</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;