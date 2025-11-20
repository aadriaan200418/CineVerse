// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS y la imagen de la papelera
import "../css/settings.css";
import binIcon from "../assets/icons/bin.png";

// Componente principal de selección de settings
export default function LogoutDelete() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    //obtén el rol desde localStorage 
    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);

        if (storedRole === "admin") {
            fetchUsers();
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

                // Limpiar localStorage
                localStorage.removeItem("username");

                // Redirigir al login
                navigate("/login");
            }
            else {
                alert("Error: " + (data.error || "No se pudo eliminar el usuario"));
            }
        }
        catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de conexión con el servidor");
        }
    };

    // Función para obtener todos los usuarios (solo admin)
    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/users", {
                headers: { role: "admin" }
            });
            const data = await res.json();
            setUsers(data.users || []);
        }
        catch {
            alert("Error al cargar usuarios");
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
        } 
        catch (err) {
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

            {/*Rabla para que el admin pueda eliminar cuentas de usuarios y admins */}
            {role === "admin" && (
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>DNI</th>
                                <th>Nombre</th>
                                <th>Usuario</th>
                                <th>Fecha nacimiento</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.dni}>
                                    <td>{u.dni}</td>
                                    <td>{u.name}</td>
                                    <td>{u.username}</td>
                                    <td>{new Date(u.birth_date).toLocaleDateString('es-ES')}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td><img src={binIcon} alt="Eliminar perfil" className="delete-icon" onClick={() => handleDeleteUserSelect(u.dni)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
