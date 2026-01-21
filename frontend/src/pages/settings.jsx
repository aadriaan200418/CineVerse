// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS, la imagen de la papelera y el componente loading
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
    const [allMovies, setAllMovies] = useState([]);
    const [allSeries, setAllSeries] = useState([]);
    const [editingMovie, setEditingMovie] = useState(null);
    const [editingSeries, setEditingSeries] = useState(null);
    const [editingUser, setEditingUser] = useState(null); // ← Nuevo estado
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const [fieldErrors, setFieldErrors] = useState({});
    const [userFieldErrors, setUserFieldErrors] = useState({}); // ← Errores específicos de usuario
    const [loading, setLoading] = useState(true);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminFieldErrors, setAdminFieldErrors] = useState({});
    const tab = searchParams.get("tab");

    /* Al cargar la pagina */
    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        if (storedRole === "admin") {
            setLoading(true);
            fetchData(tab).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [tab]);

    // Iniciar edición de administrador
    const startEditingAdmin = (admin) => {
        setEditingAdmin({ ...admin });
        setAdminFieldErrors({});
        setError("");
    };
    // Validadores comunes
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
    };

    // Validadores específicos para película
    const movieValidators = {
        ...validators,
        duration_minutes: (v) => {
            const num = parseInt(v, 10);
            if (v === "" || isNaN(num)) return "La duración es obligatoria.";
            if (num <= 0) return "Debe ser mayor que 0.";
            return "";
        }
    };

    // Validadores específicos para serie
    const seriesValidators = {
        ...validators,
        seasons: (v) => {
            const num = parseInt(v, 10);
            if (v === "" || isNaN(num)) return "El número de temporadas es obligatorio.";
            if (num <= 0) return "Debe ser mayor que 0.";
            return "";
        }
    };

    // Validadores para usuario
    const userValidators = {
        name: (v) => {
            if (!v?.trim()) return "El nombre es obligatorio.";
            if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
            return "";
        },
        username: (v) => {
            if (!v?.trim()) return "El nombre de usuario es obligatorio.";
            if (v.trim().length < 3) return "Debe tener al menos 3 caracteres.";
            return "";
        },
        email: (v) => {
            if (!v?.trim()) return "El correo es obligatorio.";
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(v)) return "Correo no válido.";
            return "";
        },
        birth_date: (v) => {
            if (!v) return "La fecha de nacimiento es obligatoria.";
            const d = new Date(v);
            if (isNaN(d.getTime())) return "Fecha no válida.";
            const today = new Date();
            if (d >= today) return "La fecha debe ser anterior a hoy.";
            return "";
        }
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Eliminar cuenta del usuario actual
    const handleDeleteUser = async () => {
        const dni = localStorage.getItem("dni");
        if (!dni) return alert("DNI no encontrado.");
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar tu cuenta?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteUserSelect/${dni}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                localStorage.clear();
                navigate("/login");
            } else {
                setError(data.error || "No se pudo eliminar tu cuenta");
            }
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Cargar datos (admin)
    const fetchData = async (tab) => {
        try {
            const res = await fetch(`http://localhost:3001/api/settings?tab=${tab}`, {
                headers: { role: "admin" },
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");
            const data = await res.json();

            if (tab === "users") {
                setUsers(data.data || []);
            }
            if (tab === "admins") {
                setAdmins(data.data || []);
            }
            if (tab === "movies") {
                setAllMovies(data.data || []);
            }
            if (tab === "series") {
                setAllSeries(data.data || []);
            }
        } catch (err) {
            console.error("Error al cargar datos:", err);
            alert("Error al cargar datos");
        }
    };

    // Eliminar usuario (admin)
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

    // Guardar cambios en administrador
    const handleAdminChange = (e) => {
        const { name, value } = e.target;
        setEditingAdmin((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelAdmin = () => {
        setEditingAdmin(null);
        setAdminFieldErrors({});
        setError("");
    };
    
    const handleSubmitAdmin = (e) => {
        e.preventDefault();
        if (!editingAdmin || !editingAdmin.dni) return;

        const errors = {};
        for (const field in userValidators) { // reutilizamos los validadores de usuario
            const errorMsg = userValidators[field](editingAdmin[field]);
            if (errorMsg) errors[field] = errorMsg;
        }
        if (Object.keys(errors).length > 0) {
            setAdminFieldErrors(errors);
            return;
        }

        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (!token || userRole !== "admin") {
            setError("No tienes permisos para editar administradores.");
            return;
        }

        const payload = {...editingAdmin, birth_date: editingAdmin.birth_date.slice(0, 10)};
        fetch(`http://localhost:3001/api/admins/${editingAdmin.dni}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Error ${res.status}`);
                }
                setAdmins(prev => prev.map(a => a.dni === editingAdmin.dni ? editingAdmin : a));
                setEditingAdmin(null);
                setError("");
            })
            .catch(err => {
                console.error("Error al actualizar administrador:", err);
                setError(`No se pudo actualizar el administrador: ${err.message}`);
            });
    };
    
    // Eliminar admin (admin)
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
            } else {
                setError(data.error || "No se pudo eliminar el administrador");
            }
        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Eliminar película (admin)
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
                setAllMovies((prev) => prev.filter((m) => m.id_movie !== id_movie));
            } else {
                setError(data.error || "No se pudo eliminar la película");
            }
        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Eliminar serie (admin)
    const handleDeleteSeriesSelect = async (id_series) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta serie?");
        if (!confirmDelete) return;
        try {
            const res = await fetch(`http://localhost:3001/api/deleteSeriesSelect/${id_series}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Respuesta no OK del servidor");

            const data = await res.json();
            if (data.success) {
                setAllSeries((prev) => prev.filter((s) => s.id_series !== id_series));
            } else {
                setError(data.error || "No se pudo eliminar la serie");
            }
        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Iniciar edición de película (admin)
    const startEditingMovie = (movie) => {
        setEditingMovie(movie);
        setFieldErrors({});
        setError("");
    };

    // Iniciar edición de serie (admin)
    const startEditingSerie = (serie) => {
        setEditingSeries(serie);
        setFieldErrors({});
        setError("");
    };

    // Iniciar edición de usuario (admin)
    const startEditingUser = (user) => {
        setEditingUser({ ...user });
        setUserFieldErrors({});
        setError("");
    };

    // Cancelar edición de serie (admin)
    const handleCancel = () => {
        setEditingSeries(null);
        setFieldErrors({});
        setError("");
    };

    // Cancelar edición de película (admin)
    const handleCancelMovie = () => {
        setEditingMovie(null);
        setFieldErrors({});
        setError("");
    };

    // Cancelar edición de usuario
    const handleCancelUser = () => {
        setEditingUser(null);
        setUserFieldErrors({});
        setError("");
    };

    // Guardar cambios para series (admin)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingSeries((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar cambios para películas (admin)
    const handleChangeMovie = (e) => {
        const { name, value } = e.target;
        setEditingMovie((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar cambios para usuarios
    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setEditingUser((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar cambios en serie (admin)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editingSeries || !editingSeries.id_series) return;

        const errors = {};
        for (const field in seriesValidators) {
            const value = editingSeries[field];
            const errorMsg = seriesValidators[field](value);
            if (errorMsg) errors[field] = errorMsg;
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if (!token) {
            setError("No estás autenticado. Por favor, inicia sesión.");
            return;
        }
        if (userRole !== "admin") {
            setError("No tienes permisos para editar esta serie.");
            return;
        }

        const payload = {
            ...editingSeries,
            release_date:
                typeof editingSeries.release_date === "string"
                    ? editingSeries.release_date.slice(0, 10)
                    : new Date(editingSeries.release_date).toISOString().slice(0, 10),
        };

        fetch(`http://localhost:3001/api/series/${editingSeries.id_series}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `Error ${res.status}`);
                }
                setAllSeries((prev) =>
                    prev.map((s) =>
                        s.id_series === editingSeries.id_series ? editingSeries : s
                    )
                );
                setEditingSeries(null);
                setError("");
            })
            .catch((err) => {
                console.error("Error en actualización de serie:", err);
                setError(`No se pudo actualizar la serie: ${err.message}`);
            });
    };

    // Guardar cambios en película
    const handleSubmitMovie = (e) => {
        e.preventDefault();
        if (!editingMovie || !editingMovie.id_movie) return;

        const errors = {};
        for (const field in movieValidators) {
            const value = editingMovie[field];
            const errorMsg = movieValidators[field](value);
            if (errorMsg) errors[field] = errorMsg;
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if (!token) {
            setError("No estás autenticado. Por favor, inicia sesión.");
            return;
        }
        if (userRole !== "admin") {
            setError("No tienes permisos para editar esta película.");
            return;
        }

        const payload = {
            ...editingMovie,
            release_date:
                typeof editingMovie.release_date === "string"
                    ? editingMovie.release_date.slice(0, 10)
                    : new Date(editingMovie.release_date).toISOString().slice(0, 10),
        };

        fetch(`http://localhost:3001/api/movies/${editingMovie.id_movie}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `Error ${res.status}`);
                }
                setAllMovies((prev) =>
                    prev.map((m) =>
                        m.id_movie === editingMovie.id_movie ? editingMovie : m
                    )
                );
                setEditingMovie(null);
                setError("");
            })
            .catch((err) => {
                console.error("Error en actualización de película:", err);
                setError(`No se pudo actualizar la película: ${err.message}`);
            });
    };

    // Guardar cambios en usuario
    const handleSubmitUser = (e) => {
        e.preventDefault();
        if (!editingUser || !editingUser.dni) return;

        const errors = {};
        for (const field in userValidators) {
            const errorMsg = userValidators[field](editingUser[field]);
            if (errorMsg) errors[field] = errorMsg;
        }
        if (Object.keys(errors).length > 0) {
            setUserFieldErrors(errors);
            return;
        }

        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if (!token || userRole !== "admin") {
            setError("No tienes permisos para editar usuarios.");
            return;
        }

        const payload = {
            ...editingUser,
            birth_date: editingUser.birth_date.slice(0, 10)
        };

        fetch(`http://localhost:3001/api/users/${editingUser.dni}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Error ${res.status}`);
                }
                setUsers(prev => prev.map(u => u.dni === editingUser.dni ? editingUser : u));
                setEditingUser(null);
                setError("");
            })
            .catch(err => {
                console.error("Error al actualizar usuario:", err);
                setError(`No se pudo actualizar el usuario: ${err.message}`);
            });
    };

    // Valores para inputs de tipo date (admin)
    const releaseDateValue = editingSeries && editingSeries.release_date ? editingSeries.release_date.slice(0, 10) : "";
    const movieReleaseDateValue = editingMovie && editingMovie.release_date ? editingMovie.release_date.slice(0, 10) : "";

    return (
        <div className="settings-container">
            {loading ? (
                <Loading />
            ) : (
                <>
                    <button className="back-button" onClick={() => navigate("/home")}>←</button>

                    {/* Botones para usuario */}
                    {role === "user" && (
                        <>
                            <h2 className="settings-title">Configuración</h2>
                            <div className="settings-button">
                                <button className="settings-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                                <button className="settings-delete-btn" onClick={handleDeleteUser}>Eliminar cuenta</button>
                            </div>
                            <div className="setting-support">
                                <p>Si necesita cambiar algún dato respecto a la cuenta registrada escriba al siguiente correo: <b>cineverse@outlook.es</b></p>
                            </div>
                        </>
                    )}

                    {/* Tabla de usuarios */}
                    {role === "admin" && tab === "users" && (
                        <>
                            <h1 className="settings-title-table">Tabla de usuarios</h1>
                            <div className="settings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>DNI</th>
                                            <th>Nombre</th>
                                            <th>Usuario</th>
                                            <th>Fecha nacimiento</th>
                                            <th>Email</th>
                                            <th>Editar</th>
                                            <th>Eliminar</th>
                                        </tr>
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
                                                    <img
                                                        src={pen}
                                                        alt="Editar usuario"
                                                        className="settings-actions-icon"
                                                        onClick={() => startEditingUser(u)}
                                                    />
                                                </td>
                                                <td>
                                                    <img
                                                        src={binIcon}
                                                        alt="Eliminar perfil"
                                                        className="settings-delete-icon"
                                                        onClick={() => handleDeleteUserSelect(u.dni)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Formulario de edición de usuario */}
                            {editingUser && (
                                <form onSubmit={handleSubmitUser} noValidate className="settings-form">
                                    <h3>Editar usuario: {editingUser.name}</h3>

                                    <label className="settings-label-sett">DNI</label>
                                    <input
                                        name="dni"
                                        value={editingUser.dni ?? ""}
                                        readOnly
                                        className="settings-input-readonly"
                                    />

                                    <label className="settings-label-sett">Nombre</label>
                                    <input
                                        name="name"
                                        value={editingUser.name ?? ""}
                                        onChange={handleUserChange}
                                        placeholder="Nombre completo"
                                    />
                                    {userFieldErrors.name && <span className="error">{userFieldErrors.name}</span>}

                                    <label className="settings-label-sett">Usuario</label>
                                    <input
                                        name="username"
                                        value={editingUser.username ?? ""}
                                        onChange={handleUserChange}
                                        placeholder="Nombre de usuario"
                                    />
                                    {userFieldErrors.username && <span className="error">{userFieldErrors.username}</span>}

                                    <label className="settings-label-sett">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={editingUser.email ?? ""}
                                        onChange={handleUserChange}
                                        placeholder="Correo electrónico"
                                    />
                                    {userFieldErrors.email && <span className="error">{userFieldErrors.email}</span>}

                                    <label className="settings-label-sett">Fecha de nacimiento</label>
                                    <input
                                        name="birth_date"
                                        type="date"
                                        value={editingUser.birth_date ? editingUser.birth_date.slice(0, 10) : ''}
                                        onChange={handleUserChange}
                                    />
                                    {userFieldErrors.birth_date && <span className="error">{userFieldErrors.birth_date}</span>}

                                    <div className="settings-btns">
                                        <button type="submit" className="settings-btn-edit">Guardar</button>
                                        <button type="button" className="settings-btn-edit" onClick={handleCancelUser}>Cancelar</button>
                                    </div>
                                    {error && <p className="error-message">{error}</p>}
                                </form>
                            )}
                        </>
                    )}

                    {/* Tabla de administradores */}
                    {role === "admin" && tab === "admins" && (
                        <>
                            <h1 className="settings-title-table">Tabla de administradores</h1>
                            <div className="settings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>DNI</th>
                                            <th>Nombre</th>
                                            <th>Usuario</th>
                                            <th>Fecha nacimiento</th>
                                            <th>Email</th>
                                            <th>Editar</th>
                                            <th>Eliminar</th>
                                        </tr>
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
                                                    <img
                                                        src={pen}
                                                        alt="Editar administrador"
                                                        className="settings-actions-icon"
                                                        onClick={() => startEditingAdmin(a)}
                                                    />
                                                </td>
                                                <td>
                                                    <img
                                                        src={binIcon}
                                                        alt="Eliminar administrador"
                                                        className="settings-delete-icon"
                                                        onClick={() => handleDeleteAdminSelect(a.dni)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Formulario de edición de administrador */}
                            {editingAdmin && (
                                <form onSubmit={handleSubmitAdmin} noValidate className="settings-form">
                                    <h3>Editar administrador: {editingAdmin.name}</h3>

                                    <label className="settings-label-sett">DNI</label>
                                    <input
                                        name="dni"
                                        value={editingAdmin.dni ?? ""}
                                        readOnly
                                        className="settings-input-readonly"
                                    />

                                    <label className="settings-label-sett">Nombre</label>
                                    <input
                                        name="name"
                                        value={editingAdmin.name ?? ""}
                                        onChange={handleAdminChange}
                                        placeholder="Nombre completo"
                                    />
                                    {adminFieldErrors.name && <span className="error">{adminFieldErrors.name}</span>}

                                    <label className="settings-label-sett">Usuario</label>
                                    <input
                                        name="username"
                                        value={editingAdmin.username ?? ""}
                                        onChange={handleAdminChange}
                                        placeholder="Nombre de usuario"
                                    />
                                    {adminFieldErrors.username && <span className="error">{adminFieldErrors.username}</span>}

                                    <label className="settings-label-sett">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={editingAdmin.email ?? ""}
                                        onChange={handleAdminChange}
                                        placeholder="Correo electrónico"
                                    />
                                    {adminFieldErrors.email && <span className="error">{adminFieldErrors.email}</span>}

                                    <label className="settings-label-sett">Fecha de nacimiento</label>
                                    <input
                                        name="birth_date"
                                        type="date"
                                        value={editingAdmin.birth_date ? editingAdmin.birth_date.slice(0, 10) : ''}
                                        onChange={handleAdminChange}
                                    />
                                    {adminFieldErrors.birth_date && <span className="error">{adminFieldErrors.birth_date}</span>}

                                    <div className="settings-btns">
                                        <button type="submit" className="settings-btn-edit">Guardar</button>
                                        <button type="button" className="settings-btn-edit" onClick={handleCancelAdmin}>Cancelar</button>
                                    </div>
                                    {error && <p className="error-message">{error}</p>}
                                </form>
                            )}
                        </>
                    )}

                    {/* Tabla de películas */}
                    {role === "admin" && tab === "movies" && (
                        <>
                            <h1 className="settings-title-table">Tabla de películas</h1>
                            <div className="settings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Título</th>
                                            <th>Imagen</th>
                                            <th>Descripción</th>
                                            <th>Fecha de estreno</th>
                                            <th>Género</th>
                                            <th>Duración</th>
                                            <th>Minimo edad</th>
                                            <th>Editar</th>
                                            <th>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allMovies.map((m) => (
                                            <tr key={m.id_movie}>
                                                <td>{m.id_movie}</td>
                                                <td>{m.title}</td>
                                                <td>{m.image}</td>
                                                <td>{m.description}</td>
                                                <td>{new Date(m.release_date).toLocaleDateString("es-ES")}</td>
                                                <td>{m.genre}</td>
                                                <td>{m.duration_minutes} min</td>
                                                <td>{m.minimum_age}</td>
                                                <td><img src={pen} alt="Editar" className="settings-actions-icon" onClick={() => startEditingMovie(m)} /></td>
                                                <td><img src={binIcon} alt="Eliminar película" className="settings-actions-icon" onClick={() => handleDeleteMovieSelect(m.id_movie)} /> </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Formulario de edición de película */}
                            {editingMovie && (
                                <form onSubmit={handleSubmitMovie} noValidate className="settings-form">
                                    <h3>Editar película: {editingMovie.title}</h3>

                                    <label className="settings-label-sett">Título</label>
                                    <input name="title" value={editingMovie.title ?? ""} onChange={handleChangeMovie} placeholder="Título" />
                                    {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

                                    <label className="settings-label-sett">Descripción</label>
                                    <textarea name="description" value={editingMovie.description ?? ""} onChange={handleChangeMovie} placeholder="Descripción" rows="4" />
                                    {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

                                    <label className="settings-label-sett">Género</label>
                                    <input name="genre" value={editingMovie.genre ?? ""} onChange={handleChangeMovie} placeholder="Género" />
                                    {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

                                    <label className="settings-label-sett">Duración (minutos)</label>
                                    <input name="duration_minutes" type="number" value={editingMovie.duration_minutes ?? ""} onChange={handleChangeMovie} min="1" placeholder="Duración en minutos" />
                                    {fieldErrors.duration_minutes && <span className="error">{fieldErrors.duration_minutes}</span>}

                                    <label className="settings-label-sett">Fecha de estreno</label>
                                    <input name="release_date" type="date" value={movieReleaseDateValue} onChange={handleChangeMovie} />
                                    {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

                                    <label className="settings-label-sett">Edad mínima</label>
                                    <input name="minimum_age" type="number" value={editingMovie.minimum_age ?? ""} onChange={handleChangeMovie} min="0" placeholder="Edad mínima" />
                                    {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

                                    <label className="settings-label-sett">Imagen (URL)</label>
                                    <input name="image" value={editingMovie.image ?? ""} onChange={handleChangeMovie} placeholder="URL de la imagen" />

                                    <div className="settings-btns">
                                        <button type="submit" className="settings-btn-edit">Guardar</button>
                                        <button type="button" className="settings-btn-edit" onClick={handleCancelMovie}>Cancelar</button>
                                    </div>
                                    {error && <p className="error-message">{error}</p>}
                                </form>
                            )}
                        </>
                    )}

                    {/* Tabla de series */}
                    {role === "admin" && tab === "series" && (
                        <>
                            <h1 className="settings-title-table">Tabla de series</h1>
                            <div className="settings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Título</th>
                                            <th>Imagen</th>
                                            <th>Descripción</th>
                                            <th>Fecha de estreno</th>
                                            <th>Género</th>
                                            <th>Temporadas</th>
                                            <th>Minimo edad</th>
                                            <th>Editar</th>
                                            <th>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allSeries.map((s) => (
                                            <tr key={s.id_series}>
                                                <td>{s.id_series}</td>
                                                <td>{s.title}</td>
                                                <td>{s.image}</td>
                                                <td>{s.description}</td>
                                                <td>{new Date(s.release_date).toLocaleDateString("es-ES")}</td>
                                                <td>{s.genre}</td>
                                                <td>{s.seasons}</td>
                                                <td>{s.minimum_age}</td>
                                                <td><img src={pen} alt="Editar" className="settings-actions-icon" onClick={() => startEditingSerie(s)} /></td>
                                                <td><img src={binIcon} alt="Eliminar serie" className="settings-actions-icon" onClick={() => handleDeleteSeriesSelect(s.id_series)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Formulario de edición de serie */}
                            {editingSeries && (
                                <form onSubmit={handleSubmit} noValidate className="settings-form">
                                    <h3>Editar serie: {editingSeries.title}</h3>

                                    <label className="settings-label-sett">Título</label>
                                    <input name="title" value={editingSeries.title ?? ""} onChange={handleChange} placeholder="Título" />
                                    {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

                                    <label className="settings-label-sett">Descripción</label>
                                    <textarea name="description" value={editingSeries.description ?? ""} onChange={handleChange} placeholder="Descripción" rows="4" />
                                    {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

                                    <label className="settings-label-sett">Género</label>
                                    <input name="genre" value={editingSeries.genre ?? ""} onChange={handleChange} placeholder="Género" />
                                    {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

                                    <label className="settings-label-sett">Temporadas</label>
                                    <input name="seasons" type="number" value={editingSeries.seasons ?? ""} onChange={handleChange} min="1" placeholder="Temporadas" />
                                    {fieldErrors.seasons && <span className="error">{fieldErrors.seasons}</span>}

                                    <label className="settings-label-sett">Fecha de estreno</label>
                                    <input name="release_date" type="date" value={releaseDateValue} onChange={handleChange} />
                                    {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

                                    <label className="settings-label-sett">Edad mínima</label>
                                    <input name="minimum_age" type="number" value={editingSeries.minimum_age ?? ""} onChange={handleChange} min="0" placeholder="Edad mínima" />
                                    {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

                                    <label className="settings-label-sett">Imagen (URL)</label>
                                    <input name="image" value={editingSeries.image ?? ""} onChange={handleChange} placeholder="URL de la imagen" />

                                    <div className="settings-btns">
                                        <button type="submit" className="settings-btn-edit">Guardar</button>
                                        <button type="button" className="settings-btn-edit" onClick={handleCancel}>Cancelar</button>
                                    </div>
                                    {error && <p className="error-message">{error}</p>}
                                </form>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}