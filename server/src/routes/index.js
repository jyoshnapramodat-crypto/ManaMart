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
import { getDatabaseHealth } from '../config/db.js';

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

// Comprehensive Platform Health & DB Status Endpoint
apiRouter.get('/health', (req, res) => {
  const dbHealth = getDatabaseHealth();
  const isHealthy = dbHealth.connected || (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production');

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    app: 'ManaMart Hyperlocal Commerce API',
    tagline: 'Mana Ooru. Mana Market.',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
    database: {
      connected: dbHealth.connected,
      mockMode: dbHealth.mockMode,
      name: dbHealth.databaseName,
    },
  });
});

export default apiRouter;
