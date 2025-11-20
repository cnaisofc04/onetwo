
import { execSync } from 'child_process';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 AUDIT COMPLET DU PROJET ONETWO\n');
console.log('='.repeat(80));
console.log(`Date: ${new Date().toISOString()}`);
console.log('='.repeat(80));

// Fonction pour exécuter des commandes et capturer la sortie
function runCommand(command: string): { output: string; exitCode: number } {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { output, exitCode: 0 };
  } catch (error: any) {
    return { output: error.stdout || error.stderr || error.message, exitCode: error.status || 1 };
  }
}

// Section 1: Informations générales
console.log('\n📊 SECTION 1 - INFORMATIONS GÉNÉRALES\n');
console.log('─'.repeat(80));

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
console.log(`Nom du projet: ${packageJson.name}`);
console.log(`Version: ${packageJson.version}`);
console.log(`Node version: ${process.version}`);

// Section 2: Configuration Doppler
console.log('\n\n🔐 SECTION 2 - CONFIGURATION DOPPLER\n');
console.log('─'.repeat(80));

const dopplerConfig = runCommand('doppler configure get');
console.log(dopplerConfig.output);

const dopplerSecrets = runCommand('doppler secrets --json');
if (dopplerSecrets.exitCode === 0) {
  try {
    const secrets = JSON.parse(dopplerSecrets.output);
    const secretKeys = Object.keys(secrets);
    console.log(`\n✅ Nombre total de secrets: ${secretKeys.length}`);
    console.log('\nCatégories de secrets:');
    
    const categories: Record<string, string[]> = {
      'Database': secretKeys.filter(k => k.includes('DATABASE')),
      'Supabase': secretKeys.filter(k => k.includes('SUPABASE')),
      'Email (Resend)': secretKeys.filter(k => k.includes('RESEND')),
      'SMS (Twilio)': secretKeys.filter(k => k.includes('TWILIO')),
      'Redis': secretKeys.filter(k => k.includes('REDIS')),
      'Analytics': secretKeys.filter(k => k.includes('AMPLITUDE') || k.includes('LOG_ROCKET')),
      'Autres': secretKeys.filter(k => 
        !k.includes('DATABASE') && 
        !k.includes('SUPABASE') && 
        !k.includes('RESEND') && 
        !k.includes('TWILIO') &&
        !k.includes('REDIS') &&
        !k.includes('AMPLITUDE') &&
        !k.includes('LOG_ROCKET')
      )
    };

    Object.entries(categories).forEach(([cat, keys]) => {
      if (keys.length > 0) {
        console.log(`\n  ${cat}: ${keys.length} secret(s)`);
        keys.forEach(k => console.log(`    - ${k}`));
      }
    });
  } catch (e) {
    console.log('❌ Erreur lors du parsing des secrets');
  }
}

// Section 3: Structure du projet
console.log('\n\n📁 SECTION 3 - STRUCTURE DU PROJET\n');
console.log('─'.repeat(80));

function countFiles(dir: string, ext?: string): number {
  let count = 0;
  try {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      const stats = statSync(filePath);
      if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        count += countFiles(filePath, ext);
      } else if (stats.isFile()) {
        if (!ext || file.endsWith(ext)) {
          count++;
        }
      }
    });
  } catch (e) {
    // Ignorer les erreurs de permission
  }
  return count;
}

console.log(`Fichiers TypeScript (.ts): ${countFiles('.', '.ts')}`);
console.log(`Fichiers TypeScript React (.tsx): ${countFiles('.', '.tsx')}`);
console.log(`Fichiers Markdown (.md): ${countFiles('.', '.md')}`);
console.log(`Fichiers JSON: ${countFiles('.', '.json')}`);

// Section 4: Tests unitaires
console.log('\n\n🧪 SECTION 4 - TESTS UNITAIRES\n');
console.log('─'.repeat(80));

const testResult = runCommand('npm test -- --run --reporter=json --reporter=default');
console.log('\nRésultat des tests:');
console.log(testResult.output);

// Section 5: Analyse des dépendances
console.log('\n\n📦 SECTION 5 - DÉPENDANCES\n');
console.log('─'.repeat(80));

console.log(`\nDépendances de production: ${Object.keys(packageJson.dependencies || {}).length}`);
console.log(`Dépendances de développement: ${Object.keys(packageJson.devDependencies || {}).length}`);

