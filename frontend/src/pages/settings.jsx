// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS, la imagen de la papelera y el componenete loading
import "../css/settings.css";
import binIcon from "../assets/icons/bin.png";
import Loading from "../components/Loading";
import pen from "../assets/icons/pen.png";


// Componente principal de selección de settings
export default function Settings() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [editingMovieId, setEditingMovieId] = useState(null);
    const [editingSerieId, setEditingSerieId] = useState(null);
    const [movies, setMovies] = useState({});
    const [series, setSeries] = useState({});
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const [isEditing, setIsEditing] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const tab = searchParams.get("tab");

    // Validadores adaptados a tus campos reales
    const validators = {
        title: (v) => {
            if (!v?.trim()) return "El título es obligatorio.";
            if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
            return "";
        },
        description: (v) => {
            if (!v?.trim()) return "La descripción es obligatoria.";
            if (v.trim().length < 10) return "Debe tener al menos 10 caracteres.";
            return "";
        },
        genre: (v) => {
            if (!v?.trim()) return "El género es obligatorio.";
            return "";
        },
        seasons: (v) => {
            const num = parseInt(v, 10);
            if (v === "" || isNaN(num)) return "El número de temporadas es obligatorio.";
            if (num <= 0) return "Debe ser mayor que 0.";
            return "";
        },
        release_date: (v) => {
            if (!v) return "La fecha de estreno es obligatoria.";
            const d = new Date(v);
            if (isNaN(d.getTime())) return "Fecha no válida.";
            return "";
        },
        minimum_age: (v) => {
            const num = parseInt(v, 10);
            if (v === "" || isNaN(num)) return "La edad mínima es obligatoria.";
            if (num < 0) return "Debe ser un número positivo.";
            return "";
        }
    }

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

    const startEditingMovie = (movie) => {
        setMovies({ ...movie });
        setEditingMovieId(movie.id_movie);
        setFieldErrors({}); setError("");
    };

    const startEditingSerie = (series) => {
        setSeries({ ...series });
        setEditingSerieId(series.id_series);
        setFieldErrors({}); setError("");
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

    // Función para eliminar una series seleccionada en la tabla (solo admin)
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

    const handleChange = e => {
        const { name, value } = e.target;
        setSerie(prev => ({ ...prev, [name]: value }));
    };

    const releaseDateValue =
        series && series.release_date
            ? series.release_date.slice(0, 10)
            : "";

    const handleCancel = () => {
        if (originalSerie) {
            setSerie(originalSerie);
        }
        setIsEditing(false);
        setError("");
        setFieldErrors({});
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!series) return;

        const errors = {};
        for (const field in validators) {
            const value = series[field];
            const errorMsg = validators[field](value);
            if (errorMsg) errors[field] = errorMsg;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            setError("❌ No estás autenticado. Por favor, inicia sesión.");
            return;
        }

        if (role !== "admin") {
            setError("❌ No tienes permisos para editar esta series.");
            return;
        }

        const payload = {
            ...series,
            release_date:
                typeof series.release_date === "string"
                    ? series.release_date.slice(0, 10)
                    : new Date(series.release_date).toISOString().slice(0, 10)
        };

        fetch(`http://localhost:3001/api/series/${series.id_series}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `Error ${res.status}`);
                }
                setOriginalSerie({ ...series });
                setIsEditing(false);
                setError("");
            })
            .catch(err => {
                console.error("Error en actualización:", err);
                setError(`No se pudo actualizar: ${err.message}`);
            });
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

                    {/*Tabla para que el admin pueda eliminar cuentas de administradores */}
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

                    {/*Tabla para que el admin pueda eliminar peliculas */}
                    {role === "admin" && tab === "movies" && (
                        <>
                            <h1>Tabla de peliculas</h1>
                            <div className="table-settings">
                                <table>
                                    <thead>
                                        <tr><th>ID</th><th>Titulo</th><th>Imagen</th><th>Descripcion</th><th>Fecha de estreno</th><th>Genero</th><th>Duracion</th><th>Eliminar</th></tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((m) => (
                                            <tr key={m.id_movie}>
                                                <td>{m.id_movie}</td>
                                                <td>{m.title}</td>
                                                <td>{m.image}</td>
                                                <td>{m.description}</td>
                                                <td>{new Date(m.release_date).toLocaleDateString("es-ES")}</td>
                                                <td>{m.genre}</td>
                                                <td>{m.duration_minutes}</td>
                                                <td>
                                                    <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteMovieSelect(m.id_movie)} />
                                                </td>
                                                <td>
                                                    <img src={pen} alt="Editar" className="pen-image" onClick={setEditingMovieId(m.id_movie)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/*Tabla para que el admin pueda eliminar series */}
                    {role === "admin" && tab === "series" && (
                        <>
                            <h1>Tabla de series</h1>
                            <div className="table-settings">
                                <table>
                                    <thead>
                                        <tr><th>ID</th><th>Titulo</th><th>Imagen</th><th>Descripcion</th><th>Fecha de estreno</th><th>Genero</th><th>Temporadas</th><th>Editar</th><th>Eliminar</th></tr>
                                    </thead>
                                    <tbody>
                                        {series.map((s) => (
                                            <tr key={s.id_series}>
                                                <td>{s.id_series}</td>
                                                <td>{s.title}</td>
                                                <td>{s.image}</td>
                                                <td>{s.description}</td>
                                                <td>{new Date(s.release_date).toLocaleDateString("es-ES")}</td>
                                                <td>{s.genre}</td>
                                                <td>{s.seasons}</td>
                                                <td>
                                                    <img src={pen} alt="Editar" className="delete-icon" onClick={() => setEditingSerieId(s.id_series)} />
                                                </td>
                                                <td>
                                                    <img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteSeriesSelect(s.id_series)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 🔹 Formulario de edición */}
                            {editingSerieId && (

                                <form onSubmit={handleSubmit} noValidate>
                                    <input
                                        name="title"
                                        value={series.title ?? ""}
                                        onChange={handleChange}
                                        placeholder="Título"
                                    />
                                    {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

                                    <textarea
                                        name="description"
                                        value={series.description ?? ""}
                                        onChange={handleChange}
                                        placeholder="Descripción"
                                        rows="4"
                                    />
                                    {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

                                    <input
                                        name="genre"
                                        value={series.genre ?? ""}
                                        onChange={handleChange}
                                        placeholder="Género"
                                    />
                                    {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

                                    <input
                                        name="seasons"
                                        type="number"
                                        value={series.seasons ?? ""}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="Temporadas"
                                    />
                                    {fieldErrors.seasons && <span className="error">{fieldErrors.seasons}</span>}

                                    <input
                                        name="release_date"
                                        type="date"
                                        value={releaseDateValue}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

                                    <input
                                        name="minimum_age"
                                        type="number"
                                        value={series.minimum_age ?? ""}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="Edad mínima"
                                    />
                                    {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

                                    <div className="btns">
                                        <button type="submit" className="btn-edit">Guardar</button>
                                        <button
                                            type="button"
                                            className="btn-edit cancel"
                                            onClick={handleCancel}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    {error && <p className="error-message" style={{ marginTop: "10px" }}>{error}</p>}
                                </form>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
