
/**
 * Script de vérification des secrets requis
 * Vérifie que tous les secrets nécessaires sont configurés
 */

const requiredSecrets = [
  {
    name: 'DATABASE_URL',
    description: 'URL de connexion PostgreSQL',
    example: 'postgresql://user:password@host:5432/database'
  },
  {
    name: 'SESSION_SECRET',
    description: 'Secret pour les sessions Express',
    example: 'une-chaine-aleatoire-tres-longue'
  },
  {
    name: 'RESEND_API_KEY',
    description: 'Clé API Resend pour envoi d\'emails',
    example: 're_...'
  },
  {
    name: 'TWILIO_ACCOUNT_SID',
    description: 'Account SID Twilio',
    example: 'AC...'
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    description: 'Token d\'authentification Twilio',
    example: 'votre-token-twilio'
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    description: 'Numéro de téléphone Twilio',
    example: '+1234567890'
  },
  {
    name: 'SUPABASE_URL',
    description: 'URL du projet Supabase',
    example: 'https://xxx.supabase.co'
  },
  {
    name: 'SUPABASE_KEY',
    description: 'Clé anon/public Supabase',
    example: 'eyJ...'
  }
];

console.log('🔍 Vérification des secrets requis...\n');

let allSecretsPresent = true;
const missingSecrets: string[] = [];

requiredSecrets.forEach(secret => {
  const value = process.env[secret.name];
  const isPresent = !!value;
  const status = isPresent ? '✅' : '❌';
  
  console.log(`${status} ${secret.name}`);
  console.log(`   Description: ${secret.description}`);
  
  if (isPresent) {
    // Masquer la valeur pour la sécurité
    const maskedValue = value.substring(0, 8) + '***';
    console.log(`   Valeur: ${maskedValue}`);
  } else {
    console.log(`   Exemple: ${secret.example}`);
    missingSecrets.push(secret.name);
    allSecretsPresent = false;
  }
  console.log('');
});

console.log('━'.repeat(60));

if (allSecretsPresent) {
  console.log('✅ Tous les secrets sont configurés !');
  console.log('🚀 L\'application peut démarrer correctement.');
} else {
  console.log(`❌ ${missingSecrets.length} secret(s) manquant(s):`);
  missingSecrets.forEach(name => console.log(`   - ${name}`));
  console.log('\n⚠️  Configurez ces secrets dans l\'outil Secrets de Replit');
  process.exit(1);
}
