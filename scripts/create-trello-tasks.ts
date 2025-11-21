import axios from 'axios';

const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN!;
const BASE_URL = 'https://api.trello.com/1';

interface TrelloCard {
  name: string;
  desc?: string;
  pos?: string;
}

async function createTrelloBoard() {
  try {
    console.log('🎯 Création du board Trello "OneTwo - Dating App"...\n');

    // Créer le board
    const boardResponse = await axios.post(`${BASE_URL}/boards`, null, {
      params: {
        key: TRELLO_API_KEY,
        token: TRELLO_TOKEN,
        name: 'OneTwo - Dating App Development',
        desc: 'Plan de développement complet pour OneTwo, application de rencontre minimaliste noir et blanc avec design Yin Yang',
        defaultLists: false,
      },
    });

    const boardId = boardResponse.data.id;
    console.log(`✅ Board créé: ${boardResponse.data.url}\n`);

    // Créer les listes
    const lists = [
      { name: '📋 Backlog', pos: 'top' },
      { name: '🚀 Phase 1: MVP Authentication (15%)', pos: 'bottom' },
      { name: '❤️ Phase 2: Dating Features (0%)', pos: 'bottom' },
      { name: '⚡ Phase 3: Production & Optimization (0%)', pos: 'bottom' },
      { name: '✅ Complété', pos: 'bottom' },
    ];

    const createdLists: any = {};
    for (const list of lists) {
      const listResponse = await axios.post(`${BASE_URL}/lists`, null, {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          name: list.name,
          idBoard: boardId,
          pos: list.pos,
        },
      });
      createdLists[list.name] = listResponse.data.id;
      console.log(`✅ Liste créée: ${list.name}`);
    }

    console.log('\n📝 Création des cartes...\n');

    // Phase 1 Cards
    const phase1Cards: TrelloCard[] = [
      {
        name: '1.1 Configuration des couleurs noir/blanc (index.css)',
        desc: `**Objectif**: Configurer le thème strict noir et blanc dans index.css

**Tâches**:
- Remplacer tous les placeholders "red" par les bonnes couleurs
- Configurer --background, --foreground
- Configurer --primary, --secondary, --accent
- Respecter format HSL sans wrapper hsl()

**Critères de validation**:
- Strict noir #000000 et blanc #FFFFFF
- Aucune autre couleur sauf gris #808080 pour bordures`,
      },
      {
        name: '1.2 Schéma utilisateur complet avec pseudonyme',
        desc: `**Objectif**: Mettre à jour shared/schema.ts avec tous les champs utilisateur

**Tâches**:
- Ajouter champ "pseudonyme" (au lieu de firstName)
- Ajouter dateOfBirth, email, phone
- Créer insertUserSchema avec validation Zod
- PAS de champ bio (décision design)

**Critères de validation**:
- Schema Drizzle correct
- Types TypeScript générés
- Validation Zod fonctionnelle`,
      },
      {
        name: '1.3 Interface Storage (IStorage) avec CRUD',
        desc: `**Objectif**: Créer l'interface de stockage dans server/storage.ts

**Tâches**:
- Définir interface IStorage
- Méthodes: createUser, getUserByEmail, getUserById
- Implémenter avec PostgreSQL
- Typage strict avec types du schema

**Critères de validation**:
- Toutes les méthodes CRUD fonctionnelles
- Gestion d'erreurs appropriée`,
      },
      {
        name: '1.4 Routes API Authentication',
        desc: `**Objectif**: Créer les routes d'authentification dans server/routes.ts

**Tâches**:
- POST /api/auth/signup - Inscription
- POST /api/auth/login - Connexion
- POST /api/auth/logout - Déconnexion
- Validation Zod des données
- Hashing des mots de passe

**Critères de validation**:
- Routes testables via curl
- Validation des données
- Erreurs appropriées`,
      },
      {
        name: '1.5 Page Home (/) - Landing avec Yin Yang',
        desc: `**Objectif**: Créer la page d'accueil minimaliste

**Design**:
- Logo Yin Yang centré (120px)
- Wordmark "OneTwo" (48px)
- Bouton "Créer un compte" (noir)
- Bouton "J'ai déjà un compte" (blanc/outline)

**Critères de validation**:
- Design 100% noir et blanc
- Centré verticalement et horizontalement
- Responsive
- data-testid sur tous les éléments interactifs`,
      },
      {
        name: '1.6 Page Signup (/signup) - 4 étapes',
        desc: `**Objectif**: Page d'inscription avec 4 étapes séquentielles

**Étapes**:
1. Date de naissance
2. Email
3. Mot de passe + Confirmation
4. Numéro de téléphone

**Features**:
- Validation en temps réel
- Navigation step-by-step
- Feedback d'erreurs
- Bouton "Créer" final

**Critères de validation**:
- 4 étapes fonctionnelles
- Validation Zod
- Design noir/blanc strict
- data-testid complets`,
      },
      {
        name: '1.7 Page Login (/login) - Connexion',
        desc: `**Objectif**: Page de connexion simple

**Champs**:
- Email
- Mot de passe
- Bouton "Se connecter"
- Bouton "Retour"

**Critères de validation**:
- Authentification fonctionnelle
- Gestion d'erreurs
- Redirection après login
- Design noir/blanc`,
      },
      {
        name: '1.8 Tests manuels MVP Authentication',
        desc: `**Objectif**: Tester manuellement le flux complet d'authentification

**Tests**:
- Inscription avec toutes les validations
- Connexion avec compte créé
- Gestion des erreurs (email existant, mot de passe incorrect)
- Design responsive
- Conformité noir/blanc strict

**Critères de validation**:
- Tous les flux fonctionnent
- Aucun bug bloquant
- Design conforme aux guidelines
- **VALIDATION AVANT PHASE 2**`,
      },
    ];

    for (const card of phase1Cards) {
      await axios.post(`${BASE_URL}/cards`, null, {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          idList: createdLists['🚀 Phase 1: MVP Authentication (15%)'],
          name: card.name,
          desc: card.desc,
        },
      });
      console.log(`  ✅ ${card.name}`);
    }

    // Phase 2 Cards
    const phase2Cards: TrelloCard[] = [
      {
        name: '2.1 Schéma de profil utilisateur étendu',
        desc: `**Champs**:
- Pseudonyme (déjà existant)
- Photos (max 6, URLs)
- Préférences (âge min/max, distance, genre)
- Localisation (latitude, longitude)
- PAS de bio`,
      },
      {
        name: '2.2 Page de création/édition de profil',
        desc: `Upload de photos, configuration des préférences, géolocalisation`,
      },
      {
        name: '2.3 Interface de swipe (cartes utilisateur)',
        desc: `Cartes swipables, animations gauche/droite, algorithme de recommandation`,
      },
      {
        name: '2.4 Backend matching (logique bidirectionnelle)',
        desc: `Stockage likes/dislikes, détection de match, notifications`,
      },
      {
        name: '2.5 Interface de chat (liste conversations)',
        desc: `Liste des matches, aperçu dernier message, timestamps`,
      },
      {
        name: '2.6 Vue conversation 1-to-1',
        desc: `Messages en temps réel, WebSocket, indicateurs de lecture`,
      },
      {
        name: '2.7 Backend messaging (WebSocket + storage)',
        desc: `API WebSocket, stockage messages, notifications push`,
      },
      {
        name: '2.8 Intégration Mapbox (géolocalisation)',
        desc: `Carte utilisateurs proches, calcul distance, filtrage par rayon`,
      },
      {
        name: '2.9 Système d\'abonnement Stripe',
        desc: `Super Likes, Boost profil, Voir qui vous a liké, paiements`,
      },
      {
        name: '2.10 Vidéo chat (Agora)',
        desc: `Intégration Agora pour appels vidéo entre matches`,
      },
      {
        name: '2.11 Système de vérification de profil',
        desc: `Vérification identité, badge vérifié`,
      },
      {
        name: '2.12 Système de signalement et modération',
        desc: `Signaler utilisateur, bloquer, raisons de signalement`,
      },
    ];

    for (const card of phase2Cards) {
      await axios.post(`${BASE_URL}/cards`, null, {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          idList: createdLists['❤️ Phase 2: Dating Features (0%)'],
          name: card.name,
          desc: card.desc,
        },
      });
      console.log(`  ✅ ${card.name}`);
    }

    // Phase 3 Cards
    const phase3Cards: TrelloCard[] = [
      {
        name: '3.1 Optimisation requêtes database',
        desc: `Indexes, query optimization, N+1 problem resolution`,
      },
      {
        name: '3.2 Caching Redis',
        desc: `Cache pour profils, conversations, recommendations`,
      },
      {
        name: '3.3 CDN pour images',
        desc: `Optimisation images profil, compression, lazy loading`,
      },
      {
        name: '3.4 Migration Supabase',
        desc: `Migration database PostgreSQL vers Supabase (profils homme/femme séparés)`,
      },
      {
        name: '3.5 Configuration MCP servers',
        desc: `Setup MCP servers pour Supabase Man et Woman`,
      },
      {
        name: '3.6 Intégration LogRocket',
        desc: `Session replay, error tracking, user monitoring`,
      },
      {
        name: '3.7 Intégration Amplitude',
        desc: `Analytics, user behavior, conversion funnels`,
      },
      {
        name: '3.8 Notifications email (Resend)',
        desc: `Emails de bienvenue, notifications de match, newsletters`,
      },
      {
        name: '3.9 Notifications SMS (Twilio)',
        desc: `SMS verification, match alerts`,
      },
      {
        name: '3.10 Monitoring et alertes production',
        desc: `Health checks, error alerting, uptime monitoring`,
      },
    ];

    for (const card of phase3Cards) {
      await axios.post(`${BASE_URL}/cards`, null, {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          idList: createdLists['⚡ Phase 3: Production & Optimization (0%)'],
          name: card.name,
          desc: card.desc,
        },
      });
      console.log(`  ✅ ${card.name}`);
    }

    // Tâches complétées
    const completedCards: TrelloCard[] = [
      { name: '✅ PostgreSQL database setup' },
      { name: '✅ Intégrations OAuth (GitHub, Twilio, Resend, Notion)' },
      { name: '✅ Design guidelines document' },
      { name: '✅ Configuration de tous les secrets API' },
      { name: '✅ Rapport d\'audit #001' },
    ];

    for (const card of completedCards) {
      await axios.post(`${BASE_URL}/cards`, null, {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          idList: createdLists['✅ Complété'],
          name: card.name,
        },
      });
      console.log(`  ✅ ${card.name}`);
    }

    console.log(`\n🎉 Board Trello créé avec succès!`);
    console.log(`🔗 URL: ${boardResponse.data.url}\n`);
    console.log(`📊 Statistiques:`);
    console.log(`   - Phase 1: ${phase1Cards.length} tâches`);
    console.log(`   - Phase 2: ${phase2Cards.length} tâches`);
    console.log(`   - Phase 3: ${phase3Cards.length} tâches`);
    console.log(`   - Complété: ${completedCards.length} tâches`);
    console.log(`   - TOTAL: ${phase1Cards.length + phase2Cards.length + phase3Cards.length + completedCards.length} tâches\n`);

    return boardResponse.data.url;
  } catch (error: any) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    throw error;
  }
}

createTrelloBoard();
