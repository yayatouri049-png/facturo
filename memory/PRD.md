# PRD — FacturaFlow (Générateur de factures)

## Problem Statement
Application web SPA complète de génération de factures avec prévisualisation A4 en temps réel, sauvegarde LocalStorage et export PDF/impression. 2 colonnes desktop (formulaire / aperçu), empilée sur mobile.

## Architecture
- **100% frontend** — React (CRA + craco), aucun backend, aucune auth, aucune DB.
- Persistance navigateur via **LocalStorage** (clés préfixées `facturaflow_`).
- Export PDF via **html2pdf.js** + impression native via `@media print`.
- Fichiers clés: `src/InvoiceApp.jsx` (état + persistance + actions), `src/components/InvoiceForm.jsx`, `src/components/InvoicePreview.jsx` (document A4 `#a4-invoice-preview`), `src/lib/invoiceUtils.js` (calculs, devises, storage), `src/lib/translations.js` (FR/EN/AR).

## User Persona
Freelances / TPE-PME (Algérie / international) émettant des factures rapidement, sans compte.

## Core Requirements (static)
- Formulaire dynamique: Émetteur (logo Base64, coordonnées, SIRET), Client, Détails (numéro, dates, devise), Articles (table dynamique), Taxes & Remises, Règlement (IBAN/RIB, mentions légales).
- Aperçu A4 comptable en temps réel tenant sur une page jusqu'à 10 lignes.
- Multi-devises DZD/EUR/USD, trilingue FR/EN/AR avec RTL arabe.
- Export PDF + impression, Nouvelle facture (incrémente le n°, garde le profil), Réinitialiser le profil.

## Implemented (2026-06)
- ✅ Modèles de facture (2025-07) : sélecteur de thème dans la barre d'outils (persistant, localStorage `facturaflow_template`) avec 4 modèles — Violet Royal (classique), Bleu Océan, Émeraude (minimal, filet sous en-tête), Noir & Or (bandeau d'en-tête sombre + Total TTC doré). Chaque thème pilote couleurs, style d'en-tête (barre/bandeau/minimal), fond des encarts, en-tête de tableau et bloc Total TTC. Appliqué à l'aperçu = PDF + impression. Noms traduits FR/AR/EN. Fichiers: `lib/templates.js` (nouveau), `lib/invoiceUtils.js` (STORAGE_KEYS), `lib/translations.js`, `InvoiceApp.jsx`, `components/InvoicePreview.jsx`.
- ✅ Layout split-screen responsive, thème sombre violet/bleu/doré, logo de marque intégré.
- ✅ Persistance LocalStorage (profil, facture, langue, devise) restaurée au rechargement.
- ✅ Calculs temps réel (sous-total, remise % ou fixe, TVA, net à payer) — validés.
- ✅ Table articles ajouter/supprimer, upload/suppression logo.
- ✅ Sélecteurs devise + langue (RTL arabe), export PDF (nommé selon n°) + impression.
- ✅ Nouvelle facture (incrément n°, profil conservé) + Réinitialiser profil (dialog de confirmation).
- ✅ Monétisation « Vidéo publicitaire avec récompense » avant téléchargement PDF : modale + mode simulation 5s (USE_AD_SIMULATION), structure GPT Rewarded Web Ads, fallback téléchargement direct si pub bloquée. Fichiers: `components/RewardedAdDialog.jsx`, `lib/adConfig.js`. Testé 100%.
- ✅ Historique des factures : bouton « Enregistrer » + « Historique » (badge de compteur), panneau latéral listant les factures sauvegardées (n°, client, total, dates) avec Rouvrir / Dupliquer / Supprimer ; auto-sauvegarde à l'enregistrement, à « Nouvelle facture » et après téléchargement PDF ; upsert par n°, persistance LocalStorage (`facturaflow_history`). Fichiers: `components/InvoiceHistory.jsx`. Testé 100%.
- ✅ Historique avancé : barre de recherche (par client ou n°), statut de paiement par facture (Payée / En attente) avec « Total impayé » groupé par devise, et export/import d'une sauvegarde JSON (fusion par n°). Testé 100% (20/20).
- ✅ Testé end-to-end (3 itérations): tous scénarios réussis (100%).
- ✅ Symbole devise localisé en arabe : le DZD s'affiche « دج » quand la langue est l'arabe (aperçu, formulaire, historique) ; € et $ restent universels. Fichier: `lib/invoiceUtils.js` (`formatMoney(amount, code, lang)`).
- ✅ Correction bug bidi RTL (2025-07) : en arabe, les nombres à séparateurs de milliers s'affichaient inversés. Fix : espaces insécables U+00A0 dans `formatMoney` + isolation LTR (`<bdi dir="ltr" style="unicode-bidi:isolate">`, composant `Ltr`) autour de chaque montant/nombre, IBAN, NIF, RC, AI, téléphones, emails, dates, n° facture et capital. Aucun impact FR/EN. Vérifié par l'agent de test (1 000 000 / 171 360 / 2 000 000 DZD OK partout, pas de régression).
- ✅ Mentions légales algériennes (2025-07) : Vendeur (NIF + N° RC, AI, forme juridique, capital social) affichés en en-tête ; forme juridique + capital en pied (« SARL au capital de … »). Client : NIF/RC/AI optionnels. « Net à payer » → « Total TTC » (FR/AR/EN). Montant en toutes lettres localisé + devise (FR « Arrêtée la présente facture… », EN « Amount in words: », AR « المبلغ بالحروف: ») via `lib/numberToWords.js` (gère « et un », « soixante et onze », « quatre-vingts », règle du « de » après million, centimes/cents, duel/pluriel arabes). Zone « Cachet et signature » en pied (dir-aware RTL). Champs vides masqués, sauvegardés avec la facture/historique/export. Fichiers: `lib/numberToWords.js` (nouveau), `lib/invoiceUtils.js`, `lib/translations.js`, `components/InvoiceForm.jsx`, `components/InvoicePreview.jsx`, `InvoiceApp.jsx`.

## Backlog (P1/P2)
- P1: Multi-factures / historique sauvegardé, duplication d'une facture.
- P2: Modèles/thèmes de facture, champs personnalisés, TVA par ligne.

## Next Tasks
- Selon retours utilisateur.
