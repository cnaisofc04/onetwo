import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// 🌐 SUPABASE MULTI-INSTANCE CLIENT FACTORY
// ============================================================

export type SupabaseInstanceType = "man" | "woman" | "brand";

interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Récupère la configuration Supabase pour une instance
 * Charge depuis les variables d'environnement (Doppler)
 */
function getSupabaseConfig(instance: SupabaseInstanceType): SupabaseConfig {
  const instanceUpper = instance.toUpperCase();
  
  const url = process.env[`SUPABASE_${instanceUpper}_URL`];
  const key = process.env[`SUPABASE_${instanceUpper}_KEY`];

  if (!url) {
    throw new Error(
      `Missing SUPABASE_${instanceUpper}_URL in environment variables (Doppler)`
    );
  }

  if (!key) {
    throw new Error(
      `Missing SUPABASE_${instanceUpper}_KEY in environment variables (Doppler)`
    );
  }

  return { url, key };
}

// Cache des clients Supabase
const supabaseClients = new Map<SupabaseInstanceType, SupabaseClient>();

/**
 * Crée un client Supabase pour une instance donnée
 */
function createSupabaseClient(instance: SupabaseInstanceType): SupabaseClient {
  const config = getSupabaseConfig(instance);

  return createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Récupère un client Supabase (avec cache)
 */
export function getSupabaseClient(instance: SupabaseInstanceType): SupabaseClient {
  if (!supabaseClients.has(instance)) {
    supabaseClients.set(instance, createSupabaseClient(instance));
  }

  return supabaseClients.get(instance)!;
}

/**
 * Détermine l'instance Supabase basée sur le genre
 */
export function getInstanceFromGender(gender: string): SupabaseInstanceType {
  // Genre Mr* → "man"
  if (gender.startsWith("Mr")) {
    return "man";
  }
  
  // Genre Mrs* → "woman"
  if (gender.startsWith("Mrs")) {
    return "woman";
  }
  
  // Genre MARQUE → "brand"
  if (gender === "MARQUE") {
    return "brand";
  }

  throw new Error(`Genre invalide pour routing Supabase: ${gender}`);
}

/**
 * Teste la connexion à une instance Supabase
 */
export async function testSupabaseConnection(
  instance: SupabaseInstanceType
): Promise<boolean> {
  try {
    const client = getSupabaseClient(instance);
    const { error } = await client.from("users").select("count", { count: "exact" }).limit(0);
    
    if (error) {
      console.error(
        `❌ [SUPABASE] Erreur connexion ${instance}:`,
        error.message
      );
      return false;
    }

    console.log(`✅ [SUPABASE] Connexion ${instance} réussie`);
    return true;
  } catch (error) {
    console.error(`❌ [SUPABASE] Erreur test ${instance}:`, error);
    return false;
  }
}

/**
 * Teste toutes les connexions Supabase
 */
export async function testAllSupabaseConnections(): Promise<Record<SupabaseInstanceType, boolean>> {
  console.log("\n🔐 [SUPABASE] Test de connexion aux 3 instances...\n");

  const instances: SupabaseInstanceType[] = ["man", "woman", "brand"];
  const results: Record<SupabaseInstanceType, boolean> = {
    man: false,
    woman: false,
    brand: false,
  };

  for (const instance of instances) {
    results[instance] = await testSupabaseConnection(instance);
  }

  console.log("\n📊 [SUPABASE] Résumé connexions:");
  Object.entries(results).forEach(([instance, connected]) => {
    console.log(`   ${connected ? "✅" : "❌"} ${instance}: ${connected ? "CONNECTÉ" : "ERREUR"}`);
  });

  return results;
}
