import { useNavigate } from "react-router-dom";
import fondo from "../assets/fondo.png";
import "../css/index.css";


export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      className="index-container"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <h1 className="index-title">
        ¿Tienes cuenta en CineVerse?
      </h1>

      <div className="button-container">
        <button
          onClick={() => navigate("/register")}
          className="button register-btn"
        >
          Registrarse
        </button>

        <button
          onClick={() => navigate("/login")}
          className="button login-btn"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
