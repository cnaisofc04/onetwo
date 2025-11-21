
import { execSync } from 'child_process';

/**
 * Script d'initialisation Doppler
 * Vérifie la configuration et la disponibilité des secrets
 */

interface DopplerStatus {
  cliInstalled: boolean;
  authenticated: boolean;
  projectConfigured: boolean;
  secretsAvailable: boolean;
}

async function checkDopplerCLI(): Promise<boolean> {
  try {
    execSync('doppler --version', { stdio: 'pipe' });
    console.log('✅ Doppler CLI installé');
    return true;
  } catch (error) {
    console.error('❌ Doppler CLI non installé');
    console.log('\n📥 Pour installer Doppler CLI:');
    console.log('curl -Ls https://cli.doppler.com/install.sh | sh');
    return false;
  }
}

async function checkDopplerAuth(): Promise<boolean> {
  try {
    execSync('doppler me', { stdio: 'pipe' });
    console.log('✅ Authentifié sur Doppler');
    return true;
  } catch (error) {
    console.error('❌ Non authentifié sur Doppler');
    console.log('\n🔐 Pour vous authentifier:');
    console.log('doppler login');
    return false;
  }
}

async function checkDopplerSetup(): Promise<boolean> {
  try {
    const output = execSync('doppler setup --no-interactive', { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    if (output.includes('project') && output.includes('config')) {
      console.log('✅ Projet Doppler configuré');
      return true;
    }
    
    console.error('❌ Projet Doppler non configuré');
    console.log('\n⚙️  Pour configurer:');
    console.log('doppler setup --project onetwo --config dev');
    return false;
  } catch (error) {
    console.error('❌ Projet Doppler non configuré');
    console.log('\n⚙️  Pour configurer:');
    console.log('doppler setup --project onetwo --config dev');
    return false;
  }
}

async function checkRequiredSecrets(): Promise<boolean> {
  const requiredSecrets = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'RESEND_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'profil_man_supabase_URL',
    'profil_man_supabase_API_anon_public',
    'profil_woman_supabase_URL',
    'profil_woman_supabase_API_anon_public',
    'SUPABASE_USER_BRAND_Project_URL',
    'SUPABASE_USER_BRAND_API_anon_public'
  ];

  try {
    const secretsOutput = execSync('doppler secrets --json', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    const secrets = JSON.parse(secretsOutput);
    const missingSecrets: string[] = [];

    console.log('\n🔍 Vérification des secrets requis:\n');
    
    requiredSecrets.forEach(secretName => {
      const exists = secrets.hasOwnProperty(secretName);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${secretName}`);
      
      if (!exists) {
        missingSecrets.push(secretName);
      }
    });

    if (missingSecrets.length > 0) {
      console.log('\n⚠️  Secrets manquants:', missingSecrets.length);
      console.log('\n📝 Pour ajouter un secret:');
      console.log('doppler secrets set NOM_SECRET="valeur"');
      return false;
    }

    console.log('\n✅ Tous les secrets requis sont configurés');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des secrets');
    return false;
  }
}

async function main() {
  console.log('🔍 VÉRIFICATION CONFIGURATION DOPPLER\n');
  console.log('='.repeat(80));

  const status: DopplerStatus = {
    cliInstalled: await checkDopplerCLI(),
    authenticated: false,
    projectConfigured: false,
    secretsAvailable: false
  };

  if (!status.cliInstalled) {
    console.log('\n❌ Configuration incomplète - Installez Doppler CLI');
    process.exit(1);
  }

  status.authenticated = await checkDopplerAuth();
  
  if (!status.authenticated) {
    console.log('\n❌ Configuration incomplète - Authentifiez-vous');
    process.exit(1);
  }

  status.projectConfigured = await checkDopplerSetup();
  
  if (!status.projectConfigured) {
    console.log('\n❌ Configuration incomplète - Configurez le projet');
    process.exit(1);
  }

  status.secretsAvailable = await checkRequiredSecrets();

  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ\n');
  console.log(`CLI Installé:        ${status.cliInstalled ? '✅' : '❌'}`);
  console.log(`Authentifié:         ${status.authenticated ? '✅' : '❌'}`);
  console.log(`Projet Configuré:    ${status.projectConfigured ? '✅' : '❌'}`);
  console.log(`Secrets Disponibles: ${status.secretsAvailable ? '✅' : '❌'}`);

  if (Object.values(status).every(v => v === true)) {
    console.log('\n🎉 Configuration Doppler complète et fonctionnelle!');
    console.log('\n💡 Pour lancer l\'application avec Doppler:');
    console.log('doppler run -- npm run dev');
    process.exit(0);
  } else {
    console.log('\n⚠️  Configuration Doppler incomplète');
    process.exit(1);
  }
}

main().catch(console.error);
