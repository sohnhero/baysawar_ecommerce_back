import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import authRoutes from './modules/auth/routes';
import productRoutes from './modules/products/routes';
import categoryRoutes from './modules/categories/routes';
import orderRoutes from './modules/orders/routes';
import artisanRoutes from './modules/artisans/routes';
import flashSaleRoutes from './modules/flash-sales/routes';
import reviewRoutes from './modules/reviews/routes';
import wishlistRoutes from './modules/wishlist/routes';
import userRoutes from './modules/users/routes';
import adminRoutes from './modules/admin/routes';
import uploadRoutes from './modules/upload/routes';
import cartRoutes from './modules/cart/routes';
import newsletterRoutes from './modules/newsletter/routes';
import paymentRoutes from './modules/payment/routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://shop.fabiratrading.com',
    'http://localhost:3000',
    'http://localhost:5000',
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payment', paymentRoutes);


app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Baysawarr Backend is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Baysawarr Backend listening at http://localhost:${port}`);
});
