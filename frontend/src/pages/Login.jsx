// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";

// Importamos el hook useNavigate de React Router DOM
// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos la imagen de fondo y los estilos CSS
import fondo from "../assets/fondo.png";
import "../css/login.css";

// Definimos el componente principal de la página de iniciar sesion
export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState({}); // errores por campo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // limpiar error al escribir
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.username) newErrors.username = "El usuario es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // no enviar si hay errores
    }

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert("Bienvenido " + formData.username);
        navigate("/home");
      } else if (data.error === "USER_NOT_FOUND") {
        alert("Usuario no encontrado, crea una cuenta");
        navigate("/register");
      } else {
        setErrors({ general: data.error || "Error al iniciar sesión" });
      }
    } catch {
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${fondo})` }}>
      <button className="back-button" onClick={() => navigate("/")}>←</button>

      <h1 className="login-title">Iniciar Sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <div className="field-error">{errors.username}</div>}

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="field-error">{errors.password}</div>}

        <button type="submit" className="continue-btn">Entrar</button>
      </form>

      {errors.general && <div className="field-error">{errors.general}</div>}
    </div>
  );
}
