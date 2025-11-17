// Importamos las librerías necesarias
const fs = require('fs');
const express = require('express');   // Framework para crear el servidor y rutas
const mysql = require('mysql2');      // Conexión a MySQL
// const bcrypt = require('bcryptjs');   // Para encriptar contraseñas
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
    console.error('❌ Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL en Aiven');
});

// Ruta de registro (POST /api/register)
app.post('/api/register', async (req, res) => {
  // Aquí recibimos los datos del frontend
  const { dni, name, username, birth_date, email, password } = req.body;

  try {
    // Encriptamos la contraseña antes de guardarla
   // const hashedPassword = await bcrypt.hash(password, 10);

    // Consulta SQL para insertar el usuario
    const sql = 'INSERT INTO users (dni, name, username, birth_date, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    // Ejecutamos la consulta con los valores recibidos
    db.query(sql, [dni, name, username, birth_date, email, password, 'user'], (err) => {
      if (err) {
        console.error('❌ Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.json({ success: true, message: 'Usuario registrado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Arrancar servidor en el puerto 3001 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor backend en http://localhost:${PORT}`));
