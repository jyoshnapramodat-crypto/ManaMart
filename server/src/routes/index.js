import { Router } from 'express';
import authRoutes from './authRoutes.js';
import discoveryRoutes from './discoveryRoutes.js';
import orderRoutes from './orderRoutes.js';
import followRoutes from './followRoutes.js';
import recurringRoutes from './recurringRoutes.js';
import merchantRoutes from './merchantRoutes.js';
import riderRoutes from './riderRoutes.js';
import adminRoutes from './adminRoutes.js';
import customerRoutes from './customerRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/discovery', discoveryRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/follows', followRoutes);
apiRouter.use('/recurring-lists', recurringRoutes);
apiRouter.use('/merchants', merchantRoutes);
apiRouter.use('/riders', riderRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/customers', customerRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ManaMart API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

export default apiRouter;

