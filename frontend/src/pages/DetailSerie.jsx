// Importamos React y useState para manejar el estado del formulario
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Importamos los estilos CSS, iconos y componentes
import "../css/detail.css";
import like from "../assets/icons/like.png";
import likeFilled from "../assets/icons/like-filled.png";
import star from "../assets/icons/star.png";
import starFilled from "../assets/icons/star-filled.png";
import pen from "../assets/icons/pen.png";
import Loading from "../components/Loading";

// Componente principal de la página de detalle de serie
export default function DetailSerie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [originalSerie, setOriginalSerie] = useState(null);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Estados para añadir temporada avanzada
  const [showAddSeasonForm, setShowAddSeasonForm] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
  const [chapters, setChapters] = useState([{ chapter_number: "", title: "", duration_minutes: "", image: "" }]);
  const [formMessage, setFormMessage] = useState("");

  // Validadores adaptados a tus campos reales
  const validators = {
    title: (v) => {
      if (!v?.trim()) return "El título es obligatorio.";
      if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
      return "";
    },
    description: (v) => {
      if (!v?.trim()) return "La descripción es obligatoria.";
      if (v.trim().length < 10) return "Debe tener al menos 10 caracteres.";
      return "";
    },
    genre: (v) => {
      if (!v?.trim()) return "El género es obligatorio.";
      return "";
    },
    seasons: (v) => {
      const num = parseInt(v, 10);
      if (v === "" || isNaN(num)) return "El número de temporadas es obligatorio.";
      if (num <= 0) return "Debe ser mayor que 0.";
      return "";
    },
    release_date: (v) => {
      if (!v) return "La fecha de estreno es obligatoria.";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "Fecha no válida.";
      return "";
    },
    minimum_age: (v) => {
      const num = parseInt(v, 10);
      if (v === "" || isNaN(num)) return "La edad mínima es obligatoria.";
      if (num < 0) return "Debe ser un número positivo.";
      return "";
    }
  };

  useEffect(() => {
    // Reiniciar estados al cambiar de serie
    setLoading(true);
    setError("");
    setSerie(null);
    setIsLiked(false);
    setIsFavorite(false);

    // 1. Cargar la serie (bloquea el loading principal)
    fetch(`http://localhost:3001/api/series/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la serie");
        return res.json();
      })
      .then(data => {
        setSerie(data.series);
        setOriginalSerie(data.series);
      })
      .catch(err => {
        console.error("Error al cargar serie:", err);
        setError("Serie no encontrada");
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Cargar likes y favoritos (en segundo plano)
    const id_profile = localStorage.getItem("id_profile");
    if (id_profile) {
      const numericId = Number(id);

      fetch(`http://localhost:3001/api/likes/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const liked = data.likes?.some(l => Number(l.id_series) === numericId);
          setIsLiked(Boolean(liked));
        })
        .catch(err => console.error("Error cargando likes:", err));

      fetch(`http://localhost:3001/api/favorites/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const fav = data.favorites?.some(f => Number(f.id_series) === numericId);
          setIsFavorite(Boolean(fav));
        })
        .catch(err => console.error("Error cargando favoritos:", err));
    }
  }, [id]);

  const toggleLike = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isLiked) {
      fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      })
        .then(() => setIsLiked(true))
        .catch(err => console.error("Error al dar like:", err));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      })
        .then(() => setIsLiked(false))
        .catch(err => console.error("Error al quitar like:", err));
    }
  };

  const toggleFavorite = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isFavorite) {
      fetch("http://localhost:3001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      })
        .then(() => setIsFavorite(true))
        .catch(err => console.error("Error al añadir favorito:", err));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      })
        .then(() => setIsFavorite(false))
        .catch(err => console.error("Error al quitar favorito:", err));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setSerie(prev => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setOriginalSerie({ ...serie });
    setIsEditing(true);
    setFieldErrors({});
    setError("");
  };

  const handleCancel = () => {
    if (originalSerie) {
      setSerie(originalSerie);
    }
    setIsEditing(false);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!serie) return;

    const errors = {};
    for (const field in validators) {
      const value = serie[field];
      const errorMsg = validators[field](value);
      if (errorMsg) errors[field] = errorMsg;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setError("❌ No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    if (role !== "admin") {
      setError("❌ No tienes permisos para editar esta serie.");
      return;
    }

    const payload = {
      ...serie,
      release_date:
        typeof serie.release_date === "string"
          ? serie.release_date.slice(0, 10)
          : new Date(serie.release_date).toISOString().slice(0, 10)
    };

    fetch(`http://localhost:3001/api/series/${serie.id_series}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Error ${res.status}`);
        }
        setOriginalSerie({ ...serie });
        setIsEditing(false);
        setError("");
      })
      .catch(err => {
        console.error("Error en actualización:", err);
        setError(`No se pudo actualizar: ${err.message}`);
      });
  };

  // === Funciones para temporada avanzada ===
  const addChapterField = () => {
    setChapters([...chapters, { chapter_number: "", title: "", duration_minutes: "", image: "" }]);
  };

  const removeChapterField = (index) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((_, i) => i !== index));
    }
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleSaveSeason = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setFormMessage("❌ Debes iniciar sesión");
      return;
    }

    // Validar capítulos
    const invalidChapter = chapters.some(chap => !chap.chapter_number || !chap.title);
    if (invalidChapter) {
      setFormMessage("❌ Todos los capítulos deben tener número y título");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/series/${id}/season-with-chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          season_number: seasonNumber,
          chapters: chapters
        })
      });

      const data = await res.json();
      if (data.success) {
        setFormMessage("✅ Temporada y capítulos creados");
        setShowAddSeasonForm(false);
        setSeasonNumber("");
        setChapters([{ chapter_number: "", title: "", duration_minutes: "", image: "" }]);

        // Actualizar localmente el número de temporadas
        setSerie(prev => ({ ...prev, seasons: (prev?.seasons || 0) + 1 }));
      } else {
        setFormMessage(`❌ ${data.error || "Error al crear temporada"}`);
      }
    } catch (err) {
      setFormMessage("❌ Error de conexión");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!serie) {
    return <Loading />;
  }

  const releaseDateValue =
    typeof serie.release_date === "string"
      ? serie.release_date.slice(0, 10)
      : new Date(serie.release_date).toISOString().slice(0, 10);

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <img
          src={`/images-series/${serie.image}`}
          alt={serie.title}
          className="banner-image"
          onError={e => (e.target.style.display = "none")}
        />

        <div className="info">
          {isEditing ? (
            <form onSubmit={handleSubmit} noValidate>
              <label className="label-edit">Título</label>
              <input
                name="title"
                value={serie.title ?? ""}
                onChange={handleChange}
                placeholder="Título"
              />
              {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

              <label className="label-edit">Descripción</label>
              <textarea
                name="description"
                value={serie.description ?? ""}
                onChange={handleChange}
                placeholder="Descripción"
                rows="4"
              />
              {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

              <label className="label-edit">Género</label>
              <input
                name="genre"
                value={serie.genre ?? ""}
                onChange={handleChange}
                placeholder="Género"
              />
              {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

              <label className="label-edit">Temporadas</label>
              <input
                name="seasons"
                type="number"
                value={serie.seasons ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="Temporadas"
              />
              {fieldErrors.seasons && <span className="error">{fieldErrors.seasons}</span>}

              <label className="label-edit">Fecha de estreno</label>
              <input
                name="release_date"
                type="date"
                value={releaseDateValue}
                onChange={handleChange}
              />
              {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

              <label className="label-edit">Edad mínima</label>
              <input
                name="minimum_age"
                type="number"
                value={serie.minimum_age ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="Edad mínima"
              />
              {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

              <div className="btns">
                <button type="submit" className="btn-edit">Guardar</button>
                <button
                  type="button"
                  className="btn-edit cancel"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
              {error && <p className="error-message" style={{ marginTop: "10px" }}>{error}</p>}
            </form>
          ) : (
            <>
              <h1>{serie.title}</h1>
              <div className="data">
                <div className="row1">
                  <p>{serie.genre}</p>
                  <p>{serie.seasons} temporadas</p>
                </div>
                <div className="row2">
                  <p>{new Date(serie.release_date).getFullYear()}</p>
                  <p>+{serie.minimum_age}</p>
                </div>
              </div>

              <p>{serie.description || "Sin descripción disponible"}</p>

              <div className="buttons-rep">
                <button className="btn play">▶ Reproducir</button>

                <div className="images">
                  <button onClick={toggleLike} aria-label={isLiked ? "Quitar like" : "Dar like"}>
                    <img
                      src={isLiked ? likeFilled : like}
                      alt="like"
                      className={`like-image ${isLiked ? "active" : ""}`}
                    />
                  </button>

                  <button onClick={toggleFavorite} aria-label={isFavorite ? "Quitar favorito" : "Añadir a favoritos"}>
                    <img
                      src={isFavorite ? starFilled : star}
                      alt="favorito"
                      className={`star-image ${isFavorite ? "active" : ""}`}
                    />
                  </button>

                  {localStorage.getItem("role") === "admin" && (
                    <button onClick={startEditing} aria-label="Editar">
                      <img src={pen} alt="Editar" className="pen-image" />
                    </button>
                  )}
                </div>
              </div>

              {/* === ADMIN: Añadir temporada avanzada === */}
              {localStorage.getItem("role") === "admin" && (
                <div className="admin-actions">
                  {!showAddSeasonForm ? (
                    <button onClick={() => setShowAddSeasonForm(true)}>➕ Añadir Temporada</button>
                  ) : (
                    <form onSubmit={handleSaveSeason} className="admin-form">
                      <h3>Añadir Temporada</h3>
                      
                      <label>Número de Temporada</label>
                      <input
                        type="number"
                        min="1"
                        value={seasonNumber}
                        onChange={(e) => setSeasonNumber(e.target.value)}
                        required
                      />

                      <h4>Capítulos</h4>
                      {chapters.map((chap, index) => (
                        <div key={index} className="chapter-form-group">
                          <label>Capítulo {index + 1}</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Núm. capítulo"
                            value={chap.chapter_number}
                            onChange={(e) => handleChapterChange(index, "chapter_number", e.target.value)}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Título"
                            value={chap.title}
                            onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Duración (min)"
                            value={chap.duration_minutes}
                            onChange={(e) => handleChapterChange(index, "duration_minutes", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Imagen (ej. cap1.jpg)"
                            value={chap.image}
                            onChange={(e) => handleChapterChange(index, "image", e.target.value)}
                          />
                          {chapters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChapterField(index)}
                              className="btn-remove-chapter"
                            >
                              🗑️ Quitar
                            </button>
                          )}
                        </div>
                      ))}

                      <button type="button" onClick={addChapterField} className="btn-add-chapter">
                        ➕ Añadir Capítulo
                      </button>

                      <div className="form-buttons">
                        <button type="submit">Guardar Temporada</button>
                        <button type="button" onClick={() => setShowAddSeasonForm(false)}>Cancelar</button>
                      </div>
                      {formMessage && <p className="form-message">{formMessage}</p>}
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}