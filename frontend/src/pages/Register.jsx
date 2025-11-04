// Importamos React para poder usar JSX en el componente
import React from "react";

// Importamos la hoja de estilos específica para esta página de registro
import "../css/register.css";

// Importamos la imagen de fondo que se usará en el contenedor principal
import fondo from "../assets/fondo.png";

// Importamos el hook useNavigate de React Router DOM
// Este hook nos permite cambiar de página (navegar entre rutas) desde el código
import { useNavigate } from "react-router-dom";

// Definimos el componente principal de la página de registro
export default function Register() {
  // Inicializamos el hook useNavigate para poder redirigir al usuario
  const navigate = useNavigate();

  // Retornamos el contenido visual de la página
  return (
    // Contenedor principal del formulario de registro
    // Se aplica la imagen de fondo usando "backgroundImage" en estilo en línea
    <div
      className="register-container"
      style={{ backgroundImage: `url(${fondo})` }}
    >

      {/* Botón para volver a la página principal (Index) */}
      <button className="back-button" onClick={() => navigate("/")}>
        ←
      </button>

      {/* Título principal del formulario */}
      <h1 className="register-title">Registrarse</h1>

      {/* Formulario de registro con los distintos campos */}
      <form className="register-form">

        {/* Campo de texto para el nombre real del usuario */}
        <input type="text" placeholder="nombre" />

        {/* Campo para el nombre de usuario (nickname o alias) */}
        <input type="text" placeholder="nombre de usuario" />

        {/* Campo para ingresar el DNI */}
        <input type="text" placeholder="DNI" />

        {/* Campo para seleccionar la fecha de nacimiento */}
        <input type="date" placeholder="fecha de nacimiento" />

        {/* Campo para el correo electrónico */}
        <input type="email" placeholder="correo electrónico" />

        {/* Campo para la contraseña */}
        <input type="password" placeholder="contraseña" />

        {/* Botón para enviar el formulario (por ahora sin funcionalidad backend) */}
        <button type="submit" className="continue-btn">
          Continuar
        </button>
      </form>
    </div>
  );
}
