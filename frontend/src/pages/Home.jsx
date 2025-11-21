// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS y los iconos
import "../css/home.css";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/settings.png";
import Loading from "../components/Loading";


import Carousel from "../components/Carousel";

// Componente principal de la página de home
export default function Home() {
  const [role, setRole] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState("inicio");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loadingMovies, setLoadingMovies] = useState(true);
const [loadingSeries, setLoadingSeries] = useState(true);


  useEffect(() => {
  const storedRole = localStorage.getItem("role");
  setRole(storedRole);

  // Películas
  fetch("http://localhost:3001/api/movies")
    .then(res => res.json())
    .then(data => {
      setMovies(data.movies);
      setLoadingMovies(false);
    })
    .catch(err => {
      console.error("Error cargando películas:", err);
      setLoadingMovies(false);
    });

  // Series
  fetch("http://localhost:3001/api/series")
    .then(res => res.json())
    .then(data => {
      setSeries(data.series);
      setLoadingSeries(false);
    })
    .catch(err => {
      console.error("Error cargando series:", err);
      setLoadingSeries(false);
    });
}, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().startsWith(searchTerm)
  );

  const filteredSeries = series.filter((serie) =>
    serie.title.toLowerCase().startsWith(searchTerm)
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
    <div className="featured-banner">
      <img src="/images-series/lidia_poet3.jpg" alt="La Ley de Lidia Poët" className="featured-image" />
      <div className="featured-label">NUEVO ESTRENO</div>
    </div>

    {loadingSeries ? (
      <Loading />
    ) : (
      <Carousel title="Top Series" items={filteredSeries} imagePath="images-series" />
    )}

    {loadingMovies ? (
      <Loading />
    ) : (
      <Carousel title="Top Películas" items={filteredMovies} imagePath="images-movies" />
    )}
  </>
)}





    {view === "series" && (
      <div className="section">
        <h2>Series</h2>
      {loadingSeries ? (
  <Loading />
) : (
  <Carousel title="Top Series" items={filteredSeries} imagePath="images-series" />
)}
      </div>
    )}

    {view === "peliculas" && (
      <div className="section">
        <h2>Películas</h2>
      {loadingMovies ? (
  <Loading />
) : (
  <Carousel title="Top Películas" items={filteredMovies} imagePath="images-movies" />
)}
      </div>
    )}
    </div>
  );
}