const criticalDeps = [
  'express', 
  '@supabase/supabase-js', 
  'drizzle-orm', 
  'resend', 
  'twilio',
  'react',
  'wouter'
];

console.log('\nDépendances critiques installées:');
criticalDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`  ❌ ${dep}: NON INSTALLÉE`);
  }
});

// Section 6: Analyse du code
console.log('\n\n💻 SECTION 6 - ANALYSE DU CODE\n');
console.log('─'.repeat(80));

const serverFiles = readdirSync('server').filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const clientPages = existsSync('client/src/pages') ? readdirSync('client/src/pages').filter(f => f.endsWith('.tsx')) : [];
const components = existsSync('client/src/components/ui') ? readdirSync('client/src/components/ui').filter(f => f.endsWith('.tsx')) : [];

console.log(`\nFichiers serveur: ${serverFiles.length}`);
serverFiles.forEach(f => console.log(`  - server/${f}`));

console.log(`\nPages client: ${clientPages.length}`);
clientPages.forEach(f => console.log(`  - client/src/pages/${f}`));

console.log(`\nComposants UI: ${components.length}`);

// Section 7: Validation des secrets requis
console.log('\n\n🔑 SECTION 7 - VALIDATION DES SECRETS REQUIS\n');
console.log('─'.repeat(80));

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
  'profil_woman_supabase_API_anon_public'
];

if (dopplerSecrets.exitCode === 0) {
  try {
    const secrets = JSON.parse(dopplerSecrets.output);
    console.log('\nSecrets critiques:');
    requiredSecrets.forEach(secret => {
      const exists = secrets.hasOwnProperty(secret);
      console.log(`  ${exists ? '✅' : '❌'} ${secret}`);
    });
  } catch (e) {
    console.log('❌ Impossible de valider les secrets');
  }
}

// Section 8: Scripts disponibles
console.log('\n\n⚙️ SECTION 8 - SCRIPTS DISPONIBLES\n');
console.log('─'.repeat(80));

console.log('\nScripts npm:');
Object.entries(packageJson.scripts || {}).forEach(([name, script]) => {
  console.log(`  - ${name}: ${script}`);
});

// Section 9: Documentation
console.log('\n\n📚 SECTION 9 - DOCUMENTATION\n');
console.log('─'.repeat(80));

const mdFiles = readdirSync('.').filter(f => f.endsWith('.md'));
console.log(`\nFichiers de documentation: ${mdFiles.length}`);
mdFiles.forEach(f => console.log(`  - ${f}`));

// Section 10: Recommandations
console.log('\n\n💡 SECTION 10 - RECOMMANDATIONS\n');
console.log('─'.repeat(80));

const recommendations: string[] = [];

// Vérifier les secrets
if (dopplerSecrets.exitCode === 0) {
  try {
    const secrets = JSON.parse(dopplerSecrets.output);
    const missing = requiredSecrets.filter(s => !secrets.hasOwnProperty(s));
    if (missing.length > 0) {
      recommendations.push(`⚠️  Secrets manquants: ${missing.join(', ')}`);
    }
  } catch (e) {
    recommendations.push('⚠️  Vérifier la configuration Doppler');
  }
}

// Vérifier les tests
if (testResult.exitCode !== 0) {
  recommendations.push('⚠️  Certains tests échouent - Vérifier la sortie des tests');
}

if (recommendations.length === 0) {
  console.log('\n✅ Aucune recommandation - Le projet est en bon état !');
} else {
  console.log('\nRecommandations:');
  recommendations.forEach(r => console.log(`  ${r}`));
}

// Section 11: Résumé
console.log('\n\n📊 SECTION 11 - RÉSUMÉ\n');
console.log('─'.repeat(80));

console.log(`
État du projet:
  - Configuration Doppler: ${dopplerSecrets.exitCode === 0 ? '✅' : '❌'}
  - Tests unitaires: ${testResult.exitCode === 0 ? '✅' : '⚠️'}
  - Dépendances: ✅
  - Documentation: ${mdFiles.length > 5 ? '✅' : '⚠️'}
`);

console.log('\n' + '='.repeat(80));
console.log('✅ AUDIT TERMINÉ');
console.log('='.repeat(80));
