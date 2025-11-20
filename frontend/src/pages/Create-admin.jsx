// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS
import "../css/create-admin.css";

// Componente principal de la página de create-admin
export default function AddContent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    releaseDate: "",
    genre: "",
    minAge: "",
    type: "", 
    duration: "",
    actors: "",
    seasons: "",
    episodes: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes añadir validaciones y lógica para enviar los datos
    console.log("Datos enviados:", formData);
  };

  return (
    <div className="add-container">
      <button className="back-button" onClick={() => navigate("/home")}>←</button>

      <h1 className="add-title">Añadir Serie/Película</h1>

      <form className="add-form" onSubmit={handleSubmit} noValidate>
        <input type="text" name="title" placeholder="Nombre de serie/película" value={formData.title} onChange={handleChange}/>
        {errors.title && <div className="field-error">{errors.title}</div>}

        <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange}/>
        {errors.description && <div className="field-error">{errors.description}</div>}

        <input type="date" name="releaseDate" placeholder="Fecha de estreno" value={formData.releaseDate} onChange={handleChange}/>
        {errors.releaseDate && <div className="field-error">{errors.releaseDate}</div>}

        <input type="text" name="genre" placeholder="Género" value={formData.genre} onChange={handleChange}/>
        {errors.genre && <div className="field-error">{errors.genre}</div>}

        <input type="number" name="minAge" placeholder="Edad mínima" value={formData.minAge}onChange={handleChange}/>
        {errors.minAge && <div className="field-error">{errors.minAge}</div>}

        <div className="type-selector">
          <label>
            <input type="radio" name="type" value="pelicula" checked={formData.type === "pelicula"} onChange={handleChange}/>
            Película
          </label>
          
          <label>
            <input type="radio" name="type" value="serie" checked={formData.type === "serie"} onChange={handleChange}/>
            Serie
          </label>
        </div>

        {formData.type === "pelicula" && (
          <>
            <input type="number" name="duration" placeholder="Duración en minutos" value={formData.duration} onChange={handleChange}/>
            {errors.duration && <div className="field-error">{errors.duration}</div>}

            <input type="text" name="actors" placeholder="Actores" value={formData.actors} onChange={handleChange}/>
            {errors.actors && <div className="field-error">{errors.actors}</div>}
          </>
        )}

        {formData.type === "serie" && (
          <>
            <input type="number" name="seasons" placeholder="Número de temporadas" value={formData.seasons} onChange={handleChange}/>
            {errors.seasons && <div className="field-error">{errors.seasons}</div>}

            <input type="number" name="episodes" placeholder="Número de capítulos" value={formData.episodes} onChange={handleChange}/>
            {errors.episodes && <div className="field-error">{errors.episodes}</div>}

            <input type="text" name="actors" placeholder="Actores" value={formData.actors} onChange={handleChange}/>
            {errors.actors && <div className="field-error">{errors.actors}</div>}
          </>
        )}

        <button type="submit" className="continue-btn">Guardar</button>
      </form>
    </div>
  );
}
