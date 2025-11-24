// Importamos React y hooks para estado y ciclo de vida
import React, { useEffect, useState } from "react";

// Nos permite redirigir al usuario a otra ruta desde el código
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS y la imagen de la papelera
import "../css/profiles.css";
import binIcon from "../assets/icons/bin.png";

// Función para generar un color aleatorio en formato HSL
const getRandomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
};

// Componente principal de selección de perfiles
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
                const res = await fetch(`http://localhost:3001/api/profiles?username=${username}`);
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

        // Validar que no esté vacío el campo de nombre
        if (!newProfile.nombre.trim()) {
            setError("El nombre del perfil es obligatorio");
            return;
        }

        try {
            const username = localStorage.getItem("username");
            const res = await fetch("http://localhost:3001/api/addProfile", {
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
            const res = await fetch(`http://localhost:3001/api/deleteProfile/${id}`, {method: "DELETE"});
            const data = await res.json();
            if (data.success) {
                // Actualizamos la lista de perfiles en el estado
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
            <div className="profiles-content">
                <button className="back-button" onClick={() => navigate("/login")}>←</button>

                <h1 className="profiles-title">¿Quién está viendo?</h1>
                {error && <div className="profiles-error">{error}</div>}

                {/*Lista perfiles*/}
                <div className="profiles-list">
                    {profiles.map((p) => (
                        <div key={p.id} className="profile-row">

                            <div className="profile-icon" style={{ backgroundColor: getRandomColor() }} onClick={() => handleSelectProfile(p.id)}>
                                <span className="profile-initial">{p.name?.[0]?.toUpperCase()}</span>
                            </div>

                            <span className="profile-name" onClick={() => handleSelectProfile(p.id)}>{p.name}</span>

                            <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteProfile(p.id)}/>
                        </div>
                    ))}

                    {/*Crear nuevo perfil*/}
                    {!showForm && (
                        <div className="profile-row new-profile" onClick={toggleForm}>
                            <div className="profile-icon plus" >
                                <span className="profile-plus">+</span>
                            </div>
                            <span className="profile-name">Nuevo perfil</span>
                        </div>
                    )}
                </div>

                {/*Formulario para crear nuevo perfil*/}
                {showForm && (
                    <form className="new-profile-form" onSubmit={handleCreateProfile}>
                        <div className="form-row">
                            <label className="form-label">Nombre del perfil</label>
                            <input type="text" className="form-input" placeholder="Ej: Sofia" value={newProfile.nombre} onChange={(e) => setNewProfile({ nombre: e.target.value })}/>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={toggleForm}>Cancelar</button>
                            <button type="submit" className="btn-primary">Crear perfil</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
