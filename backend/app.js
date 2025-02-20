// Importaciones necesarias
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const taskServiceKey = require('./taskServiceKey.json');
const { addDays, addHours, addMinutes, addWeeks } = require("date-fns");

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

// Generar Token JWT con datos del usuario
const generateToken = (user) => {
    return jwt.sign(
        {
            uid: user.uid,
            username: user.username,
            email: user.email,
            rol: user.rol,
        },
        'secretKey', // Usa una clave secreta segura (idealmente desde variables de entorno)
        { expiresIn: '10m' }
    );
};

// Login de usuario
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    try {
        const userQuery = await db.collection('users').where('username', '==', username.trim()).get();

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

        // Generar el token con la información completa del usuario
        const token = generateToken({
            uid: userId,
            username: userData.username,
            email: userData.email,
            rol: userData.rol,
        });

        // Imprimir los datos del usuario en la consola 
        console.log('✅ Usuario ha iniciado sesión:', {
            uid: userId,
            username: userData.username,
            email: userData.email,
            rol: userData.rol,
            token: token,
        });

        res.json({
            message: 'Login exitoso',
            token,
            userId,
            user: {
                uid: userId,
                username: userData.username,
                email: userData.email,
                rol: userData.rol,
                password: userData.password,
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: error.message });
    }
});


//Esta es la parte de las TASK

// Middleware para verificar el token
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
    }

    const token = authHeader.split(" ")[1]; // Extraer el token real
    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido' });
    }

    try {
        const decoded = jwt.verify(token, 'secretKey'); // Asegúrate de que 'secretKey' sea la correcta
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error de autenticación:", error);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// 📌 **Crear una nueva tarea (solo para usuarios autenticados)**
app.post("/tasks", authenticateUser, async (req, res) => {
    const { nameTask, descripcion, categoria, estatus, time, timeUnit } = req.body; // Ahora el frontend también debe enviar 'time' y 'timeUnit'

    const userId = req.user.uid; // Se obtiene del token

    if (!nameTask || !estatus) {
        return res.status(400).json({ error: "Los campos nameTask y estatus son obligatorios" });
    }

    let deadline;
    try {
        // Calcular la fecha de vencimiento en base al tiempo proporcionado
        const currentTime = new Date();

        if (time && timeUnit) {
            switch (timeUnit) {
                case 'days':
                    deadline = addDays(currentTime, parseInt(time));
                    break;
                case 'hours':
                    deadline = addHours(currentTime, parseInt(time));
                    break;
                case 'minutes':
                    deadline = addMinutes(currentTime, parseInt(time));
                    break;
                case 'weeks':
                    deadline = addWeeks(currentTime, parseInt(time));
                    break;
                default:
                    return res.status(400).json({ error: "Unidad de tiempo inválida" });
            }
        } else {
            // Si no se especifica tiempo, usar el timestamp del servidor
            deadline = admin.firestore.FieldValue.serverTimestamp();
        }

        const newTask = {
            userId,
            nameTask,
            descripcion: descripcion || "",
            categoria: categoria || "",
            estatus,
            deadLine: deadline,
        };

        const taskRef = await db.collection("task").add(newTask);

        res.status(201).json({ message: "Tarea creada exitosamente", taskId: taskRef.id });
    } catch (error) {
        console.error("Error al crear la tarea:", error);
        res.status(500).json({ error: error.message });
    }
});

// 📌 **Obtener todas las tareas del usuario autenticado**
app.get("/tasks", authenticateUser, async (req, res) => {
    const userId = req.user.uid;

    try {
        const tasksSnapshot = await db.collection("task").where("userId", "==", userId).get();
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.json(tasks);
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).json({ error: error.message });
    }
});
// 📌 **Actualizar una tarea (solo el usuario que la creó)**
app.put("/tasks/:taskId", authenticateUser, async (req, res) => {
    const { taskId } = req.params;
    const { nameTask, descripcion, categoria, estatus, deadLine } = req.body;
    const userId = req.user.uid;

    try {
        const taskRef = db.collection("task").doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        if (taskDoc.data().userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para editar esta tarea" });
        }

        await taskRef.update({
            nameTask,
            descripcion,
            categoria,
            estatus,
            deadLine: deadLine ? admin.firestore.Timestamp.fromDate(new Date(deadLine)) : null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ message: "Tarea actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
        res.status(500).json({ error: error.message });
    }
});

// 📌 **Eliminar una tarea (solo el usuario que la creó)**
app.delete("/tasks/:taskId", authenticateUser, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.uid;

    try {
        const taskRef = db.collection("task").doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        if (taskDoc.data().userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta tarea" });
        }

        await taskRef.delete();
        res.json({ message: "Tarea eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        res.status(500).json({ error: error.message });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
