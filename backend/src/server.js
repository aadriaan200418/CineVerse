// ---------------------- IMPORTAR LIBRERÍAS ----------------------
const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

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
    console.error('❌ Error conectando a MySQL:', err);
  } else {
    console.log('✅ Conectado a MySQL en Aiven');
  }
});

// ---------------------- RUTAS ----------------------

// 📌 REGISTRO DE USUARIO
app.post('/api/register', (req, res) => {
  const { dni, name, username, birth_date, email, password } = req.body;

  const sql = `
    INSERT INTO users (dni, name, username, birth_date, email, password, role)
    VALUES (?, ?, ?, ?, ?, ?, 'user')
  `;
  db.query(sql, [dni, name, username, birth_date, email, password], (err) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.json({ success: true, message: 'Usuario registrado correctamente' });
  });
});

// 📌 LOGIN DE USUARIO
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT username, password FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, error: 'USER_NOT_FOUND' });
    }

    const user = results[0];

    // 👇 Verificamos que el usuario existe y mostramos en consola
    console.log("Usuario encontrado en DB:", user);

    if (user.password !== password) {
      return res.json({ success: false, error: 'Contraseña incorrecta' });
    }

    // ✅ Devolvemos el username correctamente
    res.json({ success: true, username: user.username });
  });
});


// 📌 OBTENER PERFILES DE UN USUARIO
app.get('/api/profiles', (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Falta username' });

  // Buscamos el dni del usuario
  const sqlUser = 'SELECT dni FROM users WHERE username = ?';
  db.query(sqlUser, [username], (err, userResults) => {
    if (err) {
      console.error('❌ Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const dni = userResults[0].dni;

    // Buscamos los perfiles asociados a ese dni
    const sqlProfiles = 'SELECT id_profile AS id, name FROM profiles WHERE id_user = ?';
    db.query(sqlProfiles, [dni], (err2, profileResults) => {
      if (err2) {
        console.error('❌ Error al obtener perfiles:', err2);
        return res.status(500).json({ error: 'Error al obtener perfiles' });
      }

      res.json({ success: true, perfiles: profileResults });
    });
  });
});

// 📌 AÑADIR NUEVO PERFIL
app.post('/api/addProfile', (req, res) => {
  const { username, nombre } = req.body;

  if (!username || !nombre) {
    return res.status(400).json({ error: 'Faltan datos: username y nombre son obligatorios' });
  }

  // Buscamos el dni del usuario
  const sqlUser = 'SELECT dni FROM users WHERE username = ?';
  db.query(sqlUser, [username], (err, userResults) => {
    if (err) {
      console.error('❌ Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const dni = userResults[0].dni;

    // Insertamos el nuevo perfil
    const sqlInsert = 'INSERT INTO profiles (id_user, name) VALUES (?, ?)';
    db.query(sqlInsert, [dni, nombre], (err2) => {
      if (err2) {
        console.error('❌ Error al crear perfil:', err2);
        return res.status(500).json({ error: 'Error al crear perfil' });
      }

      // Devolvemos la lista actualizada de perfiles
      const sqlProfiles = 'SELECT id_profile AS id, name FROM profiles WHERE id_user = ?';
      db.query(sqlProfiles, [dni], (err3, profileResults) => {
        if (err3) {
          console.error('❌ Error al obtener perfiles:', err3);
          return res.status(500).json({ error: 'Error al obtener perfiles' });
        }

        res.json({ success: true, perfiles: profileResults });
      });
    });
  });
});


const path = require('path');

// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, 'build')));

// Redirigir todas las rutas al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ---------------------- ARRANCAR SERVIDOR ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));


