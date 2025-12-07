// components/FareManagement.jsx
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus, Trash2, Search, MapPin, Clock, DollarSign, Percent, Zap, Truck } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { getCurrentUser } from '../../utils/auth';

const FareManagement = () => {
    const [fareConfig, setFareConfig] = useState({
        time_rate_per_minute: 9,
        platform_commission: 0.8,
        bonus_rate: 3,
        penalty_rate_per_minute: 32,
        grace_period_seconds: 320
    });

    const [vehicleRates, setVehicleRates] = useState([]);
    const [distanceSettings, setDistanceSettings] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState(null);

    useEffect(() => {
        fetchCurrentAdmin();
        fetchFareData();
    }, []);

    const fetchCurrentAdmin = async () => {
        try {
            const session = getCurrentUser();
            if (session && session.email) {
                // FIX: Use .maybeSingle() instead of .single() to handle no rows
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('email', session.email)
                    .maybeSingle(); // This returns null instead of throwing error

                if (error) {
                    console.error('Error fetching admin:', error);
                    return;
                }

                if (data) {
                    setCurrentAdmin(data);
                    console.log('Admin found:', data);
                } else {
                    console.log('No admin found with email:', session.email);
                    // You might want to handle this case - redirect or show message
                }
            } else {
                console.log('No session or email found');
            }
        } catch (error) {
            console.error('Error in fetchCurrentAdmin:', error);
        }
    };

    const fetchFareData = async () => {
        try {
            setLoading(true);

            // Fetch fare configuration - use maybeSingle to handle no config
            const { data: configData, error: configError } = await supabase
                .from('fare_configuration')
                .select('*')
                .eq('is_active', true)
                .maybeSingle();

            if (configError) {
                console.error('Error fetching fare config:', configError);
            } else if (configData) {
                setFareConfig(configData);
                console.log('Fare config loaded:', configData);
            } else {
                console.log('No active fare configuration found, using defaults');
            }

            // Fetch vehicle rates
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicle_rates')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (vehicleError) {
                console.error('Error fetching vehicle rates:', vehicleError);
            } else if (vehicleData) {
                setVehicleRates(vehicleData);
                console.log('Vehicle rates loaded:', vehicleData);
            }

            // Fetch distance settings
            const { data: distanceData, error: distanceError } = await supabase
                .from('distance_fare_settings')
                .select('*')
                .eq('is_active', true)
                .order('min_distance');

            if (distanceError) {
                console.error('Error fetching distance settings:', distanceError);
            } else if (distanceData) {
                setDistanceSettings(distanceData);
                console.log('Distance settings loaded:', distanceData);
            }

        } catch (error) {
            console.error('Error fetching fare data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFareConfig = async () => {
        try {
            // Allow saving even if no admin is found (for demo/testing)
            // Or you can check if currentAdmin exists and handle accordingly

            // Check if config exists
            const { data: existingConfig, error: checkError } = await supabase
                .from('fare_configuration')
                .select('config_id')
                .eq('is_active', true)
                .maybeSingle();

            if (checkError) {
                throw checkError;
            }

            let result;
            const updateData = {
                ...fareConfig,
                customer_id: currentAdmin?.id || null, // Use null if no admin
                updated_at: new Date().toISOString()
            };

            if (existingConfig) {
                // Update existing config
                result = await supabase
                    .from('fare_configuration')
                    .update(updateData)
                    .eq('config_id', existingConfig.config_id)
                    .select();
            } else {
                // Create new config
                result = await supabase
                    .from('fare_configuration')
                    .insert({
                        ...updateData,
                        created_at: new Date().toISOString()
                    })
                    .select();
            }

            if (result.error) throw result.error;

            setIsEditing(false);
            alert('Fare configuration updated successfully!');
            fetchFareData(); // Refresh data
        } catch (error) {
            console.error('Error saving fare config:', error);
            alert('Error saving fare configuration: ' + error.message);
        }
    };

    const handleSaveVehicleRate = async (vehicleId, updates) => {
        try {
            const { error } = await supabase
                .from('vehicle_rates')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('vehicle_id', vehicleId);

            if (error) throw error;

            fetchFareData();
            alert('Vehicle rate updated successfully!');
        } catch (error) {
            console.error('Error saving vehicle rate:', error);
            alert('Error saving vehicle rate: ' + error.message);
        }
    };

    const handleSaveDistanceSetting = async (settingId, updates) => {
        try {
            const { error } = await supabase
                .from('distance_fare_settings')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', settingId);

            if (error) throw error;

            fetchFareData();
            alert('Distance setting updated successfully!');
        } catch (error) {
            console.error('Error saving distance setting:', error);
            alert('Error saving distance setting: ' + error.message);
        }
    };

    const calculateSampleFare = (vehicle, distance = 5, time = 15, isRush = false) => {
        if (!vehicle || !fareConfig) return 0;

        const base = vehicle.base_fare || 0;
        const distanceCost = distance * (vehicle.distance_rate_per_km || 0);
        const timeCost = time * (fareConfig.time_rate_per_minute || 0);
        const bonus = isRush ? (fareConfig.bonus_rate || 0) : 0;

        const subtotal = base + distanceCost + timeCost + bonus;
        const platformFee = subtotal * ((fareConfig.platform_commission || 0) / 100);

        return subtotal + platformFee;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <p className="text-white ml-3">Loading fare configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Admin Info Banner */}
            {!currentAdmin && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                        <strong>Note:</strong> No admin user found. Fare configuration can still be managed.
                    </p>
                </div>
            )}

            {/* Delivery Fare Management */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">

                        Delivery Fare Management
                    </h2>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white transition-colors"
                        >
                            <Edit2 size={16} />
                            Edit Settings
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveFareConfig}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchFareData();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                            <Clock size={16} />
                            Time Rate (₱ per Minute)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={fareConfig.time_rate_per_minute}
                                onChange={(e) => setFareConfig({ ...fareConfig, time_rate_per_minute: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                step="0.1"
                                min="0"
                            />
                        ) : (
                            <div className="text-white font-semibold text-lg">₱{fareConfig.time_rate_per_minute}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                            <Percent size={16} />
                            Platform Commission (%)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={fareConfig.platform_commission}
                                onChange={(e) => setFareConfig({ ...fareConfig, platform_commission: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                step="0.1"
                                min="0"
                                max="100"
                            />
                        ) : (
                            <div className="text-white font-semibold text-lg">{fareConfig.platform_commission}%</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                            <Zap size={16} />
                            Ipa-Dali Bonus
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={fareConfig.bonus_rate}
                                onChange={(e) => setFareConfig({ ...fareConfig, bonus_rate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                min="0"
                            />
                        ) : (
                            <div className="text-white font-semibold text-lg">₱{fareConfig.bonus_rate}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Penalty Rate (₱ Per Minute)</label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={fareConfig.penalty_rate_per_minute}
                                onChange={(e) => setFareConfig({ ...fareConfig, penalty_rate_per_minute: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                min="0"
                            />
                        ) : (
                            <div className="text-white font-semibold text-lg">₱{fareConfig.penalty_rate_per_minute}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Grace Period (Seconds)</label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={fareConfig.grace_period_seconds}
                                onChange={(e) => setFareConfig({ ...fareConfig, grace_period_seconds: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                min="0"
                            />
                        ) : (
                            <div className="text-white font-semibold text-lg">{fareConfig.grace_period_seconds}s</div>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                        <p className="text-yellow-400 text-sm">
                            Changes to fare settings will affect all new delivery calculations immediately.
                        </p>
                    </div>
                )}
            </div>

            {/* Delivery Vehicle Management */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Truck size={24} />
                    Delivery Vehicle Management
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicleRates.map((vehicle) => (
                        <VehicleRateCard
                            key={vehicle.vehicle_id}
                            vehicle={vehicle}
                            onSave={handleSaveVehicleRate}
                            calculateSample={calculateSampleFare}
                        />
                    ))}
                </div>
            </div>

            {/* Distance-based Fare Settings */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <MapPin size={24} />
                    Distance-based Fare Settings
                </h2>

                <div className="space-y-4">
                    {distanceSettings.map((setting) => (
                        <DistanceSettingCard
                            key={setting.id}
                            setting={setting}
                            onSave={handleSaveDistanceSetting}
                        />
                    ))}
                </div>

                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                        <strong>Note:</strong> Distance multipliers affect both base fare and time rates.
                        Higher multipliers apply to longer distances to account for increased operational costs.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Vehicle Rate Card Component
const VehicleRateCard = ({ vehicle, onSave, calculateSample }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...vehicle });

    const handleSave = () => {
        onSave(vehicle.vehicle_id, editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...vehicle });
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-750 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{vehicle.icon}</span>
                    <h3 className="text-white font-semibold">{vehicle.vehicle_type}</h3>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                ) : (
                    <div className="flex gap-1">
                        <button
                            onClick={handleSave}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                        >
                            <Save size={14} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div>
                    <label className="text-gray-400 text-sm">Base Fare</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editData.base_fare}
                            onChange={(e) => setEditData({ ...editData, base_fare: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            step="0.1"
                            min="0"
                        />
                    ) : (
                        <div className="text-white font-semibold">₱{vehicle.base_fare}</div>
                    )}
                </div>

                <div>
                    <label className="text-gray-400 text-sm">Distance Rate per Km</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editData.distance_rate_per_km}
                            onChange={(e) => setEditData({ ...editData, distance_rate_per_km: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            step="0.1"
                            min="0"
                        />
                    ) : (
                        <div className="text-white font-semibold">₱{vehicle.distance_rate_per_km}</div>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-sm text-gray-400">
                    Sample (5km, 15min):
                    <span className="text-green-400 font-semibold ml-1">
                        ₱{calculateSample(vehicle, 5, 15).toFixed(2)}
                    </span>
                </div>
                <div className="text-sm text-gray-400">
                    With Rush:
                    <span className="text-yellow-400 font-semibold ml-1">
                        ₱{calculateSample(vehicle, 5, 15, true).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Distance Setting Card Component
const DistanceSettingCard = ({ setting, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...setting });

    const handleSave = () => {
        onSave(setting.id, editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...setting });
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-750 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                    {setting.min_distance} - {setting.max_distance} km
                </h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                ) : (
                    <div className="flex gap-1">
                        <button
                            onClick={handleSave}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                        >
                            <Save size={14} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-gray-400 text-sm">Base Multiplier</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editData.base_multiplier}
                            onChange={(e) => setEditData({ ...editData, base_multiplier: parseFloat(e.target.value) || 1.0 })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            step="0.1"
                            min="0"
                        />
                    ) : (
                        <div className="text-white font-semibold">{setting.base_multiplier}x</div>
                    )}
                </div>

                <div>
                    <label className="text-gray-400 text-sm">Time Multiplier</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editData.time_multiplier}
                            onChange={(e) => setEditData({ ...editData, time_multiplier: parseFloat(e.target.value) || 1.0 })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            step="0.1"
                            min="0"
                        />
                    ) : (
                        <div className="text-white font-semibold">{setting.time_multiplier}x</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FareManagement;