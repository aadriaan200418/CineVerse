// Importamos React para poder usar JSX
import React from "react";

// Importamos el hook useNavigate de React Router DOM
// Este hook permite cambiar de página (navegar entre rutas) de forma programática
import { useNavigate } from "react-router-dom";

// Importamos la imagen de fondo que se usará en esta página
import fondo from "../assets/fondo.png";

// Componente principal de la página de inicio
export default function Index() {
  // Hook que nos permite redirigir al usuario a otras rutas (por ejemplo, /register o /login)
  const navigate = useNavigate();

  // Estructura visual de la página de inicio
  return (
    // Contenedor principal que agrupa todo el contenido
    <div className="container">

      {/* Título principal que aparece centrado en pantalla */}
      <h1 className="title">🎬 ¿Tienes cuenta en CineVerse?</h1>

      {/* Contenedor que agrupa los dos botones */}
      <div className="buttons">

        {/* Botón para ir a la página de registro */}
        <button
          onClick={() => navigate("/register")} // Navega a /register al hacer clic
          className="btn btn-purple" // Clases CSS para darle estilo
        >
          Registrarse
        </button>

        {/* Botón para ir a la página de inicio de sesión */}
        <button
          onClick={() => navigate("/login")} // Navega a /login al hacer clic
          className="btn btn-blue" // Clases CSS para su color azul
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
