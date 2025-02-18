// Importaciones necesarias
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const taskServiceKey = require('./taskServiceKey.json');

// Inicializar Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(taskServiceKey),
        projectId: 'task-manager-c25bb', // Especificar explícitamente el project_id
    });
    console.log('Firebase Admin SDK inicializado correctamente');
} catch (error) {
    console.error('Error al inicializar Firebase Admin SDK:', error.message);
    process.exit(1); 
}

const db = admin.firestore();
const auth = admin.auth();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Generar Token JWT
const generateToken = (uid) => {
    return jwt.sign({ uid }, 'secretKey', { expiresIn: '10m' });
};

// Registro de usuario
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body; 
    
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: username
        });

        // Encriptar la contraseña antes de guardarla en Firestore
        const hashedPassword = await bcrypt.hash(password, 10);

        // Definir rol automáticamente (admin si el correo es especial, usuario normal si no)
        let rol = 2; // Usuario normal
        const adminEmails = ["admin@example.com", "otroadmin@empresa.com"]; // Define correos de admin
        if (adminEmails.includes(email)) {
            rol = 1; // Asignar rol de administrador si el correo está en la lista
        }

        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            username,
            password: hashedPassword,  
            rol, 
            last_login: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente y guardado en Firestore',
            userId: userRecord.uid
        });

    } catch (error) {
        console.error('Error en la creación del usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login de usuario
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Username recibido:', username);
    const userQuery = await db.collection('users').where('username', '==', username.trim()).get();
    console.log('Resultado de la consulta Firestore:', userQuery.empty);
    console.log('Usuarios encontrados:', userQuery.docs.map(doc => doc.data()));  
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    try {
        const userQuery = await db.collection('users').where('username', '==', username).get();
        
        console.log('Resultado de la consulta Firestore:', userQuery.empty);  // Verifica si el usuario fue encontrado

        if (userQuery.empty) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const userData = userQuery.docs[0].data();
        const userId = userQuery.docs[0].id;

        // Verificación de la contraseña con bcrypt
        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Generar el token JWT si las credenciales son correctas
        const token = generateToken(userId);

        res.json({
            message: 'Login exitoso',
            token,
            userId
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
