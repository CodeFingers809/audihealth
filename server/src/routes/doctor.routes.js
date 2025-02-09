import express from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctor.controller.js';

const router = express.Router();

// ✅ Create doctor
router.post('/', createDoctor);

// ✅ Get all doctors
router.get('/', getDoctors);

// ✅ Get doctor by ID
router.get('/:id', getDoctorById);

// ✅ Update doctor by ID
router.put('/:id', updateDoctor);

// ✅ Delete doctor by ID
router.delete('/:id', deleteDoctor);

export default router;
