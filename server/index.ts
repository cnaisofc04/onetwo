import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Importations critiques
import { storage } from './db';
import { VerificationService } from './verification-service';
import { setupRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001; // BACKEND sur 3001 (pas 5000!)

// Middleware
app.use(express.json());

// CORS pour appels depuis frontend sur 5000
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Startup verification
console.log('\n🔐 [STARTUP] Vérification des secrets Doppler...');
console.log(`📧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ CHARGÉ (re_...)' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER ? '✅ CHARGÉ' : '❌ MANQUANT'}\n`);

// Setup routes
setupRoutes(app);

// Démarrage serveur SANS erreur
const server = createServer(app);

// Handle port conflicts
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [ERROR] Port ${port} déjà utilisé!`);
    console.error('Tuer les processus: killall -9 node npm tsx');
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ [BACKEND] Démarré sur http://0.0.0.0:${port}`);
  console.log(`   Frontend sur: http://0.0.0.0:5000`);
  console.log(`   API calls: /api → localhost:${port}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  [SHUTDOWN] SIGTERM reçu');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});
