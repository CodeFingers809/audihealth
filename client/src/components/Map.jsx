import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { ChangeMapCenter } from "./ChangeMapCenter";
import { SearchBox } from "./SearchBox";
import { DoctorMarker } from "./DoctorMarker";
import { staticDoctors } from "../data/doctors";
import "../utils/leafletConfig";
import "leaflet/dist/leaflet.css";

export function Map() {
  const [userLocation, setUserLocation] = useState(null);
  const [doctors] = useState(staticDoctors);
  const { searchTerm, setSearchTerm, suggestions, loading } =
    useLocationSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setUserLocation([30.356726, 76.364187]); // Default to Thapar Institute
        }
      );
    } else {
      console.error("Geolocation not supported.");
      setUserLocation([30.356726, 76.364187]);
    }
  }, []);

  const handleLocationSelect = (location) => {
    const newLocation = [parseFloat(location.lat), parseFloat(location.lon)];
    setUserLocation(newLocation);
    setSearchTerm(location.display_name);
    setShowSuggestions(false);
  };

  return (
    <div className="app-container relative">
      {/* Search Box Component */}
      <SearchBox
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        loading={loading}
        onLocationSelect={handleLocationSelect}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
      />

      {/* Map Display */}
      {userLocation ? (
        <MapContainer
          center={userLocation}
          zoom={15}
          style={{ height: "100vh", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeMapCenter center={userLocation} />

          {/* User Location CircleMarker (Filled Disc) */}
          <CircleMarker
            center={userLocation}
            radius={10}
            color="blue"
            fillColor="blue"
            fillOpacity={0.6}
          >
            <Popup>
              <div>
                <h3>Your Location</h3>
                <p>Latitude: {userLocation[0]}</p>
                <p>Longitude: {userLocation[1]}</p>
              </div>
            </Popup>
          </CircleMarker>

          {/* Doctor Markers */}
          {doctors.map((doctor) => (
            <DoctorMarker key={doctor.id} doctor={doctor} />
          ))}
        </MapContainer>
      ) : (
        <p className="text-center mt-4">Loading map...</p>
      )}
    </div>
  );
}
