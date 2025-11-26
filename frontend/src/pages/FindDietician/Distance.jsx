/* eslint-disable react/prop-types */
import React from "react";

export default function Distance({ leg }) {
  if (!leg.distance || !leg.duration) return null;
  return (
    <div>
      <p>
        This clinic is <span className="highlight">{leg.distance.text}</span> away from your location. That would take{" "}
        <span className="highlight">{leg.duration.text}</span> to reach.
      </p>
    </div>
  );
}
