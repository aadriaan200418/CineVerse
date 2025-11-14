import React from "react";
import "../css/register.css"; // Reutilizamos los estilos del registro (puedes renombrarlo luego a "auth.css")
import fondo from "../assets/fondo.png"; // Fondo usado en todas las pantallas
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate(); // Hook para cambiar de página (navegar entre rutas)

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    // Aquí podrías agregar la lógica de validación y conexión con la base de datos
    console.log("Inicio de sesión enviado");
  };

  return (
    <div
      className="register-container" // Reutilizamos el mismo contenedor de Register
      style={{ backgroundImage: `url(${fondo})` }}
    >
      {/* Botón para volver a la página principal */}
      <button className="back-button" onClick={() => navigate("/")}>←</button>

      {/* Título principal de la página */}
      <h1 className="register-title">Iniciar sesión</h1>

      {/* Formulario de inicio de sesión */}
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Campo: nombre de usuario */}
        <input type="text" placeholder="nombre de usuario" required />

        {/* Campo: contraseña */}
        <input type="password" placeholder="contraseña" required />

        {/* Botón de enviar */}
        <button type="submit" className="continue-btn">Continuar</button>
      </form>
    </div>
  );
}
