/**
 * @fileoverview Module d'import et d'export JSON pour le carnet clients Facturo.
 * Fournit l'export horodaté facturo_clients_backup_AAAA-MM-JJ.json
 * et l'import sécurisé avec détection des doublons, tolérance au JSON corrompu
 * et notifications récapitulatives trilingues (FR, AR, EN).
 */

import { toast } from "sonner";
import { createClient } from "@/lib/clientModel";
import {
  CLIENTS_STORAGE_KEY,
  loadStoredClients,
  persistClients,
} from "@/hooks/useClients";

/**
 * Messages traduits par défaut pour l'import et l'export.
 */
const I18N_MESSAGES = {
  fr: {
    exportSuccess: "Sauvegarde du carnet clients exportée avec succès",
    exportError: "Erreur lors de l'export du carnet clients",
    fileReadError: "Impossible de lire le fichier sélectionné",
    corruptedError:
      "Fichier de sauvegarde invalide ou corrompu. Aucune donnée n'a été modifiée.",
    summary: (added, updated, ignored) =>
      `${added} ajouté${added > 1 ? "s" : ""}, ${updated} mis à jour, ${ignored} ignoré${ignored > 1 ? "s" : ""}`,
  },
  ar: {
    exportSuccess: "تم تصدير نسخة احتياطية من دفتر العملاء بنجاح",
    exportError: "حدث خطأ أثناء تصدير دفتر العملاء",
    fileReadError: "تعذر قراءة الملف المحدد",
    corruptedError:
      "ملف النسخة الاحتياطية غير صالح أو تالف. لم يتم تعديل أي بيانات.",
    summary: (added, updated, ignored) =>
      `${added} تمت إضافتهم، ${updated} تم تحديثهم، ${ignored} تم تجاهلهم`,
  },
  en: {
    exportSuccess: "Client address book backup exported successfully",
    exportError: "Error exporting client address book",
    fileReadError: "Unable to read the selected file",
    corruptedError:
      "Invalid or corrupted backup file. No data was modified.",
    summary: (added, updated, ignored) =>
      `${added} added, ${updated} updated, ${ignored} ignored`,
  },
};

/**
 * Récupère le dictionnaire de messages pour la langue courante.
 *
 * @param {string} [lang] - Code langue (fr, ar, en)
 * @returns {typeof I18N_MESSAGES.fr}
 */
function getMessages(lang) {
  const currentLang =
    lang ||
    (typeof document !== "undefined" && document.documentElement.lang) ||
    "fr";
  return I18N_MESSAGES[currentLang] || I18N_MESSAGES.fr;
}

/**
 * Formate la date du jour au format AAAA-MM-JJ.
 *
 * @param {Date} [date=new Date()] - Date à formater
 * @returns {string} Date au format AAAA-MM-JJ
 */
export function formatBackupDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Exporte le carnet de clients dans un fichier JSON horodaté.
 * Nom du fichier généré : facturo_clients_backup_AAAA-MM-JJ.json
 *
 * @param {Array<import("@/lib/clientModel").Client>} [clients] - Liste des clients à exporter (lit localStorage si omis)
 * @param {Object} [options={}] - Options d'export
 * @param {string} [options.lang] - Langue pour le message de notification
 * @param {Object} [options.t] - Objet de traduction alternatif
 * @returns {boolean} Vrai si le fichier a été généré et téléchargé
 */
