import React from "react";
import "./Loader.css"; // CSS aparte para la animación

export default function Loader({ message = "Cargando..." }) {
  return (
    <div className="gym-loader-overlay">
      <div className="gym-loader">
        <div className="barbell">
          <div className="plate left" />
          <div className="bar" />
          <div className="plate right" />
        </div>
      </div>
      <span className="gym-loader-text">{message}</span>
    </div>
  );
}
