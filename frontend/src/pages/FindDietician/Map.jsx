import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
  InfoWindow,
} from "@react-google-maps/api";
import Places from "./Places";
import Distance from "./Distance";
import './Map.css';

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export default function Map() {
  const lat = 21.135360;
  const lng = 79.101952;
  const [office, setOffice] = useState({ lat, lng });
  const [directions, setDirections] = useState(null);
  const [dieticians, setDieticians] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef();
  const center = useMemo(() => ({ lat, lng }), []);
  const options = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
  }), []);

  const onLoad = useCallback(map => (mapRef.current = map), []);
  const houses = useMemo(() => generateHouses(center), [center]);

  const fetchDirections = (house) => {
    if (!office) return;
  
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: house,
        destination: office,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          // Clear existing directions
          setDirections(null);
          // Set new directions
          setDirections(result);
        }
      }
    );
  };
  

  const fetchDieticians = useCallback((location) => {
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location,
      radius: '1500', // 1.5 km radius
      type: 'hospital', // Specify the type to find dieticians
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setDieticians(results);
      }
    });
  }, []);

  useEffect(() => {
    if (office) {
      fetchDieticians(office);
    }
  }, [office, fetchDieticians]);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleGetDirections = () => {
    if (selectedMarker) {
      fetchDirections(selectedMarker.geometry.location);
      setSelectedMarker(null);
    }
  };

  return (
    <div className="container">
      <div className="controls">
        <h1>Nearby Hospitals</h1>
        <Places
          setOffice={(position) => {
            setOffice(position);
            mapRef.current?.panTo(position);
          }}
        />
        {!office && <p>Enter the source location.</p>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerStyle={mapContainerStyle}
          options={options}
          onLoad={onLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {office && (
            <>
              <Marker
                position={office}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />

              <MarkerClusterer>
                {(clusterer) =>
                  houses.map((house) => (
                    <Marker
                      key={house.lat}
                      position={house}
                      clusterer={clusterer}
                      onClick={() => fetchDirections(house)}
                    />
                  ))
                }
              </MarkerClusterer>

              <Circle center={office} radius={15000} options={closeOptions} />
              <Circle center={office} radius={30000} options={middleOptions} />
              <Circle center={office} radius={45000} options={farOptions} />
            </>
          )}

          {dieticians.map((dietician) => (
            <Marker
              key={dietician.place_id}
              position={dietician.geometry.location}
              title={dietician.name}
              onClick={() => handleMarkerClick(dietician)}
            >
              {selectedMarker === dietician && (
                <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                  <div>
                    <h3>{dietician.name}</h3>
                    <p>{dietician.vicinity}</p>
                    <button className="btn btn-success" onClick={handleGetDirections}>Get Directions</button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position) => {
  const houses = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return houses;
};
