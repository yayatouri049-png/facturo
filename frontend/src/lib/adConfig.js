// Rewarded Ad configuration.

// Réglage unique d'activation des publicités récompensées (vidéo).
// À false par défaut : le bouton Télécharger PDF télécharge directement sans afficher la fenêtre.
export const REWARDED_ADS_ENABLED = false;

// Set USE_AD_SIMULATION = false when a validated AdSense/GPT account is ready.
export const USE_AD_SIMULATION = true;

// Simulation countdown length (seconds)
export const AD_SIMULATION_SECONDS = 5;

// GPT rewarded ad unit path (replace with your real ad unit once approved)
export const REWARDED_AD_UNIT = "/6355419/Travel/Europe/France/Paris";

/**
 * Vérifie si l'utilisateur est en mode Pro ou en essai (isPro).
 * En mode Pro/essai, la fenêtre de pub ne s'affiche jamais.
 *
 * @param {Object} [profile] Profil de l'utilisateur
 * @returns {boolean}
 */
export function checkIsPro(profile) {
  if (profile?.isPro || profile?.plan === "pro" || profile?.isTrial) {
    return true;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored =
        localStorage.getItem("facturo_is_pro") ||
        localStorage.getItem("isPro") ||
        localStorage.getItem("facturaflow_is_pro");
      if (stored === "true" || stored === "1") {
        return true;
      }
    } catch (e) {
      /* Ignorer */
    }
  }
  return false;
}

