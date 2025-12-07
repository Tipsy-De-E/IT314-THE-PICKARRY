import React, { useState, useEffect, useRef } from 'react';
import { getAddressSuggestions } from '../utils/mapUtils';
import { MapPin } from 'lucide-react';

const AddressAutocomplete = ({
  value,
  onChange,
  placeholder,
  onSelect,
  onMapSelect
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value && value.length > 2) {
      setIsLoading(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await getAddressSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.address);
    if (onSelect) {
      onSelect(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="address-autocomplete">
      <div className="autocomplete-input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="autocomplete-input"
        />
        {/* <button
          onClick={onMapSelect}
          className="map-select-button"
          title="Select from map"
          type="button"
        >
          <MapPin size={16} />
        </button> */}
      </div>

      {isLoading && (
        <div className="autocomplete-loading">Searching...</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="autocomplete-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin size={14} className={`suggestion-icon ${suggestion.isBarangay ? 'barangay-icon' : ''}`} />
              <div className="suggestion-details">
                <div className="suggestion-address">
                  {suggestion.name || suggestion.address.split(',')[0]}
                  {suggestion.isBarangay && <span className="barangay-badge">Barangay</span>}
                </div>
                <div className="suggestion-location">
                  {suggestion.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;