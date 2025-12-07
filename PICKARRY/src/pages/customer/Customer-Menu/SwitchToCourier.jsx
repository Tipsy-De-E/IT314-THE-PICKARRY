import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, Upload, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '../../../utils/auth';
import { supabase } from '../../../utils/supabaseClient';
import '../../../styles/Customer-css/css-Menu/SwitchToCourier.css';

const SwitchToCourier = ({ onBack }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',

        // Vehicle Information
        vehicleType: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        plateNumber: '',
        otherDetails: '',

        // Documents
        licenseImage: null,
        licenseImagePreview: '',
        vehicleRegistration: null,
        vehicleRegistrationPreview: '',

        // Agreement
        agreeToTerms: false,
        agreeToBackgroundCheck: false
    });

    // Fetch current user data
    useEffect(() => {
        fetchCurrentUser();
        checkStorageAccess();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const session = await getCurrentUser();
            console.log('Session in fetchCurrentUser:', session);

            if (!session) {
                console.error('No session found, redirecting to auth');
                navigate('/customer/auth');
                return;
            }

            console.log('Checking courier status for:', session.email);

            // Check if user already has a courier application
            const { data: existingCourier, error } = await supabase
                .from('couriers')
                .select('*')
                .eq('email', session.email)
                .single();

            console.log('Existing courier data:', existingCourier);
            console.log('Error:', error);

            if (existingCourier && !error) {
                if (existingCourier.application_status === 'approved') {
                    // User is already an approved courier
                    console.log('User is approved courier, switching immediately...');
                    alert('You are already an approved courier! Switching to courier mode...');
                    await handleSwitchToCourierMode();
                    return;
                } else if (existingCourier.application_status === 'pending') {
                    alert('Your courier application is still pending approval.');
                    return;
                } else if (existingCourier.application_status === 'rejected') {
                    alert('Your previous courier application was rejected. Please contact support.');
                    return;
                }
            }

            // If no existing courier record or error, pre-fill form with user data
            console.log('No existing courier record, pre-filling form...');

            // Pre-fill form with user data from customers table
            const { data: customerData } = await supabase
                .from('customers')
                .select('*')
                .eq('email', session.email)
                .single();

            if (customerData) {
                setFormData(prev => ({
                    ...prev,
                    fullName: customerData.full_name || '',
                    email: customerData.email || '',
                    phone: customerData.phone || '',
                    address: customerData.address || '',
                    city: customerData.city || '',
                    zipCode: customerData.zip_code || ''
                }));
                setCurrentUser(customerData);
            } else {
                // If no customer data, use session data
                setFormData(prev => ({
                    ...prev,
                    email: session.email || '',
                    fullName: session.full_name || session.user_metadata?.full_name || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Check storage access and create bucket if needed
    const checkStorageAccess = async () => {
        try {
            // List buckets to check access
            const { data: buckets, error } = await supabase.storage.listBuckets();

            if (error) {
                console.error('Error accessing storage:', error);
                return;
            }

            console.log('Available buckets:', buckets);

            // Check if courier-documents bucket exists
            const courierBucket = buckets?.find(bucket => bucket.name === 'courier-documents');

            if (!courierBucket) {
                console.warn('courier-documents bucket does not exist. Please create it in Supabase dashboard.');
                alert('Storage bucket not configured. Please contact administrator.');
                return;
            }

            console.log('Courier documents bucket found:', courierBucket);

        } catch (error) {
            console.error('Error checking storage access:', error);
        }
    };

    const handleMenuClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/customer/menu');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please upload an image file (JPEG, PNG, etc.)');
                    return;
                }

                const previewUrl = URL.createObjectURL(file);
                setFormData(prev => ({
                    ...prev,
                    [name]: file,
                    [`${name}Preview`]: previewUrl
                }));
            }
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // FIXED: Enhanced file upload with better error handling
    const uploadFile = async (file, folder) => {
        try {
            console.log('Starting file upload:', file.name, 'Size:', file.size, 'Type:', file.type);

            const session = await getCurrentUser();
            if (!session) {
                throw new Error('No user session found');
            }

            // Get user email for file naming
            const userEmail = session.email || 'user';
            const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');

            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${folder}_${sanitizedEmail}_${Date.now()}.${fileExt}`;

            console.log('Uploading to path:', fileName);

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('courier-documents')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Supabase storage upload error:', error);

                // Provide more specific error messages
                if (error.message.includes('row-level security policy')) {
                    throw new Error('Storage permission denied. Please contact administrator to configure storage permissions.');
                } else if (error.message.includes('bucket')) {
                    throw new Error('Storage bucket not found. Please contact administrator.');
                } else {
                    throw new Error(`Storage error: ${error.message}`);
                }
            }

            console.log('File uploaded successfully:', data);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('courier-documents')
                .getPublicUrl(fileName);

            console.log('Public URL generated:', urlData.publicUrl);
            return urlData.publicUrl;

        } catch (error) {
            console.error('Error in uploadFile function:', error);
            throw new Error(`Failed to upload document: ${error.message}`);
        }
    };

    // Alternative upload method using base64 as fallback
    const uploadFileAlternative = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const session = await getCurrentUser();
            console.log('Session in handleSubmit:', session);

            if (!session) {
                alert('Please log in again.');
                navigate('/customer/auth');
                return;
            }

            console.log('User session:', session);

            // Get the complete customer data including ID
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', session.email)
                .single();

            if (customerError) {
                console.error('Error fetching customer data:', customerError);
                throw customerError;
            }

            console.log('Customer data:', customerData);

            // Validate required fields
            if (!formData.fullName.trim()) {
                alert('Please enter your full name');
                setLoading(false);
                return;
            }

            if (!formData.licenseImage) {
                alert('Driver\'s license is required');
                setLoading(false);
                return;
            }

            // Upload documents to Supabase Storage
            let licenseImageUrl = '';
            let vehicleRegistrationUrl = '';

            console.log('Starting document uploads...');

            // Upload license image
            if (formData.licenseImage) {
                console.log('Uploading license image:', formData.licenseImage.name);
                try {
                    licenseImageUrl = await uploadFile(formData.licenseImage, 'license');
                    console.log('License image uploaded successfully:', licenseImageUrl);
                } catch (uploadError) {
                    console.error('License image upload failed:', uploadError);

                    // Try alternative method as fallback
                    console.log('Trying alternative upload method...');
                    try {
                        licenseImageUrl = await uploadFileAlternative(formData.licenseImage);
                        console.log('License image stored as base64');
                    } catch (altError) {
                        console.error('Alternative upload also failed:', altError);
                        alert(`Failed to upload license image: ${uploadError.message}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Upload vehicle registration (optional)
            if (formData.vehicleRegistration) {
                console.log('Uploading vehicle registration:', formData.vehicleRegistration.name);
                try {
                    vehicleRegistrationUrl = await uploadFile(formData.vehicleRegistration, 'registration');
                    console.log('Vehicle registration uploaded successfully:', vehicleRegistrationUrl);
                } catch (uploadError) {
                    console.error('Vehicle registration upload failed:', uploadError);
                    // Continue even if registration fails since it's optional
                    console.log('Vehicle registration upload failed, but continuing since optional');

                    // Try alternative method
                    try {
                        vehicleRegistrationUrl = await uploadFileAlternative(formData.vehicleRegistration);
                        console.log('Vehicle registration stored as base64');
                    } catch (altError) {
                        console.error('Alternative upload for registration failed:', altError);
                    }
                }
            }

            console.log('All documents processed, inserting courier application...');

            // Prepare the data for insertion
            const courierData = {
                customer_id: customerData.id,
                email: formData.email,
                full_name: formData.fullName,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zip_code: formData.zipCode,
                vehicle_type: formData.vehicleType,
                vehicle_brand: formData.vehicleBrand,
                vehicle_model: formData.vehicleModel,
                vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
                vehicle_color: formData.vehicleColor,
                plate_number: formData.plateNumber,
                other_details: formData.otherDetails,
                license_image_url: licenseImageUrl,
                vehicle_registration_url: vehicleRegistrationUrl,
                application_status: 'pending',
                background_check_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Inserting courier data:', courierData);

            // Insert courier application into Supabase
            const { data, error } = await supabase
                .from('couriers')
                .insert([courierData])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error details:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                // Check if it's a duplicate error
                if (error.code === '23505') { // Unique violation
                    alert('You already have a courier application. Please check your application status.');
                } else if (error.message.includes('row-level security policy')) {
                    alert('Database permission denied. Please contact administrator to configure database permissions.');
                } else {
                    throw error;
                }
                return;
            }

            console.log('Courier application inserted successfully:', data);

            // Update user session
            const currentUserSession = await getCurrentUser();
            if (currentUserSession) {
                const updatedUser = {
                    ...currentUserSession,
                    role: 'customer',
                    hasPendingCourierApplication: true,
                    courierApplicationId: data.id
                };
                localStorage.setItem('userSession', JSON.stringify(updatedUser));
                console.log('User session updated with pending application');
            }

            alert('Your courier application has been submitted successfully! You will be notified once approved.');

            // Navigate back to menu
            if (onBack) {
                onBack();
            } else {
                navigate('/customer/menu');
            }

        } catch (error) {
            console.error('Detailed error in handleSubmit:', error);
            console.error('Error stack:', error.stack);

            // More specific error messages
            if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
                alert('Permission denied. Please contact administrator to configure database and storage permissions.');
            } else if (error.message.includes('users')) {
                alert('Database configuration error. Please contact support.');
            } else {
                alert(`There was an error submitting your application: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to switch user to courier mode
    const handleSwitchToCourierMode = async () => {
        try {
            console.log('=== SWITCH TO COURIER MODE START ===');

            // Get current session first
            let session = await getCurrentUser();
            console.log('Current session from getCurrentUser():', session);

            if (!session) {
                console.error('No session found from getCurrentUser()');
                alert('Please log in again.');
                navigate('/customer/auth');
                return;
            }

            // Update user session to courier mode
            const updatedUser = {
                ...session,
                role: 'courier',
                isApprovedCourier: true,
                hasPendingCourierApplication: false
            };

            // Save to localStorage
            localStorage.setItem('userSession', JSON.stringify(updatedUser));

            console.log('User session updated to courier role:', updatedUser);

            // Navigate to courier home
            console.log('Navigating to /courier/home');
            navigate('/courier/home');

        } catch (error) {
            console.error('Error switching to courier mode:', error);
            alert('Error switching to courier mode. Please try again.');
        }
    };

    const vehicleTypes = [
        { value: 'motorcycle', label: 'Motorcycle' },
        { value: 'bicycle', label: 'Bicycle' },
        { value: 'car', label: 'Car' },
        { value: 'scooter', label: 'Scooter' },
        { value: 'walking', label: 'Walking' }
    ];

    const steps = [
        { number: 1, title: 'Personal Info', completed: currentStep > 1 },
        { number: 2, title: 'Vehicle Info', completed: currentStep > 2 },
        { number: 3, title: 'Documents', completed: currentStep > 3 },
        { number: 4, title: 'Review & Submit', completed: false }
    ];

    // Check if current step is valid
    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.fullName && formData.email && formData.phone && formData.address;
            case 2:
                return formData.vehicleType && formData.vehicleBrand && formData.plateNumber && formData.vehicleColor;
            case 3:
                return formData.licenseImage;
            case 4:
                return formData.agreeToTerms && formData.agreeToBackgroundCheck;
            default:
                return false;
        }
    };

    return (
        <div className="switch-to-courier">
            <div className="courier-container">
                {/* Header */}
                <div className="courier-header">
                    <button onClick={handleMenuClick} className="back-button">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-content">
                        <div className="title-section">
                            <Bike className="title-icon" />
                            <h1>Become a Courier</h1>
                        </div>
                        <p className="subtitle">Start earning money by delivering with Pickarry</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="progress-steps">
                    {steps.map(step => (
                        <div key={step.number} className={`step ${currentStep === step.number ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                            <div className="step-number">
                                {step.completed ? <CheckCircle size={16} /> : step.number}
                            </div>
                            <span className="step-title">{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="courier-main-content">
                    <form onSubmit={handleSubmit} className="courier-form">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <h2>Personal Information</h2>
                                    <p>Tell us about yourself</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label className="form-label">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="+1 (555) 123-4567"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter your full address"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="12345"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Vehicle Information */}
                        {currentStep === 2 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <h2>Vehicle Information</h2>
                                    <p>Tell us about your delivery vehicle</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Vehicle Type *
                                        </label>
                                        <select
                                            name="vehicleType"
                                            value={formData.vehicleType}
                                            onChange={handleChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select vehicle type</option>
                                            {vehicleTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Vehicle Brand *
                                        </label>
                                        <input
                                            type="text"
                                            name="vehicleBrand"
                                            value={formData.vehicleBrand}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., Honda, Toyota, Yamaha"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Vehicle Model
                                        </label>
                                        <input
                                            type="text"
                                            name="vehicleModel"
                                            value={formData.vehicleModel}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., Civic, Corolla, NMAX"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Vehicle Year
                                        </label>
                                        <input
                                            type="number"
                                            name="vehicleYear"
                                            value={formData.vehicleYear}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="2023"
                                            min="1990"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Vehicle Color *
                                        </label>
                                        <input
                                            type="text"
                                            name="vehicleColor"
                                            value={formData.vehicleColor}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., Red, Blue, Black"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Plate Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="plateNumber"
                                            value={formData.plateNumber}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., ABC123"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">
                                            Additional Vehicle Details
                                        </label>
                                        <textarea
                                            name="otherDetails"
                                            value={formData.otherDetails}
                                            onChange={handleChange}
                                            className="form-textarea"
                                            placeholder="Any additional information about your vehicle (modifications, special features, etc.)"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <h2>Required Documents</h2>
                                    <p>Upload the necessary documents for verification</p>
                                </div>

                                <div className="documents-grid">
                                    <div className="document-upload">
                                        <label className="document-label">
                                            Driver's License *
                                            <span className="document-required">Required</span>
                                        </label>
                                        <p className="document-description">
                                            Upload a clear photo of your valid driver's license
                                        </p>

                                        <div className="upload-area">
                                            <input
                                                type="file"
                                                name="licenseImage"
                                                onChange={handleChange}
                                                accept="image/*"
                                                className="file-input"
                                                required
                                            />
                                            <div className="upload-content">
                                                <Upload size={32} />
                                                <p>Click to upload driver's license</p>
                                                <span>PNG, JPG up to 5MB</span>
                                            </div>
                                        </div>

                                        {formData.licenseImagePreview && (
                                            <div className="preview-container">
                                                <img
                                                    src={formData.licenseImagePreview}
                                                    alt="License preview"
                                                    className="document-preview"
                                                />
                                                <span className="preview-text">Preview</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="document-upload">
                                        <label className="document-label">
                                            Vehicle Registration
                                            <span className="document-optional">Optional</span>
                                        </label>
                                        <p className="document-description">
                                            Upload vehicle registration document (if applicable)
                                        </p>

                                        <div className="upload-area">
                                            <input
                                                type="file"
                                                name="vehicleRegistration"
                                                onChange={handleChange}
                                                accept="image/*"
                                                className="file-input"
                                            />
                                            <div className="upload-content">
                                                <Upload size={32} />
                                                <p>Click to upload registration</p>
                                                <span>PNG, JPG up to 5MB</span>
                                            </div>
                                        </div>

                                        {formData.vehicleRegistrationPreview && (
                                            <div className="preview-container">
                                                <img
                                                    src={formData.vehicleRegistrationPreview}
                                                    alt="Registration preview"
                                                    className="document-preview"
                                                />
                                                <span className="preview-text">Preview</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {currentStep === 4 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <h2>Review & Submit</h2>
                                    <p>Review your information and agree to terms</p>
                                </div>

                                <div className="review-sections">
                                    <div className="review-section">
                                        <h3>Personal Information</h3>
                                        <div className="review-grid">
                                            <div className="review-item">
                                                <span className="review-label">Full Name:</span>
                                                <span className="review-value">{formData.fullName}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Email:</span>
                                                <span className="review-value">{formData.email}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Phone:</span>
                                                <span className="review-value">{formData.phone}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Address:</span>
                                                <span className="review-value">{formData.address}, {formData.city} {formData.zipCode}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="review-section">
                                        <h3>Vehicle Information</h3>
                                        <div className="review-grid">
                                            <div className="review-item">
                                                <span className="review-label">Vehicle Type:</span>
                                                <span className="review-value">
                                                    {vehicleTypes.find(v => v.value === formData.vehicleType)?.label}
                                                </span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Brand & Model:</span>
                                                <span className="review-value">{formData.vehicleBrand} {formData.vehicleModel}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Color:</span>
                                                <span className="review-value">{formData.vehicleColor}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Plate Number:</span>
                                                <span className="review-value">{formData.plateNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="agreement-section">
                                        <div className="agreement-item">
                                            <input
                                                type="checkbox"
                                                name="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onChange={handleChange}
                                                className="agreement-checkbox"
                                                required
                                            />
                                            <label className="agreement-label">
                                                I agree to the <a href="#" className="agreement-link">Courier Terms of Service</a> and <a href="#" className="agreement-link">Privacy Policy</a> *
                                            </label>
                                        </div>

                                        <div className="agreement-item">
                                            <input
                                                type="checkbox"
                                                name="agreeToBackgroundCheck"
                                                checked={formData.agreeToBackgroundCheck}
                                                onChange={handleChange}
                                                className="agreement-checkbox"
                                                required
                                            />
                                            <label className="agreement-label">
                                                I consent to a background check and verification of my documents *
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-navigation">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="nav-button secondary">
                                    Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="nav-button primary"
                                    disabled={!isStepValid()}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="nav-button submit"
                                    disabled={!isStepValid() || loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SwitchToCourier;