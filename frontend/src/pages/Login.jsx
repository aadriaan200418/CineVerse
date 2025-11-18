// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";

// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS
import "../css/login.css";

// Definimos el componente principal de la página de iniciar sesión
export default function Login() {
  const navigate = useNavigate();

  // Estado para guardar los datos que el usuario escribe en el formulario
  const [formData, setFormData] = useState({ username: "", password: "" });

  // Estado para guardar errores de validación
  const [errors, setErrors] = useState({});

  // Función que se ejecuta cada vez que el usuario escribe en un input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // limpiamos errores al escribir
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        // Guardamos el username que devuelve el backend
        localStorage.setItem("username", data.username);

        // Redirigimos a perfiles
        navigate("/profiles");
      }
      else if (data.error === "USER_NOT_FOUND") {
        alert("Usuario no encontrado, crea una cuenta");
        navigate("/register");
      }
      else {
        setErrors({ general: data.error || "Error al iniciar sesión" });
      }
    }
    catch {
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>←</button>
      <h1 className="login-title">Iniciar Sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} />
        {errors.username && <div className="field-error">{errors.username}</div>}

        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
        {errors.password && <div className="field-error">{errors.password}</div>}

        <button type="submit" className="continue-btn">Entrar</button>
      </form>

      {errors.general && <div className="field-error">{errors.general}</div>}
    </div>
  );
}
