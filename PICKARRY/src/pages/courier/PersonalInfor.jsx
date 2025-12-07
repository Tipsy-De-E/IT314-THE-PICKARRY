// import React, { useState, useEffect } from 'react';
// import { User, Camera, Edit3, Save, X, MapPin, Phone, Mail, Calendar, Bike } from 'lucide-react';
// import { getCurrentUser } from '../utils/auth';
// import { supabase } from '../utils/supabaseClient';
// import '../styles/personal-info.css';

// const CourierProfile = ({ onBack }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({
//         full_name: '',
//         email: '',
//         phone: '',
//         address: '',
//         city: '',
//         zip_code: '',
//         date_of_birth: '',
//         gender: '',
//         vehicle_type: '',
//         vehicle_brand: '',
//         plate_number: ''
//     });
//     const [profileImage, setProfileImage] = useState(null);
//     const [profileImagePreview, setProfileImagePreview] = useState('');

//     // Fetch user data on component mount
//     useEffect(() => {
//         fetchUserData();
//     }, []);

//     const fetchUserData = async () => {
//         try {
//             setLoading(true);
//             const session = getCurrentUser();

//             if (!session) {
//                 console.error('No session found');
//                 return;
//             }

//             const { data, error } = await supabase
//                 .from('couriers')
//                 .select('*')
//                 .eq('email', session.email)
//                 .single();

//             if (error) {
//                 console.error('Error fetching courier data:', error);
//                 // Use session data as fallback
//                 const fallbackData = {
//                     full_name: session.user_metadata?.full_name || 'Courier',
//                     email: session.email,
//                     phone: session.user_metadata?.phone || '',
//                     address: '',
//                     city: '',
//                     zip_code: '',
//                     date_of_birth: '',
//                     gender: '',
//                     vehicle_type: '',
//                     vehicle_brand: '',
//                     plate_number: '',
//                     profile_image: session.user_metadata?.avatar_url || '',
//                     application_status: 'pending'
//                 };

//                 setCurrentUser(fallbackData);
//                 setFormData(fallbackData);
//                 setProfileImagePreview(session.user_metadata?.avatar_url || '');
//             } else {
//                 setCurrentUser(data);
//                 setFormData({
//                     full_name: data.full_name || '',
//                     email: data.email || '',
//                     phone: data.phone || '',
//                     address: data.address || '',
//                     city: data.city || '',
//                     zip_code: data.zip_code || '',
//                     date_of_birth: data.date_of_birth || '',
//                     gender: data.gender || '',
//                     vehicle_type: data.vehicle_type || '',
//                     vehicle_brand: data.vehicle_brand || '',
//                     plate_number: data.plate_number || ''
//                 });
//                 setProfileImagePreview(data.profile_image || '');
//             }
//         } catch (err) {
//             console.error('Error fetching courier data:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             // Validate file size (2MB limit)
//             if (file.size > 2 * 1024 * 1024) {
//                 alert('Image size must be less than 2MB');
//                 return;
//             }

//             // Validate file type
//             if (!file.type.startsWith('image/')) {
//                 alert('Please upload an image file (JPEG, PNG, etc.)');
//                 return;
//             }

//             setProfileImage(file);
//             const previewUrl = URL.createObjectURL(file);
//             setProfileImagePreview(previewUrl);
//         }
//     };

//     const uploadProfileImage = async (file) => {
//         try {
//             const fileExt = file.name.split('.').pop();
//             const fileName = `courier_profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
//             const filePath = fileName;

//             const { data, error } = await supabase.storage
//                 .from('profile-images')
//                 .upload(filePath, file, {
//                     cacheControl: '3600',
//                     upsert: false
//                 });

//             if (error) throw error;

//             // Get public URL
//             const { data: { publicUrl } } = supabase.storage
//                 .from('profile-images')
//                 .getPublicUrl(filePath);

//             return publicUrl;

//         } catch (error) {
//             console.error('Error uploading profile image:', error);
//             throw new Error('Failed to upload profile image');
//         }
//     };

//     const handleSave = async () => {
//         try {
//             setSaving(true);
//             const session = getCurrentUser();

