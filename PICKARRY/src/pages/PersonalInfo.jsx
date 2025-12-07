import React, { useState, useEffect } from 'react';
import { User, Camera, Edit3, Save, X, Phone, Mail, Calendar, ArrowLeft, MapPin, Bike, FileText, Eye, RefreshCw } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';
import '../styles/personal-info.css';

const PersonalInfo = ({ onBack, userType = 'customer' }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showLicenseUploadModal, setShowLicenseUploadModal] = useState(false);
    const [showRegistrationUploadModal, setShowRegistrationUploadModal] = useState(false);
    const [syncStatus, setSyncStatus] = useState('');

    // Base form data for both user types
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: ''
    });

    // Courier-specific form data
    const [courierFormData, setCourierFormData] = useState({
        city: '',
        zip_code: '',
        vehicle_type: '',
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_year: '',
        vehicle_color: '',
        plate_number: '',
        other_details: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [licenseImage, setLicenseImage] = useState(null);
    const [licenseImagePreview, setLicenseImagePreview] = useState('');
    const [registrationImage, setRegistrationImage] = useState(null);
    const [registrationImagePreview, setRegistrationImagePreview] = useState('');

    // Fetch user data on component mount and when userType changes
    useEffect(() => {
        fetchUserData();
    }, [userType]);

    // Enhanced fetch function with automatic sync detection
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const session = getCurrentUser();

            if (!session) {
                console.error('No session found');
                return;
            }

            console.log(`🔄 Fetching ${userType} data for:`, session.email);

            if (userType === 'courier') {
                await fetchCourierDataWithSync(session);
            } else {
                await fetchCustomerData(session);
            }

        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    // ENHANCED: Courier data fetch with automatic sync from customer profile
    const fetchCourierDataWithSync = async (session) => {
        try {
            console.log('🔍 DEBUG: Starting enhanced courier data fetch with sync');

            // First, get courier data
            const { data: courierData, error: courierError } = await supabase
                .from('couriers')
                .select('*')
                .eq('email', session.email)
                .single();

            if (courierError) {
                console.error('❌ Error fetching courier data:', courierError);
                throw courierError;
            }

            console.log('📦 Fetched courier data:', courierData);

            // Then, get customer data to check for newer profile information
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', session.email)
                .single();

            console.log('👤 Fetched customer data for sync check:', customerData);

            // Determine which profile has more recent updates
            const courierUpdated = courierData?.updated_at ? new Date(courierData.updated_at) : new Date(0);
            const customerUpdated = customerData?.updated_at ? new Date(customerData.updated_at) : new Date(0);

            console.log('🕒 Update timestamps:', {
                courier: courierUpdated,
                customer: customerUpdated
            });

            let mergedData = { ...courierData };
            let syncPerformed = false;

            // If customer profile has more recent personal info updates, sync to courier
            if (customerData && customerUpdated > courierUpdated) {
                console.log('🔄 Customer profile has newer data, syncing to courier...');

                const syncData = {
                    full_name: customerData.full_name || courierData.full_name,
                    phone: customerData.phone || courierData.phone,
                    address: customerData.address || courierData.address,
                    date_of_birth: (customerData.date_of_birth || courierData.date_of_birth) || null,
                    gender: customerData.gender || courierData.gender,
                    profile_image: customerData.profile_image || courierData.profile_image,
                    updated_at: new Date().toISOString()
                };

                // Update courier table with customer's personal info
                const { error: syncError } = await supabase
                    .from('couriers')
                    .update(syncData)
                    .eq('email', session.email);

                if (!syncError) {
                    console.log('✅ Successfully synced customer data to courier profile');
                    mergedData = { ...mergedData, ...syncData };
                    syncPerformed = true;
                    setSyncStatus('Profile synced from customer account');
                } else {
                    console.warn('⚠️ Could not sync to courier table:', syncError);
                }
            }

            // Merge data with priority to the most recent updates
            mergedData = {
                ...mergedData,
                email: mergedData.email || session.email,
                // Ensure we have the latest profile image
                profile_image: customerData?.profile_image || courierData.profile_image || ''
            };

            console.log('🎯 Final merged data:', mergedData);
            setCurrentUser(mergedData);

            // Set base form data
            setFormData({
                full_name: mergedData.full_name || '',
                email: mergedData.email || '',
                phone: mergedData.phone || '',
                address: mergedData.address || '',
                date_of_birth: mergedData.date_of_birth || '',
                gender: mergedData.gender || ''
            });

            // Set courier-specific data
            setCourierFormData({
                city: mergedData.city || '',
                zip_code: mergedData.zip_code || '',
                vehicle_type: mergedData.vehicle_type || '',
                vehicle_brand: mergedData.vehicle_brand || '',
                vehicle_model: mergedData.vehicle_model || '',
                vehicle_year: mergedData.vehicle_year || '',
                vehicle_color: mergedData.vehicle_color || '',
                plate_number: mergedData.plate_number || '',
                other_details: mergedData.other_details || ''
            });

            // Set images - prioritize customer profile image for consistency
            setLicenseImagePreview(mergedData.license_image_url || '');
            setRegistrationImagePreview(mergedData.vehicle_registration_url || '');
            setProfileImagePreview(mergedData.profile_image || '');

            if (syncPerformed) {
                // Show sync notification for a few seconds
                setTimeout(() => setSyncStatus(''), 5000);
            }

        } catch (error) {
            console.error('Error in fetchCourierDataWithSync:', error);
            const fallbackData = createFallbackData(session, userType);
            setCurrentUser(fallbackData);
            setFormDataFromFallback(fallbackData);
        }
    };

    const fetchCustomerData = async (session) => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('email', session.email)
                .single();

            if (error) {
                console.error('Error fetching customer data:', error);
                throw error;
            }

            console.log('Fetched customer data:', data);
            setCurrentUser(data);

            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                date_of_birth: data.date_of_birth || '',
                gender: data.gender || ''
            });

            setProfileImagePreview(data.profile_image || '');

        } catch (error) {
            console.error('Error in fetchCustomerData:', error);
            const fallbackData = createFallbackData(session, userType);
            setCurrentUser(fallbackData);
            setFormDataFromFallback(fallbackData);
        }
    };

    // Manual sync function
    const handleManualSync = async () => {
        try {
            setSyncing(true);
            const session = getCurrentUser();

            if (!session) return;

            console.log('🔄 Manual sync triggered');
            setSyncStatus('Syncing profiles...');

            // Fetch latest customer data
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', session.email)
                .single();

            if (customerError) {
                console.error('Error fetching customer data for sync:', customerError);
                setSyncStatus('Sync failed');
                return;
            }

            if (userType === 'courier') {
                // Sync customer data to courier profile
                const syncData = {
                    full_name: customerData.full_name,
                    phone: customerData.phone,
                    address: customerData.address,
                    date_of_birth: customerData.date_of_birth || null,
                    gender: customerData.gender,
                    profile_image: customerData.profile_image,
                    updated_at: new Date().toISOString()
                };

                const { error: updateError } = await supabase
                    .from('couriers')
                    .update(syncData)
                    .eq('email', session.email);

                if (!updateError) {
                    console.log('✅ Manual sync successful');
                    setSyncStatus('Profiles synced successfully!');

                    // Update local state
                    setCurrentUser(prev => ({ ...prev, ...syncData }));
                    setFormData(prev => ({ ...prev, ...syncData }));
                    setProfileImagePreview(customerData.profile_image || '');

                    // Clear status after 3 seconds
                    setTimeout(() => setSyncStatus(''), 3000);
                } else {
                    setSyncStatus('Sync failed');
                }
            } else {
                // For customer view, we can sync from courier if needed
                const { data: courierData, error: courierError } = await supabase
                    .from('couriers')
                    .select('*')
                    .eq('email', session.email)
                    .single();

                if (!courierError && courierData) {
                    const courierUpdated = courierData.updated_at ? new Date(courierData.updated_at) : new Date(0);
                    const customerUpdated = customerData.updated_at ? new Date(customerData.updated_at) : new Date(0);

                    if (courierUpdated > customerUpdated) {
                        // Sync courier personal data to customer
                        const syncData = {
                            full_name: courierData.full_name,
                            phone: courierData.phone,
                            address: courierData.address,
                            date_of_birth: courierData.date_of_birth || null,
                            gender: courierData.gender,
                            profile_image: courierData.profile_image,
                            updated_at: new Date().toISOString()
                        };

                        const { error: updateError } = await supabase
                            .from('customers')
                            .update(syncData)
                            .eq('email', session.email);

                        if (!updateError) {
                            setSyncStatus('Profiles synced successfully!');
                            setCurrentUser(prev => ({ ...prev, ...syncData }));
                            setFormData(prev => ({ ...prev, ...syncData }));
                            setProfileImagePreview(courierData.profile_image || '');
                            setTimeout(() => setSyncStatus(''), 3000);
                        }
                    } else {
                        setSyncStatus('Profiles are already in sync');
                        setTimeout(() => setSyncStatus(''), 3000);
                    }
                }
            }

        } catch (error) {
            console.error('Error in manual sync:', error);
            setSyncStatus('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const createFallbackData = (session, userType) => {
        const fallbackData = {
            full_name: session.user_metadata?.full_name || session.full_name || (userType === 'courier' ? 'Courier' : 'Customer'),
            email: session.email || session.user?.email,
            phone: session.user_metadata?.phone || '',
            address: '',
            date_of_birth: '',
            gender: '',
            created_at: session.created_at || new Date().toISOString(),
            profile_image: ''
        };

        if (userType === 'courier') {
            Object.assign(fallbackData, {
                city: '',
                zip_code: '',
                vehicle_type: '',
                vehicle_brand: '',
                vehicle_model: '',
                vehicle_year: '',
                vehicle_color: '',
                plate_number: '',
                other_details: '',
                license_image_url: '',
                vehicle_registration_url: '',
                application_status: '',
                background_check_status: ''
            });
        }

        return fallbackData;
    };

    const setFormDataFromFallback = (fallbackData) => {
        setFormData({
            full_name: fallbackData.full_name,
            email: fallbackData.email,
            phone: fallbackData.phone,
            address: fallbackData.address,
            date_of_birth: fallbackData.date_of_birth,
            gender: fallbackData.gender
        });

        if (userType === 'courier') {
            setCourierFormData({
                city: fallbackData.city || '',
                zip_code: fallbackData.zip_code || '',
                vehicle_type: fallbackData.vehicle_type || '',
                vehicle_brand: fallbackData.vehicle_brand || '',
                vehicle_model: fallbackData.vehicle_model || '',
                vehicle_year: fallbackData.vehicle_year || '',
                vehicle_color: fallbackData.vehicle_color || '',
                plate_number: fallbackData.plate_number || '',
                other_details: fallbackData.other_details || ''
            });
            setLicenseImagePreview(fallbackData.license_image_url || '');
            setRegistrationImagePreview(fallbackData.vehicle_registration_url || '');
        }

        setProfileImagePreview(fallbackData.profile_image || '');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCourierInputChange = (e) => {
        const { name, value } = e.target;
        setCourierFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (JPEG, PNG, etc.)');
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            if (type === 'profile') {
                setProfileImage(file);
                setProfileImagePreview(previewUrl);
            } else if (type === 'license') {
                setLicenseImage(file);
                setLicenseImagePreview(previewUrl);
                setShowLicenseUploadModal(false);
            } else if (type === 'registration') {
                setRegistrationImage(file);
                setRegistrationImagePreview(previewUrl);
                setShowRegistrationUploadModal(false);
            }
        }
    };

    const uploadImage = async (file, type) => {
        try {
            const session = getCurrentUser();
            if (!session) {
                throw new Error('No user session found');
            }

            const userIdentifier = session.user?.id ||
                session.id ||
                session.email?.replace(/[^a-zA-Z0-9]/g, '_') ||
                'user';

            const fileExt = file.name.split('.').pop();
            const fileName = `${userIdentifier}_${type}_${Date.now()}.${fileExt}`;

            console.log('Uploading file:', {
                bucket: 'courier-documents',
                fileName: fileName,
                fileSize: file.size,
                fileType: file.type
            });

            const { data, error } = await supabase.storage
                .from('courier-documents')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            console.log('Upload successful:', data);

            const { data: { publicUrl } } = supabase.storage
                .from('courier-documents')
                .getPublicUrl(fileName);

            console.log('Public URL:', publicUrl);
            return publicUrl;

        } catch (error) {
            console.error(`Error uploading ${type} image:`, error);
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
    };

    // ENHANCED: Save function with improved synchronization
    const handleSave = async () => {
        try {
            setSaving(true);
            const session = getCurrentUser();

            if (!session) {
                alert('Please log in again.');
                return;
            }

            let profileImageUrl = profileImagePreview;
            let licenseImageUrl = licenseImagePreview;
            let registrationImageUrl = registrationImagePreview;

            // Upload new images if selected
            try {
                if (profileImage) {
                    profileImageUrl = await uploadImage(profileImage, 'profile');
                    console.log('Profile image uploaded:', profileImageUrl);
                }

                if (licenseImage && userType === 'courier') {
                    licenseImageUrl = await uploadImage(licenseImage, 'license');
                    console.log('License image uploaded:', licenseImageUrl);
                }

                if (registrationImage && userType === 'courier') {
                    registrationImageUrl = await uploadImage(registrationImage, 'registration');
                    console.log('Registration image uploaded:', registrationImageUrl);
                }
            } catch (uploadError) {
                console.warn('Image upload warning:', uploadError);
            }

            // Prepare common personal data for synchronization
            console.log('DEBUG: formData.date_of_birth before update:', formData.date_of_birth);
            const commonPersonalData = {
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender,
                profile_image: profileImageUrl || profileImagePreview,
                updated_at: new Date().toISOString()
            };
            console.log('DEBUG: commonPersonalData.date_of_birth:', commonPersonalData.date_of_birth);

            console.log('🔄 Starting enhanced synchronization for:', userType);

            if (userType === 'courier') {
                // Update courier data
                const courierUpdateData = {
                    ...commonPersonalData,
                    city: courierFormData.city || null,
                    zip_code: courierFormData.zip_code ? (parseInt(courierFormData.zip_code) || null) : null,
                    vehicle_type: courierFormData.vehicle_type || null,
                    vehicle_brand: courierFormData.vehicle_brand || null,
                    vehicle_model: courierFormData.vehicle_model || null,
                    vehicle_year: courierFormData.vehicle_year ? (parseInt(courierFormData.vehicle_year) || null) : null,
                    vehicle_color: courierFormData.vehicle_color || null,
                    plate_number: courierFormData.plate_number || null,
                    other_details: courierFormData.other_details || null,
                    license_image_url: licenseImageUrl || null,
                    vehicle_registration_url: registrationImageUrl || null
                };

                console.log('📝 Updating courier data:', courierUpdateData);

                const { error: courierError } = await supabase
                    .from('couriers')
                    .update(courierUpdateData)
                    .eq('email', session.email);

                if (courierError) {
                    console.error('❌ Error updating courier profile:', courierError);
                    throw courierError;
                }

                // SYNC: Always update customer table with personal data
                console.log('🔄 Synchronizing personal data to customer table');
                const { error: customerError } = await supabase
                    .from('customers')
                    .update(commonPersonalData)
                    .eq('email', session.email);

                if (customerError) {
                    console.warn('⚠️ Warning: Could not sync to customer table:', customerError);
                } else {
                    console.log('✅ Successfully synced to customer table');
                }

            } else {
                // Update customer data
                console.log('📝 Updating customer data:', commonPersonalData);

                const { error: customerError } = await supabase
                    .from('customers')
                    .update(commonPersonalData)
                    .eq('email', session.email);

                if (customerError) {
                    console.error('❌ Error updating customer profile:', customerError);
                    throw customerError;
                }

                // SYNC: Check if user has courier profile and sync to it
                console.log('🔄 Checking for courier profile to sync...');
                const { data: courierProfile, error: courierCheckError } = await supabase
                    .from('couriers')
                    .select('id')
                    .eq('email', session.email)
                    .single();

                if (courierProfile && !courierCheckError) {
                    console.log('🔄 Synchronizing personal data to courier table');
                    const { error: courierSyncError } = await supabase
                        .from('couriers')
                        .update(commonPersonalData)
                        .eq('email', session.email);

                    if (courierSyncError) {
                        console.warn('⚠️ Warning: Could not sync to courier table:', courierSyncError);
                    } else {
                        console.log('✅ Successfully synced to courier table');
                    }
                } else {
                    console.log('ℹ️ No courier profile found to sync with');
                }
            }

            // Update local state
            const updatedUserData = {
                ...commonPersonalData,
                ...(userType === 'courier' ? {
                    city: courierFormData.city,
                    zip_code: courierFormData.zip_code,
                    vehicle_type: courierFormData.vehicle_type,
                    vehicle_brand: courierFormData.vehicle_brand,
                    vehicle_model: courierFormData.vehicle_model,
                    vehicle_year: courierFormData.vehicle_year,
                    vehicle_color: courierFormData.vehicle_color,
                    plate_number: courierFormData.plate_number,
                    other_details: courierFormData.other_details,
                    license_image_url: licenseImageUrl,
                    vehicle_registration_url: registrationImageUrl
                } : {})
            };

            setCurrentUser(prev => ({
                ...prev,
                ...updatedUserData
            }));

            if (profileImageUrl) {
                setProfileImagePreview(profileImageUrl);
            }

            setIsEditing(false);
            setSyncStatus('✅ Profile updated & synced successfully!');
            setTimeout(() => setSyncStatus(''), 5000);

        } catch (error) {
            console.error('❌ Error updating profile:', error);
            alert('❌ Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: currentUser?.full_name || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
            address: currentUser?.address || '',
            date_of_birth: currentUser?.date_of_birth || '',
            gender: currentUser?.gender || ''
        });

        if (userType === 'courier') {
            setCourierFormData({
                city: currentUser?.city || '',
                zip_code: currentUser?.zip_code || '',
                vehicle_type: currentUser?.vehicle_type || '',
                vehicle_brand: currentUser?.vehicle_brand || '',
                vehicle_model: currentUser?.vehicle_model || '',
                vehicle_year: currentUser?.vehicle_year || '',
                vehicle_color: currentUser?.vehicle_color || '',
                plate_number: currentUser?.plate_number || '',
                other_details: currentUser?.other_details || ''
            });
            setLicenseImagePreview(currentUser?.license_image_url || '');
            setRegistrationImagePreview(currentUser?.vehicle_registration_url || '');
        }

        setProfileImagePreview(currentUser?.profile_image || '');
        setProfileImage(null);
        setLicenseImage(null);
        setRegistrationImage(null);
        setIsEditing(false);
    };

    // Get user ID for display
    const getUserId = () => {
        if (!currentUser) return '';
        const id = currentUser.id || currentUser.customer_id;
        const prefix = userType === 'courier' ? 'COU' : 'CUS';
        return `${prefix}${String(id).padStart(3, '0')}`;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!currentUser?.full_name) return userType === 'courier' ? 'C' : 'U';
        return currentUser.full_name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Image Modal Components (same as before)
    const LicenseModal = () => (
        <div className="modal-overlay" onClick={() => setShowLicenseModal(false)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Driver's License</h3>
                    <button className="close-button" onClick={() => setShowLicenseModal(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {licenseImagePreview ? (
                        <img src={licenseImagePreview} alt="Driver's License" className="modal-image" />
                    ) : (
                        <div className="no-image">
                            <FileText size={48} />
                            <p>No license image uploaded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const RegistrationModal = () => (
        <div className="modal-overlay" onClick={() => setShowRegistrationModal(false)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Vehicle Registration</h3>
                    <button className="close-button" onClick={() => setShowRegistrationModal(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {registrationImagePreview ? (
                        <img src={registrationImagePreview} alt="Vehicle Registration" className="modal-image" />
                    ) : (
                        <div className="no-image">
                            <FileText size={48} />
                            <p>No registration image uploaded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const LicenseUploadModal = () => (
        <div className="modal-overlay" onClick={() => setShowLicenseUploadModal(false)}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Upload Driver's License</h3>
                    <button className="close-button" onClick={() => setShowLicenseUploadModal(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="upload-instructions">
                        <p>Please upload a clear photo of your valid driver's license</p>
                        <ul>
                            <li>Image must be clear and readable</li>
                            <li>File size must be less than 2MB</li>
                            <li>Accepted formats: JPEG, PNG</li>
                        </ul>
                    </div>
                    <div className="upload-area-large">
                        <label className="upload-label-large">
                            <Camera size={48} />
                            <span>Click to upload license</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'license')}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {licenseImagePreview && (
                        <div className="preview-section">
                            <h4>Preview:</h4>
                            <img src={licenseImagePreview} alt="License preview" className="preview-image" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const RegistrationUploadModal = () => (
        <div className="modal-overlay" onClick={() => setShowRegistrationUploadModal(false)}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Upload Vehicle Registration</h3>
                    <button className="close-button" onClick={() => setShowRegistrationUploadModal(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="upload-instructions">
                        <p>Please upload a clear photo of your vehicle registration document</p>
                        <ul>
                            <li>Image must be clear and readable</li>
                            <li>File size must be less than 2MB</li>
                            <li>Accepted formats: JPEG, PNG</li>
                        </ul>
                    </div>
                    <div className="upload-area-large">
                        <label className="upload-label-large">
                            <Camera size={48} />
                            <span>Click to upload registration</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'registration')}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {registrationImagePreview && (
                        <div className="preview-section">
                            <h4>Preview:</h4>
                            <img src={registrationImagePreview} alt="Registration preview" className="preview-image" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-teal-400">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {userType === 'courier' ? 'Courier Profile' : 'Personal Information'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Manual Sync Button */}
                    <button
                        onClick={handleManualSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        title="Sync profile between customer and courier accounts"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Profile'}
                    </button>

                    {!isEditing ? (
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                {profileImagePreview ? (
                                    <img
                                        src={profileImagePreview}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    getUserInitials()
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-2 cursor-pointer hover:bg-teal-600 transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'profile')}
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{currentUser?.full_name || 'User'}</h2>
                            <div className="flex items-center gap-4 text-gray-400">
                                <span>{getUserId()}</span>
                                <span>Member since {formatDate(currentUser?.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Sync Notifications */}
                    {syncStatus && (
                        <div className="mt-3 p-3 bg-green-900 border border-green-700 rounded-lg">
                            <p className="text-green-200 text-sm">{syncStatus}</p>
                        </div>
                    )}

                    <div className="mt-3 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                        <p className="text-blue-200 text-sm">
                            💫 <strong>Auto-Sync Active:</strong> Profile changes (name, phone, address, profile picture)
                            automatically sync between customer and courier accounts. Use "Sync Profile" button to manually sync.
                        </p>
                    </div>

                    {/* Application Status for Couriers */}
                    {userType === 'courier' && currentUser?.application_status && (
                        <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                            <h4 className="text-blue-200 font-semibold">
                                Application Status: {currentUser.application_status.charAt(0).toUpperCase() + currentUser.application_status.slice(1)}
                            </h4>
                            <p className="text-blue-200 text-sm mt-1">
                                {currentUser.application_status === 'approved' && 'Your courier application has been approved. You can now accept delivery requests.'}
                                {currentUser.application_status === 'pending' && 'Your application is under review. This process usually takes 1-2 business days.'}
                                {currentUser.application_status === 'rejected' && 'Your application was not approved. Please contact support for more information.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Rest of the component remains the same */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-teal-400" />
                                    <div className="flex-1">
                                        <label className="text-gray-400 text-sm">Phone Number</label>
                                        <div className="text-white">
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                currentUser?.phone || 'Not provided'
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-teal-400" />
                                    <div className="flex-1">
                                        <label className="text-gray-400 text-sm">Email Address</label>
                                        <div className="text-white">{currentUser?.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-teal-400" />
                                    <div className="flex-1">
                                        <label className="text-gray-400 text-sm">Address</label>
                                        <div className="text-white">
                                            {isEditing ? (
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full resize-none"
                                                    placeholder="Enter address"
                                                    rows="3"
                                                />
                                            ) : (
                                                currentUser?.address || 'Not provided'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courier-specific Address Fields */}
                        {userType === 'courier' && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Location Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">City</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="city"
                                                value={courierFormData.city}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter your city"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.city || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">ZIP Code</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="zip_code"
                                                value={courierFormData.zip_code}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter ZIP code"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.zip_code || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Personal Details */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {userType === 'courier' ? 'Courier' : 'Customer'} Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm block mb-2">Date of Birth</label>
                                    <div className="text-white">
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                            />
                                        ) : (
                                            formatDate(currentUser?.date_of_birth)
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-2">Gender</label>
                                    <div className="text-white">
                                        {isEditing ? (
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                        ) : (
                                            currentUser?.gender ?
                                                currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1).replace(/_/g, ' ')
                                                : 'Not provided'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-2">Account Created</label>
                                    <p className="text-white">{formatDate(currentUser?.created_at)}</p>
                                </div>
                                {userType === 'courier' && currentUser?.vehicle_type && (
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Type</label>
                                        <p className="text-white">{currentUser.vehicle_type}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Information for Couriers */}
                        {userType === 'courier' && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Bike className="w-5 h-5 text-teal-400" />
                                    Vehicle Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Type</label>
                                        {isEditing ? (
                                            <select
                                                name="vehicle_type"
                                                value={courierFormData.vehicle_type}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                            >
                                                <option value="">Select vehicle type</option>
                                                <option value="motorcycle">Motorcycle</option>
                                                <option value="bicycle">Bicycle</option>
                                                <option value="car">Car</option>
                                                <option value="scooter">Scooter</option>
                                                <option value="truck">Truck</option>
                                            </select>
                                        ) : (
                                            <p className="text-white">{currentUser?.vehicle_type || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Brand</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="vehicle_brand"
                                                value={courierFormData.vehicle_brand}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter vehicle brand"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.vehicle_brand || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Model</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="vehicle_model"
                                                value={courierFormData.vehicle_model}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter vehicle model"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.vehicle_model || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Year</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="vehicle_year"
                                                value={courierFormData.vehicle_year}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter vehicle year"
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.vehicle_year || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Vehicle Color</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="vehicle_color"
                                                value={courierFormData.vehicle_color}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter vehicle color"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.vehicle_color || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Plate Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="plate_number"
                                                value={courierFormData.plate_number}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                                placeholder="Enter plate number"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.plate_number || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Other Details</label>
                                        {isEditing ? (
                                            <textarea
                                                name="other_details"
                                                value={courierFormData.other_details}
                                                onChange={handleCourierInputChange}
                                                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full resize-none"
                                                placeholder="Any additional vehicle details..."
                                                rows="3"
                                            />
                                        ) : (
                                            <p className="text-white">{currentUser?.other_details || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Upload Section for Couriers */}
                {userType === 'courier' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* License Image */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-medium">Driver's License</h4>
                                    <div className="flex items-center gap-2">
                                        {!isEditing && licenseImagePreview && (
                                            <button
                                                onClick={() => setShowLicenseModal(true)}
                                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={() => setShowLicenseUploadModal(true)}
                                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Camera size={16} />
                                                {licenseImagePreview ? 'Change' : 'Upload'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center min-h-48 flex items-center justify-center">
                                    {licenseImagePreview ? (
                                        <div className="relative w-full">
                                            <img
                                                src={licenseImagePreview}
                                                alt="License preview"
                                                className="w-full h-48 object-contain rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 py-8">
                                            <FileText size={32} className="text-gray-400" />
                                            <p className="text-gray-400">No license uploaded</p>
                                            {isEditing && (
                                                <p className="text-gray-500 text-sm">Click 'Upload' to add license</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Registration Image */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-medium">Vehicle Registration</h4>
                                    <div className="flex items-center gap-2">
                                        {!isEditing && registrationImagePreview && (
                                            <button
                                                onClick={() => setShowRegistrationModal(true)}
                                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={() => setShowRegistrationUploadModal(true)}
                                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Camera size={16} />
                                                {registrationImagePreview ? 'Change' : 'Upload'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center min-h-48 flex items-center justify-center">
                                    {registrationImagePreview ? (
                                        <div className="relative w-full">
                                            <img
                                                src={registrationImagePreview}
                                                alt="Registration preview"
                                                className="w-full h-48 object-contain rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 py-8">
                                            <FileText size={32} className="text-gray-400" />
                                            <p className="text-gray-400">No registration uploaded</p>
                                            {isEditing && (
                                                <p className="text-gray-500 text-sm">Click 'Upload' to add registration</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Fields for Editing */}
                {isEditing && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-sm block mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                                    placeholder="Enter your full name"
                                    required
                                />
                                <p className="text-gray-500 text-xs mt-1">Your name will be visible to {userType === 'courier' ? 'customers' : 'couriers'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={currentUser?.email}
                                    className="bg-gray-600 border border-gray-600 rounded px-3 py-2 text-gray-400 w-full cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showLicenseModal && <LicenseModal />}
            {showRegistrationModal && <RegistrationModal />}
            {showLicenseUploadModal && <LicenseUploadModal />}
            {showRegistrationUploadModal && <RegistrationUploadModal />}
        </div>
    );
};

export default PersonalInfo;