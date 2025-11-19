import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";
import userIcon from "../assets/icons/user.png";
import moviesData from "../data/movies.json";
import seriesData from "../data/series.json";
import Carousel from "../components/Carousel";


// Función para generar un color aleatorio en formato HSL
const getRandomColor = () => {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
};

export default function Home() {
  const [role, setRole] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState("inicio");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setMovies(moviesData);
    setSeries(seriesData);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm)
  );

  const filteredSeries = series.filter((serie) =>
    serie.title.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="home-container">
      {/* Menu de navegacion y buscador */}
      <nav className="top-menu">
        <div className="menu-left">
          {role === "admin" && (
            <>
              <button className="add-button" onClick={() => navigate("/create-admin")}>＋</button>
              <div className="back-point" onClick={() => navigate("/login")}>
                {localStorage.getItem("username") || "Usuario"}
              </div>
            </>
          )}

          {role === "user" && (
            <>
              <div className="profile-icon"><img src={userIcon} alt="Usuario" class="user-icon" onClick={() => navigate("/profiles")}/></div>
              <div className="back-point" onClick={() => navigate("/profiles")}>
                {localStorage.getItem("username") || "Usuario"}
              </div>
            </>
          )}
        </div>

        <div className="menu-center">
          <button onClick={() => setView("inicio")}>INICIO</button>
          <button onClick={() => setView("series")}>SERIES</button>
          <button onClick={() => setView("peliculas")}>PELÍCULAS</button>
          <button>FAVORITOS</button>
          <button>ME GUSTA</button>
          <input type="text" placeholder="Buscar..." className="search-input" onChange={handleSearch} />
        </div>
      </nav>

      {/* Contenido dinámico */}
      {view === "inicio" && (
        <>
          <h1 className="home-title">Nuevo Estreno: La Ley de Lidia Poët</h1>

          <Carousel title="Top Series" items={series} imagePath="images-series" />
          <Carousel title="Top Películas" items={movies} imagePath="images-movies" />

        </>
      )}


      {view === "series" && (
        <div className="section">
          <h2>Series</h2>
          <ul>
            {filteredSeries.map((serie) => (
              <li key={serie.id_series} className="card">
                <img
                  src={`/images-series/${serie.image}`}
                  alt={serie.title}
                  className="card-image"
                />
                <div className="card-info">
                  <strong>{serie.title}</strong> — {serie.genre}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view === "peliculas" && (
        <div className="section">
          <h2>Películas</h2>
          <ul>
            {filteredMovies.map((movie) => (
              <li key={movie.id_movie} className="card">
                <img
                  src={`/images-movies/${movie.image}`}
                  alt={movie.title}
                  className="card-image"
                />
                <div className="card-info">
                  <strong>{movie.title}</strong> — {movie.genre}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