//             if (!session) {
//                 alert('Please log in again.');
//                 return;
//             }

//             let profileImageUrl = profileImagePreview;

//             // Upload new profile image if selected
//             if (profileImage) {
//                 profileImageUrl = await uploadProfileImage(profileImage);
//             }

//             const updateData = {
//                 ...formData,
//                 profile_image: profileImageUrl,
//                 updated_at: new Date().toISOString()
//             };

//             const { error } = await supabase
//                 .from('couriers')
//                 .update(updateData)
//                 .eq('email', session.email);

//             if (error) throw error;

//             // Update local state
//             setCurrentUser(prev => ({
//                 ...prev,
//                 ...updateData
//             }));

//             setIsEditing(false);
//             alert('Profile updated successfully!');

//         } catch (error) {
//             console.error('Error updating courier profile:', error);
//             alert('Error updating profile. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     const handleCancel = () => {
//         // Reset form data to current user data
//         setFormData({
//             full_name: currentUser?.full_name || '',
//             email: currentUser?.email || '',
//             phone: currentUser?.phone || '',
//             address: currentUser?.address || '',
//             city: currentUser?.city || '',
//             zip_code: currentUser?.zip_code || '',
//             date_of_birth: currentUser?.date_of_birth || '',
//             gender: currentUser?.gender || '',
//             vehicle_type: currentUser?.vehicle_type || '',
//             vehicle_brand: currentUser?.vehicle_brand || '',
//             plate_number: currentUser?.plate_number || ''
//         });
//         setProfileImagePreview(currentUser?.profile_image || '');
//         setProfileImage(null);
//         setIsEditing(false);
//     };

//     // Get user initials for avatar fallback
//     const getUserInitials = () => {
//         if (!currentUser?.full_name) return 'C';
//         return currentUser.full_name
//             .split(' ')
//             .map(name => name[0])
//             .join('')
//             .toUpperCase()
//             .slice(0, 2);
//     };

//     if (loading) {
//         return (
//             <div className="personal-info">
//                 <div className="loading-container">
//                     <div className="loading-spinner"></div>
//                     <p>Loading profile...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="personal-info">
//             {/* Header */}
//             <div className="personal-info-header">
//                 <button onClick={onBack} className="back-button">
//                     <X size={24} />
//                 </button>
//                 <div className="header-content">
//                     <h1>Courier Profile</h1>
//                     <p>Manage your courier profile and vehicle information</p>
//                 </div>
//                 {!isEditing ? (
//                     <button
//                         className="edit-button"
//                         onClick={() => setIsEditing(true)}
//                     >
//                         <Edit3 size={20} />
//                         Edit
//                     </button>
//                 ) : (
//                     <div className="edit-actions">
//                         <button
//                             className="cancel-button"
//                             onClick={handleCancel}
//                             disabled={saving}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             className="save-button"
//                             onClick={handleSave}
//                             disabled={saving}
//                         >
//                             {saving ? 'Saving...' : 'Save'}
//                             <Save size={16} />
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* Profile Image Section */}
//             <div className="profile-image-section">
//                 <div className="profile-image-container">
//                     {profileImagePreview ? (
//                         <img
//                             src={profileImagePreview}
//                             alt="Profile"
//                             className="profile-image"
//                         />
//                     ) : (
//                         <div className="profile-image-placeholder">
//                             <span className="initials">{getUserInitials()}</span>
//                         </div>
//                     )}

