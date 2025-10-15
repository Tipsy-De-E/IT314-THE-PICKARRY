import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setUserSession } from '../../utils/auth';
import '../../styles/customer-auth.css';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    agreeToTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Handle login
      if (formData.email === 'customer@gmail.com' && formData.password === '1234567890') {
        setUserSession('customer', { email: formData.email, name: 'Customer' });
        navigate('/customer/home');
      } else if (formData.email === 'courier@gmail.com' && formData.password === '1234567890') {
        setUserSession('courier', { email: formData.email, name: 'Courier' });
        navigate('/courier/home');
      } else if (formData.email === 'admin@gmail.com' && formData.password === '1234567890') {
        setUserSession('admin', { email: formData.email, name: 'Admin' });
        navigate('/admin');
      } else {
        alert('Invalid credentials. Please use valid email and password.');
      }
    } else {
      // Handle signup - show verification
      if (!formData.agreeToTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
      setPhoneNumber(formData.phone);
      setShowVerification(true);
    }
  };

  const handleVerification = (e) => {
    e.preventDefault();
    // Simulate verification
    if (verificationCode === '7875') {
      setUserSession('customer', { 
        email: formData.email, 
        name: formData.fullName || 'Customer' 
      });
      navigate('/customer/home');
    } else {
      alert('Invalid verification code. Please try 7875');
    }
  };

  if (showVerification) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <div className="verification-logo">
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
          </div>
          
          <div className="verification-content">
            <p className="verification-message">
              We sent a message with a code to
            </p>
            <p className="phone-number">{phoneNumber}</p>
            
            <form onSubmit={handleVerification} className="verification-form">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="verification-input"
                maxLength="4"
                required
              />
              <button type="submit" className="continue-btn">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-auth-container">
      {/* Left Side - Branding */}
      <div className="auth-branding-enhanced">
        <div className="brand-content-enhanced">
          <div className="brand-logo-enhanced">
            <div className="logo-icon-enhanced">
              <div className="delivery-person-enhanced">
                <div className="person-body-enhanced"></div>
                <div className="person-head-enhanced"></div>
                <div className="delivery-bag-enhanced"></div>
              </div>
              <div className="scooter-enhanced">
                <div className="scooter-body-enhanced"></div>
                <div className="wheel-enhanced wheel-front-enhanced"></div>
                <div className="wheel-enhanced wheel-back-enhanced"></div>
              </div>
            </div>
            <div className="brand-text-enhanced">
              <h1 className="brand-name-enhanced">Pickarry</h1>
              <p className="brand-location-enhanced">Jasaan, Misamis Oriental</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-form-container-enhanced">
        <div className="auth-form-wrapper-enhanced">
          {/* Tab Navigation */}
          <div className="auth-tabs-enhanced">
            <button
              className={`auth-tab-enhanced ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button
              className={`auth-tab-enhanced ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="auth-form-enhanced" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input-enhanced"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row-enhanced">
                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Date Of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-input-enhanced"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Gender</label>
                    <div className="gender-options">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleInputChange}
                        />
                        <span className="radio-custom"></span>
                        <span>Male</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleInputChange}
                        />
                        <span className="radio-custom"></span>
                        <span>Female</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="form-group-enhanced">
              <label className="form-label-enhanced">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input-enhanced"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input-enhanced"
                    placeholder="+63"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input-enhanced"
                    placeholder="Enter Your Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group-enhanced">
              <label className="form-label-enhanced">Password</label>
              <div className="password-input-wrapper-enhanced">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input-enhanced password-input-enhanced"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-enhanced"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="terms-section">
                <label className="checkbox-wrapper-enhanced">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="checkbox-custom-enhanced"></span>
                  <span className="checkbox-label-enhanced">
                    I agree to the{' '}
                    <a href="#" className="terms-link">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="terms-link">Privacy Policy</a>.
                  </span>
                </label>
              </div>
            )}

            <button type="submit" className="auth-submit-btn-enhanced">
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;