/**
 * @fileoverview Modèle de données pour les clients du carnet d'adresses Facturo.
 * Garantit la structure, l'intégrité et la normalisation de chaque fiche client.
 */

/**
 * @typedef {Object} Client
 * @property {string} id - Identifiant unique universel du client (UUID v4 ou fallback)
 * @property {string} name - Nom ou raison sociale (seul champ obligatoire)
 * @property {string} address - Adresse postale ou siège social
 * @property {string} phone - Numéro de téléphone
 * @property {string} email - Adresse email
 * @property {string} nif - Numéro d'Identification Fiscale (NIF algérien)
 * @property {string} nis - Numéro d'Identification Statistique (NIS algérien)
 * @property {string} rc - Numéro du Registre de Commerce (RC algérien)
 * @property {string} ai - Numéro d'Article d'Imposition (AI algérien)
 * @property {number} createdAt - Horodatage de création en millisecondes (timestamp Unix)
 * @property {number} updatedAt - Horodatage de dernière modification en millisecondes (timestamp Unix)
 * @property {number} version - Version du schéma de données (toujours 1)
 */

/**
 * Génère un identifiant unique universel pour un client.
 * Utilise crypto.randomUUID() si supporté par l'environnement d'exécution,
 * sinon utilise un fallback basé sur l'horodatage Date.now() et une chaîne pseudo-aléatoire.
 *
 * @returns {string} Identifiant unique sous forme de chaîne
 */
export function generateClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      /* Fallback si indisponible ou restriction de contexte */
    }
  }
  return `cli_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Crée et normalise une fiche client pour le carnet Facturo.
 * Le nom est le seul champ strictement obligatoire.
 *
 * @param {Object} [data={}] - Données brutes ou partielles du client
 * @param {string} data.name - Nom ou raison sociale (obligatoire)
 * @param {string} [data.id] - Identifiant existant (optionnel, généré si absent)
 * @param {string} [data.address] - Adresse du client (optionnel)
 * @param {string} [data.phone] - Téléphone du client (optionnel)
 * @param {string} [data.email] - Email du client (optionnel)
 * @param {string} [data.nif] - Numéro d'Identification Fiscale NIF (optionnel)
 * @param {string} [data.nis] - Numéro d'Identification Statistique NIS (optionnel)
 * @param {string} [data.rc] - Numéro de Registre de Commerce RC (optionnel)
 * @param {string} [data.ai] - Numéro d'Article d'Imposition AI (optionnel)
 * @param {number} [data.createdAt] - Date de création en ms (Date.now() par défaut)
 * @param {number} [data.updatedAt] - Date de dernière mise à jour en ms (Date.now() par défaut)
 * @returns {Client|null} Objet client normalisé ou null si data est invalide ou si le nom est manquant/vide
 */
export function createClient(data = {}) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const rawName = typeof data.name === "string" ? data.name.trim() : "";
  if (!rawName) {
    return null;
  }

  const now = Date.now();

  const id =
    typeof data.id === "string" && data.id.trim()
      ? data.id.trim()
      : generateClientId();

  return {
    id,
    name: rawName,
    address: typeof data.address === "string" ? data.address.trim() : "",
    phone: typeof data.phone === "string" ? data.phone.trim() : "",
    email: typeof data.email === "string" ? data.email.trim() : "",
    nif: typeof data.nif === "string" ? data.nif.trim() : "",
    nis: typeof data.nis === "string" ? data.nis.trim() : "",
    rc: typeof data.rc === "string" ? data.rc.trim() : "",
    ai: typeof data.ai === "string" ? data.ai.trim() : "",
    createdAt:
      typeof data.createdAt === "number" && data.createdAt > 0
        ? data.createdAt
        : now,
    updatedAt:
      typeof data.updatedAt === "number" && data.updatedAt > 0
        ? data.updatedAt
        : now,
    version: 1,
  };
}
