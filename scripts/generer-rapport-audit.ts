
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const filename = `audit_rapport_${timestamp}_COMPLET_AVEC_TESTS.md`;

console.log(`📝 Génération du rapport d'audit: ${filename}\n`);

// Exécuter l'audit complet
const auditOutput = execSync('npx tsx scripts/audit-complet-avec-tests.ts', {
  encoding: 'utf-8',
  stdio: 'pipe'
});

// Créer le contenu du rapport MD
const rapport = `# Rapport d'Audit Complet - OneTwo Dating App
**Date**: ${new Date().toLocaleDateString('fr-FR')}  
**Timestamp**: ${new Date().toISOString()}  
**Statut**: Audit Complet avec Tests Unitaires

---

## 📋 TABLE DES MATIÈRES

1. [Informations Générales](#informations-générales)
2. [Configuration Doppler](#configuration-doppler)
3. [Structure du Projet](#structure-du-projet)
4. [Tests Unitaires](#tests-unitaires)
5. [Dépendances](#dépendances)
6. [Analyse du Code](#analyse-du-code)
7. [Validation des Secrets](#validation-des-secrets)
8. [Scripts Disponibles](#scripts-disponibles)
9. [Documentation](#documentation)
10. [Recommandations](#recommandations)
11. [Résumé](#résumé)

---

## 🔍 RÉSULTAT COMPLET DE L'AUDIT

\`\`\`
${auditOutput}
\`\`\`

---

## 🎯 ACTIONS PRIORITAIRES

### Immédiat (P0)
- [ ] Vérifier tous les secrets Doppler configurés
- [ ] S'assurer que tous les tests unitaires passent
- [ ] Valider la connexion aux bases de données

### Court terme (P1)
- [ ] Compléter la documentation manquante
- [ ] Ajouter des tests d'intégration
- [ ] Optimiser les performances

### Moyen terme (P2)
- [ ] Mettre en place le monitoring
- [ ] Configurer les alertes
- [ ] Planifier les déploiements

---

## 📊 MÉTRIQUES CLÉS

| Métrique | Valeur | Statut |
|----------|--------|--------|
| Tests unitaires | À compléter | ⚠️ |
| Coverage code | À calculer | ⏳ |
| Secrets configurés | À vérifier | 🔍 |
| Documentation | En cours | 📝 |

---

## 🔗 RESSOURCES

- [Documentation Doppler](https://docs.doppler.com)
- [Replit Documentation](https://docs.replit.com)
- [Supabase Documentation](https://supabase.com/docs)

---

**Rapport généré automatiquement par le système d'audit OneTwo**
`;

// Écrire le fichier
writeFileSync(filename, rapport, 'utf-8');

console.log(`✅ Rapport généré avec succès: ${filename}`);
console.log(`📄 Fichier créé: ${filename}`);
console.log(`📊 Taille: ${rapport.length} caractères`);
