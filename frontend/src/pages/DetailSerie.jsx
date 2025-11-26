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

// Componente principal de la página de detailSerie
export default function DetailSerie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/series/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la serie");
        return res.json();
      })
      .then(data => setSerie(data.series))
      .catch(err => {
        console.error("Error al cargar serie:", err);
        setError("Serie no encontrada");
      });

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

  //Fucion para añadir y quitar like
  const toggleLike = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isLiked) {
      fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      }).then(() => setIsLiked(true));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      }).then(() => setIsLiked(false));
    }
  };

  //Funcion para añadir y quitar favorito
  const toggleFavorite = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isFavorite) {
      fetch("http://localhost:3001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      }).then(() => setIsFavorite(true));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      }).then(() => setIsFavorite(false));
    }
  };

  // Manejo de cambios en inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setSerie(prev => ({ ...prev, [name]: value }));
  };

  // Enviar formulario 
  const handleSubmit = e => {
    e.preventDefault();
    if (!serie) return;

    const payload = {
      ...serie,
      release_date:
        typeof serie.release_date === "string"
          ? serie.release_date.slice(0, 10)
          : new Date(serie.release_date).toISOString().slice(0, 10)
    };

    fetch(`http://localhost:3001/api/series/${serie.id_series}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar");
        setIsEditing(false);
      })
      .catch(() => setError("No se pudo actualizar"));
  };

  if (error) return <p>{error}</p>;
  if (!serie) return <Loading />;

  // Valor seguro para mostrar en el input type="date"
  const releaseDateValue =
    typeof serie.release_date === "string"
      ? serie.release_date.slice(0, 10)
      : new Date(serie.release_date).toISOString().slice(0, 10);

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <img src={`/images-series/${serie.image}`} alt={serie.title} className="banner-image" />

        <div className="info">
          {isEditing ? (
            //Formulario de editar una serie o pelicula 
            <form onSubmit={handleSubmit}>
              <input name="title" value={serie.title ?? ""} onChange={handleChange} placeholder="Título"/>

              <textarea name="description" value={serie.description ?? ""} onChange={handleChange} placeholder="Descripción"/>
              
              <input name="genre" value={serie.genre ?? ""} onChange={handleChange} placeholder="Género"/>

              <input name="seasons" type="number" value={serie.seasons ?? ""} onChange={handleChange} placeholder="Temporadas" min="0"/>
              
              <input name="release_date" type="date" value={releaseDateValue ?? ""} onChange={handleChange}/>
              
              <input name="minimum_age" type="number" value={serie.minimum_age ?? ""} onChange={handleChange} placeholder="Edad mínima" min="0"/>
              
              <div className="btns">
                <button type="submit" className="btn">Guardar</button>
                <button type="button"  className="btn"onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              {/*Datos de cada serie / pelicula */}
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
                {/*Botones de reproducir, like, favorito y editar */}
                <button className="btn play">▶ Reproducir</button>
                
                <div className="images">
                  <button onClick={toggleLike}>
                    <img src={isLiked ? likeFilled : like} alt="like" className={`like-image ${isLiked ? "active" : ""}`}/>
                  </button>

                  <button onClick={toggleFavorite}>
                    <img src={isFavorite ? starFilled : star} alt="favorite" className={`star-image ${isFavorite ? "active" : ""}`}/>
                  </button>

                  {localStorage.getItem("role") === "admin" && (
                    <button onClick={() => setIsEditing(true)}>
                      <img src={pen} alt="Editar" className="pen-image" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
