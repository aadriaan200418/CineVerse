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
export default function DetailMovie({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  // Cargar datos de la serie
  useEffect(() => {
    fetch(`http://localhost:3001/api/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la película");
        return res.json();
      })
      .then(data => setMovie(data.movie))
      .catch(err => {
        console.error("Error al cargar película:", err);
        setError("Película no encontrada");
      });
  }, [id]);


  if (error) return <p>{error}</p>;
  if (!movie) return <Loading />;

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/movies")}>←</button>

      <div className="detail">
        <img src={`/images-movies/${movie.image}`} alt={movie.title} className="banner-image" />

        <div className="info">
          <h1>{movie.title}</h1>

          {/*Datos de la serie */}
          <div className="data">
            <div className="row1">
              <p>{movie.genre}</p>
              <p>{movie.seasons} temporadas</p>
            </div>

            <div className="row2">
              <p>{new Date(movie.release_date).getFullYear()}</p>
              <p>+{movie.minimum_age}</p>
            </div>
          </div>

          <p>{movie.description || "Sin descripción disponible"}</p>

          {/*Botones de acciones */}
          <div className="buttons-rep">
            <button className="btn play">▶ Reproducir</button>

            <div className="images">
              <img src={like} alt="like" className="like-image" />
              <img src={star} alt="star" className="star-image" />

              {localStorage.getItem("role") === "admin" && (
                <img
                  src={pen}
                  alt="Editar"
                  className="pen-image"
                  onClick={() => navigate(`/movies/edit/${movie.id_series}`)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
