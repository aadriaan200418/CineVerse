import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/detail.css";
import like from "../assets/icons/like.png";
import likeFilled from "../assets/icons/like-filled.png";
import star from "../assets/icons/star.png";
import starFilled from "../assets/icons/star-filled.png";
import pen from "../assets/icons/pen.png";
import Loading from "../components/Loading";

export default function DetailSerie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
        });

      fetch(`http://localhost:3001/api/favorites/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const fav = data.favorites?.some(f => Number(f.id_series) === numericId);
          setIsFavorite(Boolean(fav));
        });
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
      }).then(() => setIsLiked(true));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/series/${serie.id_series}`, {
        method: "DELETE"
      }).then(() => setIsLiked(false));
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
      }).then(() => setIsFavorite(true));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/series/${serie.id_series}`, {
        method: "DELETE"
      }).then(() => setIsFavorite(false));
    }
  };

  if (error) return <p>{error}</p>;
  if (!serie) return <Loading />;

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <img src={`/images-series/${serie.image}`} alt={serie.title} className="banner-image" />

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

          <div className="buttons-rep">
            <button className="btn play">▶ Reproducir</button>

            <div className="images">
              <button onClick={toggleLike}>
                <img
                  src={isLiked ? likeFilled : like}
                  alt="like"
                  className={`like-image ${isLiked ? "active" : ""}`}
                />
              </button>

              <button onClick={toggleFavorite}>
                <img
                  src={isFavorite ? starFilled : star}
                  alt="favorite"
                  className={`star-image ${isFavorite ? "active" : ""}`}
                />
              </button>

              {localStorage.getItem("role") === "admin" && (
                <button onClick={() => navigate(`/series/edit/${serie.id_series}`)}>
                  <img src={pen} alt="Editar" className="pen-image" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
