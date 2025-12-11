import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, Truck, Shield, Star, ArrowLeft, AlertCircle, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { setUserSession } from '../../utils/auth';
import { notificationService } from '../../hooks/notificationService';
import logo from '../../assets/images/LOGO.png';
import '../../styles/customer-auth.css';
import bcrypt from 'bcryptjs';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form validation states
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    agreeToTerms: ''
  });

  const [fieldStates, setFieldStates] = useState({
    email: 'default',
    password: 'default',
    confirmPassword: 'default',
    fullName: 'default',
    dateOfBirth: 'default',
    gender: 'default',
    phone: 'default',
    address: 'default'
  });

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

  // Date picker state
  const [datePickerDate, setDatePickerDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate()
  });

  // Suspension modal state
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionData, setSuspensionData] = useState(null);

  // Generate years (from current year back to 1900)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  // Months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days based on selected month and year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(datePickerDate.month, datePickerDate.year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check for auto-open instructions from landing page
  useEffect(() => {
    if (location.state?.autoOpenSignUp) {
      setIsLogin(false);
    } else if (location.state?.autoOpenLogin) {
      setIsLogin(true);
    }
  }, [location.state]);

  // Update days when month or year changes
  useEffect(() => {
    const newDaysInMonth = getDaysInMonth(datePickerDate.month, datePickerDate.year);
    if (datePickerDate.day > newDaysInMonth) {
      setDatePickerDate(prev => ({ ...prev, day: newDaysInMonth }));
    }
  }, [datePickerDate.month, datePickerDate.year]);

  // --- DEFAULT ADMIN CREDENTIALS ---
  const DEFAULT_ADMIN = {
    email: 'admin@gmail.com',
    password: '1234567890',
    name: 'Admin'
  };

  // Animation variants
  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const stepVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateFullName = (fullName) => {
    if (!fullName) return 'Full name is required';
    if (fullName.length < 2) return 'Full name must be at least 2 characters';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const validateDateOfBirth = (date) => {
    if (!date) return 'Date of birth is required';

    // Check if date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return 'Date of birth cannot be in the future';
    }

    // Check if user is at least 13 years old
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 13);

    if (selectedDate > minDate) {
      return 'You must be at least 13 years old';
    }

    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, formData.password);
      case 'fullName':
        return validateFullName(value);
      case 'phone':
        return validatePhone(value);
      case 'dateOfBirth':
        return validateDateOfBirth(value);
      case 'gender':
        return !value ? 'Gender is required' : '';
      case 'address':
        return !value ? 'Address is required' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    // Update field state
    setFieldStates({
      ...fieldStates,
      [name]: 'default'
    });

    // If date of birth is typed manually, update date picker state
    if (name === 'dateOfBirth' && value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setDatePickerDate({
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate()
          });
        }
      } catch (err) {
        console.error('Error parsing date:', err);
      }
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormErrors({
      ...formErrors,
      [name]: error
    });

    setFieldStates({
      ...fieldStates,
      [name]: error ? 'error' : 'success'
    });
  };

  const handleDatePickerSelect = () => {
    const selectedDate = new Date(datePickerDate.year, datePickerDate.month, datePickerDate.day);
    const formattedDate = selectedDate.toISOString().split('T')[0];

    setFormData({
      ...formData,
      dateOfBirth: formattedDate
    });

    setShowDatePicker(false);

    // Validate the selected date
    const error = validateDateOfBirth(formattedDate);
    setFormErrors({
      ...formErrors,
      dateOfBirth: error
    });

    setFieldStates({
      ...fieldStates,
      dateOfBirth: error ? 'error' : 'success'
    });
  };

  const handleDatePickerChange = (type, value) => {
    setDatePickerDate(prev => {
      const newState = { ...prev, [type]: parseInt(value) };

      // Adjust day if it exceeds days in month
      if (type === 'month' || type === 'year') {
        const daysInNewMonth = getDaysInMonth(
          type === 'month' ? parseInt(value) : newState.month,
          type === 'year' ? parseInt(value) : newState.year
        );
        if (newState.day > daysInNewMonth) {
          newState.day = daysInNewMonth;
        }
      }

      return newState;
    });
  };

  const validateStep = (step) => {
    const errors = {};
    const states = { ...fieldStates };

    if (step === 1) {
      errors.fullName = validateFullName(formData.fullName);
      errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
      errors.gender = !formData.gender ? 'Gender is required' : '';

      states.fullName = errors.fullName ? 'error' : formData.fullName ? 'success' : 'default';
      states.dateOfBirth = errors.dateOfBirth ? 'error' : formData.dateOfBirth ? 'success' : 'default';
      states.gender = errors.gender ? 'error' : formData.gender ? 'success' : 'default';
    }

    if (step === 2) {
      errors.email = validateEmail(formData.email);
      errors.phone = validatePhone(formData.phone);
      errors.address = !formData.address ? 'Address is required' : '';

      states.email = errors.email ? 'error' : formData.email ? 'success' : 'default';
      states.phone = errors.phone ? 'error' : formData.phone ? 'success' : 'default';
      states.address = errors.address ? 'error' : formData.address ? 'success' : 'default';
    }

    if (step === 3) {
      errors.password = validatePassword(formData.password);
      errors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);

      states.password = errors.password ? 'error' : formData.password ? 'success' : 'default';
      states.confirmPassword = errors.confirmPassword ? 'error' : formData.confirmPassword ? 'success' : 'default';
    }

    setFormErrors(errors);
    setFieldStates(states);

    return Object.values(errors).every(error => error === '');
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  // Enhanced suspension check function
  const checkSuspension = async (userId, userType = 'customer') => {
    try {
      console.log(`🔍 Checking suspension for ${userType} ID:`, userId);

      const tableName = userType === 'customer' ? 'customer_suspensions' : 'courier_suspensions';
      const idField = userType === 'customer' ? 'customer_id' : 'courier_id';

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idField, userId)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error checking suspension:', error);
        return null;
      }

      console.log(`📋 Suspension data found:`, data);

      // Return the first active suspension if exists, otherwise null
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error checking suspension:', error);
      return null;
    }
  };

  // Check if suspension should be automatically lifted
  const checkAutoLiftSuspension = async (suspension, userId, userType = 'customer') => {
    if (suspension.is_permanent) {
      console.log('🔒 Permanent suspension - cannot auto-lift');
      return false;
    }

    if (suspension.scheduled_lift_date && new Date(suspension.scheduled_lift_date) <= new Date()) {
      console.log('🔄 Auto-lifting expired suspension');

      // Auto-lift the suspension
      const tableName = userType === 'customer' ? 'customer_suspensions' : 'courier_suspensions';

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ status: 'lifted' })
        .eq('id', suspension.id);

      if (updateError) {
        console.error('❌ Error auto-lifting suspension:', updateError);
        return false;
      }

      // Update user status
      const userTable = userType === 'customer' ? 'customers' : 'couriers';
      const statusField = userType === 'customer' ? 'status' : 'application_status';

      const { error: userUpdateError } = await supabase
        .from(userTable)
        .update({ [statusField]: 'active' })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('❌ Error updating user status after auto-lift:', userUpdateError);
      }

      console.log('✅ Suspension auto-lifted successfully');
      return true;
    }

    console.log('⏳ Suspension still active, no auto-lift needed');
    return false;
  };

  const handleSignUp = async () => {
    if (!formData.agreeToTerms) {
      setFormErrors({
        ...formErrors,
        agreeToTerms: 'Please agree to Terms & Privacy'
      });
      return;
    }

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 [SIGNUP] Starting signup process...');

      // Check existing email or phone
      const { data: existing, error: existingError } = await supabase
        .from('customers')
        .select('id')
        .or(`email.eq.${formData.email},phone.eq.${formData.phone}`);

      if (existingError) {
        console.error('🔴 [SIGNUP] Error checking existing users:', existingError);
      }

      if (existing && existing.length > 0) {
        console.log('🟡 [SIGNUP] User already exists');
        setFormErrors({
          ...formErrors,
          email: 'Email or phone already exists'
        });
        setIsLoading(false);
        return;
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(formData.password, 10);
      console.log('🟢 [SIGNUP] Password hashed');

      // Insert new customer
      console.log('🟢 [SIGNUP] Inserting customer into database...');
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          full_name: formData.fullName,
          email: formData.email.toLowerCase(),
          password: hashedPassword,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          status: 'active',
          total_orders: 0
        }])
        .select();

      if (error) {
        console.error('🔴 [SIGNUP] Error creating customer:', error);
        throw error;
      }

      console.log('✅ [SIGNUP] Customer created successfully. ID:', data[0].id);

      // CRITICAL: Check if notificationService is available
      console.log('🟡 [NOTIFICATION] Checking notificationService:', typeof notificationService);

      if (!notificationService) {
        console.error('🔴 [NOTIFICATION] notificationService is undefined!');
        alert('Notification service not available, but signup successful.');
      } else {
        console.log('🟢 [NOTIFICATION] notificationService found, calling notifyNewCustomerSignup...');

        // Notify admin about new customer signup
        try {
          const notificationResult = await notificationService.notifyNewCustomerSignup({
            id: data[0].id,
            full_name: formData.fullName,
            email: formData.email,
            created_at: new Date().toISOString()
          });

          console.log('✅ [NOTIFICATION] Admin notification completed:', notificationResult);

          if (notificationResult && notificationResult.length > 0) {
            console.log(`✅ [NOTIFICATION] ${notificationResult.length} notifications created`);
          } else {
            console.log('🟡 [NOTIFICATION] No notifications were created (empty array)');
          }
        } catch (notifyError) {
          console.error('🔴 [NOTIFICATION] Failed to send admin notification:', notifyError);
          console.error('🔴 [NOTIFICATION] Error details:', notifyError.message);
        }
      }

      setUserSession('customer', {
        id: data[0].id,
        email: formData.email,
        name: formData.fullName
      });

      console.log('✅ [SIGNUP] User session set, showing welcome modal');
      setShowWelcomeModal(true);

    } catch (err) {
      console.error('🔴 [SIGNUP] Signup failed:', err);
      alert('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Validate login form
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFormErrors({
        email: emailError,
        password: passwordError
      });
      setFieldStates({
        ...fieldStates,
        email: emailError ? 'error' : 'default',
        password: passwordError ? 'error' : 'default'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 [LOGIN] Attempting login for:', formData.email);

      // --- Check Default Admin First ---
      if (
        formData.email.toLowerCase() === DEFAULT_ADMIN.email &&
        formData.password === DEFAULT_ADMIN.password
      ) {
        console.log('👑 Admin login detected');

        // Fetch the actual admin record from database
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', DEFAULT_ADMIN.email.toLowerCase())
          .maybeSingle();

        if (adminError || !adminData) {
          // Create admin record if it doesn't exist (fallback)
          const { data: newAdmin, error: createError } = await supabase
            .from('admins')
            .insert([{
              email: DEFAULT_ADMIN.email.toLowerCase(),
              name: DEFAULT_ADMIN.name,
              role: 'super_admin',
              status: 'active'
            }])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Failed to create admin record:', createError);
            // Still allow login with fallback session
            setUserSession('admin', {
              id: 'fallback-admin-id',
              email: DEFAULT_ADMIN.email,
              name: DEFAULT_ADMIN.name
            });
          } else {
            setUserSession('admin', {
              id: newAdmin.id,
              email: newAdmin.email,
              name: newAdmin.name
            });
          }
        } else {
          setUserSession('admin', {
            id: adminData.id,
            email: adminData.email,
            name: adminData.name
          });
        }

        navigate('/admin');
        return;
      }

      // --- Regular Customer Login ---
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (customerError || !customerData) {
        console.log('👤 Not a customer, checking courier...');

        // Check if it's a courier
        const { data: courierData, error: courierError } = await supabase
          .from('couriers')
          .select('*')
          .eq('email', formData.email.toLowerCase())
          .maybeSingle();

        if (courierError || !courierData) {
          console.log('❌ Invalid credentials - user not found');
          setFormErrors({
            email: 'No account found with this email',
            password: 'Please check your credentials'
          });
          setFieldStates({
            email: 'error',
            password: 'error'
          });
          setIsLoading(false);
          return;
        }

        console.log('🚚 Courier found:', courierData.full_name);

        // Verify password for courier
        if (!bcrypt.compareSync(formData.password, courierData.password)) {
          console.log('❌ Invalid password for courier');
          setFormErrors({
            password: 'Wrong password'
          });
          setFieldStates({
            ...fieldStates,
            password: 'error'
          });
          setIsLoading(false);
          return;
        }

        // Courier login - Check if account is suspended
        console.log('🔍 Checking courier suspension status...');
        if (courierData.application_status === 'suspended') {
          console.log('🚫 Courier account is suspended');

          // Check for detailed suspension info
          const suspension = await checkSuspension(courierData.id, 'courier');
          if (suspension) {
            console.log('📋 Suspension record found:', suspension);

            const wasLifted = await checkAutoLiftSuspension(suspension, courierData.id, 'courier');
            if (!wasLifted) {
              console.log('🔄 Setting up suspension modal for courier');
              setSuspensionData({
                ...suspension,
                userType: 'courier',
                userName: courierData.full_name,
                userEmail: courierData.email,
                userPhone: courierData.phone
              });
              setShowSuspensionModal(true);
              setIsLoading(false);
              return;
            } else {
              console.log('✅ Suspension was auto-lifted, proceeding with login');
              // Continue with normal login since suspension was lifted
            }
          } else {
            // Account is suspended but no suspension record found - show modal anyway
            console.log('⚠️ Account suspended but no suspension record found');
            setSuspensionData({
              userType: 'courier',
              userName: courierData.full_name,
              userEmail: courierData.email,
              suspension_reason: 'Account suspended by administrator',
              is_permanent: false,
              suspended_at: new Date().toISOString()
            });
            setShowSuspensionModal(true);
            setIsLoading(false);
            return;
          }
        }

        // If we reach here, courier is not suspended or suspension was lifted
        setUserSession('courier', {
          id: courierData.id,
          email: courierData.email,
          name: courierData.full_name
        });
        navigate('/courier/dashboard');
        return;
      }

      console.log('👤 Customer found:', customerData.full_name);

      // Verify password for customer
      if (!bcrypt.compareSync(formData.password, customerData.password)) {
        console.log('❌ Invalid password for customer');
        setFormErrors({
          password: 'Wrong password'
        });
        setFieldStates({
          ...fieldStates,
          password: 'error'
        });
        setIsLoading(false);
        return;
      }

      // Customer login - Check if account is suspended
      console.log('🔍 Checking customer suspension status...');
      if (customerData.status === 'suspended') {
        console.log('🚫 Customer account is suspended');

        // Check for detailed suspension info
        const suspension = await checkSuspension(customerData.id, 'customer');
        if (suspension) {
          console.log('📋 Suspension record found:', suspension);

          const wasLifted = await checkAutoLiftSuspension(suspension, customerData.id, 'customer');
          if (!wasLifted) {
            console.log('🔄 Setting up suspension modal for customer');
            setSuspensionData({
              ...suspension,
              userType: 'customer',
              userName: customerData.full_name,
              userEmail: customerData.email,
              userPhone: customerData.phone
            });
            setShowSuspensionModal(true);
            setIsLoading(false);
            return;
          } else {
            console.log('✅ Suspension was auto-lifted, proceeding with login');
            // Continue with normal login since suspension was lifted
          }
        } else {
          // Account is suspended but no suspension record found - show modal anyway
          console.log('⚠️ Account suspended but no suspension record found');
          setSuspensionData({
            userType: 'customer',
            userName: customerData.full_name,
            userEmail: customerData.email,
            suspension_reason: 'Account suspended by administrator',
            is_permanent: false,
            suspended_at: new Date().toISOString()
          });
          setShowSuspensionModal(true);
          setIsLoading(false);
          return;
        }
      }

      // If we reach here, customer is not suspended or suspension was lifted
      console.log('✅ Login successful, setting user session');
      setUserSession('customer', {
        id: customerData.id,
        email: formData.email,
        name: customerData.full_name
      });
      navigate('/customer/home');

    } catch (err) {
      console.error('❌ Login failed:', err);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      if (currentStep < 3) {
        if (validateStep(currentStep)) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        handleSignUp();
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
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
    setFormErrors({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: '',
      agreeToTerms: ''
    });
    setFieldStates({
      email: 'default',
      password: 'default',
      confirmPassword: 'default',
      fullName: 'default',
      dateOfBirth: 'default',
      gender: 'default',
      phone: 'default',
      address: 'default'
    });
    setShowDatePicker(false);
  };

  const handleWelcomeContinue = () => {
    setShowWelcomeModal(false);
    navigate('/customer/home');
  };

  const handleSuspensionModalClose = () => {
    setShowSuspensionModal(false);
    setSuspensionData(null);
    // Clear the form
    setFormData(prev => ({ ...prev, password: '' }));
  };

  // Format suspension duration for display
  const formatSuspensionDuration = (suspension) => {
    if (suspension.is_permanent) {
      return 'Permanent Suspension';
    }

    if (suspension.scheduled_lift_date) {
      const liftDate = new Date(suspension.scheduled_lift_date);
      const now = new Date();
      const diffTime = liftDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return 'Suspension ending today';
      }

      return `${diffDays} day${diffDays > 1 ? 's' : ''} (until ${liftDate.toLocaleDateString()})`;
    }

    if (suspension.duration_days) {
      return `${suspension.duration_days} day${suspension.duration_days > 1 ? 's' : ''}`;
    }

    return 'Duration not specified';
  };

  // Calculate remaining days for progress bar
  const calculateRemainingDays = (suspension) => {
    if (suspension.is_permanent) return 0;

    if (suspension.scheduled_lift_date) {
      const liftDate = new Date(suspension.scheduled_lift_date);
      const now = new Date();
      const suspendedDate = new Date(suspension.suspended_at || suspension.created_at);
      const totalDuration = Math.ceil((liftDate - suspendedDate) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.ceil((liftDate - now) / (1000 * 60 * 60 * 24));

      const progress = Math.max(0, Math.min(100, (remainingDays / totalDuration) * 100));
      console.log(`📊 Suspension progress: ${progress}% (${remainingDays}/${totalDuration} days remaining)`);
      return progress;
    }

    return 50; // Default progress if no specific dates
  };

  // Helper function to get input styles based on field state
  const getInputStyles = (fieldName) => {
    const state = fieldStates[fieldName];

    switch (state) {
      case 'error':
        return 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200';
      case 'success':
        return 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200';
      default:
        return 'border-gray-300 bg-white focus:border-teal-500 focus:ring-teal-200';
    }
  };

  return (
    <motion.div
      className="enhanced-auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Suspension Modal with Tailwind CSS */}
      <AnimatePresence>
        {showSuspensionModal && suspensionData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-5 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSuspensionModalClose}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 border border-gray-600 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-lg"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div
                className="text-center mb-8 pb-6 border-b border-gray-600"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border border-red-400"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, delay: 0.3 }}
                >
                  <AlertCircle size={32} className="text-white" />
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold text-red-400 mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Account Suspended
                </motion.h2>
                <motion.p
                  className="text-gray-400 text-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your account has been temporarily suspended
                </motion.p>
              </motion.div>

              {/* User Information */}
              <motion.div
                className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-xl p-6 mb-6 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={18} />
                  Account Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b border-gray-600">
                    <User size={16} className="text-teal-400" />
                    <span className="text-gray-300 font-medium min-w-16">Name:</span>
                    <span className="text-white font-medium">{suspensionData.userName}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-gray-600">
                    <Mail size={16} className="text-teal-400" />
                    <span className="text-gray-300 font-medium min-w-16">Email:</span>
                    <span className="text-white font-medium">{suspensionData.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <Phone size={16} className="text-teal-400" />
                    <span className="text-gray-300 font-medium min-w-16">Type:</span>
                    <span className="text-white font-medium capitalize">{suspensionData.userType}</span>
                  </div>
                </div>
              </motion.div>

              {/* Suspension Details */}
              <motion.div
                className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-xl p-6 mb-6 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Suspension Information
                </h3>

                {/* Suspension Progress */}
                {!suspensionData.is_permanent && (
                  <motion.div
                    className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  >
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${calculateRemainingDays(suspensionData)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
                      <Clock size={14} />
                      <span>{formatSuspensionDuration(suspensionData)}</span>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {/* Suspension Reason */}
                  <div className="space-y-2">
                    <strong className="text-gray-300 text-sm flex items-center gap-2">
                      📝 Suspension Reason:
                    </strong>
                    <p className="text-white bg-gray-900 p-3 rounded-lg border-l-4 border-red-500 font-medium">
                      {suspensionData.suspension_reason || suspensionData.reason || 'No reason provided'}
                    </p>
                  </div>

                  {/* Suspension Type */}
                  <div className="space-y-2">
                    <strong className="text-gray-300 text-sm flex items-center gap-2">
                      ⚡ Suspension Type:
                    </strong>
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm border ${suspensionData.is_permanent
                      ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400 border-opacity-40'
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400 border-opacity-40'
                      }`}>
                      {suspensionData.is_permanent ? 'Permanent Suspension' : 'Temporary Suspension'}
                    </span>
                  </div>

                  {/* Duration */}
                  {!suspensionData.is_permanent && (
                    <div className="space-y-2">
                      <strong className="text-gray-300 text-sm flex items-center gap-2">
                        ⏰ Duration:
                      </strong>
                      <span className="text-white">{formatSuspensionDuration(suspensionData)}</span>
                    </div>
                  )}

                  {/* Scheduled Lift Date */}
                  {suspensionData.scheduled_lift_date && !suspensionData.is_permanent && (
                    <div className="space-y-2">
                      <strong className="text-gray-300 text-sm flex items-center gap-2">
                        📅 Scheduled Reactivation:
                      </strong>
                      <span className="text-white">
                        {new Date(suspensionData.scheduled_lift_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Suspension Notes */}
                  {(suspensionData.suspension_notes || suspensionData.notes) && (
                    <div className="space-y-2">
                      <strong className="text-gray-300 text-sm flex items-center gap-2">
                        📋 Additional Notes:
                      </strong>
                      <p className="text-gray-300 bg-gray-900 p-3 rounded-lg border-l-4 border-gray-500 italic text-sm">
                        {suspensionData.suspension_notes || suspensionData.notes}
                      </p>
                    </div>
                  )}

                  {/* Suspension Date */}
                  <div className="space-y-2">
                    <strong className="text-gray-300 text-sm flex items-center gap-2">
                      📅 Suspended On:
                    </strong>
                    <span className="text-white">
                      {new Date(suspensionData.suspended_at || suspensionData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Important Notice */}
              <motion.div
                className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-xl p-6 mb-6 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center gap-2 mb-3 text-yellow-400">
                  <AlertCircle size={18} />
                  <strong className="text-base">Important Notice</strong>
                </div>
                <p className="text-yellow-300 mb-4 leading-relaxed">
                  {suspensionData.is_permanent ? (
                    "This is a permanent suspension. Your account access has been permanently revoked due to serious violations of our terms of service."
                  ) : (
                    <>
                      Your account access has been temporarily restricted.
                      <strong> You will be able to access your account automatically after the suspension period ends.</strong>
                      {" "}The admin may also choose to reactivate your account earlier at their discretion.
                    </>
                  )}
                </p>
                <div className="bg-gray-900 bg-opacity-60 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-300 text-sm">
                    <strong>Need help?</strong> If you believe this is a mistake or want to appeal the suspension,
                    please contact our support team at <span className="text-teal-400 font-semibold hover:text-teal-300 cursor-pointer">support@pickarry.com</span>
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex gap-4 justify-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <motion.button
                  className="px-8 py-3 bg-gray-600 bg-opacity-60 text-gray-200 border border-gray-500 rounded-xl font-semibold hover:bg-gray-500 hover:bg-opacity-80 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg relative overflow-hidden"
                  onClick={handleSuspensionModalClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  I Understand
                </motion.button>
                <motion.button
                  className="px-8 py-3 bg-red-600 bg-opacity-60 text-white border border-red-500 rounded-xl font-semibold hover:bg-red-500 hover:bg-opacity-80 transition-all duration-300 transform hover:-translate-y-1 shadow-lg relative overflow-hidden"
                  onClick={() => window.location.href = 'mailto:support@pickarry.com'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Support
                </motion.button>
              </motion.div>

              {/* Admin Note */}
              <motion.div
                className="bg-teal-500 bg-opacity-10 border border-teal-500 border-opacity-30 rounded-xl p-4 text-center backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <p className="text-teal-400 text-sm flex items-center justify-center gap-2">
                  💡 <strong>Note:</strong> Account reactivation can be done anytime by the administrator.
                  {!suspensionData.is_permanent && " The system will automatically lift the suspension when the duration period ends."}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-lg flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 border border-gray-600 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6   flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, delay: 0.3 }}
                >

                  <img src="/src/assets/images/THEPICKARRY.png" alt="Pickarry" className="landing-page-logo"></img>
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Welcome to Pickarry!
                </motion.h2>
                <motion.p
                  className="text-gray-300 text-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your account has been successfully created
                </motion.p>
              </motion.div>

              {/* Message */}
              <motion.div
                className="mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-gray-400 text-center leading-relaxed">
                  Thank you for joining our community. Your account is ready to use and you can start exploring our services immediately.
                </p>
              </motion.div>

              {/* Features */}
              <motion.div
                className="space-y-4 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div
                  className="flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-600 hover:border-teal-500 transition-all duration-300 hover:transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-teal-500 bg-opacity-20 rounded-lg flex items-center justify-center border border-teal-500 border-opacity-30">
                    <Truck className="text-teal-400" size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold">Fast Delivery</h4>
                    <p className="text-gray-400 text-sm">Quick and reliable service</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-600 hover:border-teal-500 transition-all duration-300 hover:transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-teal-500 bg-opacity-20 rounded-lg flex items-center justify-center border border-teal-500 border-opacity-30">
                    <Shield className="text-teal-400" size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold">Secure & Safe</h4>
                    <p className="text-gray-400 text-sm">Protected transactions</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-600 hover:border-teal-500 transition-all duration-300 hover:transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-teal-500 bg-opacity-20 rounded-lg flex items-center justify-center border border-teal-500 border-opacity-30">
                    <Star className="text-teal-400" size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold">Exclusive Offers</h4>
                    <p className="text-gray-400 text-sm">Special deals for you</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                className="flex justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.button
                  onClick={handleWelcomeContinue}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 w-full max-w-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Exploring
                </motion.button>
              </motion.div>

              {/* Footer Note */}
              <motion.div
                className="mt-6 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <p className="text-gray-500 text-sm">
                  Need help? Contact us at{" "}
                  <span className="text-teal-400 font-semibold">support@pickarry.com</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Landing Page Button */}
      <motion.button
        className="back-to-landing-btn"
        onClick={handleBackToLanding}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{
          x: 5,
          backgroundColor: "rgba(20, 184, 166, 0.9)"
        }}
      >
        <ArrowLeft size={20} />
        Back to Home
      </motion.button>

      <motion.div
        className="auth-branding-enhanced"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="brand-logo-enhanced">
          <motion.img
            src={logo}
            alt="Pickarry Logo"
            className="logo-image-enhanced"
            whileHover={{ scale: 1.1, rotate: 5 }}
          />
          <p className="brand-location-enhanced">Jasaan, Misamis Oriental</p>
        </div>
      </motion.div>

      <div className="auth-form-container-enhanced">
        <motion.div
          className="auth-form-wrapper-enhanced"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="auth-tabs-enhanced">
            <motion.button
              className={`auth-tab-enhanced ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                resetForm();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log In
            </motion.button>
            <motion.button
              className={`auth-tab-enhanced ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                resetForm();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Step Indicator for Signup */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                className="step-indicator"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="step-item">
                  <motion.div
                    className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}
                    whileHover={{ scale: 1.2 }}
                  >
                    1
                  </motion.div>
                  <div className="step-line"></div>
                  <div className="step-label">Personal</div>
                </div>
                <div className="step-item">
                  <motion.div
                    className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}
                    whileHover={{ scale: 1.2 }}
                  >
                    2
                  </motion.div>
                  <div className="step-line"></div>
                  <div className="step-label">Contact</div>
                </div>
                <div className="step-item">
                  <motion.div
                    className={`step-circle ${currentStep >= 3 ? 'active' : ''}`}
                    whileHover={{ scale: 1.2 }}
                  >
                    3
                  </motion.div>
                  <div className="step-label">Security</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="auth-form-enhanced" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* LOGIN FORM */}
              {isLogin && (
                <motion.div
                  key="login"
                  className="form-step"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="form-group-enhanced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`form-input-enhanced ${getInputStyles('email')}`}
                      required
                    />
                    {formErrors.email && (
                      <motion.p
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle size={14} />
                        {formErrors.email}
                      </motion.p>
                    )}
                  </motion.div>
                  <motion.div
                    className="form-group-enhanced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="form-label">Password</label>
                    <div className="password-input-wrapper-enhanced">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`form-input-enhanced password-input-enhanced ${getInputStyles('password')}`}
                        required
                      />
                      <motion.button
                        type="button"
                        className="password-toggle-enhanced"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </motion.button>
                    </div>
                    {formErrors.password && (
                      <motion.p
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle size={14} />
                        {formErrors.password}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* SIGNUP FORM STEPS */}
              {!isLogin && (
                <motion.div
                  key={`signup-step-${currentStep}`}
                  className="form-step"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className={`form-input-enhanced ${getInputStyles('fullName')}`}
                          required
                        />
                        {formErrors.fullName && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.fullName}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Date of Birth Field with Custom Picker */}
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="form-label">Date of Birth</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="dateOfBirth"
                            placeholder="MM/DD/YYYY"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className={`form-input-enhanced w-full ${getInputStyles('dateOfBirth')}`}
                            required
                          />
                          <motion.button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-500"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Calendar size={20} />
                          </motion.button>
                        </div>
                        {formErrors.dateOfBirth && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.dateOfBirth}
                          </motion.p>
                        )}

                        {/* Custom Date Picker Modal */}
                        <AnimatePresence>
                          {showDatePicker && (
                            <motion.div
                              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowDatePicker(false)}
                            >
                              <motion.div
                                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Date Picker Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-xl font-bold text-white">Select Date of Birth</h3>
                                  <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="text-gray-400 hover:text-white text-lg"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Date Picker Content */}
                                <div className="space-y-4">
                                  {/* Month Selection */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                                    <select
                                      value={datePickerDate.month}
                                      onChange={(e) => handleDatePickerChange('month', e.target.value)}
                                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                      {months.map((month, index) => (
                                        <option key={index} value={index} className="bg-gray-800">
                                          {month}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Year and Day Selection Row */}
                                  <div className="flex gap-4">
                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                                      <select
                                        value={datePickerDate.year}
                                        onChange={(e) => handleDatePickerChange('year', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                      >
                                        {years.map((year) => (
                                          <option key={year} value={year} className="bg-gray-800">
                                            {year}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-gray-300 mb-2">Day</label>
                                      <select
                                        value={datePickerDate.day}
                                        onChange={(e) => handleDatePickerChange('day', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                      >
                                        {days.map((day) => (
                                          <option key={day} value={day} className="bg-gray-800">
                                            {day}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Selected Date Display */}
                                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                    <p className="text-gray-300 text-sm mb-1">Selected Date:</p>
                                    <p className="text-white font-semibold text-lg">
                                      {months[datePickerDate.month]} {datePickerDate.day}, {datePickerDate.year}
                                    </p>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3 pt-4">
                                    <motion.button
                                      type="button"
                                      onClick={() => setShowDatePicker(false)}
                                      className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Cancel
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      onClick={handleDatePickerSelect}
                                      className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                                      whileHover={{ scale: 1.02, y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Select Date
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Footer Note */}
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                  <p className="text-gray-400 text-sm text-center">
                                    You must be at least 13 years old to register
                                  </p>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Gender Field with Styled Dropdown */}
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="form-label">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className={`
                            w-full px-4 py-3 rounded-lg border bg-gray-800 text-white 
                            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                            transition-all duration-200
                            ${fieldStates.gender === 'error'
                              ? 'border-red-500'
                              : fieldStates.gender === 'success'
                                ? 'border-green-500'
                                : 'border-gray-600 hover:border-teal-400'}
                            appearance-none
                            bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2314b8a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
                            bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]
                            pr-10
                          `}
                          required
                        >
                          <option value="" className="bg-gray-800 text-gray-300">Select your gender</option>
                          <option value="male" className="bg-gray-800 text-white">Male</option>
                          <option value="female" className="bg-gray-800 text-white">Female</option>
                        </select>
                        {formErrors.gender && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.gender}
                          </motion.p>
                        )}
                      </motion.div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className={`form-input-enhanced ${getInputStyles('email')}`}
                          required
                        />
                        {formErrors.email && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.email}
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className={`form-input-enhanced ${getInputStyles('phone')}`}
                          required
                        />
                        {formErrors.phone && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.phone}
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          name="address"
                          placeholder="Enter your complete address"
                          value={formData.address}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className={`form-input-enhanced ${getInputStyles('address')}`}
                          required
                        />
                        {formErrors.address && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.address}
                          </motion.p>
                        )}
                      </motion.div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="form-label">Password</label>
                        <div className="password-input-wrapper-enhanced">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className={`form-input-enhanced password-input-enhanced ${getInputStyles('password')}`}
                            required
                          />
                          <motion.button
                            type="button"
                            className="password-toggle-enhanced"
                            onClick={() => setShowPassword(!showPassword)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                        {formErrors.password && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.password}
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="form-label">Confirm Password</label>
                        <div className="password-input-wrapper-enhanced">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className={`form-input-enhanced password-input-enhanced ${getInputStyles('confirmPassword')}`}
                            required
                          />
                        </div>
                        {formErrors.confirmPassword && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.confirmPassword}
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div
                        className="form-group-enhanced"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="checkbox-wrapper-enhanced">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="agreeToTerms" className="checkbox-custom-enhanced"></label>
                          <span className="checkbox-label-enhanced">
                            I agree to <a href="#" className="terms-link">Terms & Privacy</a>
                          </span>
                        </div>
                        {formErrors.agreeToTerms && (
                          <motion.p
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={14} />
                            {formErrors.agreeToTerms}
                          </motion.p>
                        )}
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="form-navigation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {!isLogin && currentStep > 1 && (
                <motion.button
                  type="button"
                  className="nav-btn previous-btn"
                  onClick={handlePreviousStep}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Previous
                </motion.button>
              )}
              <motion.button
                type="submit"
                className={`nav-btn auth-submit-btn-enhanced ${isLogin ? 'login-btn' : ''}`}
                disabled={isLoading}
                whileHover={{
                  scale: isLoading ? 1 : 1.05,
                  y: isLoading ? 0 : -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.div>
                ) : (
                  isLogin ? 'Log In' : (currentStep < 3 ? 'Next' : 'Sign Up')
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerAuth;