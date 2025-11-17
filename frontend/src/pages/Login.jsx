import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importamos la imagen de fondo y los estilos CSS
import fondo from "../assets/fondo.png";
import "../css/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llamada al backend para comprobar usuario
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        // Usuario encontrado y login correcto
        alert("✅ Bienvenido " + formData.username);
        navigate("/home"); // Página principal
      } else if (data.error === "USER_NOT_FOUND") {
        // Usuario no existe → redirigir a registro
        alert("❌ Usuario no encontrado, crea una cuenta");
        navigate("/register");
      } else {
        // Error de contraseña u otro
        setError(data.error || "Error al iniciar sesión");
      }
    } catch {
      setError("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container"  style={{ backgroundImage: `url(${fondo})` }}>
      {/* Botón para volver a la página principal */}
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
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" class="continue-btn">Entrar</button>
      </form>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
