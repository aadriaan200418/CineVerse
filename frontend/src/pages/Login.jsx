// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";

// Importamos el hook useNavigate de React Router DOM
// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos la imagen de fondo y los estilos CSS
import fondo from "../assets/fondo-formato-bueno.png";
import "../css/login.css";

// Definimos el componente principal de la página de iniciar sesion
export default function Login() {
  // Inicializamos el useNavigate para poder redirigir al usuario
  const navigate = useNavigate();

  // Estado para guardar los datos que el usuario escribe en el formulario
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState({}); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // limpiar error al escribir
    setErrors({ ...errors, [name]: "" });
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validamos todos los campos antes de enviar
    let newErrors = {};
    if (!formData.username) newErrors.username = "El usuario es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // no enviar si hay errores
    }

    try {
      // Enviamos los datos al backend
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      // Si el registro fue exitoso redirige a la pagina del inicio
      if (data.success) {
        alert("Bienvenido " + formData.username);
        navigate("/home");
      } 
      else if (data.error === "USER_NOT_FOUND") {
        alert("Usuario no encontrado, crea una cuenta");
        navigate("/register");
      } 
      else {
        setErrors({ general: data.error || "Error al iniciar sesión" });
      }
    } catch {
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  // Renderizamos el formulario
  return (
    <div className="login-container" style={{ backgroundImage: `url(${fondo})` }}>
      {/* Botón para volver a la página principal */}
      <button className="back-button" onClick={() => navigate("/")}>←</button>

      {/* Título del formulario */}
      <h1 className="login-title">Iniciar Sesión</h1>

      {/* Formulario con validación */}
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange}/>
        {errors.username && <div className="field-error">{errors.username}</div>}

        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange}/>
        {errors.password && <div className="field-error">{errors.password}</div>}

        {/* Botón para enviar el formulario */}
        <button type="submit" className="continue-btn">Entrar</button>
      </form>

      {errors.general && <div className="field-error">{errors.general}</div>}
    </div>
  );
}
