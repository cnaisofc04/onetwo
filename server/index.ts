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
const port = 5000;

// Middleware
app.use(express.json());

// Startup verification
console.log('\n🔐 [STARTUP] Vérification des secrets Doppler...');
console.log(`📧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ CHARGÉ (re_...)' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
console.log(`📱 TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER ? '✅ CHARGÉ' : '❌ MANQUANT'}\n`);

// Setup routes
setupRoutes(app);

// Servir le frontend
const clientPath = path.join(__dirname, '../dist');
app.use(express.static(clientPath));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

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
  console.log(`✅ Serveur démarré sur http://0.0.0.0:${port}`);
  console.log('🚀 OneTwo application ready!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  [SHUTDOWN] SIGTERM reçu');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});
