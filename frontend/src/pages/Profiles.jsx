// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS y las imagenes
import "../css/profiles.css";
import binIcon from "../assets/icons/bin.png";
import Loading from "../components/Loading";

// Función para generar un color aleatorio en formato HSL
const getRandomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
};

export default function Profiles() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newProfile, setNewProfile] = useState({ nombre: "" });
    const [loading, setLoading] = useState(true);

    // Al montar el componente, obtenemos los perfiles del usuario
    useEffect(() => {
        const username = localStorage.getItem("username");
        console.log("Username en localStorage:", username);

        if (!username) {
            setError("No se encontró el usuario. Inicia sesión de nuevo.");
            setLoading(false);
            return;
        }

        const fetchProfiles = async () => {
            try {
                const res = await fetch(`/api/profiles?username=${username}`);
                if (!res.ok) {
                    setError("Error en el servidor: " + res.status);
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setProfiles(data.perfiles || []);
                } 
                else {
                    setError(data.error || "No se pudieron cargar los perfiles");
                }
            }
            catch {
                setError("Error de conexión con el servidor");
            }
            finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    // Selección de perfil
    const handleSelectProfile = (profileId, name) => {
        localStorage.setItem("id_profile", profileId);
        navigate("/home");
    };

    // Mostrar/ocultar formulario
    const toggleForm = () => setShowForm((v) => !v);

    // Crear nuevo perfil
    const handleCreateProfile = async (e) => {
        e.preventDefault();
        setError("");

        if (!newProfile.nombre.trim()) {
            setError("El nombre del perfil es obligatorio");
            return;
        }

        try {
            const username = localStorage.getItem("username");
            const res = await fetch("/api/addProfile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, nombre: newProfile.nombre.trim() })
            });

            const data = await res.json();
            if (data.success) {
                setProfiles(data.perfiles || []);
                setShowForm(false);
                setNewProfile({ nombre: "" });
            }
            else {
                setError(data.error || "No se pudo crear el perfil");
            }
        }
        catch {
            setError("Error de conexión con el servidor");
        }
    };

    // Eliminar perfil
    const handleDeleteProfile = async (id) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar este perfil?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/deleteProfile/${id}`, {method: "DELETE"});
            const data = await res.json();
            if (data.success) {
                setProfiles((prev) => prev.filter((p) => p.id !== id));
            } 
            else {
                setError(data.error || "No se pudo eliminar el perfil");
            }
        } 
        catch {
            setError("Error de conexión al eliminar perfil");
        }
    };

    return (
    <div className="profiles-container">
        {/* Si está cargando, mostramos el componente Loading */}
        {loading ? (
            <Loading />
        ) : (
            <div className="profiles-content">
                <button className="back-button" onClick={() => navigate("/login")}>←</button>

                <h1 className="profiles-title">¿Quién está viendo?</h1>
                {error && <div className="profiles-error">{error}</div>}

                {/*Lista perfiles*/}
                <div className="profiles-list">
                    {profiles.map((p) => (
                        <div key={p.id} className="profiles-row">

                            <div className="profiles-icon" style={{ backgroundColor: getRandomColor() }} onClick={() => handleSelectProfile(p.id)}>
                                <span className="profiles-initial">{p.name?.[0]?.toUpperCase()}</span>
                            </div>

                            <span className="profiles-name" onClick={() => handleSelectProfile(p.id)}>{p.name}</span>

                            <img src={binIcon} alt="Eliminar perfil" className="profiles-delete-icon" onClick={() => handleDeleteProfile(p.id)}/>
                        </div>
                    ))}

                    {/*Crear nuevo perfil*/}
                    {!showForm && (
                        <div className="profiles-row new-profile" onClick={toggleForm}>
                            <div className="profiles-icon plus" >
                                <span className="profiles-plus">+</span>
                            </div>
                            <span className="profiles-name">Nuevo perfil</span>
                        </div>
                    )}
                </div>

                {/*Formulario para crear nuevo perfil*/}
                {showForm && (
                    <form className="profiles-new-form" onSubmit={handleCreateProfile}>
                        <div className="profiles-form-row">
                            <label className="profiles-form-label">Nombre del perfil</label>
                            <input type="text" className="profiles-form-input" placeholder="Ej: Sofia" value={newProfile.nombre} onChange={(e) => setNewProfile({ nombre: e.target.value })}/>
                        </div>

                        <div className="profiles-form-actions">
                            <button type="button" className="profiles-btn-secondary" onClick={toggleForm}>Cancelar</button>
                            <button type="submit" className="profiles-btn-primary">Crear perfil</button>
                        </div>
                    </form>
                )}
            </div>
        )}
    </div>
);
}
