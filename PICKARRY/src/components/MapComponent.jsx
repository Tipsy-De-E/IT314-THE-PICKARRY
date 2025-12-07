
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation, X } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({
  pickupLocation,
  deliveryLocation,
  onDistanceCalculated,
  onLocationSelect,
  height = '400px',
  mode = 'view',
  onModeChange
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Custom icons
  const createCustomIcon = (color) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  const pickupIcon = createCustomIcon('#10b981');
  const deliveryIcon = createCustomIcon('#ef4444');
  const selectionIcon = createCustomIcon('#3b82f6');
  const barangayIcon = createCustomIcon('#8b5cf6');

  useEffect(() => {
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([8.6546, 124.7552], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on('click', async (e) => {
        if (mode !== 'view') {
          const { lat, lng } = e.latlng;
          await handleMapClick(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mode]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateMapWithLocations();
  }, [pickupLocation, deliveryLocation, mode]);

  const handleMapClick = async (lat, lng) => {
    try {
      const { reverseGeocode } = await import('../utils/mapUtils');
      const addressInfo = await reverseGeocode(lat, lng);

      setSelectedLocation({
        lat: lat,
        lng: lng,
        address: addressInfo.address,
        barangay: addressInfo.barangay,
        municipality: addressInfo.municipality
      });

      updateSelectionMarker(lat, lng, addressInfo.address);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const updateSelectionMarker = (lat, lng, address) => {
    // Clear existing selection marker
    markersRef.current.forEach(marker => {
      if (marker._customType === 'selection') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });

    const selectionMarker = L.marker([lat, lng], { icon: selectionIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <strong>📍 Selected Location</strong><br/>
          <div style="margin: 8px 0; font-size: 14px;">${address}</div>
          <button onclick="window.confirmSelection()" 
            style="width: 100%; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
            ✅ Confirm This Location
          </button>
        </div>
      `);

    window.confirmSelection = () => {
      if (selectedLocation && onLocationSelect) {
        onLocationSelect(selectedLocation.address, {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        });
      }
    };

    selectionMarker._customType = 'selection';
    markersRef.current.push(selectionMarker);
    selectionMarker.openPopup();
  };

  const updateMapWithLocations = async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and route
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current && marker._customType !== 'barangay') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = markersRef.current.filter(marker => marker._customType === 'barangay');

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    try {
      const { geocodeAddress, calculateRoute, getJasaanBarangays } = await import('../utils/mapUtils');

      let pickupCoords, deliveryCoords;
      const bounds = L.latLngBounds();

      // Always show barangay markers in selection mode
      if (mode !== 'view') {
        const barangays = getJasaanBarangays();
        barangays.forEach(barangay => {
          // Check if barangay marker already exists
          const existingMarker = markersRef.current.find(m =>
            m._customType === 'barangay' && m._barangayName === barangay.name
          );

          if (!existingMarker) {
            const barangayMarker = L.marker([barangay.lat, barangay.lng], {
              icon: barangayIcon
            })
              .addTo(mapInstanceRef.current)
              .bindPopup(`
                <div style="padding: 8px; min-width: 200px;">
                  <strong>🏠 ${barangay.name}</strong><br/>
                  <div style="font-size: 12px; color: #666; margin: 4px 0;">
                    📍 ${barangay.fullAddress}<br/>
                    👥 ${barangay.population} • 📏 ${barangay.area}
                  </div>
                  <button onclick="window.selectBarangay('${barangay.name}', ${barangay.lat}, ${barangay.lng})" 
                    style="width: 100%; padding: 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 8px;">
                    📍 Select ${barangay.name}
                  </button>
                </div>
              `);
            barangayMarker._customType = 'barangay';
            barangayMarker._barangayName = barangay.name;
            markersRef.current.push(barangayMarker);
          }
          bounds.extend([barangay.lat, barangay.lng]);
        });

        window.selectBarangay = (name, lat, lng) => {
          const address = `${name}, Jasaan, Misamis Oriental`;
          setSelectedLocation({
            lat,
            lng,
            address,
            barangay: name,
            municipality: 'Jasaan'
          });
          updateSelectionMarker(lat, lng, address);
        };
      }

      // Geocode and show pickup location
      if (pickupLocation && mode === 'view') {
        try {
          pickupCoords = await geocodeAddress(pickupLocation);
          const pickupMarker = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="padding: 8px;">
                <strong>📍 Pickup Location</strong><br/>
                <div style="font-size: 12px;">${pickupLocation}</div>
              </div>
            `);
          pickupMarker._customType = 'pickup';
          markersRef.current.push(pickupMarker);
          bounds.extend([pickupCoords.lat, pickupCoords.lng]);
        } catch (error) {
          console.error('Error geocoding pickup location:', error);
        }
      }

      // Geocode and show delivery location
      if (deliveryLocation && mode === 'view') {
        try {
          deliveryCoords = await geocodeAddress(deliveryLocation);
          const deliveryMarker = L.marker([deliveryCoords.lat, deliveryCoords.lng], { icon: deliveryIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="padding: 8px;">
                <strong>🏠 Delivery Location</strong><br/>
                <div style="font-size: 12px;">${deliveryLocation}</div>
              </div>
            `);
          deliveryMarker._customType = 'delivery';
          markersRef.current.push(deliveryMarker);
          bounds.extend([deliveryCoords.lat, deliveryCoords.lng]);
        } catch (error) {
          console.error('Error geocoding delivery location:', error);
        }
      }

      // Calculate route if both locations are available
      if (pickupCoords && deliveryCoords && mode === 'view') {
        try {
          const routeInfo = await calculateRoute(pickupCoords, deliveryCoords);

          if (routeInfo.routeGeometry) {
            routeLayerRef.current = L.geoJSON(routeInfo.routeGeometry, {
              style: {
                color: '#14b8a6',
                weight: 4,
                opacity: 0.7
              }
            }).addTo(mapInstanceRef.current);
            bounds.extend(routeLayerRef.current.getBounds());
          }

          if (onDistanceCalculated) {
            onDistanceCalculated(routeInfo.distance, routeInfo.duration);
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        }
      }

      // Fit map to show all markers
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Default view of Jasaan
        mapInstanceRef.current.setView([8.6546, 124.7552], 14);
      }

    } catch (error) {
      console.error('Error updating map:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { getAddressSuggestions } = await import('../utils/mapUtils');
      const results = await getAddressSuggestions(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);

      if (results.length > 0) {
        const firstResult = results[0];
        mapInstanceRef.current.setView([firstResult.lat, firstResult.lng], 16);

        if (mode !== 'view') {
          setSelectedLocation({
            lat: firstResult.lat,
            lng: firstResult.lng,
            address: firstResult.address,
            name: firstResult.name,
            barangay: firstResult.isBarangay ? firstResult.name : undefined
          });
          updateSelectionMarker(firstResult.lat, firstResult.lng, firstResult.address);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result) => {
    setSelectedLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      name: result.name,
      barangay: result.isBarangay ? result.name : undefined
    });

    mapInstanceRef.current.setView([result.lat, result.lng], 16);
    setShowSearchResults(false);
    setSearchQuery('');

    if (mode !== 'view') {
      updateSelectionMarker(result.lat, result.lng, result.address);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation.address, {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      });
    }
  };

  const handleCancelSelection = () => {
    setSelectedLocation(null);
    // Clear selection marker
    markersRef.current.forEach(marker => {
      if (marker._customType === 'selection') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    if (onModeChange) {
      onModeChange('view');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  return (
    <div className="map-container" style={{ position: 'relative', height, width: '100%' }}>
      {/* Enhanced Location Selection Panel - Moved to top and compact */}
      {mode !== 'view' && (
        <div className="enhanced-location-selection-panel">
          <div className="selection-header-compact">
            {/* <div className="selection-title">
              <MapPin size={18} />
              <span>Set {mode === 'pickup' ? 'Pickup' : 'Delivery'} Location</span>
            </div> */}
            <button
              onClick={handleCancelSelection}
              className="close-selection-button"
              title="Cancel selection"
            >
              <X size={16} />
            </button>
          </div>

          <div className="selection-instructions-compact">
            <p>📍 Click anywhere on the map to select location</p>
          </div>

          {selectedLocation && (
            <div className="selected-location-compact">
              {/* <div className="selected-address">
                <strong>Selected:</strong> {selectedLocation.address}
              </div> */}
              <button
                onClick={handleConfirmLocation}
                className="confirm-location-button"
              >
                Confirm Location
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Search Bar - Only show in view mode */}
      {mode === 'view' && (
        <div className="map-search-bar">
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search barangays in Jasaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-search-button">
                <X size={14} />
              </button>
            )}
            <button onClick={handleSearch} disabled={isSearching} className="search-button">
              {isSearching ? '...' : 'Search'}
            </button>
          </div>

          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleLocationSelect(result)}
                  >
                    <MapPin size={14} className={result.isBarangay ? 'barangay-icon' : 'place-icon'} />
                    <div className="result-details">
                      <div className="result-name">
                        {result.name}
                        {result.isBarangay && <span className="barangay-badge">Barangay</span>}
                      </div>
                      <div className="result-address">{result.address}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <MapPin size={16} />
                  <div>No results found</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '8px',
          marginTop: mode !== 'view' ? '80px' : '0',
          transition: 'margin-top 0.3s ease'
        }}
      />
    </div>
  );
};

export default MapComponent;