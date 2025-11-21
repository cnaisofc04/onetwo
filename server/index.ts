import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Importations critiques
import { registerRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(express.json());

// CORS pour appels depuis frontend sur 5000
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Startup
(async () => {
  try {
    // Setup routes
    await registerRoutes(app);

    // Healthcheck
    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', port });
    });

    // Démarrage serveur
    const server = createServer(app);

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [ERROR] Port ${port} déjà utilisé!`);
        process.exit(1);
      } else {
        throw err;
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`\n✅ [BACKEND] Démarré sur http://0.0.0.0:${port}`);
      console.log(`📡 [PROXY] Frontend sur 5000 → API sur ${port}`);
      console.log(`🚀 OneTwo application ready!\n`);
    });

    process.on('SIGTERM', () => {
      console.log('\n⚠️  [SHUTDOWN] SIGTERM reçu');
      server.close(() => {
        console.log('✅ Serveur fermé');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ [STARTUP] Erreur critique:', err);
    process.exit(1);
  }
})();
