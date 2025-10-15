import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronDown, Navigation, Plus, Minus, ChevronLeft, ChevronRight, Upload, X, CreditCard, AlertTriangle, DollarSign, Smartphone } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/customer-home.css';


const CustomerHome = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryItem, setDeliveryItem] = useState('');
  const [selectedService, setSelectedService] = useState('Pasundo');
  const [bookForDelivery, setBookForDelivery] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isRushDelivery, setIsRushDelivery] = useState(false);
  const [rushAmount, setRushAmount] = useState('');
  const [isWaitingForCourier, setIsWaitingForCourier] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);

  const vehicles = [
    { id: 1, type: 'Tricycle', price: 20, icon: '🛺' },
    { id: 2, type: 'Motorcycle', price: 20, icon: '🏍️' },
    { id: 3, type: 'Jeepney', price: 20, icon: '🚐' },
    { id: 4, type: 'Van', price: 25, icon: '🚐' },
    { id: 5, type: 'Truck', price: 30, icon: '🚛' }
  ];

  const categories = [
    'Pagkaon & Sud-an',
    'Documents',
    'School Supplies',
    'Electronics',
    'Clothing',
    'Medicine',
    'Others'
  ];

  const handleOrder = () => {
    if (!pickupLocation || !deliveryLocation || !deliveryItem || !selectedVehicle || !selectedPayment || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields, select a vehicle, choose a payment method, and set delivery time');
      return;
    }

    // Calculate total cost
    const vehiclePrice = vehicles.find(v => v.id === selectedVehicle)?.price || 0;
    const rushFee = rushAmount ? parseFloat(rushAmount) : 0;
    const totalCost = vehiclePrice + rushFee;

    // Enter waiting state for courier acceptance
    setIsWaitingForCourier(true);
  };

  const handleCancelOrder = () => {
    setIsWaitingForCourier(false);
  };

  const handleTimeSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    setShowTimeModal(false);
  };

  const handleDescriptionSubmit = () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    if (uploadedPhotos.length < 3) {
      alert('Please upload at least 3 photos');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (rushAmount && parseFloat(rushAmount) <= 0) {
      alert('Please enter a valid rush delivery amount or leave it empty');
      return;
    }
    setDeliveryItem(description);
    setShowDescriptionModal(false);
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (uploadedPhotos.length + files.length > 10) {
      alert('Maximum 10 photos allowed');
      return;
    }
    const newPhotos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const nextVehicles = () => {
    if (currentVehicleIndex + 3 < vehicles.length) {
      setCurrentVehicleIndex(currentVehicleIndex + 1);
    }
  };

  const prevVehicles = () => {
    if (currentVehicleIndex > 0) {
      setCurrentVehicleIndex(currentVehicleIndex - 1);
    }
  };

  const getVisibleVehicles = () => {
    return vehicles.slice(currentVehicleIndex, currentVehicleIndex + 3);
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };
  return (
    <div className="customer-home">
      {/* Header */}
      <div className="customer-header">
        <div className="header-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>
        <div className="header-right">
          <div className="customer-profile">
            <div className="profile-avatar">
              <span>C</span>
            </div>
            <span className="profile-name">Customer</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="customer-content">
        {/* Sidebar */}
        <div className="customer-sidebar">
          <div className="customer-profile-card">
            <div className="profile-avatar-large">
              <span>C</span>
            </div>
            <div className="profile-info">
              <h3>Customer</h3>
              <p>customer@gmail.com</p>
            </div>
          </div>

          <nav className="customer-nav">
            <button
              onClick={() => navigate('/customer/home')}
              className="nav-item active"
            >
              <div className="nav-icon">🏠</div>
              <span>Home</span>
            </button>

            <button
              onClick={() => navigate('/customer/orders')}
              className="nav-item"
            >
              <div className="nav-icon">🛒</div>
              <span>Order</span>
            </button>

            <button
              onClick={() => navigate('/customer/menu')}
              className="nav-item"
            >
              <div className="nav-icon">☰</div>
              <span>Menu</span>
            </button>
          </nav>

        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Booking Form */}
          <div className="booking-form">
            <div className="form-section">
              <div className="form-group">
                <div className="input-with-icon" onClick={() => setShowLocationModal(true)}>
                  <input
                    type="text"

                    placeholder="Where to pickup?"
                    value={pickupLocation}
                    readOnly
                  />
                  <ChevronDown className="chevron-icon" />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="text"
                    placeholder="Where to deliver?"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                  <ChevronDown className="chevron-icon" />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon" onClick={() => setShowDescriptionModal(true)}>
                  <input
                    type="text"
                    placeholder="What to Deliver?"
                    value={deliveryItem}
                    readOnly
                  />
                  <ChevronDown className="chevron-icon" />
                </div>
              </div>
            </div>

            <div className="booking-options">
              <div className="option-row">
                <div className="service-dropdown">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="service-select"
                  >
                    <option value="Pasundo">Pasundo</option>
                    <option value="Pasugo">Pasugo</option>
                  </select>
                </div>
                <div className="option-item checkbox-item">
                  <span>Book For Delivery</span>
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      id="bookDelivery"
                      checked={bookForDelivery}
                      onChange={(e) => setBookForDelivery(e.target.checked)}
                    />
                    <label htmlFor="bookDelivery"></label>
                  </div>
                </div>
              </div>

              <div className="option-row">
                <div className="option-item" onClick={() => setShowPaymentModal(true)}>
                  <CreditCard className="option-icon" />
                  <span>{selectedPayment || 'Select Payment'}</span>
                </div>
                <div className="option-item" onClick={() => setShowTimeModal(true)}>
                  <Clock className="option-icon" />
                  <span>{selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Set Delivery Time'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="vehicle-selection">
              <button
                className={`vehicle-nav-btn prev ${currentVehicleIndex === 0 ? 'disabled' : ''}`}
                onClick={prevVehicles}
                disabled={currentVehicleIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="vehicles-container">
                {getVisibleVehicles().map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`vehicle-card ${selectedVehicle === vehicle.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <div className="vehicle-icon">{vehicle.icon}</div>
                    <div className="vehicle-type">{vehicle.type}</div>
                    <div className="vehicle-price">₱{vehicle.price}</div>
                  </div>
                ))}
              </div>

              <button
                className={`vehicle-nav-btn next ${currentVehicleIndex + 3 >= vehicles.length ? 'disabled' : ''}`}
                onClick={nextVehicles}
                disabled={currentVehicleIndex + 3 >= vehicles.length}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button className="order-button" onClick={handleOrder}>
              Order
            </button>
          </div>

          {/* Map Section */}
          <div className="map-section">
            {/* <div className="map-header">
              <MapPin className="map-header-icon" />
               <span>Cabacungan Zone 8</span> 
            </div>  */}

            <div className="map-container">
              <div className="map-placeholder">
                <div className="map-controls">
                  <button className="map-control-btn">
                    <Plus size={20} />
                  </button>
                  <button className="map-control-btn">
                    <Minus size={20} />
                  </button>
                  <button className="map-control-btn navigation-btn">
                    <Navigation size={20} />
                  </button>
                </div>
                <div className="location-marker pickup-marker">
                  <div className="marker-icon pickup">📍</div>
                </div>
                <div className="location-marker delivery-marker">
                  <div className="marker-icon delivery">🏠</div>
                </div>
              </div>
            </div>

            <div className="location-info">
              <div className="location-header">
                <h3>Where to Pickup</h3>
              </div>
              <div className="location-details">
                <MapPin className="location-icon" />
                <span>Cabacungan Zone 8</span>
              </div>
              <button className="done-button">Done</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="customer-footer">
        <div className="footer-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>

        <div className="footer-links">
          <a href="#" className="footer-link">Contact Us</a>
          <a href="#" className="footer-link">Terms of Use</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Rider's Policy</a>
          <a href="#" className="footer-link">Customer's Policy</a>
        </div>

        <div className="footer-copyright">
          <p>INFERNO Copyright © 2021 Inferno - All rights reserved || Designed By: Mahesh</p>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Pickup Location</h3>
            <input
              type="text"
              placeholder="Search location..."
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
            <button onClick={() => setShowLocationModal(false)}>Done</button>
          </div>
        </div>
      )}



      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="modal-overlay" onClick={() => setShowDescriptionModal(false)}>
          <div className="description-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button
                className="back-button"
                onClick={() => setShowDescriptionModal(false)}
              >
                <ChevronLeft size={24} />
              </button>
              <h3>Description To Deliver</h3>
              <span className="required-text">*Required Field</span>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <div className="category-dropdown">
                  <button
                    className="category-button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span>{selectedCategory || 'Category'}</span>
                    <ChevronDown size={16} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="category-options">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="category-option"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <span style={{ flex: 1, textAlign: 'left' }}>{category}</span>
                          {category === 'Pagkaon & Sud-an' && (
                            <div className="category-image">
                              {/* <img src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop" alt="Food" /> */}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="upload-button"
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <Upload size={16} />
                  Upload Photos ({uploadedPhotos.length}/10)
                </button>
                <span className="upload-note">*Minimum 3 photos required</span>

                {uploadedPhotos.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '8px',
                    marginTop: '12px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid #14b8a6'
                      }}>
                        <img
                          src={photo.url}
                          alt="Uploaded"
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.8)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="description-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Ipadali | Rush
                </label>
                <input
                  type="number"
                  placeholder="Enter Rush Amount"
                  value={rushAmount}
                  onChange={(e) => {
                    setRushAmount(e.target.value);
                    setIsRushDelivery(e.target.value && parseFloat(e.target.value) > 0);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '2px solid #14b8a6',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                className="submit-button"
                onClick={handleDescriptionSubmit}
                disabled={uploadedPhotos.length < 3}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setSelectedPayment('Cash on Delivery (COD)');
                  setShowPaymentModal(false);
                }}
                style={{
                  padding: '16px',
                  background: selectedPayment === 'Cash on Delivery (COD)' ? '#14b8a6' : 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid #14b8a6',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <DollarSign size={20} />
                Cash on Delivery (COD)
              </button>
              <button
                onClick={() => {
                  setSelectedPayment('GCash');
                  setShowPaymentModal(false);
                }}
                style={{
                  padding: '16px',
                  background: selectedPayment === 'GCash' ? '#14b8a6' : 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid #14b8a6',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Smartphone size={20} />
                GCash
              </button>
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '24px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Modal */}
      {showTimeModal && (
        <div className="modal-overlay" onClick={() => setShowTimeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Delivery Date & Time</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '16px',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid #14b8a6',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{
                  padding: '16px',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid #14b8a6',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>
            <button
              onClick={handleTimeSubmit}
              style={{
                width: '100%',
                padding: '16px',
                background: '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '24px'
              }}
            >
              Set Time
            </button>
            <button
              onClick={() => setShowTimeModal(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Waiting for Courier Modal */}
      {isWaitingForCourier && (
        <div className="modal-overlay" onClick={() => { }}>
          <div className="waiting-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="waiting-modal-header">
              <button className="cancel-modal-button" onClick={handleCancelOrder}>
                <X size={24} />
              </button>
            </div>

            <div className="waiting-header">
              {/* <div className="waiting-icon">⏳</div> */}
              <h2>Waiting for Courier</h2>
              <p>Your service request has been submitted. We're finding the best courier for your delivery.</p>
            </div>

            <div className="waiting-body">
              <div className="waiting-details-section">
                <div className="waiting-details">
                  <div className="detail-item">
                    <div className="detail-label-with-icon">
                      <MapPin className="detail-icon" size={16} />
                      <span>Pickup Location:</span>
                    </div>
                    <span className="detail-value">{pickupLocation || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Location:</span>
                    <span className="detail-value">{deliveryLocation}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service:</span>
                    <span className="detail-value">{selectedService}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{vehicles.find(v => v.id === selectedVehicle)?.type || 'Not selected'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle Price:</span>
                    <span className="detail-value">₱{vehicles.find(v => v.id === selectedVehicle)?.price || 0}</span>
                  </div>
                  {rushAmount && parseFloat(rushAmount) > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Rush Fee:</span>
                      <span className="detail-value">₱{rushAmount}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value">₱{(vehicles.find(v => v.id === selectedVehicle)?.price || 0) + (rushAmount ? parseFloat(rushAmount) : 0)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Time:</span>
                    <span className="detail-value">{selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">{selectedPayment}</span>
                  </div>
                </div>

                <div className="waiting-actions">
                  <button className="report-issue-button" onClick={() => alert('Report issue functionality would be implemented here')}>
                    <AlertTriangle size={16} />
                    Report Issue
                  </button>
                </div>
              </div>

              <div className="waiting-map-section">
                <div className="map-container modal-map-container">
                  <div className="map-placeholder">
                    <div className="map-controls">
                      <button className="map-control-btn">
                        <Plus size={20} />
                      </button>
                      <button className="map-control-btn">
                        <Minus size={20} />
                      </button>
                      <button className="map-control-btn navigation-btn">
                        <Navigation size={20} />
                      </button>
                    </div>
                    <div className="location-marker pickup-marker">
                      <div className="marker-icon pickup">📍</div>
                    </div>
                    <div className="location-marker delivery-marker">
                      <div className="marker-icon delivery">🏠</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHome;