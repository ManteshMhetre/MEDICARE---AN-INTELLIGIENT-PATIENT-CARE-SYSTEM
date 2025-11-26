import React from "react";
import { useLoadScript } from '@react-google-maps/api';
import Map from './Map'; 

import './Map.css';

const Home = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC5_mC3Ix78BpvHLWa5oBbQ95u7xhlmxw4",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

export default Home