// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS, la imagen de la papelera y el componenete loading
import "../css/settings.css";
import binIcon from "../assets/icons/bin.png";
import Loading from "../components/Loading";


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
    const [loading, setLoading] = useState(true);
    const tab = searchParams.get("tab");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        if (storedRole === "admin") {
            setLoading(true);
            fetchData(tab).finally(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);


    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Función para eliminar un usuario seleccionada en la tabla (solo admin)
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
        }
        catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Función para eliminar administradores seleccionada en la tabla (solo admin)
    const handleDeleteAdminSelect = async (dni) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar este perfil?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteAdminSelect/${dni}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                setAdmins((prevAdmins) => prevAdmins.filter((a) => a.dni !== dni));
            }
            else {
                setError(data.error || "No se pudo eliminar el usuario");
            }
        }
        catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Función para eliminar una película seleccionada en la tabla (solo admin)
    const handleDeleteMovieSelect = async (id_movie) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta película?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteMovieSelect/${id_movie}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                setMovies((prevMovies) => prevMovies.filter((m) => m.id_movie !== id_movie));
            } else {
                setError(data.error || "No se pudo eliminar la película");
            }
        }
        catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Función para eliminar una serie seleccionada en la tabla (solo admin)
    const handleDeleteSeriesSelect = async (id_series) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta película?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteSeriesSelect/${id_series}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                setSeries((prevSeries) => prevSeries.filter((s) => s.id_series !== id_series));
            } else {
                setError(data.error || "No se pudo eliminar la película");
            }
        }
        catch (err) {
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

    return (
        <div className="logout-container">
            {loading ? (
                <Loading />
            ) : (
                <>
                    <button className="back-button" onClick={() => navigate("/home")}>←</button>

                    {/*Botones para que el user pueda cerrar sesion o eliminar su cuenta */}
                    {role === "user" && (
                        <>
                            <h2>Configuración</h2>
                            <div className="button-group">
                                <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                                <button className="delete-btn" onClick={handleDeleteUser}>Eliminar usuario</button>
                            </div>
                        </>
                    )}

                    {/*Tabla para que el admin pueda eliminar cuentas de usuarios */}

                    {role === "admin" && tab === "users" && (
                        <>
                            <h1>Tabla de usuarios</h1>
                            <div className="table-settings">
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
                            </div>
                        </>
                    )}

                    {role === "admin" && tab === "admins" && (
                        <>
                            <h1>Tabla de administradores</h1>
                            <div className="table-settings">
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
                                                    <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteAdminSelect(a.dni)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {role === "admin" && tab === "movies" && (
                        <>
                            <h1>Tabla de peliculas</h1>
                            <div className="table-settings">
                                <table>
                                    <thead>
                                        <tr><th>ID</th><th>Titulo</th><th>Descripcion</th><th>Fecha de estreno</th><th>Genero</th><th>Duracion</th><th>Eliminar</th></tr>
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
                                                    <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteMovieSelect(m.id_movie)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {role === "admin" && tab === "series" && (
                        <>
                            <h1>Tabla de series</h1>
                            <div className="table-settings">
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
                                                    <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteSeriesSelect(s.id_series)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
