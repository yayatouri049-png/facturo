/**
 * @fileoverview Hook React pour la gestion du carnet clients Facturo.
 * Assure la persistance dans localStorage sous la clé "facturo_clients",
 * la résilience contre le JSON corrompu et les erreurs de quota,
 * et l'appel à navigator.storage.persist().
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/clientModel";
import {
  exportClientsJSON,
  importClientsJSON,
} from "@/lib/clientImportExport";

/**
 * Clé de stockage localStorage réservée au carnet de clients.
 * @type {string}
 */
export const CLIENTS_STORAGE_KEY = "facturo_clients";

/**
 * Charge les clients depuis le localStorage de manière sécurisée.
 * Tolère le JSON corrompu sans lever d'exception.
 *
 * @returns {Array<import("@/lib/clientModel").Client>} Liste des clients validés
 */
export function loadStoredClients() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => createClient(item))
      .filter((client) => client !== null);
  } catch (error) {
    console.error("Erreur lors de la lecture du carnet clients:", error);
    return [];
  }
}

/**
 * Enregistre la liste des clients dans le localStorage de manière sécurisée.
 * Capture les erreurs de quota plein sans faire planter l'application.
 *
 * @param {Array<import("@/lib/clientModel").Client>} clients - Liste à sauvegarder
 * @returns {boolean} Vrai si la sauvegarde a réussi, faux en cas d'erreur
 */
export function persistClients(clients) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    return true;
  } catch (error) {
    console.error("Erreur d'écriture localStorage (quota plein probable):", error);
    if (typeof toast !== "undefined" && toast.error) {
      toast.error("Espace de stockage plein. Pensez à exporter une sauvegarde.");
    }
    return false;
  }
}

/**
 * Hook personnalisé pour interagir avec le carnet clients local.
 *
 * @param {Object} [options={}] - Options du hook
 * @param {Object} [options.t] - Objet de traduction pour les messages de confirmation
 * @returns {Object} Méthodes et état du carnet clients
 */
export function useClients(options = {}) {
  const { t } = options;
  const [clients, setClients] = useState(() => loadStoredClients());

  // Demande de persistance du stockage auprès du navigateur si l'API est supportée
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.storage &&
      typeof navigator.storage.persist === "function"
    ) {
      navigator.storage.persist().catch(() => {
        /* Ignorer en cas d'environnement restreint */
      });
    }
  }, []);

  /**
   * Ajoute un nouveau client au carnet.
   *
   * @param {Object} data - Données du client
   * @returns {import("@/lib/clientModel").Client|null} Le client créé ou null si invalide
   */
  const addClient = useCallback((data) => {
    const newClient = createClient(data);
    if (!newClient) {
      return null;
    }

    setClients((prev) => {
      // Si un client avec le même id existe déjà, on le remplace, sinon on l'ajoute en tête
      const existsIndex = prev.findIndex((c) => c.id === newClient.id);
      let next;
      if (existsIndex >= 0) {
        next = [...prev];
        next[existsIndex] = newClient;
      } else {
        next = [newClient, ...prev];
      }
      persistClients(next);
      return next;
    });

    return newClient;
  }, []);

  /**
   * Met à jour un client existant en actualisant updatedAt.
   *
   * @param {string} id - Identifiant du client
   * @param {Object} data - Nouvelles données partielles ou complètes
   * @returns {import("@/lib/clientModel").Client|null} Le client mis à jour ou null si introuvable/invalide
   */
  const updateClient = useCallback((id, data) => {
    if (!id || !data) return null;

    let updatedResult = null;

    setClients((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) return prev;

      const current = prev[index];
      const merged = {
        ...current,
        ...data,
        id: current.id, // L'ID ne change jamais
        createdAt: current.createdAt, // La date de création initiale est préservée
        updatedAt: Date.now(), // Mise à jour de l'horodatage
      };

      const validated = createClient(merged);
      if (!validated) return prev;

      updatedResult = validated;
      const next = [...prev];
      next[index] = validated;
      persistClients(next);
      return next;
    });

    return updatedResult;
  }, []);

  /**
   * Supprime un client après confirmation utilisateur traduite.
   *
   * @param {string} id - Identifiant du client à supprimer
   * @param {string} [customConfirmMessage] - Message personnalisé pour le window.confirm
   * @returns {boolean} Vrai si le client a été supprimé, faux si annulé ou introuvable
   */
  const deleteClient = useCallback(
    (id, customConfirmMessage) => {
      if (!id) return false;

      const confirmText =
        customConfirmMessage ||
        t?.confirmDeleteClient ||
        "Voulez-vous vraiment supprimer ce client du carnet ?";

      if (typeof window !== "undefined" && window.confirm) {
        const confirmed = window.confirm(confirmText);
        if (!confirmed) return false;
      }

      let deleted = false;
      setClients((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length !== prev.length) {
          deleted = true;
          persistClients(next);
          return next;
        }
        return prev;
      });

      return deleted;
    },
    [t]
  );

  /**
   * Filtre la liste des clients en direct sur le nom et le NIF (insensible à la casse).
   *
   * @param {string} query - Terme de recherche
   * @returns {Array<import("@/lib/clientModel").Client>} Liste filtrée des clients
   */
  const searchClients = useCallback(
    (query) => {
      if (!query || typeof query !== "string") {
        return clients;
      }
      const q = query.trim().toLowerCase();
      if (!q) {
        return clients;
      }
      return clients.filter((client) => {
        const nameMatch = (client.name || "").toLowerCase().includes(q);
        const nifMatch = (client.nif || "").toLowerCase().includes(q);
        return nameMatch || nifMatch;
      });
    },
    [clients]
  );

  /**
   * Exporte le carnet de clients au format JSON.
   */
  const exportClients = useCallback(
    (exportOptions = {}) => {
      return exportClientsJSON(clients, {
        t,
        lang: options.lang,
        ...exportOptions,
      });
    },
    [clients, t, options.lang]
  );

  /**
   * Importe un fichier de sauvegarde JSON et met immédiatement à jour l'état React.
   */
  const importClients = useCallback(
    async (file, importOptions = {}) => {
      const result = await importClientsJSON(file, {
        currentClients: clients,
        t,
        lang: options.lang,
        ...importOptions,
        onSuccess: (merged, stats) => {
          setClients(merged); // Met immédiatement à jour l'état React de useClients
          if (typeof importOptions.onSuccess === "function") {
            importOptions.onSuccess(merged, stats);
          }
        },
      });
      return result;
    },
    [clients, t, options.lang]
  );

  // Synchronisation si le localStorage change (ex: autre onglet)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e) => {
      if (e.key === CLIENTS_STORAGE_KEY) {
        setClients(loadStoredClients());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    clients,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    searchClients,
    exportClients,
    importClients,
    persistClients,
  };
}

export default useClients;
