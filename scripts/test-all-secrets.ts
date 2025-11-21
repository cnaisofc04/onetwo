
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import twilio from 'twilio';

config();

console.log('🔍 TEST COMPLET DE TOUS LES SECRETS\n');
console.log('='.repeat(80));

interface SecretTest {
  name: string;
  value: string | undefined;
  required: boolean;
  category: string;
  test: () => Promise<{ success: boolean; message: string }>;
}

const secrets: SecretTest[] = [
  {
    name: 'DATABASE_URL',
    value: process.env.DATABASE_URL,
    required: true,
    category: 'Base de données',
    test: async () => {
      if (!process.env.DATABASE_URL) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
        return { success: false, message: 'Format invalide (doit commencer par postgresql://)' };
      }
      return { success: true, message: 'Format valide' };
    }
  },
  {
    name: 'SESSION_SECRET',
    value: process.env.SESSION_SECRET,
    required: true,
    category: 'Sécurité',
    test: async () => {
      if (!process.env.SESSION_SECRET) {
        return { success: false, message: 'Non configuré - CRITIQUE pour sessions' };
      }
      if (process.env.SESSION_SECRET.length < 32) {
        return { success: false, message: `Trop court (${process.env.SESSION_SECRET.length} chars, minimum 32)` };
      }
      return { success: true, message: `Longueur sécurisée (${process.env.SESSION_SECRET.length} chars)` };
    }
  },
  {
    name: 'RESEND_API_KEY',
    value: process.env.RESEND_API_KEY,
    required: true,
    category: 'Email',
    test: async () => {
      if (!process.env.RESEND_API_KEY) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.RESEND_API_KEY.startsWith('re_')) {
        return { success: false, message: 'Format invalide (doit commencer par re_)' };
      }
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        return { success: true, message: 'Client initialisé avec succès' };
      } catch (error: any) {
        return { success: false, message: `Erreur: ${error.message}` };
      }
    }
  },
  {
    name: 'TWILIO_ACCOUNT_SID',
    value: process.env.TWILIO_ACCOUNT_SID,
    required: true,
    category: 'SMS',
    test: async () => {
      if (!process.env.TWILIO_ACCOUNT_SID) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        return { success: false, message: 'Format invalide (doit commencer par AC)' };
      }
      return { success: true, message: 'Format valide' };
    }
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    value: process.env.TWILIO_AUTH_TOKEN,
    required: true,
    category: 'SMS',
    test: async () => {
      if (!process.env.TWILIO_AUTH_TOKEN) {
        return { success: false, message: 'Non configuré' };
      }
      return { success: true, message: `Configuré (${process.env.TWILIO_AUTH_TOKEN.length} chars)` };
    }
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    value: process.env.TWILIO_PHONE_NUMBER,
    required: true,
    category: 'SMS',
    test: async () => {
      if (!process.env.TWILIO_PHONE_NUMBER) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.TWILIO_PHONE_NUMBER.startsWith('+')) {
        return { success: false, message: 'Format invalide (doit commencer par +)' };
      }
      return { success: true, message: `Format valide: ${process.env.TWILIO_PHONE_NUMBER}` };
    }
  },
  {
    name: 'profil_man_supabase_URL',
    value: process.env.profil_man_supabase_URL,
    required: true,
    category: 'Supabase Man',
    test: async () => {
      if (!process.env.profil_man_supabase_URL) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.profil_man_supabase_URL.includes('supabase.co')) {
        return { success: false, message: 'Format invalide (doit contenir supabase.co)' };
      }
      return { success: true, message: 'Format valide' };
    }
  },
  {
    name: 'profil_man_supabase_API_anon_public',
    value: process.env.profil_man_supabase_API_anon_public,
    required: true,
    category: 'Supabase Man',
    test: async () => {
      if (!process.env.profil_man_supabase_API_anon_public) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.profil_man_supabase_API_anon_public.startsWith('eyJ')) {
        return { success: false, message: 'Format invalide (JWT doit commencer par eyJ)' };
      }
      try {
        const client = createClient(
          process.env.profil_man_supabase_URL!,
          process.env.profil_man_supabase_API_anon_public
        );
        return { success: true, message: 'Client créé avec succès' };
      } catch (error: any) {
        return { success: false, message: `Erreur: ${error.message}` };
      }
    }
  },
  {
    name: 'profil_woman_supabase_URL',
    value: process.env.profil_woman_supabase_URL,
    required: true,
    category: 'Supabase Woman',
    test: async () => {
      if (!process.env.profil_woman_supabase_URL) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.profil_woman_supabase_URL.includes('supabase.co')) {
        return { success: false, message: 'Format invalide' };
      }
      return { success: true, message: 'Format valide' };
    }
  },
  {
    name: 'profil_woman_supabase_API_anon_public',
    value: process.env.profil_woman_supabase_API_anon_public,
    required: true,
    category: 'Supabase Woman',
    test: async () => {
      if (!process.env.profil_woman_supabase_API_anon_public) {
        return { success: false, message: 'Non configuré' };
      }
      if (!process.env.profil_woman_supabase_API_anon_public.startsWith('eyJ')) {
        return { success: false, message: 'Format invalide' };
      }
      try {
        const client = createClient(
          process.env.profil_woman_supabase_URL!,
          process.env.profil_woman_supabase_API_anon_public
        );
        return { success: true, message: 'Client créé avec succès' };
      } catch (error: any) {
        return { success: false, message: `Erreur: ${error.message}` };
      }
    }
  },
  {
    name: 'SUPABASE_USER_BRAND_Project_URL',
    value: process.env.SUPABASE_USER_BRAND_Project_URL,
    required: true,
    category: 'Supabase Brand',
    test: async () => {
      if (!process.env.SUPABASE_USER_BRAND_Project_URL) {
        return { success: false, message: 'Non configuré - Fallback vers supabaseMan actif' };
      }
      if (!process.env.SUPABASE_USER_BRAND_Project_URL.includes('supabase.co')) {
        return { success: false, message: 'Format invalide' };
      }
      return { success: true, message: 'Format valide' };
    }
  },
  {
    name: 'SUPABASE_USER_BRAND_API_anon_public',
    value: process.env.SUPABASE_USER_BRAND_API_anon_public,
    required: true,
    category: 'Supabase Brand',
    test: async () => {
      if (!process.env.SUPABASE_USER_BRAND_API_anon_public) {
        return { success: false, message: 'Non configuré - Fallback vers supabaseMan actif' };
      }
      if (!process.env.SUPABASE_USER_BRAND_API_anon_public.startsWith('eyJ')) {
        return { success: false, message: 'Format invalide' };
      }
      try {
        const client = createClient(
          process.env.SUPABASE_USER_BRAND_Project_URL!,
          process.env.SUPABASE_USER_BRAND_API_anon_public
        );
        return { success: true, message: 'Client créé avec succès' };
      } catch (error: any) {
        return { success: false, message: `Erreur: ${error.message}` };
      }
    }
  },
  {
    name: 'SUPER_MEMORY_API_KEY',
    value: process.env.SUPER_MEMORY_API_KEY,
    required: false,
    category: 'Mémoire AI',
    test: async () => {
      if (!process.env.SUPER_MEMORY_API_KEY) {
        return { success: false, message: 'Non configuré - Fonctionnalité mémoire désactivée' };
      }
      if (!process.env.SUPER_MEMORY_API_KEY.startsWith('sk_')) {
        return { success: false, message: 'Format invalide (doit commencer par sk_)' };
      }
      return { success: true, message: 'Configuré - Mémoire AI activée' };
    }
  }
];

