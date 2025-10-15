  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Search, Filter, MoreVertical, Eye, UserX } from 'lucide-react';
  import '../styles/courier-table.css';
  
  const CourierTable = () => {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
    const couriers = [
      {
        id: '04',
        name: 'J.A. Juntilla',
        email: 'JamesAnt@gmail.com',
        phone: '+639616265275',
        totalDeliveries: 15,
        status: 'Active'
      },
      {
        id: '04',
        name: 'J.A. Juntilla',
        email: 'JamesAnt@gmail.com',
        phone: '+639616265275',
        totalDeliveries: 15,
        status: 'Inactive'
      },
      {
        id: '01',
        name: 'Scottie mafren',
        email: 'Scot2@gmail.com',
        phone: '+639616265275',
        totalDeliveries: 15,
        status: 'Pending'
      },
      {
        id: '02',
        name: 'Kuya Sam',
        email: 'Sammy@gmail.com',
        phone: '+639616265275',
        totalDeliveries: 15,
        status: 'Active'
      },
      {
        id: '03',
        name: 'Jerick Rival',
        email: 'Jerick01@gmail.com',
        phone: '+639616265275',
        totalDeliveries: 15,
        status: 'Inactive'
      }
    ];
  
    const filterOptions = ['All', 'Active', 'Inactive', 'Pending', 'Suspended'];
  
    const filteredCouriers = couriers.filter(courier => {
      const matchesSearch = courier.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                           courier.email.toLowerCase().includes(searchValue.toLowerCase());
      const matchesFilter = selectedFilter === 'All' || courier.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  
  
    const handleAction = (action, courier) => {
      if (action === 'view') {
        navigate(`/admin/courier/profile/${courier.id}`);
      } else if (action === 'suspend') {
        // Suspend courier
        console.log('Suspend courier:', courier);
      }
      setActionMenuOpen(null);
    };
  
    return (
      <div className="courier-table-content">
        <div className="courier-table-title-container">
          <h1 className="courier-table-title">Courier Table</h1>
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
                  <th className="table-header-cell">Total Deliveries</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCouriers.map((courier, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell-id">{courier.id}</td>
                    <td className="table-cell-name">{courier.name}</td>
                    <td className="table-cell-contact">
                      <div className="table-cell-email">{courier.email}</div>
                      <div className="table-cell-phone">{courier.phone}</div>
                    </td>
                    <td className="table-cell-deliveries">{courier.totalDeliveries}</td>
                    <td className="table-cell-status">
                      <span className={`status-text status-${courier.status.toLowerCase()}`}>
                        {courier.status}
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
                                onClick={() => handleAction('view', courier)}
                                className="action-menu-button"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleAction('suspend', courier)}
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
  
  export default CourierTable;