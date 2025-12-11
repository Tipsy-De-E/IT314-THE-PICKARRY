import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X } from 'lucide-react';

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

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([8.6546, 124.7552], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Handle map click for pinpointing
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

  // Update map when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateMapWithLocations();
  }, [pickupLocation, deliveryLocation, mode]);

  // Handle map click for pinpointing
  const handleMapClick = async (lat, lng) => {
    try {
      // Import only when needed
      const { reverseGeocode } = await import('../utils/mapUtils');
      const addressInfo = await reverseGeocode(lat, lng);

      // Format address for better accuracy
      let formattedAddress = addressInfo.address;

      // If address is too generic, try to get more details
      if (formattedAddress.includes('Jasaan, Misamis Oriental') && !formattedAddress.includes(',')) {
        // Get nearest barangay for more specific address
        const { getJasaanBarangays } = await import('../utils/mapUtils');
        const barangays = getJasaanBarangays();
        const nearestBarangay = barangays.reduce((nearest, barangay) => {
          const distance = Math.sqrt(
            Math.pow(barangay.lat - lat, 2) + Math.pow(barangay.lng - lng, 2)
          );
          if (distance < nearest.distance) {
            return { barangay, distance };
          }
          return nearest;
        }, { barangay: null, distance: Infinity }).barangay;

        if (nearestBarangay) {
          formattedAddress = `${nearestBarangay.name}, Jasaan, Misamis Oriental`;
        }
      }

      // Immediately call onLocationSelect with the coordinates and address
      // No confirmation modal needed
      if (onLocationSelect) {
        onLocationSelect(formattedAddress, {
          lat: lat,
          lng: lng,
          barangay: addressInfo.barangay,
          municipality: addressInfo.municipality
        });
      }

      // Add temporary marker for visual feedback
      addTemporaryMarker(lat, lng, formattedAddress);

    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback: use coordinates as address
      const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      if (onLocationSelect) {
        onLocationSelect(fallbackAddress, { lat, lng });
      }
      addTemporaryMarker(lat, lng, fallbackAddress);
    }
  };

  // Add temporary marker that auto-removes after 2 seconds
  const addTemporaryMarker = (lat, lng, address) => {
    // Clear any existing temporary markers
    markersRef.current.forEach(marker => {
      if (marker._customType === 'temporary') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });

    const tempMarker = L.marker([lat, lng], {
      icon: selectionIcon,
      zIndexOffset: 1000
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <strong>📍 Location Selected</strong><br/>
          <div style="margin: 8px 0; font-size: 14px;">${address}</div>
          <p style="font-size: 12px; color: #666;">This marker will disappear shortly</p>
        </div>
      `)
      .openPopup();

    tempMarker._customType = 'temporary';
    markersRef.current.push(tempMarker);

    // Auto-remove after 2 seconds
    setTimeout(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(tempMarker)) {
        mapInstanceRef.current.removeLayer(tempMarker);
      }
    }, 2000);
  };

  // Update map with current locations
  const updateMapWithLocations = async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and route (except temporary)
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current && marker._customType !== 'temporary' && marker._customType !== 'barangay') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = markersRef.current.filter(marker =>
      marker._customType === 'temporary' || marker._customType === 'barangay'
    );

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

        // Global function for barangay selection
        window.selectBarangay = (name, lat, lng) => {
          const address = `${name}, Jasaan, Misamis Oriental`;
          if (onLocationSelect) {
            onLocationSelect(address, {
              lat: lat,
              lng: lng,
              barangay: name,
              municipality: 'Jasaan'
            });
          }
          addTemporaryMarker(lat, lng, address);
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

  // Handle cancel selection
  const handleCancelSelection = () => {
    // Clear temporary markers
    markersRef.current.forEach(marker => {
      if (marker._customType === 'temporary') {
        mapInstanceRef.current.removeLayer(marker);
      }
    });

    if (onModeChange) {
      onModeChange('view');
    }
  };

  return (
    <div className="map-container" style={{ position: 'relative', height, width: '100%' }}>
      {/* Enhanced Location Selection Panel */}
      {mode !== 'view' && (
        <div className="enhanced-location-selection-panel">
          {/* <div className="selection-header-compact">
            <button
              onClick={handleCancelSelection}
              className="close-selection-button"
              title="Cancel selection"
            >
              <X size={16} />
            </button>
          </div> */}

          {/* <div className="selection-instructions-compact">
            <p>📍 Click on map to select location - One click only!</p>
            <p className="instruction-note">Click any location on the map to instantly set it</p>
          </div> */}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '8px',
          cursor: mode !== 'view' ? 'crosshair' : 'default'
        }}
      />
    </div>
  );
};

export default MapComponent;