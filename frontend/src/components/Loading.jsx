// Importamos React 
import React from "react";

// Importamos los estilos CSS
import "../css/loading.css";

export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
    </div>
  );
}
