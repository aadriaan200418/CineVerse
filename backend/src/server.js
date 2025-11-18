// Importamos las librerías necesarias
const fs = require('fs');
const express = require('express');   // Framework para crear el servidor y rutas
const mysql = require('mysql2');      // Conexión a MySQL
// const bcrypt = require('bcryptjs');   // Para encriptar contraseñas (opcional)
const cors = require('cors');         // Para permitir peticiones desde el frontend
require('dotenv').config();           // Para leer variables desde el archivo .env

// Creamos la aplicación Express
const app = express();
app.use(express.json()); // Permite leer datos en formato JSON
app.use(cors());         // Permite que el frontend (React) se conecte al backend

// Configuración de conexión a MySQL en Aiven
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'cineverse-cineverse.b.aivencloud.com', 
  port: process.env.DB_PORT || 20319,                               
  user: process.env.DB_USER || 'avnadmin',                             
  password: process.env.DB_PASS || 'AVNS_RPJs2yDtZTJGT-9mzWA',                  
  database: process.env.DB_NAME || 'cineVerse',                        
  ssl: {
    ca: fs.readFileSync('./certs/ca.pem') // ruta al certificado descargado
  }                           
});

// Probar conexión
db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL en Aiven');
});

// ---------------------- RUTAS ----------------------

// Ruta de registro (POST /api/register)
app.post('/api/register', async (req, res) => {
  const { dni, name, username, birth_date, email, password } = req.body;

  try {
    // Encriptar contraseña si activas bcrypt:
    // const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (dni, name, username, birth_date, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [dni, name, username, birth_date, email, password, 'user'], (err) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.json({ success: true, message: 'Usuario registrado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de login (POST /api/login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      // Usuario no existe
      return res.json({ success: false, error: 'USER_NOT_FOUND' });
    }

    const user = results[0];

    // Comparar contraseña (ejemplo simple, mejor usar bcrypt)
    if (user.password !== password) {
      return res.json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Si todo va bien
    return res.json({ success: true, message: 'Login correcto' });
  });
});

// ---------------------- SERVIDOR ----------------------

// Arrancar servidor en el puerto 3001 (o el que pongas en .env)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));
