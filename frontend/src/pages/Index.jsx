import React from "react";
import { useNavigate } from "react-router-dom";
import fondo from "../assets/fondo.png";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">🎬 ¿Tienes cuenta en CineVerse?</h1>

      <div className="buttons">
        <button
          onClick={() => navigate("/register")}
          className="btn btn-purple"
        >
          Registrarse
        </button>

        <button
          onClick={() => navigate("/login")}
          className="btn btn-blue"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
