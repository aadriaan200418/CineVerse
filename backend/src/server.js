// ---------------------- IMPORTAR LIBRERÍAS ----------------------
const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// ---------------------- CONFIGURAR EXPRESS ----------------------
const app = express();
app.use(express.json());
app.use(cors());

// ---------------------- CONEXIÓN A MYSQL ----------------------
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

// ---------------------- RUTAS ----------------------

// REGISTRO DE USUARIO
app.post('/api/register', (req, res) => {
  const { dni, name, username, birth_date, email, password } = req.body;

  // Primero comprobamos duplicados
  const checkSql = `
    SELECT dni, username, email 
    FROM users 
    WHERE dni = ? OR username = ? OR email = ?
  `;
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
    const insertSql = `
      INSERT INTO users (dni, name, username, birth_date, email, password, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
    `;
    db.query(insertSql, [dni, name, username, birth_date, email, password], (err) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.json({ success: true, message: 'Usuario registrado correctamente' });
    });
  });
});

// LOGIN DE USUARIO (devuelve también el rol)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT username, password, role FROM users WHERE username = ?';
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

    // Devolvemos username y role
    res.json({ success: true, username: user.username, role: user.role });
  });
});

// OBTENER PERFILES DE UN USUARIO
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

// AÑADIR NUEVO PERFIL
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

      // Actualizar campo JSON profile en users
      const sqlUpdateJson = ` UPDATE users   SET profile = JSON_ARRAY_APPEND(IFNULL(profile, JSON_ARRAY()), '$', ?) WHERE dni = ?`;
      db.query(sqlUpdateJson, [nombre, dni], (err3) => {
        if (err3) {
          console.error(' Error al actualizar campo JSON profile:', err3);
          // No bloqueamos la creación, solo avisamos
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

// ELIMINAR PERFIL
app.delete('/api/deleteProfile/:id', (req, res) => {
  const profileId = req.params.id;

  const sqlGetUserProfile = ` SELECT u.dni, p.name FROM profiles p JOIN users u ON u.dni = p.id_user WHERE p.id_profile = ?`;
  db.query(sqlGetUserProfile, [profileId], (err, results) => {
    if (err) {
      console.error('Error al obtener datos del perfil:', err);
      return res.status(500).json({ error: 'Error al obtener datos del perfil' });
    }

    const { dni, name } = results[0];

    const sqlDelete = 'DELETE FROM profiles WHERE id_profile = ?';
    db.query(sqlDelete, [profileId], (err2) => {
      if (err2) {
        console.error(' Error al eliminar perfil:', err2);
        return res.status(500).json({ error: 'Error al eliminar perfil' });
      }

      const sqlUpdateJson = `UPDATE users SET profile = JSON_REMOVE(profile, JSON_UNQUOTE(JSON_SEARCH(profile, 'one', ?))) WHERE dni = ?`;
      db.query(sqlUpdateJson, [name, dni], (err3) => {
        if (err3) {
          console.error(' Error al actualizar campo JSON profile:', err3);
        }

        res.json({ success: true });
      });
    });
  });
});

// ---------------------- ELIMINAR USUARIO ----------------------
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

    // Eliminamos perfiles asociados al usuario (si aplica)
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

// ---------------------- OBTENER TODOS LOS USUARIOS (ADMIN) ----------------------
app.get('/api/users', (req, res) => {
  const role = req.headers['role']; // el frontend debe enviar el rol en headers
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const sql = 'SELECT dni, name, username, birth_date, email, role FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json({ success: true, users: results });
  });
});

// -------------------------- ELIMINAR USUARIOS DESDE ADMIN -------------------------------
app.delete("/api/deleteUserSelect/:dni", (req, res) => {
  const { dni } = req.params;

  // 1. Borrar likes asociados a los perfiles del usuario
  db.query(
    "DELETE FROM likes WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
    [dni],
    (err) => {
      if (err) {
        console.error("Error SQL (likes):", err);
        return res.status(500).json({ success: false, error: "Error al eliminar likes" });
      }

      // 2. Borrar favoritos asociados a los perfiles del usuario
      db.query(
        "DELETE FROM favorites WHERE id_profile IN (SELECT id_profile FROM profiles WHERE id_user = ?)",
        [dni],
        (err) => {
          if (err) {
            console.error("Error SQL (favorites):", err);
            return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });
          }

          // 3. Borrar perfiles del usuario
          db.query("DELETE FROM profiles WHERE id_user = ?", [dni], (err) => {
            if (err) {
              console.error("Error SQL (profiles):", err);
              return res.status(500).json({ success: false, error: "Error al eliminar perfiles" });
            }

            // 4. Finalmente borrar el usuario
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
// ---------------------- PELÍCULAS ----------------------

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

// Editar una película (solo admin)
app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, genre, image, minimum_age, duration_minutes } = req.body;
  const role = req.headers["role"];

  if (role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const sqlUpdate = `
    UPDATE movies SET 
      title = ?, description = ?, genre = ?, image = ?, minimum_age = ?, duration_minutes = ?
    WHERE id_movie = ?
  `;
  db.query(sqlUpdate, [title, description, genre, image, minimum_age, duration_minutes, id], (err) => {
    if (err) {
      console.error("Error al editar película:", err);
      return res.status(500).json({ error: "Error al editar película" });
    }
    res.json({ success: true, message: "Película actualizada correctamente" });
  });
});


// ---------------------- SERIES ----------------------

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

// Detalle de una serie + temporadas
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

// Editar una serie (solo admin)
app.put("/api/series/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, genre, image, minimum_age, seasons } = req.body;
  const role = req.headers["role"];

  if (role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const sqlUpdate = `
    UPDATE series SET 
      title = ?, description = ?, genre = ?, image = ?, minimum_age = ?, seasons = ?
    WHERE id_series = ?
  `;
  db.query(sqlUpdate, [title, description, genre, image, minimum_age, seasons, id], (err) => {
    if (err) {
      console.error("Error al editar serie:", err);
      return res.status(500).json({ error: "Error al editar serie" });
    }
    res.json({ success: true, message: "Serie actualizada correctamente" });
  });
});


// ---------------------- FAVORITOS Y LIKES ----------------------

// Añadir a favoritos
app.post("/api/favorite", (req, res) => {
  const { id_profile, id_series, id_movie } = req.body;
  const sql = "INSERT INTO favorites (id_profile, id_series, id_movie) VALUES (?, ?, ?)";
  db.query(sql, [id_profile, id_series || null, id_movie || null], (err) => {
    if (err) {
      console.error("Error al añadir a favoritos:", err);
      return res.status(500).json({ error: "Error al añadir a favoritos" });
    }
    res.json({ success: true });
  });
});

// Añadir like
app.post("/api/like", (req, res) => {
  const { id_profile, id_series, id_movie } = req.body;
  const sql = "INSERT INTO likes (id_profile, id_series, id_movie) VALUES (?, ?, ?)";
  db.query(sql, [id_profile, id_series || null, id_movie || null], (err) => {
    if (err) {
      console.error("Error al dar like:", err);
      return res.status(500).json({ error: "Error al dar like" });
    }
    res.json({ success: true });
  });
});

// ---------------------- SERVIR FRONTEND ----------------------
app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ---------------------- ARRANCAR SERVIDOR ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));

