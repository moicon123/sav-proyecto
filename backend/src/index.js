import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import levelRoutes from './routes/levels.js';
import rechargeRoutes from './routes/recharges.js';
import withdrawalRoutes from './routes/withdrawals.js';
import adminRoutes from './routes/admin.js';
import sorteoRoutes from './routes/sorteo.js';
import telegramWebhookRoutes from './routes/telegram_webhook.js';
import { getPublicContent, getBanners } from './lib/queries.js';
import { mergePublicContent } from './data/publicContentDefaults.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de CORS ultra-robusta para producción
const allowedOrigins = [
  'https://sav-proyecto.vercel.app',
  'https://sav-proyecto-ba1m6lwn0-moicon123s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos del frontend y carpetas de medios
app.use('/imag', express.static(path.join(__dirname, '../../frontend/public/imag')));
app.use('/video', express.static(path.join(__dirname, '../../frontend/public/video')));
app.use('/videos', express.static(path.join(__dirname, '../../frontend/public/video')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/recharges', rechargeRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sorteo', sorteoRoutes);
app.use('/api/telegram-webhook', telegramWebhookRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'SAV API' });
});

app.get('/api/banners', async (req, res) => {
  const banners = await getBanners();
  res.json(banners);
});

app.get('/api/public-content', async (req, res) => {
  const config = await getPublicContent();
  res.json(mergePublicContent(config));
});

app.listen(PORT, async () => {
  console.log(`SAV API running on http://localhost:${PORT}`);
});
