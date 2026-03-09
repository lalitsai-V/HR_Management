import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, employeeController.getEmployees);
router.get('/export', protect, adminOnly, employeeController.exportEmployees);
router.get('/me', protect, employeeController.getMyEmployee);
router.get('/:id', protect, employeeController.getEmployeeById);
router.post('/me', protect, employeeController.createEmployee);
router.post('/', protect, adminOnly, employeeController.createEmployee);
router.put('/me', protect, employeeController.updateEmployee);
router.put('/:id', protect, adminOnly, employeeController.updateEmployee);
router.delete('/:id', protect, adminOnly, employeeController.deleteEmployee);

export default router;