export function exportClientsJSON(clients, options = {}) {
  try {
    const list = Array.isArray(clients) ? clients : loadStoredClients();
    const dateStr = formatBackupDate();
    const filename = `facturo_clients_backup_${dateStr}.json`;

    const payload = {
      app: "Facturo",
      type: "clients_backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      count: list.length,
      clients: list,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const msgs = getMessages(options.lang);
    const successMsg = options.t?.exportSuccess || msgs.exportSuccess;
    toast.success(successMsg);

    return true;
  } catch (error) {
    console.error("Erreur lors de l'export JSON des clients:", error);
    const msgs = getMessages(options.lang);
    toast.error(msgs.exportError);
    return false;
  }
}

/**
 * Recherche l'index d'un doublon dans la liste des clients.
 * Un doublon est identifié soit par le même id, soit par le même nif (non vide).
 *
 * @param {Array<import("@/lib/clientModel").Client>} list - Liste existante
 * @param {import("@/lib/clientModel").Client} client - Client à tester
 * @returns {number} Index de l'élément trouvé ou -1 si aucun doublon
 */
export function findDuplicateClientIndex(list, client) {
  if (!Array.isArray(list) || !client) return -1;

  const targetNif =
    typeof client.nif === "string" ? client.nif.trim().toLowerCase() : "";

  return list.findIndex((item) => {
    // 1. Même ID
    if (item.id && client.id && item.id === client.id) {
      return true;
    }
    // 2. Même NIF non vide
    if (targetNif) {
      const itemNif =
        typeof item.nif === "string" ? item.nif.trim().toLowerCase() : "";
      if (itemNif && itemNif === targetNif) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Importe un fichier de sauvegarde JSON de clients.
 * - Tolère le JSON corrompu ou invalide sans lever d'erreur bloquante et sans modifier les données.
 * - Normalise chaque fiche avec createClient et ignore celles sans nom.
 * - Gère les doublons (même id, ou même nif non vide) en conservant la version au updatedAt le plus récent.
 * - Ajoute les nouveaux clients.
 * - Affiche un résumé traduit (ajoutés, mis à jour, ignorés).
 *
 * @param {File} file - Fichier sélectionné par l'utilisateur
 * @param {Object} [options={}] - Options d'import
 * @param {Array<import("@/lib/clientModel").Client>} [options.currentClients] - Liste des clients existants (lit localStorage si omis)
 * @param {Function} [options.onSuccess] - Callback appelé avec la liste fusionnée et les statistiques
 * @param {string} [options.lang] - Code langue (fr, ar, en)
 * @param {Object} [options.t] - Objet de traduction
 * @returns {Promise<{success: boolean, clients?: Array<import("@/lib/clientModel").Client>, stats?: {added: number, updated: number, ignored: number}}|null>}
 */
export function importClientsJSON(file, options = {}) {
  const msgs = getMessages(options.lang);

  return new Promise((resolve) => {
    if (!file) {
      toast.error(msgs.fileReadError);
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      console.error("Erreur de lecture du fichier:", reader.error);
      toast.error(msgs.fileReadError);
      resolve(null);
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string" || !text.trim()) {
          throw new Error("Contenu vide");
        }

        // Parsing JSON sécurisé
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error("JSON corrompu ou mal formé");
        }

        // Extraction de la liste brute de clients
        let rawList = null;
        if (Array.isArray(parsed)) {
          rawList = parsed;
        } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.clients)) {
          rawList = parsed.clients;
        } else {
          throw new Error("Structure JSON invalide");
        }

        // Liste des clients existants
        const baseList = Array.isArray(options.currentClients)
          ? options.currentClients
          : loadStoredClients();

        // Copie de travail pour la fusion
        const merged = [...baseList];

        let addedCount = 0;
        let updatedCount = 0;
        let ignoredCount = 0;

        rawList.forEach((item) => {
          // Normalisation via createClient (ignore si nom absent ou vide)
          const normalized = createClient(item);
          if (!normalized) {
            ignoredCount++;
            return;
          }

          // Détection de doublon (même id, ou même nif non vide)
          const duplicateIndex = findDuplicateClientIndex(merged, normalized);

          if (duplicateIndex >= 0) {
            const existing = merged[duplicateIndex];
            const existingUpdated = Number(existing.updatedAt) || 0;
            const incomingUpdated = Number(normalized.updatedAt) || 0;

            // Règle : garde la version dont updatedAt est le plus récent
            if (incomingUpdated > existingUpdated) {
              merged[duplicateIndex] = {
                ...normalized,
                // On conserve l'identifiant initial pour la stabilité des références
                id: existing.id || normalized.id,
                createdAt: existing.createdAt || normalized.createdAt,
                updatedAt: incomingUpdated,
              };
              updatedCount++;
            } else {
              // La version existante est plus récente ou égale : on la conserve
              // Rien n'est écrasé
            }
          } else {
            // Nouveau client : ajout
            merged.push(normalized);
            addedCount++;
          }
        });

        // Sauvegarde dans localStorage
        persistClients(merged);

        // Notification du résumé traduit
        const summaryText = msgs.summary(addedCount, updatedCount, ignoredCount);
        toast.success(summaryText);

        const result = {
          success: true,
          clients: merged,
          stats: {
            added: addedCount,
            updated: updatedCount,
            ignored: ignoredCount,
          },
        };

        if (typeof options.onSuccess === "function") {
          options.onSuccess(merged, result.stats);
        }

        resolve(result);
      } catch (err) {
        console.error("Échec de l'importation de la sauvegarde:", err);
        // En cas d'erreur ou de fichier corrompu : notification claire, AUCUNE donnée modifiée
        toast.error(msgs.corruptedError);
        resolve(null);
      }
    };

    reader.readAsText(file);
  });
}
