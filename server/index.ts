import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Importations critiques
import { registerRoutes } from './routes';
import {
  securityHeadersMiddleware,
  secureCorsMiddleware,
  requestValidationMiddleware,
  securityContextMiddleware,
} from './security-middleware';
import { globalErrorHandler } from './error-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware ordre critique: sécurité AVANT parsing
app.use(securityContextMiddleware());
app.use(...securityHeadersMiddleware());
app.use(requestValidationMiddleware());
app.use(express.json({ limit: '1mb' }));
app.use(secureCorsMiddleware());

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

    // Global error handler (doit être LAST middleware)
    app.use(globalErrorHandler());

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
