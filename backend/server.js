import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import leaveRoutes from './routes/Leaveroutes.js';
<<<<<<< HEAD
import attendanceRoutes from './routes/attendanceRoutes.js';
=======
>>>>>>> 93b8165bd87c5360229d96013264986a1782586d

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/leave-requests', leaveRoutes); 
<<<<<<< HEAD
app.use('/api/attendance', attendanceRoutes);
=======
>>>>>>> 93b8165bd87c5360229d96013264986a1782586d

app.get('/', (req, res) => {
  res.send('VisoVersa API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
