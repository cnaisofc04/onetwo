// Endpoint de debug pour tester les secrets
import { Request, Response } from 'express';

export async function setupDebugRoutes(app: any) {
  app.get('/api/debug/secrets', (req: Request, res: Response) => {
    console.log('🔍 [DEBUG] Vérification des secrets...');
    
    const secrets = {
      DATABASE_URL: !!process.env.DATABASE_URL ? 'CHARGÉ' : '❌ MANQUANT',
      RESEND_API_KEY: !!process.env.RESEND_API_KEY ? '✅ CHARGÉ' : '❌ MANQUANT',
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID ? '✅ CHARGÉ' : '❌ MANQUANT',
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN ? '✅ CHARGÉ' : '❌ MANQUANT',
      TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER ? '✅ CHARGÉ' : '❌ MANQUANT',
      SESSION_SECRET: !!process.env.SESSION_SECRET ? '✅ CHARGÉ' : '❌ MANQUANT',
    };
    
    console.log('📋 [DEBUG] État des secrets:', secrets);
    res.json(secrets);
  });

  app.get('/api/debug/health', (req: Request, res: Response) => {
    res.json({ status: '✅ OK', timestamp: new Date().toISOString() });
  });
}
