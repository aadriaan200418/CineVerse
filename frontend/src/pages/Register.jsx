// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";

// Importamos el hook useNavigate de React Router DOM
// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos la imagen de fondo y los estilos CSS
import fondo from "../assets/fondo-formato-bueno.png";
import "../css/register.css";

// Definimos el componente principal de la página de registro
export default function Register() {
  // Inicializamos el useNavigate para poder redirigir al usuario
  const navigate = useNavigate();

  // Estado para guardar los datos que el usuario escribe en el formulario
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    dni: "",
    birth_date: "",
    email: "",
    password: ""
  });

  // Estado para guardar los errores específicos de cada campo
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    dni: "",
    birth_date: "",
    email: "",
    password: ""
  });

  // Funciones de validación para cada campo
  // Incluyen comprobación de si están vacíos y si cumplen formato
  const validators = {
    name: (v) => {
      if (!v.trim()) return "El nombre es obligatorio.";
      if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
      return "";
    },
    username: (v) => {
      if (!v.trim()) return "El nombre de usuario es obligatorio.";
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(v)) return "Debe tener 3-20 caracteres (letras, números, guion bajo).";
      return "";
    },
    dni: (v) => {
      if (!v.trim()) return "El DNI es obligatorio.";
      if (!/^[0-9XYZxyz][0-9]{7}[A-Za-z]$/.test(v)) return "Formato de DNI/NIE no válido (ej: 12345678Z).";
      return "";
    },
    birth_date: (v) => {
      if (!v) return "La fecha de nacimiento es obligatoria.";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "Fecha de nacimiento no válida.";
      const hoy = new Date();
      if (d > hoy) return "La fecha de nacimiento no puede ser futura.";
      return "";
    },
    email: (v) => {
      if (!v.trim()) return "El correo electrónico es obligatorio.";
      if (!/^\S+@\S+\.\S+$/.test(v)) return "Correo electrónico no válido.";
      return "";
    },
    password: (v) => {
      if (!v) return "La contraseña es obligatoria.";
      if (v.length < 4) return "Debe tener al menos 4 caracteres.";
      return "";
    }
  };

  // Función que se ejecuta cada vez que el usuario escribe en un input
  // Actualiza el estado y valida el campo en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // limpiar error al escribir
    const error = validators[name] ? validators[name](value) : "";
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Función que valida todos los campos antes de enviar el formulario
  const validateAll = () => {
    const newErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validators[key] ? validators[key](formData[key]) : "";
      return acc;
    }, {});
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validamos todos los campos antes de enviar
    if (!validateAll()) return;

    try {
      // Enviamos los datos al backend
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      // Si el backend devuelve errores específicos por campo
      if (data.errors) {
        setErrors((prev) => ({ ...prev, ...data.errors }));
        return;
      }

      // Si el registro fue exitoso redirige al inicio de sesion
      if (data.success) {
        alert("Usuario registrado correctamente");
        navigate("/login"); 
      } 
      else {
        alert("Error: " + (data.error || "Error al registrar usuario"));
      }
    } 
    catch {
      alert("Error de conexión con el servidor");
    }
  };

  // Renderizamos el formulario
  return (
    <div className="register-container" style={{ backgroundImage: `url(${fondo})` }}>
      {/* Botón para volver a la página principal */}
      <button className="back-button" onClick={() => navigate("/")}>←</button>

      {/* Título del formulario */}
      <h1 className="register-title">Registrarse</h1>

      {/* Formulario con validación */}
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <input type="text" name="name" placeholder="nombre" value={formData.name} onChange={handleChange} />
        {errors.name && <div className="field-error">{errors.name}</div>}

        <input type="text" name="username" placeholder="nombre de usuario" value={formData.username} onChange={handleChange} />
        {errors.username && <div className="field-error">{errors.username}</div>}

        <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} />
        {errors.dni && <div className="field-error">{errors.dni}</div>}

        <input type="text" name="birth_date" placeholder="fecha de nacimiento" value={formData.birth_date} onChange={handleChange} />
        {errors.birth_date && <div className="field-error">{errors.birth_date}</div>}

        <input type="email" name="email" placeholder="correo electrónico" value={formData.email} onChange={handleChange} />
        {errors.email && <div className="field-error">{errors.email}</div>}

        <input type="password" name="password" placeholder="contraseña" value={formData.password} onChange={handleChange} />
        {errors.password && <div className="field-error">{errors.password}</div>}

        {/* Botón para enviar el formulario */}
        <button type="submit" className="continue-btn">Continuar</button>
      </form>
    </div>
  );
}
