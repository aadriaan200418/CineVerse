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
  const [loading, setLoading] = useState(true);
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
              {role === "user" && (
                <>
                  <img src={settingsIcon} alt="Settings" className="settings" onClick={() => navigate("/settings")} />
                </>
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

          {/*  Renderizado condicional de cada pestaña  */}
          {view2 === "setting-users" && (
            <div className="section">
              <h2>Usuarios</h2>
              {loadingUsers ? (
                <Loading />
              ) : (
                <Carousel title="Todos los Usuarios" items={filteredUsers} imagePath="images-users" />
              )}
            </div>
          )}

          {view2 === "setting-admins" && (
            <div className="section">
              <h2>Administradores</h2>
              {loadingAdmins ? (
                <Loading />
              ) : (
                <Carousel title="Todos los Administradores" items={filteredAdmins} imagePath="images-admins" />
              )}
            </div>
          )}

          {view2 === "setting-movies" && (
            <div className="section">
              <h2>Películas</h2>
              {loadingMovies ? (
                <Loading />
              ) : (
                <Carousel title="Todas las Películas" items={filteredMovies} imagePath="images-movies" />
              )}
            </div>
          )}

          {view2 === "setting-series" && (
            <div className="section">
              <h2>Series</h2>
              {loadingSeries ? (
                <Loading />
              ) : (
                <Carousel title="Todas las Series" items={filteredSeries} imagePath="images-series" />
              )}
            </div>
          )}

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
            <>
              <h2>Mis Favoritos</h2>
              <div className="favorites-likes">
                {favorites.map(f => (
                  <span className="card" key={f.id_favorite}>
                    <img src={`/images-${f.movie_title ? "movies" : "series"}/${f.movie_image || f.series_image}`} className="card-image" />
                  </span>
                ))}
              </div></>
          )}

          {view === "likes" && (
            <>
              <h2>Mis Likes</h2>
              <div className="favorites-likes">
                {likes.map(l => (
                  <span className="card" key={l.id_like}>
                    <img src={`/images-${l.movie_title ? "movies" : "series"}/${l.movie_image || l.series_image}`} className="card-image" />
                  </span>
                ))}
              </div>
            </>
          )}
    </div>
  );
}