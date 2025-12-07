// mapUtils.js - Updated for Routing API Playground
const ROUTING_API_KEY = '3a5efd5b50004c209f743fb5f08bd749';
const BASE_URL = 'https://api.geoapify.com/v1';

// Jasaan Municipality coordinates and barangays
const JASAHAN_CENTER = [8.6546, 124.7552];
const JASAHAN_BOUNDS = [
  [8.6000, 124.7000],
  [8.7000, 124.8000]
];

// Jasaan Barangays with approximate coordinates and additional info
const JASAHAN_BARANGAYS = [
  { name: 'Aplaya', lat: 8.6514, lng: 124.7569, population: '2,500', area: '150 ha', fullAddress: 'Aplaya, Jasaan, Misamis Oriental' },
  { name: 'Bobontugan', lat: 8.6658, lng: 124.7589, population: '3,200', area: '180 ha', fullAddress: 'Bobontugan, Jasaan, Misamis Oriental' },
  { name: 'Solana', lat: 8.6481, lng: 124.7636, population: '2,800', area: '160 ha', fullAddress: 'Solana, Jasaan, Misamis Oriental' },
  { name: 'San Antonio', lat: 8.6583, lng: 124.7514, population: '3,500', area: '200 ha', fullAddress: 'San Antonio, Jasaan, Misamis Oriental' },
  { name: 'Ignacio S. Cruz', lat: 8.6625, lng: 124.7469, population: '2,900', area: '170 ha', fullAddress: 'Ignacio S. Cruz, Jasaan, Misamis Oriental' },
  { name: 'Jampason', lat: 8.6708, lng: 124.7417, population: '2,600', area: '155 ha', fullAddress: 'Jampason, Jasaan, Misamis Oriental' },
  { name: 'Kimaya', lat: 8.6833, lng: 124.7333, population: '3,800', area: '220 ha', fullAddress: 'Kimaya, Jasaan, Misamis Oriental' },
  { name: 'Lumbo', lat: 8.6417, lng: 124.7750, population: '2,700', area: '165 ha', fullAddress: 'Lumbo, Jasaan, Misamis Oriental' },
  { name: 'Nazareth', lat: 8.6375, lng: 124.7681, population: '3,100', area: '190 ha', fullAddress: 'Nazareth, Jasaan, Misamis Oriental' },
  { name: 'San Nicolas', lat: 8.6458, lng: 124.7583, population: '2,400', area: '140 ha', fullAddress: 'San Nicolas, Jasaan, Misamis Oriental' },
  { name: 'San Vicente', lat: 8.6528, lng: 124.7458, population: '3,300', area: '195 ha', fullAddress: 'San Vicente, Jasaan, Misamis Oriental' },
  { name: 'Santa Ana', lat: 8.6472, lng: 124.7528, population: '2,900', area: '175 ha', fullAddress: 'Santa Ana, Jasaan, Misamis Oriental' },
  { name: 'Upper Jasaan', lat: 8.6750, lng: 124.7500, population: '4,200', area: '250 ha', fullAddress: 'Upper Jasaan, Jasaan, Misamis Oriental' },
  { name: 'Veterans Village', lat: 8.6500, lng: 124.7600, population: '1,800', area: '120 ha', fullAddress: 'Veterans Village, Jasaan, Misamis Oriental' }
];

