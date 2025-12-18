// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS, los iconos y componentes
import "../css/home.css";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/settings.png";
import Loading from "../components/Loading";
import Carousel from "../components/Carousel";

// Componente principal de la página de home
export default function Home({ view: initialView = "inicio" }) {
  const [role, setRole] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState(initialView);
  const [view2, setView2] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  // Estados para géneros seleccionados
  const [selectedSeriesGenre, setSelectedSeriesGenre] = useState(null);
  const [selectedMovieGenre, setSelectedMovieGenre] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const id_profile = localStorage.getItem("id_profile");
    setRole(storedRole);

    // Cargar películas — SIN modificar genre
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

    // Cargar series — SIN modificar genre
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

    if (!id_profile) return;

    fetch(`http://localhost:3001/api/favorites/${id_profile}`)
      .then(res => res.json())
      .then(data => setFavorites(data.favorites))
      .catch(err => console.error("Error cargando favoritos:", err));

    fetch(`http://localhost:3001/api/likes/${id_profile}`)
      .then(res => res.json())
      .then(data => setLikes(data.likes))
      .catch(err => console.error("Error cargando likes:", err));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // ✅ Géneros únicos de películas y series
  const uniqueMovieGenres = [...new Set(movies.map(m => m.genre).filter(Boolean))];
  const uniqueSeriesGenres = [...new Set(series.map(s => s.genre).filter(Boolean))];

  // ✅ Filtrado de películas: por búsqueda + género
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().startsWith(searchTerm);
    const matchesGenre = selectedMovieGenre !== null
      ? movie.genre === selectedMovieGenre
      : true;
    return matchesSearch && matchesGenre;
  });

  // ✅ Filtrado de series: por búsqueda + género
  const filteredSeries = series.filter((serie) => {
    const matchesSearch = serie.title.toLowerCase().startsWith(searchTerm);
    const matchesGenre = selectedSeriesGenre !== null
      ? serie.genre === selectedSeriesGenre
      : true;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="home-container">
      {/* Menú de navegación y buscador */}
      <nav className="top-menu">
        <div className="menu-left">
          {role === "admin" && (
            <>
              <button className="add-button" onClick={() => setOpen1(!open1)}>＋</button>
              {open1 && (
                <div className="dropdown-create">
                  <ul>
                    <li onClick={() => navigate("/create-admin?form=users-admin")}>Usuario / Admin</li>
                    <li onClick={() => navigate("/create-admin?form=movies-series")}>Pelicula / Serie</li>
                  </ul>
                </div>
              )}
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
              <div className="back-point">
                {localStorage.getItem("username") || "Usuario"}
              </div>
            </>
          )}
        </div>

        <div className="menu-center">
          <button onClick={() => setView("inicio")}>INICIO</button>
          <button onClick={() => setView("series")}>SERIES</button>
          <button onClick={() => setView("movies")}>PELÍCULAS</button>
          <button onClick={() => setView("favorites")}>FAVORITOS</button>
          <button onClick={() => setView("likes")}>ME GUSTA</button>
          <input type="text" placeholder="Buscar..." className="search-input" onChange={handleSearch} />
        </div>

        <div className="menu-right">
          {role === "user" && (
            <img src={settingsIcon} alt="Settings" className="settings" onClick={() => navigate("/settings")} />
          )}

          {role === "admin" && (
            <>
              <img src={settingsIcon} alt="Settings" className="settings" onClick={() => setOpen2(!open2)} />
              {open2 && (
                <div className="dropdown-settings">
                  <ul>
                    <li onClick={() => navigate("/settings?tab=users")}>Usuarios</li>
                    <li onClick={() => navigate("/settings?tab=admins")}>Administradores</li>
                    <li onClick={() => navigate("/settings?tab=movies")}>Películas</li>
                    <li onClick={() => navigate("/settings?tab=series")}>Series</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Vista: Inicio */}
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

      {/* Vista: Series con filtro por género real */}
      {view === "series" && (
        <div className="section">
          <h2>Series</h2>
          {loadingSeries ? (
            <Loading />
          ) : (
            <Carousel title="Todas las Series" items={filteredSeries} imagePath="images-series" />
          )}

          <div className="genre-grid">
            <button
              className={`genre-button ${selectedSeriesGenre === null ? "active" : ""}`}
              onClick={() => setSelectedSeriesGenre(null)}
            >
              TODAS
            </button>
            {uniqueSeriesGenres.map((genre) => (
              <button
                key={genre}
                className={`genre-button ${selectedSeriesGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedSeriesGenre(genre)}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Películas con filtro por género real */}
      {view === "movies" && (
        <div className="section">
          <h2>Películas</h2>
          {loadingMovies ? (
            <Loading />
          ) : (
            <Carousel title="Todas las Películas" items={filteredMovies} imagePath="images-movies" />
          )}

          <div className="genre-grid">
            <button
              className={`genre-button ${selectedMovieGenre === null ? "active" : ""}`}
              onClick={() => setSelectedMovieGenre(null)}
            >
              TODAS
            </button>
            {uniqueMovieGenres.map((genre) => (
              <button
                key={genre}
                className={`genre-button ${selectedMovieGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedMovieGenre(genre)}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favoritos */}
      {view === "favorites" && (
        <>
          <h2>Mis Favoritos</h2>
          <div className="favorites-likes">
            {favorites.map(f => (
              <span className="card" key={f.id_favorite}>
                <img
                  src={`/images-${f.movie_title ? "movies" : "series"}/${f.movie_image || f.series_image}`}
                  className="card-image"
                  alt={f.movie_title || f.series_title}
                />
              </span>
            ))}
          </div>
        </>
      )}

      {/* Likes */}
      {view === "likes" && (
        <>
          <h2>Mis Likes</h2>
          <div className="favorites-likes">
            {likes.map(l => (
              <span className="card" key={l.id_like}>
                <img
                  src={`/images-${l.movie_title ? "movies" : "series"}/${l.movie_image || l.series_image}`}
                  className="card-image"
                  alt={l.movie_title || l.series_title}
                />
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}