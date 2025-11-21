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
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [favorites, setFavorites] = useState([]);
const [likes, setLikes] = useState([]);


  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const id_profile = localStorage.getItem("id_profile");
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
              <div className="back-point">
                {localStorage.getItem("") || "Usuario"}
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
          <img src={settingsIcon} alt="Settings" className="settings" onClick={() => setOpen(!open)} />
          {open && (
            <div className="dropdown">
              <ul>
                <li onClick={() => navigate("/setting-users")}>Usuarios</li>
                <li onClick={() => navigate("/setting-admins")}>Administradores</li>
                <li onClick={() => navigate("/setting-movies")}>Películas</li>
                <li onClick={() => navigate("/setting-series")}>Series</li>
              </ul>
            </div>
          )}
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
            <Carousel title="Todas las Series" items={filteredSeries} imagePath="images-series" />
          )}
        </div>
      )}

      {view === "movies" && (
        <div className="section">
          <h2>Películas</h2>
          {loadingMovies ? (
            <Loading />
          ) : (
            <Carousel title="Todas las Películas" items={filteredMovies} imagePath="images-movies" />
          )}
        </div>
      )}

      {view === "favorites" && (
  <div>
    <h2>My Favorites</h2>
    <table>
      <thead>
        <tr><th>Title</th><th>Image</th></tr>
      </thead>
      <tbody>
        {favorites.map(f => (
          <tr key={f.id_favorite}>
            <td>{f.movie_title || f.series_title}</td>
            <td><img src={`/images-${f.movie_title ? "movies" : "series"}/${f.movie_image || f.series_image}`} alt="" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{view === "likes" && (
  <div>
    <h2>My Likes</h2>
    <table>
      <thead>
        <tr><th>Title</th><th>Image</th></tr>
      </thead>
      <tbody>
        {likes.map(l => (
          <tr key={l.id_like}>
            <td>{l.movie_title || l.series_title}</td>
            <td><img src={`/images-${l.movie_title ? "movies" : "series"}/${l.movie_image || l.series_image}`} alt="" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


    </div>
  );
}