async function runTests() {
  const results: { [key: string]: any[] } = {};

  for (const secret of secrets) {
    const category = secret.category;
    if (!results[category]) {
      results[category] = [];
    }

    console.log(`\n🔍 ${secret.name}`);
    console.log('─'.repeat(80));
    console.log(`Catégorie: ${category}`);
    console.log(`Obligatoire: ${secret.required ? 'OUI' : 'NON'}`);
    console.log(`Présent: ${secret.value ? 'OUI' : 'NON'}`);
    
    if (secret.value) {
      const masked = secret.value.substring(0, 8) + '***';
      console.log(`Valeur: ${masked}`);
    }

    const testResult = await secret.test();
    const status = testResult.success ? '✅' : '❌';
    console.log(`${status} Test: ${testResult.message}`);

    results[category].push({
      name: secret.name,
      present: !!secret.value,
      required: secret.required,
      testSuccess: testResult.success,
      message: testResult.message
    });
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ PAR CATÉGORIE\n');

  Object.entries(results).forEach(([category, items]) => {
    console.log(`\n${category}`);
    console.log('─'.repeat(80));
    
    const total = items.length;
    const configured = items.filter(i => i.present).length;
    const passing = items.filter(i => i.testSuccess).length;
    
    console.log(`Total: ${total}`);
    console.log(`Configurés: ${configured}/${total}`);
    console.log(`Tests réussis: ${passing}/${total}`);
    
    const failed = items.filter(i => !i.testSuccess);
    if (failed.length > 0) {
      console.log('\n⚠️ Problèmes:');
      failed.forEach(item => {
        console.log(`  - ${item.name}: ${item.message}`);
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  
  const allRequired = secrets.filter(s => s.required);
  const allConfigured = allRequired.filter(s => s.value);
  const allPassing = secrets.filter(async s => (await s.test()).success);

  console.log(`\n📊 ÉTAT GLOBAL:`);
  console.log(`Secrets obligatoires: ${allRequired.length}`);
  console.log(`Secrets configurés: ${allConfigured.length}/${allRequired.length}`);
  
  if (allConfigured.length === allRequired.length) {
    console.log('✅ Tous les secrets obligatoires sont configurés');
  } else {
    console.log('❌ Certains secrets obligatoires manquent');
  }
}

runTests().catch(console.error);
