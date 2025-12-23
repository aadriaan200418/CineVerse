// Importamos React y hooks
import React, { useState } from "react";
import { useNavigate,  } from "react-router-dom";

// Importamos  el css
import "../css/index.css";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="index-container">
      <h1 className="index-title">🎬 ¿Tienes cuenta en CineVerse?</h1>

      <div className="index-buttons">
        <button onClick={() => navigate("/register")} className="index-btn index-btn-purple">Registrarse</button>
        <button onClick={() => navigate("/login")} className="index-btn index-btn-blue">Iniciar sesión</button>
      </div>
    </div>
  );
}