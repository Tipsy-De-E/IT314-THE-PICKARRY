import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = () => {
    // Approximate center of Jasaan, Misamis Oriental
    const jasaanCoords = [8.6547, 124.7573];

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <MapContainer
                center={jasaanCoords}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                maxBounds={[
                    [8.60, 124.70], // southwest boundary
                    [8.70, 124.80], // northeast boundary
                ]}
                maxBoundsViscosity={1.0} // prevents moving outside bounds
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a> contributors'
                    url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=UCT7ELAx1RjTyWzrxLbn`}
                />
            </MapContainer>
        </div>
    );
};

export default MapView;
