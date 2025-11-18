// Importamos React para poder usar JSX
import React from "react";

// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos la imagen de fondo y el css
import fondo from "../assets/fondo-formato-bueno.png";
import "../css/index.css";

// Componente principal de la página de inicio
export default function Index() {
  // Nos permite redirigir al usuario a otras rutas
  const navigate = useNavigate();

  // Estructura visual de la página de inicio
  return (
    <div className="container" style={{ backgroundImage: `url(${fondo})` }}>
      <h1 className="title">🎬 ¿Tienes cuenta en CineVerse?</h1>

      <div className="buttons">
        <button onClick={() => navigate("/register")} className="btn btn-purple">Registrarse</button>
        <button onClick={() => navigate("/login")} className="btn btn-blue">Iniciar sesión</button>
      </div>
    </div>
  );
}