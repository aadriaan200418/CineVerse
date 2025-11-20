// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS y los iconos
import "../css/home.css";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/settings.png";


import moviesData from "../data/movies.json";
import seriesData from "../data/series.json";
import Carousel from "../components/Carousel";

// Componente principal de la página de home
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
              <div className="profile-icon">
                <img src={userIcon} alt="Usuario" className="user-icon" onClick={() => navigate("/profiles")} />
              </div>

              <div className="back-point">{localStorage.getItem("username") || "Usuario"}</div>
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

        <div className="menu-right">
          <img src={settingsIcon} alt="Settings" className="settings" onClick={() => navigate("/settings")} />
        </div>
      </nav>

      {/* Contenido dinámico */}
      {view === "inicio" && (
        <>
          {/* Imagen destacada de estreno */}
          <div className="featured-banner">
            <img src="/images-series/lidia_poet3.jpg" alt="La Ley de Lidia Poët" className="featured-image" />

            <div className="featured-label">NUEVO ESTRENO</div>
          </div>

          {/* Carrusel de Series */}
          <Carousel title="Top Series" items={series} imagePath="images-series" />

          {/* Carrusel de Películas */}
          <Carousel title="Top Películas" items={movies} imagePath="images-movies" />
        </>
      )}

      {view === "series" && (
        <div className="section">
          <h2>Series</h2>
          <div className="card-grid">
            {filteredSeries.map((serie) => (
              <Card
                key={serie.id_series}
                image={serie.image}
                title={serie.title}
                genre={serie.genre}
                type="images-series"
              />
            ))}
          </div>
        </div>
      )}

      {view === "peliculas" && (
        <div className="section">
          <h2>Películas</h2>
          <div className="card-grid">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id_movie}
                image={movie.image}
                title={movie.title}
                genre={movie.genre}
                type="images-movies"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
