import express from 'express';
import * as adminController from './admin.controller.js';
import { verifyAdmin } from './admin.middleware.js';

const router = express.Router();

router.post('/login', adminController.loginAdmin);
router.get('/dashboard', verifyAdmin, adminController.dashboard);
router.post('/product', verifyAdmin, adminController.addProduct);
router.put('/product/:id', verifyAdmin, adminController.updateProduct);
router.delete('/product/:id', verifyAdmin, adminController.deleteProduct);
router.get('/orders', verifyAdmin, adminController.getOrders);

export default router;