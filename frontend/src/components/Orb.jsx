import React from "react";
import "./Orb.css";

export default function Orb({ state = "idle", size = 200 }) {
  // States: idle, listening, speaking, processing
  const getOrbClass = () => {
    switch (state) {
      case "listening":
        return "orb orb-listening";
      case "speaking":
        return "orb orb-speaking";
      case "processing":
        return "orb orb-processing";
      default:
        return "orb orb-idle";
    }
  };

  return (
    <div className="orb-wrapper" style={{ width: size, height: size }}>
      <div className={getOrbClass()}>
        <div className="orb-core" />
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <div className="orb-glow" />
      </div>
      <div className="orb-label">
        {state === "idle" && "Click to start"}
        {state === "listening" && "Listening..."}
        {state === "speaking" && "AI Speaking"}
        {state === "processing" && "Processing..."}
      </div>
    </div>
  );
}

