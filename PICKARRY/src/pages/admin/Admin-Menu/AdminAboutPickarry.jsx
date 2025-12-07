import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Users, Award, Clock, Heart, Globe, Shield, Truck, Mail, Phone, MapPin, Edit, Save, X, Upload, Trash2, Plus, Image as ImageIcon, Loader } from 'lucide-react';

const AdminAboutPickarry = ({ onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Initial data
    const [aboutData, setAboutData] = useState({
        features: [
            {
                id: 1,
                icon: Target,
                title: 'Our Mission',
                description: 'To provide fast, reliable, and affordable delivery services to every Filipino household and business.',
                color: 'from-blue-500 to-teal-400'
            },
            {
                id: 2,
                icon: Users,
                title: 'Our Community',
                description: 'Serving thousands of customers and empowering local couriers across the Philippines.',
                color: 'from-purple-500 to-pink-400'
            },
            {
                id: 3,
                icon: Award,
                title: 'Quality Service',
                description: 'Committed to excellence with 99% on-time delivery and 24/7 customer support.',
                color: 'from-amber-500 to-orange-400'
            },
            {
                id: 4,
                icon: Clock,
                title: 'Always Available',
                description: 'Round-the-clock service to meet your delivery needs anytime, anywhere.',
                color: 'from-emerald-500 to-green-400'
            }
        ],
        stats: [
            { id: 1, number: '50K+', label: 'Happy Customers', icon: Users },
            { id: 2, number: '10K+', label: 'Active Couriers', icon: Truck },
            { id: 3, number: '500K+', label: 'Deliveries Made', icon: Shield },
            { id: 4, number: '99%', label: 'Satisfaction Rate', icon: Heart }
        ],
        teamMembers: [
            {
                id: 1,
                name: 'Juan Dela Cruz',
                role: 'CEO & Founder',
                description: 'Visionary leader with 10+ years in logistics technology',
                imageColor: 'bg-gradient-to-br from-blue-500 to-teal-400',
                imageUrl: null,
                isFounder: true
            },
            {
                id: 2,
                name: 'Maria Santos',
                role: 'CTO',
                description: 'Tech expert specializing in scalable delivery solutions',
                imageColor: 'bg-gradient-to-br from-purple-500 to-pink-400',
                imageUrl: null,
                isFounder: false
            },
            {
                id: 3,
                name: 'Pedro Reyes',
                role: 'Operations Head',
                description: 'Ensuring seamless delivery operations nationwide',
                imageColor: 'bg-gradient-to-br from-amber-500 to-orange-400',
                imageUrl: null,
                isFounder: false
            },
            {
                id: 4,
                name: 'Ana Lim',
                role: 'Marketing Director',
                description: 'Building brand presence across the Philippines',
                imageColor: 'bg-gradient-to-br from-emerald-500 to-green-400',
                imageUrl: null,
                isFounder: false
            },
            {
                id: 5,
                name: 'Michael Tan',
                role: 'Customer Experience Lead',
                description: 'Dedicated to providing exceptional customer service',
                imageColor: 'bg-gradient-to-br from-red-500 to-rose-400',
                imageUrl: null,
                isFounder: false
            }
        ],
        heroContent: {
            title: 'Your Trusted Delivery Partner',
            description: 'Pickarry is revolutionizing the delivery industry in the Philippines by connecting customers with reliable couriers for fast, secure, and affordable delivery services. We bridge the gap between urban and rural communities, making delivery accessible to all.'
        },
        companyInfo: {
            title: 'Our Story',
            paragraphs: [
                'Founded in 2023, Pickarry started with a simple goal: to make delivery services accessible to everyone. What began as a small team of passionate individuals has grown into one of the fastest-growing delivery platforms in the Philippines.',
                'Today, we proudly serve both urban and rural communities, bridging the gap between traditional logistics and modern technology. Our commitment to innovation, reliability, and customer satisfaction drives everything we do.'
            ],
            milestones: [
                { label: 'Year Founded', value: '2023' },
                { label: 'Provinces Served', value: '81' },
                { label: 'Service Availability', value: '24/7' }
            ]
        },
        contactInfo: {
            email: 'support@pickarry.com',
            phone: '1-800-PICKARRY',
            address: 'Manila, Philippines'
        }
    });

    useEffect(() => {
        // Load saved data from localStorage or API
        const savedData = localStorage.getItem('pickarry_about_data');
        if (savedData) {
            setAboutData(JSON.parse(savedData));
        }
    }, []);

    const startEditing = (section, data = null) => {
        setEditingSection({ section, data });
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('pickarry_about_data', JSON.stringify(aboutData));
            setIsSaving(false);
            setSaveSuccess(true);
            setIsEditing(false);
            setEditingSection(null);

            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleCancel = () => {
        const confirmed = window.confirm('Discard changes?');
        if (confirmed) {
            setIsEditing(false);
            setEditingSection(null);
        }
    };

    const handleChange = (section, field, value) => {
        setAboutData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleTeamMemberChange = (id, field, value) => {
        setAboutData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.map(member =>
                member.id === id ? { ...member, [field]: value } : member
            )
        }));
    };

    const handleFeatureChange = (id, field, value) => {
        setAboutData(prev => ({
            ...prev,
            features: prev.features.map(feature =>
                feature.id === id ? { ...feature, [field]: value } : feature
            )
        }));
    };

    const handleStatChange = (id, field, value) => {
        setAboutData(prev => ({
            ...prev,
            stats: prev.stats.map(stat =>
                stat.id === id ? { ...stat, [field]: value } : stat
            )
        }));
    };

    const addTeamMember = () => {
        const newId = Math.max(...aboutData.teamMembers.map(m => m.id)) + 1;
        setAboutData(prev => ({
            ...prev,
            teamMembers: [
                ...prev.teamMembers,
                {
                    id: newId,
                    name: 'New Team Member',
                    role: 'Position',
                    description: 'Brief description',
                    imageColor: 'bg-gradient-to-br from-gray-500 to-gray-400',
                    imageUrl: null,
                    isFounder: false
                }
            ]
        }));
    };

    const removeTeamMember = (id) => {
        if (aboutData.teamMembers.length <= 1) {
            alert('Must have at least one team member');
            return;
        }
        setAboutData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.filter(member => member.id !== id)
        }));
    };

    const addFeature = () => {
        const newId = Math.max(...aboutData.features.map(f => f.id)) + 1;
        setAboutData(prev => ({
            ...prev,
            features: [
                ...prev.features,
                {
                    id: newId,
                    icon: Target,
                    title: 'New Feature',
                    description: 'Feature description',
                    color: 'from-gray-500 to-gray-400'
                }
            ]
        }));
    };

    const removeFeature = (id) => {
        if (aboutData.features.length <= 1) {
            alert('Must have at least one feature');
            return;
        }
        setAboutData(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature.id !== id)
        }));
    };

    const handleImageUpload = async (e, teamMemberId) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            // In a real app, you would upload to your server/cloud storage
            // For now, we'll create a local object URL
            const imageUrl = URL.createObjectURL(file);

            // Update team member with new image
            handleTeamMemberChange(teamMemberId, 'imageUrl', imageUrl);

            // Simulate upload delay
            setTimeout(() => {
                setUploadingImage(false);
                alert('Image uploaded successfully!');
            }, 1000);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
            setUploadingImage(false);
        }
    };

    const renderIconSelect = (currentIcon, onChange) => {
        const icons = [Target, Users, Award, Clock, Heart, Globe, Shield, Truck, Mail, Phone, MapPin];

        return (
            <div className="grid grid-cols-5 gap-2 mb-4">
                {icons.map((Icon, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onChange(Icon)}
                        className={`p-3 rounded-lg ${currentIcon === Icon ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'}`}
                    >
                        <Icon className="w-5 h-5 text-white" />
                    </button>
                ))}
            </div>
        );
    };

    const renderColorSelect = (currentColor, onChange) => {
        const colors = [
            { name: 'Blue-Teal', value: 'from-blue-500 to-teal-400' },
            { name: 'Purple-Pink', value: 'from-purple-500 to-pink-400' },
            { name: 'Amber-Orange', value: 'from-amber-500 to-orange-400' },
            { name: 'Emerald-Green', value: 'from-emerald-500 to-green-400' },
            { name: 'Red-Rose', value: 'from-red-500 to-rose-400' },
            { name: 'Indigo-Purple', value: 'from-indigo-500 to-purple-400' }
        ];

        return (
            <div className="grid grid-cols-3 gap-2 mb-4">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onChange(color.value)}
                        className={`h-10 rounded-lg ${currentColor === color.value ? 'ring-2 ring-white' : ''}`}
                        style={{
                            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            backgroundImage: color.value.replace('from-', 'linear-gradient(135deg, #').replace('to-', ', #').replace('400', '400)')
                        }}
                        title={color.name}
                    >
                        <span className="sr-only">{color.name}</span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200 hover-lift"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-300" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">About Pickarry Management</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isEditing ? (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="loading-spinner w-4 h-4"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => window.open('/about', '_blank')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>View Public Page</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="mt-2 text-gray-400 ml-14">
                        Manage and edit all content on the About Pickarry page
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <Save className="w-5 h-5" />
                        <span>Changes saved successfully!</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Edit Controls Banner */}
                <div className="mb-8 card bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20">
                    <div className="flex items-start space-x-3 p-6">
                        <Edit className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg text-white">Admin Controls</h3>
                                <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                                    {isEditing ? 'Edit Mode' : 'View Mode'}
                                </span>
                            </div>
                            <p className="text-gray-300">
                                Click the edit buttons to modify content. Changes will affect the public About page.
                            </p>
                            {!isEditing && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                        onClick={() => startEditing('heroContent')}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Edit Hero Section
                                    </button>
                                    <button
                                        onClick={() => startEditing('companyInfo')}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Edit Company Story
                                    </button>
                                    <button
                                        onClick={() => startEditing('contactInfo')}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Edit Contact Info
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Section - Top Priority */}
                <div className="mb-16 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Leadership Team</h2>
                            <p className="text-gray-400">Manage team members and their information</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={addTeamMember}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 rounded-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Team Member</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {aboutData.teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`relative group p-4 bg-gray-800/50 border rounded-xl hover:border-teal-500/30 transition-all duration-200 ${member.isFounder ? 'border-2 border-teal-500' : 'border-gray-700'}`}
                            >
                                {!isEditing && (
                                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => startEditing('teamMember', member)}
                                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                            title="Edit"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => removeTeamMember(member.id)}
                                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                )}

                                {/* Image Upload Area */}
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <div className={`w-full h-full ${member.imageColor} rounded-full overflow-hidden shadow-lg`}>
                                        {member.imageUrl ? (
                                            <img
                                                src={member.imageUrl}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <label className="absolute bottom-0 right-0 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e, member.id)}
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                        </label>
                                    )}
                                </div>

                                {isEditing && editingSection?.section === 'teamMember' && editingSection?.data?.id === member.id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => handleTeamMemberChange(member.id, 'name', e.target.value)}
                                            className="w-full input-field"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={member.role}
                                            onChange={(e) => handleTeamMemberChange(member.id, 'role', e.target.value)}
                                            className="w-full input-field"
                                            placeholder="Role"
                                        />
                                        <textarea
                                            value={member.description}
                                            onChange={(e) => handleTeamMemberChange(member.id, 'description', e.target.value)}
                                            className="w-full input-field"
                                            placeholder="Description"
                                            rows="3"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={member.isFounder}
                                                onChange={(e) => handleTeamMemberChange(member.id, 'isFounder', e.target.checked)}
                                                className="rounded"
                                                id={`founder-${member.id}`}
                                            />
                                            <label htmlFor={`founder-${member.id}`} className="text-sm">
                                                Mark as Founder
                                            </label>
                                        </div>
                                        <div className="text-sm text-gray-400">Color Scheme:</div>
                                        {renderColorSelect(member.imageColor, (color) =>
                                            handleTeamMemberChange(member.id, 'imageColor', color)
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-lg text-white mb-1 text-center">
                                            {member.name}
                                        </h3>
                                        <div className={`inline-block px-3 py-1 ${member.isFounder ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'} text-white text-sm font-semibold rounded-full mb-3 w-full text-center`}>
                                            {member.role}
                                        </div>
                                        {member.isFounder && (
                                            <div className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full inline-block mb-2">
                                                Founder
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-400 text-center">
                                            {member.description}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Section Editor */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Hero Section</h2>
                        {!isEditing && (
                            <button
                                onClick={() => startEditing('heroContent')}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>

                    <div className="text-center p-8 bg-gray-800/30 rounded-xl">
                        {isEditing && editingSection?.section === 'heroContent' ? (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    value={aboutData.heroContent.title}
                                    onChange={(e) => handleChange('heroContent', 'title', e.target.value)}
                                    className="w-full input-field text-3xl text-center font-bold"
                                    placeholder="Hero Title"
                                />
                                <textarea
                                    value={aboutData.heroContent.description}
                                    onChange={(e) => handleChange('heroContent', 'description', e.target.value)}
                                    className="w-full input-field text-center text-lg"
                                    placeholder="Hero Description"
                                    rows="4"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl mb-6">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    {aboutData.heroContent.title}
                                </h2>
                                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                                    {aboutData.heroContent.description}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Features</h2>
                            <p className="text-gray-400">Manage feature cards and their content</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={addFeature}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 rounded-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Feature</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {aboutData.features.map((feature) => (
                            <div
                                key={feature.id}
                                className="relative group p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-teal-500/30 transition-all duration-200"
                            >
                                {!isEditing && (
                                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => startEditing('feature', feature)}
                                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => removeFeature(feature.id)}
                                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                )}

                                {isEditing && editingSection?.section === 'feature' && editingSection?.data?.id === feature.id ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-400">Icon:</div>
                                        {renderIconSelect(feature.icon, (icon) =>
                                            handleFeatureChange(feature.id, 'icon', icon)
                                        )}
                                        <input
                                            type="text"
                                            value={feature.title}
                                            onChange={(e) => handleFeatureChange(feature.id, 'title', e.target.value)}
                                            className="w-full input-field text-xl font-bold"
                                            placeholder="Feature Title"
                                        />
                                        <textarea
                                            value={feature.description}
                                            onChange={(e) => handleFeatureChange(feature.id, 'description', e.target.value)}
                                            className="w-full input-field"
                                            placeholder="Feature Description"
                                            rows="3"
                                        />
                                        <div className="text-sm text-gray-400">Color Scheme:</div>
                                        {renderColorSelect(feature.color, (color) =>
                                            handleFeatureChange(feature.id, 'color', color)
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl inline-flex mb-6`}>
                                            {React.createElement(feature.icon, { className: "w-6 h-6 text-white" })}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Statistics</h2>
                        <p className="text-gray-400">{aboutData.stats.length} stats displayed</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {aboutData.stats.map((stat, index) => (
                            <div
                                key={stat.id}
                                className="relative group p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-teal-500/30 transition-all duration-200"
                            >
                                {!isEditing && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => startEditing('stat', stat)}
                                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {isEditing && editingSection?.section === 'stat' && editingSection?.data?.id === stat.id ? (
                                    <div className="space-y-3">
                                        <div className="text-sm text-gray-400">Icon:</div>
                                        {renderIconSelect(stat.icon, (icon) =>
                                            handleStatChange(stat.id, 'icon', icon)
                                        )}
                                        <input
                                            type="text"
                                            value={stat.number}
                                            onChange={(e) => handleStatChange(stat.id, 'number', e.target.value)}
                                            className="w-full input-field text-2xl font-bold text-center"
                                            placeholder="Stat Number"
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                                            className="w-full input-field text-center"
                                            placeholder="Stat Label"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl">
                                                {React.createElement(stat.icon, { className: "w-6 h-6 text-white" })}
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-2">
                                            {stat.number}
                                        </div>
                                        <div className="text-gray-300 font-medium">
                                            {stat.label}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Company Info Editor */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Company Story</h2>
                        {!isEditing && (
                            <button
                                onClick={() => startEditing('companyInfo')}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>

                    <div className="p-8 bg-gray-800/30 rounded-xl">
                        {isEditing && editingSection?.section === 'companyInfo' ? (
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    value={aboutData.companyInfo.title}
                                    onChange={(e) => handleChange('companyInfo', 'title', e.target.value)}
                                    className="w-full input-field text-2xl font-bold"
                                    placeholder="Section Title"
                                />
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-400">Paragraphs:</div>
                                    {aboutData.companyInfo.paragraphs.map((para, index) => (
                                        <textarea
                                            key={index}
                                            value={para}
                                            onChange={(e) => {
                                                const newParagraphs = [...aboutData.companyInfo.paragraphs];
                                                newParagraphs[index] = e.target.value;
                                                handleChange('companyInfo', 'paragraphs', newParagraphs);
                                            }}
                                            className="w-full input-field"
                                            placeholder={`Paragraph ${index + 1}`}
                                            rows="3"
                                        />
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-400">Milestones:</div>
                                    {aboutData.companyInfo.milestones.map((milestone, index) => (
                                        <div key={index} className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={milestone.value}
                                                onChange={(e) => {
                                                    const newMilestones = [...aboutData.companyInfo.milestones];
                                                    newMilestones[index].value = e.target.value;
                                                    handleChange('companyInfo', 'milestones', newMilestones);
                                                }}
                                                className="flex-1 input-field"
                                                placeholder="Value"
                                            />
                                            <input
                                                type="text"
                                                value={milestone.label}
                                                onChange={(e) => {
                                                    const newMilestones = [...aboutData.companyInfo.milestones];
                                                    newMilestones[index].label = e.target.value;
                                                    handleChange('companyInfo', 'milestones', newMilestones);
                                                }}
                                                className="flex-2 input-field"
                                                placeholder="Label"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-lg max-w-none">
                                <h3 className="text-2xl font-bold text-white mb-6">
                                    {aboutData.companyInfo.title}
                                </h3>
                                {aboutData.companyInfo.paragraphs.map((para, index) => (
                                    <p key={index} className="text-gray-300 mb-6">
                                        {para}
                                    </p>
                                ))}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    {aboutData.companyInfo.milestones.map((milestone, index) => (
                                        <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
                                            <div className="text-3xl font-bold text-teal-400 mb-2">
                                                {milestone.value}
                                            </div>
                                            <div className="text-gray-300 font-medium">
                                                {milestone.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Info Editor */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Contact Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => startEditing('contactInfo')}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8">
                        {isEditing && editingSection?.section === 'contactInfo' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={aboutData.contactInfo.email}
                                        onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                                        className="w-full input-field"
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Phone</label>
                                    <input
                                        type="text"
                                        value={aboutData.contactInfo.phone}
                                        onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                                        className="w-full input-field"
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Address</label>
                                    <input
                                        type="text"
                                        value={aboutData.contactInfo.address}
                                        onChange={(e) => handleChange('contactInfo', 'address', e.target.value)}
                                        className="w-full input-field"
                                        placeholder="Address"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-teal-500/20 rounded-lg">
                                            <Mail className="w-6 h-6 text-teal-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold mb-1 text-gray-300">Email</div>
                                            <div className="text-gray-400">{aboutData.contactInfo.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                            <Phone className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold mb-1 text-gray-300">Phone</div>
                                            <div className="text-gray-400">{aboutData.contactInfo.phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-purple-500/20 rounded-lg">
                                            <MapPin className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold mb-1 text-gray-300">Address</div>
                                            <div className="text-gray-400">{aboutData.contactInfo.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add CSS */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .card {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(55, 65, 81, 0.5);
                    border-radius: 0.75rem;
                    backdrop-filter: blur(10px);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .btn-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .input-field {
                    background: rgba(17, 24, 39, 0.5);
                    border: 1px solid rgba(55, 65, 81, 0.5);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    color: white;
                    width: 100%;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .loading-spinner {
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top: 2px solid white;
                    width: 1rem;
                    height: 1rem;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminAboutPickarry;