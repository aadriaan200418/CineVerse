// ------------------------------------------------------------- IMPORTAR LIBRERÍAS -------------------------------------------------------
const fs = require('fs');
const express = require('express');
const jwt = require("jsonwebtoken");
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// ------------------------------------------------------------- CONFIGURAR EXPRESS ------------------------------------------------------
const app = express();
app.use(express.json());
app.use(cors());

// --------------------------------------------------------------- CONEXIÓN A MYSQL ---------------------------------------------------------
const db = mysql.createPool({
  host: process.env.DB_HOST || 'cineverse-cineverse.b.aivencloud.com',
  port: process.env.DB_PORT || 20319,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASS || 'AVNS_RPJs2yDtZTJGT-9mzWA',
  database: process.env.DB_NAME || 'cineVerse',
  ssl: { ca: fs.readFileSync('./certs/ca.pem') },
  connectionLimit: 10
});

db.query('SELECT 1', (err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conectado a MySQL en Aiven');
  }
});

// ------------------------------------------------------------- REGISTRO DE USUARIO ---------------------------------------------------------------
app.post('/api/register', (req, res) => {
  const { dni, name, username, birth_date, email, password } = req.body;

  // Primero comprobamos duplicados
  const checkSql = ` SELECT dni, username, email FROM users  WHERE dni = ? OR username = ? OR email = ?`;
  db.query(checkSql, [dni, username, email], (err, results) => {
    if (err) {
      console.error('Error al comprobar duplicados:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length > 0) {
      const errors = {};
      results.forEach(user => {
        if (user.dni === dni) errors.dni = "El DNI ya está registrado";
        if (user.username === username) errors.username = "El nombre de usuario ya está en uso";
        if (user.email === email) errors.email = "El correo ya está registrado";
      });
      return res.json({ errors });
    }

    // Si no hay duplicados, insertamos el usuario
    const insertSql = ` INSERT INTO users (dni, name, username, birth_date, email, password, role)  VALUES (?, ?, ?, ?, ?, ?, 'user')`;
    db.query(insertSql, [dni, name, username, birth_date, email, password], (err) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.json({ success: true, message: 'Usuario registrado correctamente' });
    });
  });
});

// ------------------------------------------------------ LOGIN DE USUARIO (devuelve también el rol) ------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT dni, username, password, role FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, error: 'USER_NOT_FOUND' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Generar token JWT usando `dni` como ID
    const token = jwt.sign(
      {
        id: user.dni,          
        username: user.username,
        role: user.role
      },
      'mi_secreto_para_dev_1234567890',
      { expiresIn: '24h' }
    );

    // Responder con los datos correctos
    res.json({
      success: true,
      username: user.username,
      role: user.role,
      id_profile: user.dni,   
      token
    });
  });
});

// ------------------------------------------------------------------ ELIMINAR USUARIO -----------------------------------------------------------------
app.delete('/api/deleteUser/:username', (req, res) => {
  const username = req.params.username;

  // Primero obtenemos datos del usuario
  const sqlGetUser = `SELECT dni, username FROM users WHERE username = ?`;
  db.query(sqlGetUser, [username], (err, results) => {
    if (err) {
      console.error('Error al obtener datos del usuario:', err);
      return res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { dni } = results[0];

    // Eliminamos perfiles asociados al usuario 
    const sqlDeleteProfiles = 'DELETE FROM profiles WHERE id_user = ?';
    db.query(sqlDeleteProfiles, [dni], (err2) => {
      if (err2) {
        console.error('Error al eliminar perfiles del usuario:', err2);
        return res.status(500).json({ error: 'Error al eliminar perfiles del usuario' });
      }

      // Finalmente eliminamos el usuario
      const sqlDeleteUser = 'DELETE FROM users WHERE username = ?';
      db.query(sqlDeleteUser, [username], (err3) => {
        if (err3) {
          console.error('Error al eliminar usuario:', err3);
          return res.status(500).json({ error: 'Error al eliminar usuario' });
        }

        res.json({ success: true });
      });
    });
  });
});

// ------------------------------------------------------------- PERFILES DE UN USUARIO ------------------------------------------------------------
//Obtener perfiles de un usuario
app.get('/api/profiles', (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Falta username' });

  const sqlUser = 'SELECT dni FROM users WHERE username = ?';
  db.query(sqlUser, [username], (err, userResults) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const dni = userResults[0].dni;

    const sqlProfiles = 'SELECT id_profile AS id, name FROM profiles WHERE id_user = ?';
    db.query(sqlProfiles, [dni], (err2, profileResults) => {
      if (err2) {
        console.error('Error al obtener perfiles:', err2);
        return res.status(500).json({ error: 'Error al obtener perfiles' });
      }

      res.json({ success: true, perfiles: profileResults });
    });
  });
});

// Crear un nuevo perfil
app.post('/api/addProfile', (req, res) => {
  const { username, nombre } = req.body;

  if (!username || !nombre) {
    return res.status(400).json({ error: 'Faltan datos: username y nombre son obligatorios' });
  }

  const sqlUser = 'SELECT dni FROM users WHERE username = ?';
  db.query(sqlUser, [username], (err, userResults) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const dni = userResults[0].dni;
    const sqlInsert = 'INSERT INTO profiles (id_user, name) VALUES (?, ?)';
    db.query(sqlInsert, [dni, nombre], (err2) => {
      if (err2) {
        console.error('Error al crear perfil:', err2);
        return res.status(500).json({ error: 'Error al crear perfil' });
      }

      const sqlUpdateJson = ` UPDATE users   SET profile = JSON_ARRAY_APPEND(IFNULL(profile, JSON_ARRAY()), '$', ?) WHERE dni = ?`;
      db.query(sqlUpdateJson, [nombre, dni], (err3) => {
        if (err3) {
          console.error(' Error al actualizar campo JSON profile:', err3);
        }

        const sqlProfiles = 'SELECT id_profile AS id, name FROM profiles WHERE id_user = ?';
        db.query(sqlProfiles, [dni], (err4, profileResults) => {
          if (err4) {
            console.error('Error al obtener perfiles:', err4);
            return res.status(500).json({ error: 'Error al obtener perfiles' });
          }

          res.json({ success: true, perfiles: profileResults });
        });
      });
    });
  });
});

//Eliminar perfil
app.delete('/api/deleteProfile/:id', (req, res) => {
  const profileId = req.params.id;
  const sqlGetUserProfile = `SELECT u.dni, p.name FROM profiles p JOIN users u ON u.dni = p.id_user WHERE p.id_profile = ?`;

  db.query(sqlGetUserProfile, [profileId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener datos del perfil' });

    const { dni, name } = results[0];

    // Eliminar likes
    const sqlDeleteLikes = 'DELETE FROM likes WHERE id_profile = ?';
    db.query(sqlDeleteLikes, [profileId], (errLikes) => {
      if (errLikes) return res.status(500).json({ error: 'Error al eliminar likes' });

      // Eliminar favoritos
      const sqlDeleteFavorites = 'DELETE FROM favorites WHERE id_profile = ?';
      db.query(sqlDeleteFavorites, [profileId], (errFav) => {
        if (errFav) return res.status(500).json({ error: 'Error al eliminar favoritos' });

        // Eliminar el perfil
        const sqlDeleteProfile = 'DELETE FROM profiles WHERE id_profile = ?';
        db.query(sqlDeleteProfile, [profileId], (errProfile) => {
          if (errProfile) return res.status(500).json({ error: 'Error al eliminar perfil' });

          // Actualizar JSON del usuario
          const sqlUpdateJson = ` UPDATE users SET profile = JSON_REMOVE(profile, JSON_UNQUOTE(JSON_SEARCH(profile, 'one', ?))) WHERE dni = ?`;
          db.query(sqlUpdateJson, [name, dni], (errJson) => {
            if (errJson) console.error('Error al actualizar JSON:', errJson);

            res.json({ success: true });
          });
        });
      });
    });
  });
});

// ------------------------------------------------------- AÑADIR USUERS/ADMINS/MOVIES/SERIES DESDE ADMIN --------------------------------------------
app.get("/api/create-admin", (req, res) => {
  const role = req.headers["role"];
  if (role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const form = req.query.tab;
  let sql;

  switch (form) {
    case "users":
      sql = "SELECT dni, name, username, birth_date, email, role FROM users WHERE role = 'user'";
      break;
    case "admins":
      sql = "SELECT dni, name, username, birth_date, email, role FROM users WHERE role = 'admin'";
      break;
    default:
      return res.status(400).json({ error: "Parámetro tab inválido" });
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json({ success: true, data: results });
  });
});

// ---------------------------------------------------- OBTENER TODAS LAS TABLAS EN SETTINGS (ADMIN) -----------------------------------------------------
// Obtener las tablas
app.get("/api/settings", (req, res) => {
  const role = req.headers["role"];
  if (role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const tab = req.query.tab;
  let sql;
  switch (tab) {
    case "users":
      sql = "SELECT dni, name, username, birth_date, email, role FROM users WHERE role = 'user'";
      break;
    case "admins":
      sql = "SELECT dni, name, username, birth_date, email, role FROM users WHERE role = 'admin'";
      break;
    case "movies":
      sql = "SELECT id_movie, title, image, description, release_date, genre, duration_minutes, minimum_age FROM movies";
      break;
    case "series":
      sql = "SELECT id_series, title, image, description, release_date, genre, seasons, minimum_age FROM series";
      break;
    default:
      return res.status(400).json({ error: "Parámetro tab inválido" });
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json({ success: true, data: results });
  });
});

// Editar película 
app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, genre, release_date, duration_minutes, minimum_age, image } = req.body;

  if (!title || !description || !genre || !release_date || !duration_minutes || minimum_age == null) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const sql = `UPDATE movies SET title = ?, description = ?, genre = ?, release_date = ?, duration_minutes = ?, minimum_age = ?, image = ?WHERE id_movie = ?`;
  db.query(
    sql,
    [title, description, genre, release_date, duration_minutes, minimum_age, image, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar película:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Película no encontrada" });
      }

      res.json({ success: true, message: "Película actualizada correctamente" });
    }
  );
});

// Editar serie 
app.put("/api/series/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, genre, release_date, seasons, minimum_age, image } = req.body;

  if (!title || !description || !genre || !release_date || !seasons || minimum_age == null) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const sql = `UPDATE series  SET title = ?, description = ?, genre = ?, release_date = ?,  seasons = ?, minimum_age = ?, image = ? WHERE id_series = ?`;

  db.query(
    sql,
    [title, description, genre, release_date, seasons, minimum_age, image, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar serie:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Serie no encontrada" });
      }

      res.json({ success: true, message: "Serie actualizada correctamente" });
    }
  );
});

// Editar usuario
app.put("/api/users/:dni", (req, res) => {
    const { dni } = req.params;
    const { name, username, birth_date, email } = req.body;

    if (!name || !username || !birth_date || !email) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar que el usuario exista y sea de tipo 'user'
    const checkUserSql = "SELECT dni FROM users WHERE dni = ? AND role = 'user'";
    db.query(checkUserSql, [dni], (err, results) => {
        if (err) {
            console.error("Error al verificar usuario:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado o no editable" });
        }

        // Verificar duplicados
        const checkDuplicatesSql = ` SELECT username, email FROM users WHERE (username = ? OR email = ?) AND dni != ?`;
        db.query(checkDuplicatesSql, [username, email, dni], (err2, dupResults) => {
            if (err2) {
                console.error("Error al verificar duplicados:", err2);
                return res.status(500).json({ error: "Error al verificar duplicados" });
            }

            if (dupResults.length > 0) {
                const errors = {};
                if (dupResults.some(u => u.username === username)) {
                    errors.username = "El nombre de usuario ya está en uso";
                }
                if (dupResults.some(u => u.email === email)) {
                    errors.email = "El correo electrónico ya está en uso";
                }
                return res.status(400).json({ errors });
            }

            // Actualizar el usuario
            const updateSql = ` UPDATE users SET name = ?, username = ?, birth_date = ?, email = ? WHERE dni = ?`;
            db.query(updateSql, [name, username, birth_date, email, dni], (err3, result) => {
                if (err3) {
                    console.error("Error al actualizar usuario:", err3);
                    return res.status(500).json({ error: "Error al actualizar usuario" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Usuario no encontrado" });
                }
                res.json({ success: true, message: "Usuario actualizado correctamente" });
            });
        });
    });
});

// Editar admininstrador
app.put("/api/admins/:dni", (req, res) => {
    const { dni } = req.params;
    const { name, username, birth_date, email } = req.body;

    // Validación básica
    if (!name || !username || !birth_date || !email) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar que el admin exista
    const checkAdminSql = "SELECT dni FROM users WHERE dni = ? AND role = 'admin'";
    db.query(checkAdminSql, [dni], (err, results) => {
        if (err) {
            console.error("Error al verificar administrador:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Administrador no encontrado" });
        }

        // Verificar duplicados (username o email usados por otro usuario o admin)
        const checkDuplicatesSql = ` SELECT username, email FROM users WHERE (username = ? OR email = ?) AND dni != ?`;
        db.query(checkDuplicatesSql, [username, email, dni], (err2, dupResults) => {
            if (err2) {
                console.error("Error al verificar duplicados:", err2);
                return res.status(500).json({ error: "Error al verificar duplicados" });
            }

            if (dupResults.length > 0) {
                const errors = {};
                if (dupResults.some(u => u.username === username)) {
                    errors.username = "El nombre de usuario ya está en uso";
                }
                if (dupResults.some(u => u.email === email)) {
                    errors.email = "El correo electrónico ya está en uso";
                }
                return res.status(400).json({ errors });
            }

            // Actualizar el administrador
            const updateSql = ` UPDATE users SET name = ?, username = ?, birth_date = ?, email = ? WHERE dni = ? AND role = 'admin'`;
            db.query(updateSql, [name, username, birth_date, email, dni], (err3, result) => {
                if (err3) {
                    console.error("Error al actualizar administrador:", err3);
                    return res.status(500).json({ error: "Error al actualizar administrador" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Administrador no encontrado" });
                }
                res.json({ success: true, message: "Administrador actualizado correctamente" });
            });
        });
    });
});

//Eliminar usuarios desde admin y usuario
app.delete("/api/deleteUserSelect/:dni", (req, res) => {
  const { dni } = req.params;

  // Borrar likes asociados a los perfiles del usuario
  db.query(
    "DELETE FROM likes WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
    [dni],
    (err) => {
      if (err) {
        console.error("Error SQL (likes):", err);
        return res.status(500).json({ success: false, error: "Error al eliminar likes" });
      }

      // Borrar favoritos asociados a los perfiles del usuario
      db.query(
        "DELETE FROM favorites WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
        [dni],
        (err) => {
          if (err) {
            console.error("Error SQL (favorites):", err);
            return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });
          }

          // Borrar perfiles del usuario
          db.query("DELETE FROM profiles WHERE id_user = ?", [dni], (err) => {
            if (err) {
              console.error("Error SQL (profiles):", err);
              return res.status(500).json({ success: false, error: "Error al eliminar perfiles" });
            }

            // Borrar el usuario
            db.query("DELETE FROM users WHERE dni = ?", [dni], (err, result) => {
              if (err) {
                console.error("Error SQL (users):", err);
                return res.status(500).json({ success: false, error: "Error al eliminar usuario" });
              }
              if (result.affectedRows > 0) {
                res.json({ success: true });
              }
              else {
                res.status(404).json({ success: false, error: "Usuario no encontrado" });
              }
            });
          });
        }
      );
    }
  );
});

//Eliminar admins
app.delete("/api/deleteAdminSelect/:dni", (req, res) => {
  const { dni } = req.params;

  // Borrar likes asociados a los perfiles del usuario
  db.query(
    "DELETE FROM likes WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
    [dni],
    (err) => {
      if (err) {
        console.error("Error SQL (likes):", err);
        return res.status(500).json({ success: false, error: "Error al eliminar likes" });
      }

      // Borrar favoritos asociados a los perfiles del usuario
      db.query(
        "DELETE FROM favorites WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
        [dni],
        (err) => {
          if (err) {
            console.error("Error SQL (favorites):", err);
            return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });
          }

          // Borrar perfiles del usuario
          db.query("DELETE FROM profiles WHERE id_user = ?", [dni], (err) => {
            if (err) {
              console.error("Error SQL (profiles):", err);
              return res.status(500).json({ success: false, error: "Error al eliminar perfiles" });
            }

            // Borrar el usuario
            db.query("DELETE FROM users WHERE dni = ?", [dni], (err, result) => {
              if (err) {
                console.error("Error SQL (users):", err);
                return res.status(500).json({ success: false, error: "Error al eliminar usuario" });
              }
              if (result.affectedRows > 0) {
                res.json({ success: true });
              }
              else {
                res.status(404).json({ success: false, error: "Usuario no encontrado" });
              }
            });
          });
        }
      );
    }
  );
});

// Eliminar película 
app.delete("/api/deleteMovieSelect/:id", (req, res) => {
  const { id } = req.params;

  // Borrar likes asociados a la película
  db.query("DELETE FROM likes WHERE id_movie = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: "Error al eliminar likes" });

    // Borrar favoritos asociados a la película
    db.query("DELETE FROM favorites WHERE id_movie = ?", [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });

      // Borrar la película
      db.query("DELETE FROM movies WHERE id_movie = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: "Error al eliminar película" });
        if (result.affectedRows > 0) {
          res.json({ success: true });
        } 
        else {
          res.status(404).json({ success: false, error: "Película no encontrada" });
        }
      });
    });
  });
});

// Eliminar serie
app.delete("/api/deleteSeriesSelect/:id", (req, res) => {
  const { id } = req.params;

  // Borrar likes asociados a la serie
  db.query("DELETE FROM likes WHERE id_series = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: "Error al eliminar likes" });

    // Borrar favoritos asociados a la serie
    db.query("DELETE FROM favorites WHERE id_series = ?", [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });

      // Finalmente borrar la serie
      db.query("DELETE FROM series WHERE id_series = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: "Error al eliminar serie" });
        if (result.affectedRows > 0) {
          res.json({ success: true });
        } 
        else {
          res.status(404).json({ success: false, error: "Serie no encontrada" });
        }
      });
    });
  });
});

// -------------------------------------------------AÑADIR PELICULAS/SERIES/USUARIOS/ASMINS DESDE ADMIN ----------------------------------------------
//Añadir usuarios o admins
app.post("/api/add-user-admin", (req, res) => {
  const { name, username, dni, birth_date, email, password, role } = req.body;
  let errors = {};
  if (!name) errors.name = "El nombre completo es obligatorio";
  if (!username) errors.username = "El nombre de usuario es obligatorio";
  if (!dni) errors.dni = "El DNI es obligatorio";
  if (!birth_date) errors.birth_date = "La fecha de nacimiento es obligatoria";
  if (!email) errors.email = "El correo electrónico es obligatorio";
  if (!password) errors.password = "La contraseña es obligatoria";
  if (!role) errors.role = "Debe seleccionar usuario o administrador";
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  // Comprobar duplicados en la tabla users (por username, dni o email)
  db.query(
    "SELECT * FROM users WHERE username = ? OR dni = ? OR email = ?",
    [username, dni, email],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      if (rows.length > 0) {
        let dupErrors = {};
        rows.forEach(row => {
          if (row.username === username) dupErrors.username = "El nombre de usuario ya existe";
          if (row.dni === dni) dupErrors.dni = "El DNI ya existe";
          if (row.email === email) dupErrors.email = "El correo electrónico ya existe";
        });
        return res.status(400).json({ errors: dupErrors });
      }

      // Insertar usuario/admin
      db.query(
        "INSERT INTO users (name, username, dni, birth_date, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, username, dni, birth_date, email, password, role],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Error en el servidor" });
          }
          return res.json({ success: true });
        }
      );
    }
  );
});

//Añadir peliculas o series
app.post("/api/add-movie-serie", (req, res) => {
  const { title, description, image, releaseDate, genre, minAge, type, duration, actors, seasons, episodes } = req.body;
  let errors = {};
  if (!title) errors.title = "El título es obligatorio";
  if (!description) errors.description = "La descripción es obligatoria";
  if (!image) errors.image = "La imagen es obligatoria";
  if (!releaseDate) errors.releaseDate = "La fecha de estreno es obligatoria";
  if (!genre) errors.genre = "El género es obligatorio";
  if (!minAge) errors.minAge = "La edad mínima es obligatoria";
  if (!type) errors.type = "Debe seleccionar película o serie";
  if (type === "pelicula") {
    if (!duration) errors.duration = "La duración es obligatoria";
    if (!actors) errors.actors = "Debe indicar actores";
  }
  else if (type === "serie") {
    if (!seasons) errors.seasons = "El número de temporadas es obligatorio";
    if (!episodes) errors.episodes = "El número de capítulos es obligatorio";
    if (!actors) errors.actors = "Debe indicar actores";
  }
  if (Object.keys(errors).length > 0) {
    return res.json({ errors });
  }

  // Comprobar duplicado en ambas tablas
  db.query(
    "SELECT * FROM movies WHERE title = ? UNION SELECT * FROM series WHERE title = ?",
    [title, title],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.json({ error: "Error en el servidor" });
      }
      if (rows.length > 0) {
        return res.json({ errors: { title: "El título ya existe en la base de datos" } });
      }

      // Insertar según tipo
      if (type === "pelicula") {
        db.query(
          "INSERT INTO movies (title, image, description, release_date, genre, minimum_age, duration_minutes, actors) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [title, image, description, releaseDate, genre, minAge, duration, JSON.stringify(actors.split(","))],
          (err2) => {
            if (err2) {
              console.error(err2);
              return res.json({ error: "Error en el servidor" });
            }
            return res.json({ success: true });
          }
        );
      } 
      else {
        db.query(
          "INSERT INTO series (title, image, description, release_date, genre, minimum_age, seasons, actors) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [title, image, description, releaseDate, genre, minAge, seasons, JSON.stringify(actors.split(","))],
          (err3) => {
            if (err3) {
              console.error(err3);
              return res.json({ error: "Error en el servidor" });
            }
            return res.json({ success: true });
          }
        );
      }
    }
  );
});

// --------------------------------------------------------------- PELÍCULAS ---------------------------------------------------
// Obtener todas las películas
app.get("/api/movies", (req, res) => {
  const sql = "SELECT * FROM movies ORDER BY release_date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener películas:", err);
      return res.status(500).json({ error: "Error al obtener películas" });
    }
    res.json({ success: true, movies: results });
  });
});

// Detalle de una película
app.get("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM movies WHERE id_movie = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener película:", err);
      return res.status(500).json({ error: "Error al obtener película" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Película no encontrada" });
    }
    res.json({ success: true, movie: results[0] });
  });
});

// Editar pelicula en el Detail (admin)
app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, image, description, release_date, genre, minimum_age, duration_minutes, actors } = req.body;

  db.query(
    `UPDATE movies SET title = ?, image = ?, description = ?, release_date = ?, genre = ?, minimum_age = ?, duration_minutes = ?, actors = ? WHERE id_movie = ?`,
    [title, image, description, release_date, genre, minimum_age, duration_minutes, JSON.stringify(actors || []), id],
    (err) => {
      if (err) {
        console.error("Error al actualizar película:", err);
        return res.status(500).send({ error: "Error al actualizar la película" });
      }
      res.send({ success: true, message: "Película actualizada correctamente" });
    }
  );
});

// ----------------------------------------------------------------- SERIES --------------------------------------------
// Obtener todas las series
app.get("/api/series", (req, res) => {
  const sql = "SELECT * FROM series ORDER BY release_date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener series:", err);
      return res.status(500).json({ error: "Error al obtener series" });
    }
    res.json({ success: true, series: results });
  });
});

// Detalle de una serie y sus temporadas
app.get("/api/series/:id", (req, res) => {
  const { id } = req.params;
  const sqlSeries = "SELECT * FROM series WHERE id_series = ?";
  const sqlSeasons = "SELECT * FROM seasons WHERE id_series = ? ORDER BY season_number ASC";

  db.query(sqlSeries, [id], (err, seriesResult) => {
    if (err) {
      console.error("Error al obtener la serie:", err);
      return res.status(500).json({ error: "Error al obtener la serie" });
    }
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: "Serie no encontrada" });
    }

    db.query(sqlSeasons, [id], (err2, seasonsResult) => {
      if (err2) {
        console.error("Error al obtener temporadas:", err2);
        return res.status(500).json({ error: "Error al obtener temporadas" });
      }

      res.json({ success: true, series: seriesResult[0], seasons: seasonsResult });
    });
  });
});

// Obtener capítulos de una temporada
app.get("/api/series/:id/season/:seasonNumber/chapters", (req, res) => {
  const { id, seasonNumber } = req.params;

  const sqlSeason = "SELECT id_season FROM seasons WHERE id_series = ? AND season_number = ?";
  db.query(sqlSeason, [id, seasonNumber], (err, seasonResult) => {
    if (err) {
      console.error("Error al obtener temporada:", err);
      return res.status(500).json({ error: "Error al obtener temporada" });
    }
    if (seasonResult.length === 0) {
      return res.status(404).json({ error: "Temporada no encontrada" });
    }

    const id_season = seasonResult[0].id_season;
    const sqlChapters = "SELECT * FROM chapters WHERE id_season = ?";
    db.query(sqlChapters, [id_season], (err2, chaptersResult) => {
      if (err2) {
        console.error("Error al obtener capítulos:", err2);
        return res.status(500).json({ error: "Error al obtener capítulos" });
      }
      res.json({ success: true, chapters: chaptersResult });
    });
  });
});

// Editar serie en Detail (admin)
app.put("/api/series/:id", (req, res) => {
  const { id } = req.params;
  const { title, image, description, release_date, genre, minimum_age, seasons, actors } = req.body;

  db.query(
    `UPDATE series SET title = ?, image = ?, description = ?, release_date = ?, genre = ?, minimum_age = ?, seasons = ?, actors = ? WHERE id_series = ?`,
    [ title, image, description, release_date, genre, minimum_age, seasons, JSON.stringify(actors || []), id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar serie:", err);
        return res.status(500).send({ error: "Error al actualizar la serie" });
      }
      res.send({ success: true, message: "Serie actualizada correctamente" });
    }
  );
});

// -------------------------------------------------------------- HOME SERIES / PELICULAS -----------------------------------------------------------------
// Top 10 peliculas
app.get('/api/top-movies', (req, res) => {
  const sql = `
    SELECT m.id_movie, m.title, m.image, m.genre, m.release_date, m.minimum_age, m.duration_minutes, COUNT(l.id_movie) AS total_likes
    FROM movies m LEFT JOIN likes l ON m.id_movie = l.id_movie
    GROUP BY  m.id_movie, m.title, m.image, m.genre, m.release_date, m.minimum_age, m.duration_minutes ORDER BY total_likes DESC LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error Top Movies:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ top_movies: results });
  });
});

// Top 10 series
app.get('/api/top-series', (req, res) => {
  const sql = `
    SELECT s.id_series, s.title, s.image, s.genre, s.release_date, s.minimum_age, s.seasons, COUNT(l.id_series) AS total_likes
    FROM series s LEFT JOIN likes l ON s.id_series = l.id_series
    GROUP BY s.id_series, s.title, s.image, s.genre, s.release_date, s.minimum_age, s.seasons ORDER BY total_likes DESC LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error Top Series:', err);
      return res.status(500).json({ error: err.message });
    }
       
    res.json({ top_series: results });
  });
});

// Recomendados
app.get("/api/recommended/:id_profile", (req, res) => { 
  const { id_profile } = req.params;

  const sql = `
    SELECT  l.id_like, l.id_movie, l.id_series, m.title AS movie_title, m.genre AS movie_genre, m.image AS movie_image, s.title AS series_title,s.genre AS series_genre, s.image AS series_image

    FROM likes l LEFT JOIN movies m ON l.id_movie = m.id_movie LEFT JOIN series s ON l.id_series = s.id_series WHERE l.id_profile = ?
  `;

  db.query(sql, [id_profile], (err, results) => {
    if (err) {
      console.error("Error obteniendo likes:", err);
      return res.status(500).json({ error: "Error obteniendo likes" });
    }

    const formatted = results.map(row => {
      if (row.id_movie) {
        return { id_like: row.id_like, type: "movie", id_movie: row.id_movie, title: row.movie_title, genre: row.movie_genre, image: row.movie_image};
      }
      if (row.id_series) {
        return { id_like: row.id_like, type: "series", id_series: row.id_series, title: row.series_title, genre: row.series_genre, image: row.series_image};
      }
      return null;
    }).filter(Boolean);

    res.json({ likes: formatted });
  });
});

// Obtener futuros estrenos de peliculas
app.get("/api/upcoming-movies", (req, res) => {
  const today = new Date().toISOString().split("T")[0]; 
  db.query(
    `SELECT * FROM movies WHERE release_date > ? ORDER BY release_date ASC`,
    [today],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ upcoming_movies: results });
    }
  );
});

// Obtener futuros estrenos de series
app.get("/api/upcoming-series", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  db.query(
    `SELECT * FROM series WHERE release_date > ? ORDER BY release_date ASC`,
    [today],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ upcoming_series: results });
    }
  );
});



// -------------------------------------------------------------- FAVORITOS -----------------------------------------------------------------
// Añadir favorito (película o serie)
app.post("/api/favorites", (req, res) => {
  const { id_profile, id_movie, id_series } = req.body;

  db.query(
    "SELECT * FROM favorites WHERE id_profile = ? AND id_movie <=> ? AND id_series <=> ?",
    [id_profile, id_movie || null, id_series || null],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      if (rows.length > 0) return res.send({ success: false, message: "Ya existe el favorito" });

      db.query(
        "INSERT INTO favorites (id_profile, id_movie, id_series) VALUES (?, ?, ?)",
        [id_profile, id_movie || null, id_series || null],
        (err2) => {
          if (err2) return res.status(500).send(err2);
          res.send({ success: true });
        }
      );
    }
  );
});

// Obtener favoritos de un perfil
app.get("/api/favorites/:id_profile", (req, res) => {
  const { id_profile } = req.params;

  db.query(
    `SELECT favorites.id_favorite, favorites.id_movie, favorites.id_series, movies.title AS movie_title, movies.image AS movie_image, series.title AS series_title, series.image AS series_image
     FROM favorites LEFT JOIN movies ON favorites.id_movie = movies.id_movie LEFT JOIN series ON favorites.id_series = series.id_series WHERE favorites.id_profile = ?`,
    [id_profile],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.send({ favorites: rows });
    }
  );
});

// Eliminar favorito de película
app.delete("/api/favorites/movies/:id_profile/:id_movie", (req, res) => {
  const { id_profile, id_movie } = req.params;

  db.query(
    "DELETE FROM favorites WHERE id_profile = ? AND id_movie = ?",
    [id_profile, id_movie],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

// Eliminar favorito de serie
app.delete("/api/favorites/series/:id_profile/:id_series", (req, res) => {
  const { id_profile, id_series } = req.params;

  db.query(
    "DELETE FROM favorites WHERE id_profile = ? AND id_series = ?",
    [id_profile, id_series],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

// -------------------------------------------------------------- LIKES -----------------------------------------------------------------
// Añadir like de pelicula o serie
app.post("/api/likes", (req, res) => {
  const { id_profile, id_movie, id_series } = req.body;

  db.query(
    "SELECT * FROM likes WHERE id_profile = ? AND id_movie <=> ? AND id_series <=> ?",
    [id_profile, id_movie || null, id_series || null],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      if (rows.length > 0) return res.send({ success: false, message: "Ya existe el like" });

      db.query(
        "INSERT INTO likes (id_profile, id_movie, id_series) VALUES (?, ?, ?)",
        [id_profile, id_movie || null, id_series || null],
        (err2) => {
          if (err2) return res.status(500).send(err2);
          res.send({ success: true });
        }
      );
    }
  );
});

// Obtener likes de un perfil
app.get("/api/likes/:id_profile", (req, res) => {
  const { id_profile } = req.params;
  db.query(
    `SELECT likes.id_like, likes.id_movie, likes.id_series, movies.title AS movie_title, movies.image AS movie_image, series.title AS series_title, series.image AS series_image
     FROM likes LEFT JOIN movies ON likes.id_movie = movies.id_movie LEFT JOIN series ON likes.id_series = series.id_series WHERE likes.id_profile = ?`,
    [id_profile],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.send({ likes: rows });
    }
  );
});

// Eliminar like pelicula
app.delete("/api/likes/movies/:id_profile/:id_movie", (req, res) => {
  const { id_profile, id_movie } = req.params;
  db.query(
    "DELETE FROM likes WHERE id_profile = ? AND id_movie = ?",
    [id_profile, id_movie],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

//eliminar like serie
app.delete("/api/likes/series/:id_profile/:id_series", (req, res) => {
  const { id_profile, id_series } = req.params;
  db.query(
    "DELETE FROM likes WHERE id_profile = ? AND id_series = ?",
    [id_profile, id_series],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

// -------------------------------------------------------------- AÑADIR TEMPORADA CON CAPÍTULOS SOLO ADMIN -----------------------------------------------------------------
app.post('/api/series/:id/season-with-chapters', (req, res) => {
  const { id } = req.params;
  const { season_number, chapters } = req.body;

  if (!season_number || !Array.isArray(chapters) || chapters.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Obtener temporadas actuales
  db.query(
    'SELECT seasons FROM series WHERE id_series = ?',
    [id],
    (err, serieRes) => {
      if (err) return res.status(500).json({ error: 'Error al buscar serie' });
      if (serieRes.length === 0) return res.status(404).json({ error: 'Serie no encontrada' });

      const currentSeasons = serieRes[0].seasons;

      // Insertar temporada
      db.query(
        'INSERT INTO seasons (id_series, season_number, chapters) VALUES (?, ?, ?)',
        [id, season_number, chapters.length],
        (err, seasonResult) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ error: 'La temporada ya existe' });
            }
            return res.status(500).json({ error: 'Error al crear temporada' });
          }

          const id_season = seasonResult.insertId;

          // Insertar capítulos
          let index = 0;
          const insertChapter = () => {
            if (index >= chapters.length) {
              db.query(
                'UPDATE series SET seasons = ? WHERE id_series = ?',
                [currentSeasons + 1, id],
                () => res.json({ success: true })
              );
              return;
            }

            const chap = chapters[index];

            db.query(
              `INSERT INTO chapters (id_season, chapter_number, title, duration_minutes, image) VALUES (?, ?, ?, ?, ?)`,
              [id_season, chap.chapter_number, chap.title, chap.duration_minutes || null, chap.image || null],
              (err) => {
                if (err) {
                  if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                      error: `Capítulo ${chap.chapter_number} duplicado`
                    });
                  }
                  return res.status(500).json({ error: 'Error al crear capítulo' });
                }
                index++;
                insertChapter();
              }
            );
          };
          insertChapter();
        }
      );
    }
  );
});

// Obtener temporadas de una serie
app.get('/api/seasons/:id_series', (req, res) => {
  const { id_series } = req.params;
  const sql = ` SELECT id_season, season_number FROM seasons WHERE id_series = ? ORDER BY season_number ASC`;

  db.query(sql, [id_series], (err, results) => {
    if (err) {
      console.error("Error al obtener temporadas:", err);
      return res.status(500).json({ error: "Error al obtener temporadas" });
    }
    res.json({ success: true, seasons: results });
  });
});


// Obtener capítulos de una temporada
app.get('/api/chapters/:id_season', (req, res) => {
  const { id_season } = req.params;

  const sql = `SELECT id_chapter, chapter_number, title, duration_minutes, image FROM chapters WHERE id_season = ? ORDER BY chapter_number ASC`;

  db.query(sql, [id_season], (err, results) => {
    if (err) {
      console.error("Error al obtener capítulos:", err);
      return res.status(500).json({ error: "Error al obtener capítulos" });
    }
    res.json({ success: true, chapters: results });
  });
});

// Editar temporada
app.put('/api/seasons/:id_season', (req, res) => {
  const { id_season } = req.params;
  const { season_number } = req.body;
  const sql = `UPDATE seasons SET season_number = ? WHERE id_season = ?`;

  db.query(sql, [season_number, id_season], (err, result) => {
    if (err) {
      console.error("Error al actualizar temporada:", err);
      return res.status(500).json({ error: "Error al actualizar temporada" });
    }
    res.json({ success: true });
  });
});

// Editar capítulo
app.put('/api/chapters/:id_chapter', (req, res) => {
  const { id_chapter } = req.params;
  const { chapter_number, title, duration_minutes, image } = req.body;

  const sql = `UPDATE chapters SET chapter_number = ?, title = ?, duration_minutes = ?, image = ? WHERE id_chapter = ?`;

  db.query(sql, [chapter_number, title, duration_minutes, image, id_chapter], (err, result) => {
    if (err) {
      console.error("Error al actualizar capítulo:", err);
      return res.status(500).json({ error: "Error al actualizar capítulo" });
    }
    res.json({ success: true });
  });
});

// Eliminar capitulo
app.delete('/api/chapters/:id', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, 'mi_secreto_para_dev_1234567890');
  } 
  catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
  if (decoded.role !== 'admin') {
    return res.status(403).json({ message: "Acceso denegado: solo administradores" });
  }

  const { id } = req.params;
  db.query('DELETE FROM chapters WHERE id_chapter = ?', [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar capítulo:", err);
      return res.status(500).json({ message: "Error interno al eliminar capítulo" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Capítulo no encontrado" });
    }
    res.json({ success: true, message: "Capítulo eliminado correctamente" });
  });
});

// Eliminar temporada
app.delete('/api/seasons/:id', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, 'mi_secreto_para_dev_1234567890');
  } 
  catch {
    return res.status(403).json({ message: "Token inválido" });
  }
  if (decoded.role !== 'admin') {
    return res.status(403).json({ message: "Acceso denegado: solo administradores" });
  }

  const { id } = req.params;

  // Obtener id_series
  db.query('SELECT id_series FROM seasons WHERE id_season = ?', [id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: "Temporada no encontrada" });
    }
    const idSeries = rows[0].id_series;

    // Eliminar capítulos
    db.query('DELETE FROM chapters WHERE id_season = ?', [id], (err2) => {
      if (err2) {
        console.error("Error al eliminar capítulos:", err2);
        return res.status(500).json({ message: "Error al eliminar capítulos" });
      }

      //  Eliminar temporada
      db.query('DELETE FROM seasons WHERE id_season = ?', [id], (err3) => {
        if (err3) {
          console.error("Error al eliminar temporada:", err3);
          return res.status(500).json({ message: "Error al eliminar temporada" });
        }

        // Actualizar series
        db.query(
          'UPDATE series SET seasons = (SELECT COUNT(*) FROM seasons WHERE id_series = ?) WHERE id_series = ?',
          [idSeries, idSeries],
          (err4) => {
            if (err4) {
              console.error("Error al actualizar contador:", err4);
            }
            res.json({ success: true, message: "Temporada eliminada correctamente" });
          }
        );
      });
    });
  });
});

// ------------------------------------------------------------ SERVIR FRONTEND -----------------------------------------------------------
const frontendBuildPath = path.join(__dirname, 'build');
 
app.use(express.static(frontendBuildPath));
 
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'build', 'index.html'));
});

// ------------------------------------------------------------- ARRANCAR SERVIDOR -----------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));