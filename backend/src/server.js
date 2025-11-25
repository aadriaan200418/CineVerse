// ------------------------------------------------------------- IMPORTAR LIBRERÍAS -------------------------------------------------------
const fs = require('fs');
const express = require('express');
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

// Añadir/crear un nuevo perfil
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

// Eliminar un perfil
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

// -------------------------------------------------------------- OBTENER TODAS LAS TABLAS (ADMIN) -----------------------------------------------------
//Obtener los usuarios
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
      sql = "SELECT id_movie, title, description, release_date, genre, duration_minutes FROM movies";
      break;
    case "series":
      sql = "SELECT id_series, title, description, release_date, genre, seasons FROM series";
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


// -------------------------------------------------------------------- ELIMINAR DATOS DE LAS TABLAS DESDE ADMIN ---------------------------------------------------------
//Eliminar usuarios
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

//Eliminar admins
app.delete("/api/deleteAdminSelect/:dni", (req, res) => {
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

// Eliminar película por ID (con dependencias)
app.delete("/api/deleteMovieSelect/:id", (req, res) => {
  const { id } = req.params;

  // 1. Borrar likes asociados a la película
  db.query("DELETE FROM likes WHERE id_movie = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: "Error al eliminar likes" });

    // 2. Borrar favoritos asociados a la película
    db.query("DELETE FROM favorites WHERE id_movie = ?", [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });

      // 3. Finalmente borrar la película
      db.query("DELETE FROM movies WHERE id_movie = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: "Error al eliminar película" });

        if (result.affectedRows > 0) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, error: "Película no encontrada" });
        }
      });
    });
  });
});

// Eliminar serie por ID (con dependencias)
app.delete("/api/deleteSeriesSelect/:id", (req, res) => {
  const { id } = req.params;

  // 1. Borrar likes asociados a la serie
  db.query("DELETE FROM likes WHERE id_series = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: "Error al eliminar likes" });

    // 2. Borrar favoritos asociados a la serie
    db.query("DELETE FROM favorites WHERE id_series = ?", [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: "Error al eliminar favoritos" });

      // 3. Finalmente borrar la serie
      db.query("DELETE FROM series WHERE id_series = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: "Error al eliminar serie" });

        if (result.affectedRows > 0) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, error: "Serie no encontrada" });
        }
      });
    });
  });
});

// ----------------------------------------------------------AÑADIR PELICULAS/SERIES (ADMIN) ---------------------------------------------------
app.post("/api/add-content", (req, res) => {
  const { title, description, image, releaseDate, genre, minAge, type, duration, actors, seasons, episodes } = req.body;
  let errors = {};

  // Validaciones básicas
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
      } else {
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

// Editar una película (solo admin)
app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, genre, image, minimum_age, duration_minutes } = req.body;
  const role = req.headers["role"];

  if (role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const sqlUpdate = `UPDATE movies SET title = ?, description = ?, genre = ?, image = ?, minimum_age = ?, duration_minutes = ? WHERE id_movie = ?`;
  db.query(sqlUpdate, [title, description, genre, image, minimum_age, duration_minutes, id], (err) => {
    if (err) {
      console.error("Error al editar película:", err);
      return res.status(500).json({ error: "Error al editar película" });
    }
    res.json({ success: true, message: "Película actualizada correctamente" });
  });
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

  const sqlUpdate = ` UPDATE series SET title = ?, description = ?, genre = ?, image = ?, minimum_age = ?, seasons = ? WHERE id_series = ?`;
  db.query(sqlUpdate, [title, description, genre, image, minimum_age, seasons, id], (err) => {
    if (err) {
      console.error("Error al editar serie:", err);
      return res.status(500).json({ error: "Error al editar serie" });
    }
    res.json({ success: true, message: "Serie actualizada correctamente" });
  });
});

// -------------------------------------------------------------- FAVORITES -----------------------------------------------------------------
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
app.delete("/api/favorites/:id_profile/:id_movie", (req, res) => {
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
app.delete("/api/favorites/:id_profile/series/:id_series", (req, res) => {
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
// Añadir like
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
 
// Eliminar like peli
app.delete("/api/likes/:id_profile/:id_movie", (req, res) => {
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
app.delete("/api/favorites/:id_profile/series/:id_series", (req, res) => {
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

// ------------------------------------------------------------ SERVIR FRONTEND -----------------------------------------------------------
app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ------------------------------------------------------------- ARRANCAR SERVIDOR -----------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));