//                     {isEditing && (
//                         <div className="image-upload-overlay">
//                             <input
//                                 type="file"
//                                 id="profile-image-upload"
//                                 accept="image/*"
//                                 onChange={handleImageUpload}
//                                 className="image-upload-input"
//                             />
//                             <label htmlFor="profile-image-upload" className="image-upload-label">
//                                 <Camera size={20} />
//                                 <span>Change Photo</span>
//                             </label>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Application Status */}
//             {currentUser?.application_status && (
//                 <div className="application-status-banner">
//                     <div className={`status-banner status-${currentUser.application_status}`}>
//                         <h4>Application Status: {currentUser.application_status.charAt(0).toUpperCase() + currentUser.application_status.slice(1)}</h4>
//                         <p>
//                             {currentUser.application_status === 'approved' && 'Your courier application has been approved. You can now accept delivery requests.'}
//                             {currentUser.application_status === 'pending' && 'Your application is under review. This process usually takes 1-2 business days.'}
//                             {currentUser.application_status === 'rejected' && 'Your application was not approved. Please contact support for more information.'}
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* Personal Information Form */}
//             <div className="personal-info-form">
//                 <div className="form-section">
//                     <h3>Basic Information</h3>
//                     <div className="form-grid">
//                         <div className="form-group full-width">
//                             <label className="form-label">
//                                 <User size={16} />
//                                 Full Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="full_name"
//                                 value={formData.full_name}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="Enter your full name"
//                                 disabled={!isEditing}
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Mail size={16} />
//                                 Email Address *
//                             </label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="your.email@example.com"
//                                 disabled={true}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Phone size={16} />
//                                 Phone Number
//                             </label>
//                             <input
//                                 type="tel"
//                                 name="phone"
//                                 value={formData.phone}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="+1 (555) 123-4567"
//                                 disabled={!isEditing}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Calendar size={16} />
//                                 Date of Birth
//                             </label>
//                             <input
//                                 type="date"
//                                 name="date_of_birth"
//                                 value={formData.date_of_birth}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 disabled={!isEditing}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <User size={16} />
//                                 Gender
//                             </label>
//                             <select
//                                 name="gender"
//                                 value={formData.gender}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 disabled={!isEditing}
//                             >
//                                 <option value="">Select gender</option>
//                                 <option value="male">Male</option>
//                                 <option value="female">Female</option>
//                                 <option value="other">Other</option>
//                                 <option value="prefer_not_to_say">Prefer not to say</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="form-section">
//                     <h3>Address Information</h3>
//                     <div className="form-grid">
//                         <div className="form-group full-width">
//                             <label className="form-label">
//                                 <MapPin size={16} />
//                                 Address
//                             </label>
//                             <input
//                                 type="text"
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="Enter your full address"
//                                 disabled={!isEditing}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <MapPin size={16} />
//                                 City
//                             </label>
//                             <input
//                                 type="text"
//                                 name="city"
//                                 value={formData.city}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="Enter your city"
//                                 disabled={!isEditing}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <MapPin size={16} />
//                                 ZIP Code
//                             </label>
//                             <input
//                                 type="text"
//                                 name="zip_code"
//                                 value={formData.zip_code}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="12345"
//                                 disabled={!isEditing}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="form-section">
//                     <h3>Vehicle Information</h3>
//                     <div className="form-grid">
//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Bike size={16} />
//                                 Vehicle Type *
//                             </label>
//                             <select
//                                 name="vehicle_type"
//                                 value={formData.vehicle_type}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 disabled={!isEditing}
//                                 required
//                             >
//                                 <option value="">Select vehicle type</option>
//                                 <option value="motorcycle">Motorcycle</option>
//                                 <option value="bicycle">Bicycle</option>
//                                 <option value="car">Car</option>
//                                 <option value="scooter">Scooter</option>
//                             </select>
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 Vehicle Brand
//                             </label>
//                             <input
//                                 type="text"
//                                 name="vehicle_brand"
//                                 value={formData.vehicle_brand}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="e.g., Honda, Yamaha"
//                                 disabled={!isEditing}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 Plate Number
//                             </label>
//                             <input
//                                 type="text"
//                                 name="plate_number"
//                                 value={formData.plate_number}
//                                 onChange={handleInputChange}
//                                 className="form-input"
//                                 placeholder="Enter plate number"
//                                 disabled={!isEditing}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {isEditing && (
//                 <div className="form-actions">
//                     <button
//                         className="cancel-button large"
//                         onClick={handleCancel}
//                         disabled={saving}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="save-button large"
//                         onClick={handleSave}
//                         disabled={saving}
//                     >
//                         {saving ? 'Saving Changes...' : 'Save Changes'}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CourierProfile;