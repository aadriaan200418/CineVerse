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
  const [seasons, setSeasons] = useState([]);

  const [editingSeasonId, setEditingSeasonId] = useState(null);
  const [editingSeasonChapters, setEditingSeasonChapters] = useState([]);
  const [editSeasonMessage, setEditSeasonMessage] = useState("");
  const [editingSeasonErrors, setEditingSeasonErrors] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");

  const [seasonsList, setSeasonsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const nextSeasonNumber = seasonsList.length + 1;
  const [chapterErrors, setChapterErrors] = useState([]);

  const [seasonError, setSeasonError] = useState("");

  // Obtener datos de temporada en edición
  const editingSeasonData = editingSeasonId
    ? seasonsList.find(s => Number(s.id_season) === Number(editingSeasonId))
    : null;

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

  /* Al cargar la pagina */
  useEffect(() => {
    setLoading(true);
    setError("");
    setSerie(null);
    setIsLiked(false);
    setIsFavorite(false);

    // Petición para obtener la película
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

    //Obtenemos el perfil del usuario
    const id_profile = localStorage.getItem("id_profile");

    // Cargar likes y favoritos 
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

    // Cargar temporadas de la serie
    fetch(`http://localhost:3001/api/seasons/${id}`)
      .then(res => res.json())
      .then(data => {
        setSeasonsList(data.seasons || []);
      })
      .catch(err => console.error("Error cargando temporadas:", err));

  }, [id]);


  //editar temporada
  const openEditSeason = async (id_season) => {
    setEditingSeasonId(id_season);
    setEditSeasonMessage("");
    setEditingSeasonErrors([]);

    try {
      const res = await fetch(`http://localhost:3001/api/chapters/${id_season}`);
      const data = await res.json();

      setEditingSeasonChapters(data.chapters || []);
    } 
    catch (err) {
      console.error("Error cargando capítulos:", err);
      setEditSeasonMessage("Error al cargar capítulos de la temporada");
    }
  };

  // editar capítulos de temporada
  const handleEditSeasonChapterChange = (index, field, value) => {
    setEditingSeasonChapters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // limpiar error de ese campo al escribir
    setEditingSeasonErrors(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: "" };
      }
      return updated;
    });
  };


  //guardar cambios de edicion de temporadas y capitulos en la base de datos
  const saveEditedSeason = async () => {
    let hasError = false;
    const errors = [];

    // Validar capítulos editados
    editingSeasonChapters.forEach((chap, index) => {
      const err = {};

      if (!chap.chapter_number) {
        err.chapter_number = "El número de capítulo es obligatorio";
        hasError = true;
      }
      if (!chap.title?.trim()) {
        err.title = "El título es obligatorio";
        hasError = true;
      }
      if (!chap.duration_minutes || chap.duration_minutes <= 0) {
        err.duration_minutes = "La duración debe ser mayor que 0";
        hasError = true;
      }
      if (!chap.image?.trim()) {
        err.image = "La imagen es obligatoria";
        hasError = true;
      } 
      else {
        const validExt = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!validExt.test(chap.image.trim().toLowerCase())) {
          err.image = "La imagen debe terminar en .jpg, .jpeg, .png, .gif o .webp";
          hasError = true;
        }
      }

      errors[index] = err;
    });

    setEditingSeasonErrors(errors);
    if (hasError) {
      setEditSeasonMessage("Hay errores en el formulario");
      return;
    }

    try {
      for (const chap of editingSeasonChapters) {
        await fetch(`http://localhost:3001/api/chapters/${chap.id_chapter}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapter_number: chap.chapter_number,
            title: chap.title,
            duration_minutes: chap.duration_minutes,
            image: chap.image
          })
        });
      }

      setEditSeasonMessage("✔ Cambios guardados correctamente");
      if (editingSeasonId) {
        setChaptersList(editingSeasonChapters);
      }

    } 
    catch (err) {
      console.error("Error guardando cambios:", err);
      setEditSeasonMessage("Error al guardar cambios");
    }
  };

  // Funciones para manejar likes y favoritos
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

  // Maneja cambios en los inputs del formulario
  const handleSeasonChange = (e) => {
    const idSeason = e.target.value;

    if (!idSeason) {
      setChaptersList([]);
      return;
    }

    fetch(`http://localhost:3001/api/chapters/${idSeason}`)
      .then(res => res.json())
      .then(data => {
        setChaptersList(data.chapters || []);
      })
      .catch(err => console.error("Error cargando capítulos:", err));
  };

  // Maneja cambios en los inputs del formulario
  const handleChange = e => {
    const { name, value } = e.target;
    setSerie(prev => ({ ...prev, [name]: value }));
  };

  // Activa el modo edición
  const startEditing = () => {
    setOriginalSerie({ ...serie });
    setIsEditing(true);
    setFieldErrors({});
    setError("");
  };

  // Cancela la edición y restaura valores
  const handleCancel = () => {
    if (originalSerie) {
      setSerie(originalSerie);
    }
    setIsEditing(false);
    setError("");
    setFieldErrors({});
  };

  // Envía el formulario de edición
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
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    if (role !== "admin") {
      setError("No tienes permisos para editar esta serie.");
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

  // Funciones para temporada avanzada 
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

    setChapterErrors(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: "" };
      }
      return updated;
    });
  };

  const handleSaveSeason = async (e) => {
    e.preventDefault();

    let hasError = false;
    const errors = [];

    if (!seasonNumber || Number(seasonNumber) < 1) {
      setSeasonError("El número de temporada debe ser mayor que 0");
      hasError = true;
    } 
    else {
      setSeasonError("");
    }

    chapters.forEach((chap, index) => {
      const err = {};

      if (!chap.chapter_number) {
        err.chapter_number = "El número de capítulo es obligatorio";
        hasError = true;
      }
      if (!chap.title?.trim()) {
        err.title = "El título es obligatorio";
        hasError = true;
      }
      if (!chap.duration_minutes || chap.duration_minutes <= 0) {
        err.duration_minutes = "La duración debe ser mayor que 0";
        hasError = true;
      }
      if (!chap.image?.trim()) {
        err.image = "La imagen es obligatoria";
        hasError = true;
      } 
      else {
        const validExt = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!validExt.test(chap.image.trim().toLowerCase())) {
          err.image = "La imagen debe terminar en .jpg, .jpeg, .png, .gif o .webp";
          hasError = true;
        }
      }

      errors[index] = err;
    });

    setChapterErrors(errors);
    if (hasError) {
      setFormMessage("Hay errores en el formulario");
      return;
    }

    // Token
    const token = localStorage.getItem("token");
    if (!token) {
      setFormMessage("Debes iniciar sesión");
      return;
    }

    const nextSeasonNumber = seasonsList.length + 1;

    try {
      const res = await fetch(`http://localhost:3001/api/series/${id}/season-with-chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          season_number: nextSeasonNumber,
          chapters: chapters
        })
      });

      const data = await res.json();

      if (data.success) {
        setFormMessage("Temporada y capítulos creados");

        setSeasonsList(prev => [
          ...prev,
          { id_season: data.id_season, season_number: nextSeasonNumber }
        ]);

        setShowAddSeasonForm(false);
        setSeasonNumber("");
        setChapters([{ chapter_number: "", title: "", duration_minutes: "", image: "" }]);
        setChapterErrors([]);
      } 
      else {
        setFormMessage(`${data.error || "Error al crear temporada"}`);
      }

    } 
    catch (err) {
      setFormMessage("Error de conexión");
    }
  };

  // Pantalla de carga
  if (loading) {
    return <Loading />;
  }
  if (!serie) {
    return <Loading />;
  }

  // Error general
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Valor de la fecha para el input date
  const releaseDateValue =
    typeof serie.release_date === "string"
      ? serie.release_date.slice(0, 10)
      : new Date(serie.release_date).toISOString().slice(0, 10);

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <div className="detail-info">
          {/* Formulario para editar la serie */}
          {isEditing ? (
            <form onSubmit={handleSubmit} noValidate>
              <label className="detail-label-edit">Título</label>
              <input name="title" value={serie.title ?? ""} onChange={handleChange} placeholder="Título" />
              {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

              <label className="detail-label-edit">Descripción</label>
              <textarea name="description" value={serie.description ?? ""} onChange={handleChange} placeholder="Descripción" rows="4" />
              {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

              <label className="detail-label-edit">Género</label>
              <input name="genre" value={serie.genre ?? ""} onChange={handleChange} placeholder="Género" />
              {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

              <label className="detail-label-edit">Temporadas</label>
              <input name="seasons" type="number" value={serie.seasons ?? ""} onChange={handleChange} min="0" placeholder="Temporadas" />
              {fieldErrors.seasons && <span className="error">{fieldErrors.seasons}</span>}

              <label className="detail-label-edit">Fecha de estreno</label>
              <input name="release_date" type="date" value={releaseDateValue} onChange={handleChange} />
              {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

              <label className="detail-label-edit">Edad mínima</label>
              <input name="minimum_age" type="number" value={serie.minimum_age ?? ""} onChange={handleChange} min="0" placeholder="Edad mínima" />
              {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

              <div className="detail-btns">
                <button type="submit" className="detail-btn-edit">Guardar</button>
                <button type="button" className="detail-btn-edit" onClick={handleCancel}>Cancelar</button>
              </div>
              {error && <p className="error-message" style={{ marginTop: "10px" }}>{error}</p>}
            </form>
          ) : (
            <>
              {/* Datos de la serie y botones de rep, lik y fav */}
              <h1>{serie.title}</h1>
              <div className="detail-data">
                <div className="detail-row1">
                  <p>{serie.genre}</p>
                  <p>{seasonsList.length} temporadas</p>
                </div>
                <div className="detail-row2">
                  <p>{new Date(serie.release_date).getFullYear()}</p>
                  <p>+{serie.minimum_age} años</p>
                </div>
              </div>

              <p>{serie.description || "Sin descripción disponible"}</p>

              <div className="detail-buttons">
                <button className="detail-btn-play">▶ Reproducir</button>

                <div className="detail-images">
                  <button onClick={toggleLike} aria-label={isLiked ? "Quitar like" : "Dar like"}>
                    <img src={isLiked ? likeFilled : like} alt="like" className={`detail-like-image ${isLiked ? "active" : ""}`} />
                  </button>

                  <button onClick={toggleFavorite} aria-label={isFavorite ? "Quitar favorito" : "Añadir a favoritos"}>
                    <img src={isFavorite ? starFilled : star} alt="favorito" className={`detail-star-image ${isFavorite ? "active" : ""}`} />
                  </button>

                  {localStorage.getItem("role") === "admin" && (
                    <button onClick={startEditing} aria-label="Editar">
                      <img src={pen} alt="Editar" className="detail-pen-image" />
                    </button>
                  )}
                </div>
              </div>

              {localStorage.getItem("role") === "admin" && (
                /* Acciones para las temporadas */
                <div className="detailSerie-admin-actions">
                  {!showAddSeasonForm ? (
                    <>
                      <div className="detailSerie-seasons">
                        <select className="detailSerie-select-seasons" value={selectedSeasonId}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedSeasonId(value);
                            if (value) {
                              handleSeasonChange({ target: { value } });
                            } else {
                              setChaptersList([]);
                            }
                          }}
                        >
                          <option value="">Selecciona una temporada</option>
                          {seasonsList.map(season => (
                            <option key={season.id_season} value={season.id_season}>Temporada{season.season_number}</option>
                          ))}
                        </select>

                        <button className="detailSerie-new-season" type="button" onClick={() => setShowAddSeasonForm(true)}>Añadir Temporada</button>

                        {selectedSeasonId && (
                          <button type="button" className="detailSerie-btn-edit-season" onClick={() => openEditSeason(selectedSeasonId)}>Editar temporada</button>
                        )}
                      </div>

                      {editingSeasonId && (
                        /* Formulario de editar la temporada */
                        <div className="detailSerie-edit-season-form">
                          <h3>Editando Temporada {editingSeasonData ? editingSeasonData.season_number : editingSeasonId}</h3>

                          {editingSeasonChapters.map((chap, index) => (
                            <div key={chap.id_chapter} className="detailSerie-chapter-edit">
                              <label>Número de capítulo</label>
                              <input type="number" value={chap.chapter_number} onChange={(e) => handleEditSeasonChapterChange(index, "chapter_number", e.target.value)} />
                              {editingSeasonErrors[index]?.chapter_number && <p className="error">{editingSeasonErrors[index].chapter_number}</p>}

                              <label>Título</label>
                              <input type="text" value={chap.title} onChange={(e) => handleEditSeasonChapterChange(index, "title", e.target.value)} />
                              {editingSeasonErrors[index]?.title && <p className="error">{editingSeasonErrors[index].title}</p>}

                              <label>Duración (min)</label>
                              <input type="number" value={chap.duration_minutes} onChange={(e) => handleEditSeasonChapterChange(index, "duration_minutes", e.target.value)} />
                              {editingSeasonErrors[index]?.duration_minutes && <p className="error">{editingSeasonErrors[index].duration_minutes}</p>}

                              <label>Imagen</label>
                              <input type="text" value={chap.image} onChange={(e) => handleEditSeasonChapterChange(index, "image", e.target.value)} />
                              {editingSeasonErrors[index]?.image && <p className="error">{editingSeasonErrors[index].image}</p>}
                            </div>
                          ))}

                          <div className="detailSerie-chapter-edit-buttons">
                            <button type="button" onClick={saveEditedSeason} className="detailSerie-btn-save-season">Guardar cambios</button>
                            <button type="button" onClick={() => { setEditingSeasonId(null); setEditingSeasonChapters([]); setEditingSeasonErrors([]); setEditSeasonMessage(""); }} className="detailSerie-btn-cancel-season">Cerrar</button>
                          </div>
                          {editSeasonMessage && <p className="form-message">{editSeasonMessage}</p>}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Formulario para añadir temporadas y capitulos */
                    <form onSubmit={handleSaveSeason} className="detailSerie-admin-form">
                      <h3>Añadir Temporada</h3>
                      <label>Número de Temporada</label>
                      <input type="number" min="1" value={seasonNumber} onChange={(e) => { setSeasonNumber(e.target.value); setSeasonError(""); }} />
                      {seasonError && <p className="error">{seasonError}</p>}

                      <h4>Capítulos</h4>
                      {chapters.map((chap, index) => (
                        <div key={index} className="detailSerie-chapter-form">
                          <label>Capítulo {index + 1}</label>
                          <input type="number" min="1" placeholder="Núm. capítulo" value={chap.chapter_number} onChange={(e) => handleChapterChange(index, "chapter_number", e.target.value)} />
                          {chapterErrors[index]?.chapter_number && <p className="error">{chapterErrors[index].chapter_number}</p>}

                          <input type="text" placeholder="Título" value={chap.title} onChange={(e) => handleChapterChange(index, "title", e.target.value)} />
                          {chapterErrors[index]?.title && <p className="error">{chapterErrors[index].title}</p>}

                          <input type="number" min="1" placeholder="Duración (min)" value={chap.duration_minutes} onChange={(e) => handleChapterChange(index, "duration_minutes", e.target.value)} />
                          {chapterErrors[index]?.duration_minutes && <p className="error">{chapterErrors[index].duration_minutes}</p>}

                          <input type="text" placeholder="Imagen (ej. cap1.jpg)" value={chap.image} onChange={(e) => handleChapterChange(index, "image", e.target.value)} />
                          {chapterErrors[index]?.image && <p className="error">{chapterErrors[index].image}</p>}

                          {chapters.length > 1 && <button type="button" onClick={() => removeChapterField(index)} className="btn-remove-chapter">Quitar</button>}
                        </div>
                      ))}

                      <button type="button" onClick={addChapterField} className="detailSerie-btn-add-chapter">Añadir Capítulo</button>

                      <div className="detailSerie-form-buttons">
                        <button type="submit">Guardar Temporada</button>
                        <button type="button" onClick={() => setShowAddSeasonForm(false)}>Cancelar</button>
                      </div>
                      {formMessage && <p className="detailSerie-form-message">{formMessage}</p>}
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Imagen de la serie */}
        <img src={`/images-series/${serie.image}`} alt={serie.title} className="detail-banner-image" onError={e => (e.target.style.display = "none")} />
      </div>

      {/* Capítulos de la temporada */}
      <div className="detailSerie-chapters-container">
        {chaptersList.map(ch => (
          <div key={ch.id_chapter} className="detailSerie-chapter-card">
            <img src={`/images-chapters/${ch.image}`} alt={ch.title} />
            <h3>{ch.chapter_number}. {ch.title}</h3>
            <p>{ch.duration_minutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );

}