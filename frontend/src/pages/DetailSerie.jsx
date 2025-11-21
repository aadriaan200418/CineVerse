// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Importamos css, iconos y componentes
import "../css/detail.css";
import like from "../assets/icons/like.png";
import star from "../assets/icons/star.png";
import pen from "../assets/icons/pen.png";
import Loading from "../components/Loading";

// Definimos el componente principal de la página de detail serie
export default function DetailSerie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [error, setError] = useState("");

  // Cargar datos de la serie
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
  }, [id]);
//guardarlike
  const saveLike = () => {
  const id_profile = localStorage.getItem("id_profile");
  fetch("http://localhost:3001/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_profile, id_series: serie.id_series }) // en DetailSerie usa id_series
  })
    .then(res => res.json())
    .then(data => console.log("Like guardado:", data))
    .catch(err => console.error("Error guardando like:", err));
};
//guardar favorito
const saveFavorite = () => {
  const id_profile = localStorage.getItem("id_profile");
  fetch("http://localhost:3001/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_profile, id_series: serie.id_series }) // en DetailSerie usa id_series
  })
    .then(res => res.json())
    .then(data => console.log("Favorito guardado:", data))
    .catch(err => console.error("Error guardando favorito:", err));
};


  if (error) return <p>{error}</p>;
  if (!serie) return <Loading />;

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <img src={`/images-series/${serie.image}`} alt={serie.title} className="banner-image" />

        {/*Datos de la serie */}
        <div className="info">
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

          {/*Botones de acciones */}
          <div className="buttons-rep">
            <button className="btn play">▶ Reproducir</button>

            <div className="images">
              {/* Botón Like */}
              <button onClick={saveLike}>
                <img src={like} alt="like" className="like-image"/>
              </button>

              {/* Botón Favorito */}
              <button onClick={saveFavorite}>
                <img src={star} alt="star" className="star-image" />
              </button>

              {/* Botón Editar solo para admin */}
              {localStorage.getItem("role") === "admin" && (
                <button>
                  <img src={pen} alt="Editar" className="pen-image" onClick={() => navigate(`/series/edit/${serie.id_series}`)}/>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