// Geocoding function to convert address to coordinates
export const geocodeAddress = async (address) => {
  try {
    // First try to find in barangays
    const barangay = JASAHAN_BARANGAYS.find(b => 
      address.toLowerCase().includes(b.name.toLowerCase())
    );
    
    if (barangay) {
      return {
        lat: barangay.lat,
        lng: barangay.lng,
        address: `${barangay.name}, Jasaan, Misamis Oriental`,
        barangay: barangay.name,
        fullAddress: barangay.fullAddress
      };
    }

    // Fallback to Geoapify geocoding
    const response = await fetch(
      `${BASE_URL}/geocode/search?text=${encodeURIComponent(address + ', Jasaan, Misamis Oriental')}&apiKey=${ROUTING_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        address: feature.properties.formatted,
        fullAddress: feature.properties
      };
    }
    
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Reverse geocoding - get address from coordinates
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${BASE_URL}/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${ROUTING_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const barangay = JASAHAN_BARANGAYS.find(b => 
        feature.properties.suburb?.toLowerCase().includes(b.name.toLowerCase()) ||
        feature.properties.village?.toLowerCase().includes(b.name.toLowerCase()) ||
        feature.properties.city?.toLowerCase().includes('jasaan')
      );
      
      return {
        address: feature.properties.formatted,
        street: feature.properties.street,
        barangay: barangay?.name || feature.properties.suburb || feature.properties.village,
        municipality: feature.properties.city || feature.properties.municipality,
        province: feature.properties.state,
        fullAddress: feature.properties
      };
    }
    
    throw new Error('Address not found for coordinates');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback: find nearest barangay
    const nearestBarangay = findNearestBarangay(lat, lng);
    return {
      address: `${nearestBarangay.name}, Jasaan, Misamis Oriental`,
      barangay: nearestBarangay.name,
      municipality: 'Jasaan',
      province: 'Misamis Oriental'
    };
  }
};

// Calculate distance and route between two points using Routing API
export const calculateRoute = async (startCoords, endCoords) => {
  try {
    const waypoints = `${startCoords.lat},${startCoords.lng}|${endCoords.lat},${endCoords.lng}`;
    
    const response = await fetch(
      `${BASE_URL}/routing?waypoints=${waypoints}&mode=drive&apiKey=${ROUTING_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Route calculation failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const route = data.features[0];
      const distance = (route.properties.distance / 1000).toFixed(1); // Convert to km
      const duration = Math.round(route.properties.time / 60); // Convert to minutes
      
      return {
        distance: `${distance} km`,
        duration: `${duration} min`,
        routeGeometry: route.geometry,
        rawDistance: route.properties.distance,
        rawTime: route.properties.time
      };
    }
    
    throw new Error('Route not found between the specified points');
  } catch (error) {
    console.error('Route calculation error:', error);
    // Fallback: calculate straight line distance
    const distance = calculateStraightDistance(startCoords, endCoords);
    const duration = Math.round(distance * 3); // Estimate 3 min per km
    
    return {
      distance: `${distance} km`,
      duration: `${duration} min`,
      routeGeometry: null,
      rawDistance: distance * 1000,
      rawTime: duration * 60
    };
  }
};

// Calculate straight line distance between two points (Haversine formula)
const calculateStraightDistance = (start, end) => {
  const R = 6371; // Earth's radius in km
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLon = (end.lng - start.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

// Find nearest barangay based on coordinates
const findNearestBarangay = (lat, lng) => {
  let nearest = JASAHAN_BARANGAYS[0];
  let minDistance = Number.MAX_SAFE_INTEGER;

  JASAHAN_BARANGAYS.forEach(barangay => {
    const distance = Math.sqrt(
      Math.pow(barangay.lat - lat, 2) + Math.pow(barangay.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = barangay;
    }
  });

  return nearest;
};

// Get address suggestions for autocomplete
export const getAddressSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    // Always include barangay suggestions
    const barangayResults = JASAHAN_BARANGAYS
      .filter(barangay => 
        barangay.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(barangay => ({
        address: barangay.fullAddress,
        lat: barangay.lat,
        lng: barangay.lng,
        name: barangay.name,
        type: 'barangay',
        isBarangay: true,
        population: barangay.population,
        area: barangay.area,
        fullAddress: barangay.fullAddress
      }));

    // Try Geoapify autocomplete for more specific addresses
    const response = await fetch(
      `${BASE_URL}/geocode/autocomplete?text=${encodeURIComponent(query + ', Jasaan')}&apiKey=${ROUTING_API_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      
      const apiResults = data.features.map(feature => ({
        address: feature.properties.formatted,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        name: feature.properties.name || feature.properties.street || feature.properties.suburb,
        type: feature.properties.result_type,
        isBarangay: false,
        properties: feature.properties
      }));

      return [...barangayResults, ...apiResults].slice(0, 10);
    }

    return barangayResults.slice(0, 10);

  } catch (error) {
    console.error('Autocomplete error:', error);
    // Return only barangay results if API fails
    return JASAHAN_BARANGAYS
      .filter(barangay => 
        barangay.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(barangay => ({
        address: barangay.fullAddress,
        lat: barangay.lat,
        lng: barangay.lng,
        name: barangay.name,
        type: 'barangay',
        isBarangay: true,
        population: barangay.population,
        area: barangay.area,
        fullAddress: barangay.fullAddress
      }))
      .slice(0, 10);
  }
};

// Search for places in Jasaan
export const searchPlacesInJasaan = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/geocode/search?text=${encodeURIComponent(query + ' Jasaan Misamis Oriental')}&apiKey=${ROUTING_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Place search failed');
    }
    
    const data = await response.json();
    
    return data.features.map(feature => ({
      address: feature.properties.formatted,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      name: feature.properties.name,
      type: feature.properties.result_type,
      properties: feature.properties
    }));
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
};

// Get all Jasaan barangays
export const getJasaanBarangays = () => {
  return JASAHAN_BARANGAYS;
};

export { JASAHAN_CENTER, JASAHAN_BOUNDS, JASAHAN_BARANGAYS };