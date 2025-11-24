// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS y la imagen de la papelera
import "../css/settings.css";
import binIcon from "../assets/icons/bin.png";

// Componente principal de selección de settings
export default function Settings() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        if (storedRole === "admin") {
            fetchData(tab);
        }
    }, []);

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Función para eliminar usuario
    const handleDeleteUser = async () => {
        const username = localStorage.getItem("username");
        if (!window.confirm("¿Seguro que quieres eliminar tu usuario?")) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteUser/${username}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Respuesta no OK del servidor");
            }

            const data = await res.json();
            if (data.success) {
                alert("Usuario eliminado correctamente");
                localStorage.removeItem("username");
                navigate("/login");
            } else {
                alert("Error: " + (data.error || "No se pudo eliminar el usuario"));
            }
        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Función para obtener todas las tablas (solo admin)
    const fetchData = async (tab) => {
        try {
            const res = await fetch(`http://localhost:3001/api/settings?tab=${tab}`, {
                headers: { role: "admin" },
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");
            const data = await res.json();

            // Si estás en la pestaña de usuarios, guarda en users
            if (tab === "users") {
                setUsers(data.data || []);
            }
            if (tab === "admins") {
                setAdmins(data.data || []);
            }
            if (tab === "movies") {
                setMovies(data.data || []);
            }
            if (tab === "series") {
                setSeries(data.data || []);
            }
        }
        catch (err) {
            console.error("Error al cargar datos:", err);
            alert("Error al cargar datos");
        }
    };


    // Función para eliminar un usuario seleccionado en la tabla (solo admin)
    const handleDeleteUserSelect = async (dni) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar este perfil?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteUserSelect/${dni}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                setUsers((prevUsers) => prevUsers.filter((u) => u.dni !== dni));
            } 
            else {
                setError(data.error || "No se pudo eliminar el usuario");
            }
        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div className="logout-container">
            <button className="back-button" onClick={() => navigate("/home")}>←</button>

            <h1 className="logout-title">Configuración</h1>

            {/*Botones para que el user pueda cerrar sesion o eliminar su cuenta */}
            {role === "user" && (
                <div className="button-group">
                    <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                    <button className="delete-btn" onClick={handleDeleteUser}>Eliminar usuario</button>
                </div>
            )}

            {/*Tabla para que el admin pueda eliminar cuentas de usuarios */}
            <div className="table-settings">
                {role === "admin" && tab === "users" && (
                    <>
                        <h1>USUARIOS</h1>
                        <table>
                            <thead>
                                <tr><th>DNI</th><th>Nombre</th><th>Usuario</th><th>Fecha nacimiento</th><th>Email</th><th>Eliminar</th></tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.dni}>
                                        <td>{u.dni}</td>
                                        <td>{u.name}</td>
                                        <td>{u.username}</td>
                                        <td>{new Date(u.birth_date).toLocaleDateString("es-ES")}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteUserSelect(u.dni)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {role === "admin" && tab === "admins" && (
                    <>
                        <h1>ADMINISTRADORES</h1>
                        <table>
                            <thead>
                                <tr><th>DNI</th><th>Nombre</th><th>Usuario</th><th>Fecha nacimiento</th><th>Email</th><th>Eliminar</th></tr>
                            </thead>
                            <tbody>
                                {admins.map((a) => (
                                    <tr key={a.dni}>
                                        <td>{a.dni}</td>
                                        <td>{a.name}</td>
                                        <td>{a.username}</td>
                                        <td>{new Date(a.birth_date).toLocaleDateString("es-ES")}</td>
                                        <td>{a.email}</td>
                                        <td>
                                            <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteUserSelect(u.dni)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {role === "admin" && tab === "movies" && (
                    <>
                        <h1>MOVIES</h1>
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Titulo</th><th>Descripcion</th><th>Fecha de estreno</th><th>Genero</th><th>Duracion en minutos</th><th>Eliminar</th></tr>
                            </thead>
                            <tbody>
                                {movies.map((m) => (
                                    <tr key={m.id_movie}>
                                        <td>{m.id_movie}</td>
                                        <td>{m.title}</td>
                                        <td>{m.description}</td>
                                        <td>{new Date(m.release_date).toLocaleDateString("es-ES")}</td>
                                        <td>{m.genre}</td>
                                        <td>{m.duration_minutes}</td>
                                        <td>
                                            <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteUserSelect(u.dni)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {role === "admin" && tab === "series" && (
                    <>
                        <h1>SERIES</h1>
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Titulo</th><th>Descripcion</th><th>Fecha de estreno</th><th>Genero</th><th>Temporadas</th><th>Eliminar</th></tr>
                            </thead>
                            <tbody>
                                {series.map((s) => (
                                    <tr key={s.id_series}>
                                        <td>{s.id_series}</td>
                                        <td>{s.title}</td>
                                        <td>{s.description}</td>
                                        <td>{new Date(s.release_date).toLocaleDateString("es-ES")}</td>
                                        <td>{s.genre}</td>
                                        <td>{s.seasons}</td>
                                        <td>
                                            <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteUserSelect(u.dni)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
}
