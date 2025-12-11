import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Target, Users, Award, Clock, Heart, Globe, Shield, Truck,
    Mail, Phone, MapPin, Edit, Save, X, Upload, Trash2, Plus,
    Image as ImageIcon, Loader, Database, RefreshCw, AlertCircle, CheckCircle,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { supabase } from '../../../utils/supabaseClient';

// Create icon mapping object
const iconComponents = {
    ArrowLeft, Target, Users, Award, Clock, Heart, Globe, Shield, Truck,
    Mail, Phone, MapPin
};

const AdminAboutPickarry = ({ onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncStatus, setSyncStatus] = useState('idle');

    // Data from Supabase
    const [aboutData, setAboutData] = useState({
        features: [],
        stats: [],
        teamMembers: [],
        heroContent: {
            title: '',
            description: ''
        },
        companyInfo: {
            title: '',
            paragraphs: [],
            milestones: []
        },
        contactInfo: {
            email: '',
            phone: '',
            address: ''
        }
    });

    // Load data from Supabase
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                pageContentResult,
                teamMembersResult,
                featuresResult,
                statsResult
            ] = await Promise.all([
                supabase.from('about_page_content').select('*'),
                supabase
                    .from('team_members')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true }),
                supabase
                    .from('features')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true }),
                supabase
                    .from('stats')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })
            ]);

            if (pageContentResult.error) throw pageContentResult.error;
            if (teamMembersResult.error) throw teamMembersResult.error;
            if (featuresResult.error) throw featuresResult.error;
            if (statsResult.error) throw statsResult.error;

            // Transform page content based on your actual table schema
            const contentBySection = {};
            pageContentResult.data?.forEach(item => {
                contentBySection[item.section] = item;
            });

            // Parse the JSON fields from your table
            const heroData = contentBySection.hero || {};
            const storyData = contentBySection.story || {};
            const contactData = contentBySection.contact || {};

            // Transform features
            const features = featuresResult.data?.map(feature => ({
                id: feature.id,
                icon: feature.icon || 'Target',
                title: feature.title || '',
                description: feature.description || '',
                color: feature.color || 'from-blue-500 to-teal-400',
                display_order: feature.display_order || 0,
                is_active: feature.is_active || true
            })) || [];

            // Transform stats
            const stats = statsResult.data?.map(stat => ({
                id: stat.id,
                number: stat.number || '',
                label: stat.label || '',
                icon: stat.icon || 'Users',
                display_order: stat.display_order || 0,
                is_active: stat.is_active || true
            })) || [];

            // Transform team members
            const teamMembers = teamMembersResult.data?.map(member => ({
                id: member.id,
                name: member.name || '',
                role: member.role || '',
                description: member.description || '',
                imageColor: member.image_color || 'bg-gradient-to-br from-blue-500 to-teal-400',
                iconColor: member.icon_color || 'bg-blue-500/20 text-blue-400',
                photoPath: member.photo_path || null,
                photoUrl: member.photo_path ? getImageUrl(member.photo_path) : null,
                isFounder: member.is_founder || false,
                displayOrder: member.display_order || 0,
                isActive: member.is_active || true
            })) || [];

            // Parse milestones from JSON
            const milestones = storyData.stats || [];

            // Parse contact info from JSON
            const contactInfo = contactData.contact_info || {};

            // Set data according to your table schema
            setAboutData({
                features,
                stats,
                teamMembers,
                heroContent: {
                    title: heroData.title || 'Your Trusted Delivery Partner',
                    description: heroData.content || 'Default hero description'
                },
                companyInfo: {
                    title: storyData.title || 'Our Story',
                    paragraphs: storyData.content ? storyData.content.split('\n\n') : [],
                    milestones: milestones
                },
                contactInfo: {
                    email: contactInfo.email || 'support@pickarry.com',
                    phone: contactInfo.phone || '1-800-PICKARRY',
                    address: contactInfo.address || 'Manila, Philippines'
                }
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        const { data: { publicUrl } } = supabase.storage
            .from('team-photos')
            .getPublicUrl(path);
        return publicUrl;
    };

    const startEditing = (section, data = null) => {
        setEditingSection({ section, data });
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSyncStatus('saving');

        try {
            // Save each section to Supabase
            await Promise.all([
                savePageContent(),
                saveTeamMembers(),
                saveFeatures(),
                saveStats()
            ]);

            setSaveSuccess(true);
            setSyncStatus('success');
            setIsEditing(false);
            setEditingSection(null);

            // Refresh data
            setTimeout(() => {
                fetchData();
                setSaveSuccess(false);
                setSyncStatus('idle');
            }, 2000);

        } catch (error) {
            console.error('Error saving data:', error);
            setError('Failed to save changes. Please try again.');
            setSyncStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const savePageContent = async () => {
        // Prepare data according to your table schema
        const sections = [
            {
                section: 'hero',
                title: aboutData.heroContent.title,
                content: aboutData.heroContent.description
            },
            {
                section: 'story',
                title: aboutData.companyInfo.title,
                content: aboutData.companyInfo.paragraphs.join('\n\n'),
                stats: aboutData.companyInfo.milestones
            },
            {
                section: 'contact',
                contact_info: {
                    email: aboutData.contactInfo.email,
                    phone: aboutData.contactInfo.phone,
                    address: aboutData.contactInfo.address
                }
            }
        ];

        for (const sectionData of sections) {
            const { error } = await supabase
                .from('about_page_content')
                .upsert({
                    ...sectionData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'section'
                });

            if (error) throw error;
        }
    };

    const saveTeamMembers = async () => {
        // First, deactivate all existing team members
        const { error: deactivateError } = await supabase
            .from('team_members')
            .update({ is_active: false })
            .eq('is_active', true);

        if (deactivateError) throw deactivateError;

        // Then, upsert all current team members
        for (const [index, member] of aboutData.teamMembers.entries()) {
            const { error } = await supabase
                .from('team_members')
                .upsert({
                    id: member.id,
                    name: member.name,
                    role: member.role,
                    description: member.description,
                    image_color: member.imageColor,
                    icon_color: member.iconColor,
                    photo_path: member.photoPath,
                    is_founder: member.isFounder,
                    display_order: index,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;
        }
    };

    const saveFeatures = async () => {
        // First, deactivate all existing features
        const { error: deactivateError } = await supabase
            .from('features')
            .update({ is_active: false })
            .eq('is_active', true);

        if (deactivateError) throw deactivateError;

        // Then, upsert all current features
        for (const [index, feature] of aboutData.features.entries()) {
            const { error } = await supabase
                .from('features')
                .upsert({
                    id: feature.id,
                    icon: feature.icon,
                    title: feature.title,
                    description: feature.description,
                    color: feature.color,
                    display_order: index,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;
        }
    };

    const saveStats = async () => {
        // First, deactivate all existing stats
        const { error: deactivateError } = await supabase
            .from('stats')
            .update({ is_active: false })
            .eq('is_active', true);

        if (deactivateError) throw deactivateError;

        // Then, upsert all current stats
        for (const [index, stat] of aboutData.stats.entries()) {
            const { error } = await supabase
                .from('stats')
                .upsert({
                    id: stat.id,
                    number: stat.number,
                    label: stat.label,
                    icon: stat.icon,
                    display_order: index,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;
        }
    };

    const handleCancel = () => {
        const confirmed = window.confirm('Discard changes? All unsaved changes will be lost.');
        if (confirmed) {
            setIsEditing(false);
            setEditingSection(null);
            fetchData(); // Reload original data
        }
    };

    // Update handlers
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
        const newId = Date.now();
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
                    iconColor: 'bg-gray-500/20 text-gray-400',
                    photoPath: null,
                    photoUrl: null,
                    isFounder: false,
                    displayOrder: prev.teamMembers.length,
                    isActive: true
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

    const moveTeamMember = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === aboutData.teamMembers.length - 1)
        ) {
            return;
        }

        const newTeamMembers = [...aboutData.teamMembers];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap positions
        [newTeamMembers[index], newTeamMembers[newIndex]] =
            [newTeamMembers[newIndex], newTeamMembers[index]];

        setAboutData(prev => ({
            ...prev,
            teamMembers: newTeamMembers
        }));
    };

    const addFeature = () => {
        const newId = Date.now();
        setAboutData(prev => ({
            ...prev,
            features: [
                ...prev.features,
                {
                    id: newId,
                    icon: 'Target',
                    title: 'New Feature',
                    description: 'Feature description',
                    color: 'from-gray-500 to-gray-400',
                    display_order: prev.features.length,
                    is_active: true
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

    const addStat = () => {
        const newId = Date.now();
        setAboutData(prev => ({
            ...prev,
            stats: [
                ...prev.stats,
                {
                    id: newId,
                    number: '0',
                    label: 'New Stat',
                    icon: 'Users',
                    display_order: prev.stats.length,
                    is_active: true
                }
            ]
        }));
    };

    const removeStat = (id) => {
        if (aboutData.stats.length <= 1) {
            alert('Must have at least one stat');
            return;
        }
        setAboutData(prev => ({
            ...prev,
            stats: prev.stats.filter(stat => stat.id !== id)
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
            const fileExt = file.name.split('.').pop();
            const fileName = `${teamMemberId}_${Date.now()}.${fileExt}`;
            const filePath = `team-members/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('team-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('team-photos')
                .getPublicUrl(filePath);

            // Update team member
            handleTeamMemberChange(teamMemberId, 'photoPath', filePath);
            handleTeamMemberChange(teamMemberId, 'photoUrl', publicUrl);

            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const renderIconSelect = (currentIcon, onChange) => {
        const iconNames = Object.keys(iconComponents).filter(name =>
            !['ArrowLeft', 'Edit', 'Save', 'X', 'Upload', 'Trash2', 'Plus', 'Loader', 'Database', 'RefreshCw', 'AlertCircle', 'CheckCircle', 'ChevronUp', 'ChevronDown'].includes(name)
        );

        return (
            <div className="grid grid-cols-5 gap-2 mb-4">
                {iconNames.map((iconName, index) => {
                    const IconComponent = iconComponents[iconName];
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onChange(iconName)}
                            className={`p-3 rounded-lg ${currentIcon === iconName ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'} hover:opacity-90 transition-opacity duration-200`}
                            title={iconName}
                        >
                            <IconComponent className="w-5 h-5 text-white" />
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderColorSelect = (currentColor, onChange) => {
        const colors = [
            { name: 'Blue-Teal', value: 'from-blue-500 to-teal-400', bg: 'bg-gradient-to-br from-blue-500 to-teal-400' },
            { name: 'Purple-Pink', value: 'from-purple-500 to-pink-400', bg: 'bg-gradient-to-br from-purple-500 to-pink-400' },
            { name: 'Amber-Orange', value: 'from-amber-500 to-orange-400', bg: 'bg-gradient-to-br from-amber-500 to-orange-400' },
            { name: 'Emerald-Green', value: 'from-emerald-500 to-green-400', bg: 'bg-gradient-to-br from-emerald-500 to-green-400' },
            { name: 'Red-Rose', value: 'from-red-500 to-rose-400', bg: 'bg-gradient-to-br from-red-500 to-rose-400' },
            { name: 'Indigo-Purple', value: 'from-indigo-500 to-purple-400', bg: 'bg-gradient-to-br from-indigo-500 to-purple-400' }
        ];

        return (
            <div className="grid grid-cols-3 gap-2 mb-4">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onChange(color.value)}
                        className={`h-10 rounded-lg ${currentColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                    >
                        <div className={`w-full h-full rounded-lg ${color.bg}`}></div>
                        <span className="sr-only">{color.name}</span>
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading data from database...</p>
                </div>
            </div>
        );
    }

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
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">About Pickarry Management</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchData}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                title="Refresh from database"
                            >
                                <RefreshCw className="w-5 h-5 text-gray-300" />
                            </button>

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
                                                <span>Save to Database</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 rounded-lg transition-all duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit Mode</span>
                                    </button>
                                    <button
                                        onClick={() => window.open('/about', '_blank')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>View Public</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center mt-2 ml-14 space-x-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-400">
                            Connected to Supabase • {aboutData.teamMembers.length} team members • {aboutData.features.length} features
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {saveSuccess && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span>Changes saved to database!</span>
                    </div>
                </div>
            )}

            {syncStatus === 'saving' && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Syncing with database...</span>
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
                                <h3 className="font-bold text-lg text-white">Database Controls</h3>
                                <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                                    {isEditing ? '✏️ Edit Mode' : '👁️ View Mode'}
                                </span>
                            </div>
                            <p className="text-gray-300">
                                All changes are saved directly to Supabase database. Changes will be visible on the public About page immediately.
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

                {/* Team Section */}
                <div className="mb-16 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Leadership Team</h2>
                            <p className="text-gray-400">
                                Manage team members. Drag and drop to reorder. {aboutData.teamMembers.length} active members.
                            </p>
                        </div>
                        {isEditing && (
                            <button
                                onClick={addTeamMember}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 rounded-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Team Member</span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {aboutData.teamMembers.map((member, index) => (
                            <div
                                key={member.id}
                                className={`flex items-center p-4 bg-gray-800/50 border rounded-xl hover:border-teal-500/30 transition-all duration-200 ${member.isFounder ? 'border-2 border-teal-500' : 'border-gray-700'}`}
                            >
                                {isEditing && (
                                    <div className="flex flex-col mr-4 space-y-1">
                                        <button
                                            onClick={() => moveTeamMember(index, 'up')}
                                            className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => moveTeamMember(index, 'down')}
                                            className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
                                            disabled={index === aboutData.teamMembers.length - 1}
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Image */}
                                <div className="relative mr-4">
                                    <div className={`w-20 h-20 ${member.imageColor} rounded-full overflow-hidden shadow-lg border-2 border-gray-700`}>
                                        {member.photoUrl ? (
                                            <img
                                                src={member.photoUrl}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 p-1 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e, member.id)}
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage ? (
                                                <Loader className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Upload className="w-3 h-3" />
                                            )}
                                        </label>
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => handleTeamMemberChange(member.id, 'name', e.target.value)}
                                                    className="input-field"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={member.role}
                                                    onChange={(e) => handleTeamMemberChange(member.id, 'role', e.target.value)}
                                                    className="input-field"
                                                    placeholder="Role"
                                                />
                                            </div>
                                            <textarea
                                                value={member.description}
                                                onChange={(e) => handleTeamMemberChange(member.id, 'description', e.target.value)}
                                                className="input-field"
                                                placeholder="Description"
                                                rows="2"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.isFounder}
                                                            onChange={(e) => handleTeamMemberChange(member.id, 'isFounder', e.target.checked)}
                                                            className="rounded"
                                                            id={`founder-${member.id}`}
                                                        />
                                                        <label htmlFor={`founder-${member.id}`} className="text-sm">
                                                            Founder
                                                        </label>
                                                    </div>
                                                    <div className="text-sm text-gray-400">Color:</div>
                                                    {renderColorSelect(member.imageColor, (color) =>
                                                        handleTeamMemberChange(member.id, 'imageColor', color)
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeTeamMember(member.id)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-lg text-white">
                                                {member.name}
                                            </h3>
                                            <div className={`inline-block px-3 py-1 ${member.isFounder ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'} text-white text-sm font-semibold rounded-full mb-2 mx-auto block text-center`}>
                                                {member.role}
                                            </div>
                                            {member.isFounder && (
                                                <div className="inline-block ml-2 text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                                                    Founder
                                                </div>
                                            )}
                                            <p className="text-gray-400">
                                                {member.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Section */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Hero Section</h2>
                        {isEditing && (
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
                        {isEditing ? (
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
                            <p className="text-gray-400">
                                Manage feature cards. {aboutData.features.length} active features.
                            </p>
                        </div>
                        {isEditing && (
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
                        {aboutData.features.map((feature) => {
                            const IconComponent = iconComponents[feature.icon] || Target;

                            return (
                                <div
                                    key={feature.id}
                                    className="relative p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-teal-500/30 transition-all duration-200"
                                >
                                    {isEditing && (
                                        <div className="absolute top-4 right-4 flex space-x-2">
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
                                                className="input-field text-xl font-bold"
                                                placeholder="Feature Title"
                                            />
                                            <textarea
                                                value={feature.description}
                                                onChange={(e) => handleFeatureChange(feature.id, 'description', e.target.value)}
                                                className="input-field"
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
                                                <IconComponent className="w-6 h-6 text-white" />
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
                            );
                        })}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Statistics</h2>
                            <p className="text-gray-400">
                                Manage statistics. {aboutData.stats.length} active stats.
                            </p>
                        </div>
                        {isEditing && (
                            <button
                                onClick={addStat}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 rounded-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Stat</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {aboutData.stats.map((stat) => {
                            const IconComponent = iconComponents[stat.icon] || Users;

                            return (
                                <div
                                    key={stat.id}
                                    className="relative p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-teal-500/30 transition-all duration-200"
                                >
                                    {isEditing && (
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <button
                                                onClick={() => startEditing('stat', stat)}
                                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => removeStat(stat.id)}
                                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400" />
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
                                                className="input-field text-2xl font-bold text-center"
                                                placeholder="Stat Number"
                                            />
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                                                className="input-field text-center"
                                                placeholder="Stat Label"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl">
                                                    <IconComponent className="w-6 h-6 text-white" />
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
                            );
                        })}
                    </div>
                </div>

                {/* Company Info */}
                <div className="mb-12 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Company Story</h2>
                        {isEditing && (
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
                        {isEditing ? (
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    value={aboutData.companyInfo.title}
                                    onChange={(e) => handleChange('companyInfo', 'title', e.target.value)}
                                    className="input-field text-2xl font-bold"
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
                                            className="input-field"
                                            placeholder={`Paragraph ${index + 1}`}
                                            rows="3"
                                        />
                                    ))}
                                    <button
                                        onClick={() => handleChange('companyInfo', 'paragraphs', [...aboutData.companyInfo.paragraphs, ''])}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Add Paragraph
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-400">Milestones:</div>
                                    {aboutData.companyInfo.milestones.map((milestone, index) => (
                                        <div key={index} className="flex space-x-3 items-center">
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
                                            <button
                                                onClick={() => {
                                                    const newMilestones = aboutData.companyInfo.milestones.filter((_, i) => i !== index);
                                                    handleChange('companyInfo', 'milestones', newMilestones);
                                                }}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => handleChange('companyInfo', 'milestones', [...aboutData.companyInfo.milestones, { value: '', label: '' }])}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        Add Milestone
                                    </button>
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
                                {aboutData.companyInfo.milestones.length > 0 && (
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
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Contact Information</h2>
                        {isEditing && (
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
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={aboutData.contactInfo.email}
                                        onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                                        className="input-field"
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Phone</label>
                                    <input
                                        type="text"
                                        value={aboutData.contactInfo.phone}
                                        onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                                        className="input-field"
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Address</label>
                                    <input
                                        type="text"
                                        value={aboutData.contactInfo.address}
                                        onChange={(e) => handleChange('contactInfo', 'address', e.target.value)}
                                        className="input-field"
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

                {/* Save Button */}
                {isEditing && (
                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                        >
                            {isSaving ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Saving to Database...</span>
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5" />
                                    <span>Save All Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAboutPickarry;