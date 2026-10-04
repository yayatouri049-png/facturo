/**
 * @fileoverview Hook React pour la gestion du carnet clients Facturo.
 * Mode "Dans ce navigateur" : IndexedDB comme copie de travail principale,
 * migration automatique depuis "facturo_clients" (sans suppression),
 * repli sécurisé sur localStorage, et synchronisation multi-onglets via BroadcastChannel.
 * Mode "Sur mon ordinateur (fichier lié)" : miroir automatique avec écriture temporisée
 * via File System Access API, gestion des permissions Chromium et reconnexion transparente.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/clientModel";
import {
  exportClientsJSON,
  importClientsJSON,
} from "@/lib/clientImportExport";
import {
  getClientsFromStorage,
  saveClientsToStorage,
  subscribeToTabUpdates,
  storeFileHandle,
  getStoredFileHandle,
  removeStoredFileHandle,
  getSavedStorageMode,
  saveStorageMode,
  isFileSystemAccessSupported,
  pickClientsFile,
  verifyHandlePermission,
  readClientsFromFile,
  writeClientsToFile,
} from "@/lib/fileSystemStorage";

export const CLIENTS_STORAGE_KEY = "facturo_clients";

/**
 * Charge les clients depuis le localStorage en lecture synchrone de démarrage.
 * @returns {Array<import("@/lib/clientModel").Client>}
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
    return [];
  }
}

/**
 * Enregistre la liste des clients dans IndexedDB et localStorage.
 * @param {Array<import("@/lib/clientModel").Client>} clients
 * @returns {Promise<boolean>|boolean}
 */
export function persistClients(clients) {
  saveClientsToStorage(clients, true);
  return true;
}

/**
 * Formate une date en HH:MM pour l'affichage de l'heure de sauvegarde.
 * @param {Date|number} [date=new Date()]
 * @returns {string}
 */
function formatTimeHHMM(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Hook personnalisé useClients
 *
 * @param {Object} [options={}]
 * @param {Object} [options.t] - Objet de traduction
 * @param {string} [options.lang] - Code langue (fr, ar, en)
 * @returns {Object}
 */
export function useClients(options = {}) {
  const { t, lang } = options;

  // 1. État des clients : initialisé avec la copie synchrone puis synchronisé avec IndexedDB
  const [clients, setClients] = useState(() => loadStoredClients());

  // 2. Mode de stockage ("browser" | "file")
  const [storageMode, setStorageModeState] = useState(() => getSavedStorageMode());

  // 3. État du fichier lié (File System Access)
  const isSupported = isFileSystemAccessSupported();
  const [fileHandle, setFileHandle] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileStatus, setFileStatus] = useState("disconnected"); // "connected" | "need_permission" | "error" | "disconnected"
  const [lastSavedTime, setLastSavedTime] = useState(() => formatTimeHHMM());
  const [isSavingToFile, setIsSavingToFile] = useState(false);

  // 4. État de conflit lors de la liaison d'un fichier existant avec fiches
  const [pendingConflict, setPendingConflict] = useState(null);

  // Référence pour le debounce d'écriture dans le fichier lié
  const debounceTimerRef = useRef(null);

  // Charger les données depuis IndexedDB au montage du composant
  useEffect(() => {
    let isMounted = true;
    getClientsFromStorage().then((stored) => {
      if (isMounted && Array.isArray(stored)) {
        setClients(stored);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Écouter les mises à jour des autres onglets via BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToTabUpdates(async () => {
      const fresh = await getClientsFromStorage();
      if (Array.isArray(fresh)) {
        setClients(fresh);
      }
    });
    return unsubscribe;
  }, []);

  // Repli écoute événement storage pour compatibilité multi-onglets
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e) => {
      if (e.key === CLIENTS_STORAGE_KEY) {
        getClientsFromStorage().then((stored) => {
          if (Array.isArray(stored)) setClients(stored);
        });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Détection et restauration du fichier lié au démarrage
  useEffect(() => {
    if (!isSupported) return;

    let isMounted = true;
    getStoredFileHandle().then(async (handle) => {
      if (!isMounted || !handle) {
        if (isMounted) setFileStatus("disconnected");
        return;
      }

      setFileHandle(handle);
      setFileName(handle.name || "facturo_clients.json");

      // Vérification non-bloquante de l'autorisation d'accès
      try {
        const hasPermission = await verifyHandlePermission(handle, false);
        if (!isMounted) return;

        if (hasPermission) {
          setFileStatus("connected");
          // Si le mode sauvegardé est "file", s'assurer que c'est actif
          if (getSavedStorageMode() === "file") {
            setStorageModeState("file");
          }
        } else {
          // L'autorisation Chromium nécessite un clic utilisateur
          setFileStatus("need_permission");
        }
      } catch (e) {
        if (isMounted) setFileStatus("need_permission");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isSupported]);

  /**
   * Écrit dans le fichier lié avec temporisation (debounce de 400ms).
   */
  const scheduleWriteToFile = useCallback(
    (clientsToWrite, immediate = false) => {
      if (!fileHandle || fileStatus !== "connected") return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const doWrite = async () => {
        setIsSavingToFile(true);
        try {
          await writeClientsToFile(fileHandle, clientsToWrite);
          setLastSavedTime(formatTimeHHMM());
          setFileStatus("connected");
        } catch (error) {
          console.error("Erreur lors de l'écriture dans le fichier lié:", error);
          if (error.name === "NotFoundError") {
            setFileStatus("error");
            toast.error(t?.fileNotFoundError || "Fichier introuvable ou déplacé sur votre ordinateur.");
          } else if (error.name === "NotAllowedError") {
            setFileStatus("need_permission");
          } else if (error.name === "QuotaExceededError") {
            toast.error(t?.fileDiskFullError || "Espace disque insuffisant pour enregistrer le fichier.");
          }
        } finally {
          setIsSavingToFile(false);
        }
      };

      if (immediate) {
        doWrite();
      } else {
        debounceTimerRef.current = setTimeout(doWrite, 400);
      }
    },
    [fileHandle, fileStatus, t]
  );

  /**
   * Persistance globale dans IndexedDB + miroir fichier lié.
   */
  const persistClientsData = useCallback(
    async (nextClients, immediateFileWrite = false) => {
      // 1. Sauvegarde dans IndexedDB (copie de travail principale)
      await saveClientsToStorage(nextClients, true);

      // 2. Si le mode fichier lié est actif et connecté, écriture miroir
      if (storageMode === "file" && fileHandle && fileStatus === "connected") {
        scheduleWriteToFile(nextClients, immediateFileWrite);
      }
    },
    [storageMode, fileHandle, fileStatus, scheduleWriteToFile]
  );

  /**
   * Bascule de mode de stockage ("browser" | "file").
   */
  const setStorageMode = useCallback(
    (mode) => {
      if (mode === "file" && !isSupported) {
        toast.error("File System Access non supporté par ce navigateur.");
        return;
      }
      setStorageModeState(mode);
      saveStorageMode(mode);

      if (mode === "file") {
        if (fileHandle && fileStatus === "connected") {
          scheduleWriteToFile(clients, true);
        }
      }
    },
    [isSupported, fileHandle, fileStatus, clients, scheduleWriteToFile]
  );

  /**
   * Ajoute un nouveau client au carnet.
   */
  const addClient = useCallback(
    async (data) => {
      const newClient = createClient(data);
      if (!newClient) return null;

      let nextList = null;
      setClients((prev) => {
        const existsIndex = prev.findIndex((c) => c.id === newClient.id);
        let next;
        if (existsIndex >= 0) {
          next = [...prev];
          next[existsIndex] = newClient;
        } else {
          next = [newClient, ...prev];
        }
        nextList = next;
        return next;
      });

      if (nextList) {
        await persistClientsData(nextList);
      }

      return newClient;
    },
    [persistClientsData]
  );

  /**
   * Met à jour un client existant.
   */
  const updateClient = useCallback(
    async (id, data) => {
      if (!id || !data) return null;
      let updatedResult = null;
      let nextList = null;

      setClients((prev) => {
        const index = prev.findIndex((c) => c.id === id);
        if (index === -1) return prev;

        const current = prev[index];
        const merged = {
          ...current,
          ...data,
          id: current.id,
          createdAt: current.createdAt,
          updatedAt: Date.now(),
        };

        const validated = createClient(merged);
        if (!validated) return prev;

        updatedResult = validated;
        const next = [...prev];
        next[index] = validated;
        nextList = next;
        return next;
      });

      if (nextList) {
        await persistClientsData(nextList);
      }

      return updatedResult;
    },
    [persistClientsData]
  );

  /**
   * Supprime un client après confirmation.
   */
  const deleteClient = useCallback(
    async (id, customConfirmMessage) => {
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
      let nextList = null;
      setClients((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length !== prev.length) {
          deleted = true;
          nextList = next;
          return next;
        }
        return prev;
      });

      if (deleted && nextList) {
        await persistClientsData(nextList);
      }

      return deleted;
    },
    [t, persistClientsData]
  );

  /**
   * Recherche en direct par nom ou NIF.
   */
  const searchClients = useCallback(
    (query) => {
      if (!query || typeof query !== "string") return clients;
      const q = query.trim().toLowerCase();
      if (!q) return clients;
      return clients.filter((client) => {
        const nameMatch = (client.name || "").toLowerCase().includes(q);
        const nifMatch = (client.nif || "").toLowerCase().includes(q);
        return nameMatch || nifMatch;
      });
    },
    [clients]
  );

  /**
   * Exporte le carnet au format JSON.
   */
  const exportClients = useCallback(
    (exportOptions = {}) => {
      return exportClientsJSON(clients, {
        t,
        lang,
        ...exportOptions,
      });
    },
    [clients, t, lang]
  );

  /**
   * Importe un fichier de sauvegarde JSON.
   */
  const importClients = useCallback(
    async (file, importOptions = {}) => {
      const result = await importClientsJSON(file, {
        currentClients: clients,
        t,
        lang,
        ...importOptions,
        onSuccess: (merged, stats) => {
          setClients(merged);
          persistClientsData(merged, true);
          if (typeof importOptions.onSuccess === "function") {
            importOptions.onSuccess(merged, stats);
          }
        },
      });
      return result;
    },
    [clients, t, lang, persistClientsData]
  );

  // ==========================================================
  // ACTIONS SUR LE FICHIER LIÉ
  // ==========================================================

  /**
   * Ouvre l'explorateur pour lier un fichier local.
   */
  const linkFile = useCallback(async () => {
    if (!isSupported) {
      toast.error("File System Access non supporté par ce navigateur.");
      return;
    }

    try {
      const handle = await pickClientsFile();
      if (!handle) return; // Annulation utilisateur

      // Vérifier les permissions
      const hasPerm = await verifyHandlePermission(handle, true);
      if (!hasPerm) {
        toast.error(t?.filePermissionNeeded || "Autorisation refusée");
        return;
      }

      // Lire le fichier sélectionné pour détecter s'il contient déjà des clients
      let existingFileClients = [];
      try {
        existingFileClients = await readClientsFromFile(handle);
      } catch (err) {
        // Fichier neuf ou vide
        existingFileClients = [];
      }

      // Si le fichier contient déjà des clients, afficher le dialogue de choix
      if (Array.isArray(existingFileClients) && existingFileClients.length > 0) {
        setPendingConflict({
          handle,
          fileClients: existingFileClients,
          currentClients: clients,
        });
        return;
      }

      // Fichier vide ou neuf : initialiser le fichier avec les clients actuels
      await writeClientsToFile(handle, clients);
      await storeFileHandle(handle);

      setFileHandle(handle);
      setFileName(handle.name);
      setFileStatus("connected");
      setLastSavedTime(formatTimeHHMM());
      setStorageMode("file");
      toast.success(t?.fileWriteSuccess || "Fichier local synchronisé");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erreur liaison fichier:", error);
        toast.error(t?.importError || "Erreur lors de la liaison du fichier");
      }
    }
  }, [isSupported, clients, t, setStorageMode]);

  /**
   * Résout le conflit de liaison de fichier existant ("load", "merge", "overwrite").
   */
  const resolveConflict = useCallback(
    async (action) => {
      if (!pendingConflict) return;
      const { handle, fileClients, currentClients } = pendingConflict;

      try {
        if (action === "load") {
          // Remplacer les clients actifs par ceux du fichier
          setClients(fileClients);
          await saveClientsToStorage(fileClients, true);
          await storeFileHandle(handle);
          setFileHandle(handle);
          setFileName(handle.name);
          setFileStatus("connected");
          setLastSavedTime(formatTimeHHMM());
          setStorageMode("file");
          toast.success(t?.clientsLoadedFromFile || "Clients chargés depuis le fichier");
        } else if (action === "merge") {
          // Fusionner selon les règles d'or (doublon par id ou nif, updatedAt le plus récent)
          const map = new Map();
          currentClients.forEach((c) => map.set(c.id, c));

          fileClients.forEach((fc) => {
            const duplicate = [...map.values()].find((ex) => {
              if (ex.id === fc.id) return true;
              if (
                fc.nif &&
                ex.nif &&
                typeof fc.nif === "string" &&
                typeof ex.nif === "string" &&
                fc.nif.trim() !== "" &&
                fc.nif.trim().toLowerCase() === ex.nif.trim().toLowerCase()
              ) {
                return true;
              }
              return false;
            });

            if (duplicate) {
              if (Number(fc.updatedAt || 0) > Number(duplicate.updatedAt || 0)) {
                map.set(duplicate.id, {
                  ...fc,
                  id: duplicate.id, // L'ID d'origine local est conservé
                });
              }
            } else {
              map.set(fc.id, fc);
            }
          });

          const mergedList = Array.from(map.values()).sort(
            (a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0)
          );

          setClients(mergedList);
          await saveClientsToStorage(mergedList, true);
          await writeClientsToFile(handle, mergedList);
          await storeFileHandle(handle);

          setFileHandle(handle);
          setFileName(handle.name);
          setFileStatus("connected");
          setLastSavedTime(formatTimeHHMM());
          setStorageMode("file");
          toast.success(t?.clientsMergedSuccess || "Clients fusionnés avec succès");
        } else if (action === "overwrite") {
          // Écraser le fichier avec mes clients actuels
          const confirmMsg =
            t?.confirmOverwriteClientsFile ||
            "Attention : cette action va écraser définitivement le contenu du fichier sélectionné avec vos fiches clients actuelles. Continuer ?";
          if (typeof window !== "undefined" && window.confirm && !window.confirm(confirmMsg)) {
            return;
          }

          await writeClientsToFile(handle, currentClients);
          await storeFileHandle(handle);

          setFileHandle(handle);
          setFileName(handle.name);
          setFileStatus("connected");
          setLastSavedTime(formatTimeHHMM());
          setStorageMode("file");
          toast.success(t?.fileOverwrittenSuccess || "Fichier écrasé et synchronisé");
        }
      } catch (err) {
        console.error("Erreur résolution conflit:", err);
        toast.error("Erreur lors de la synchronisation");
      } finally {
        setPendingConflict(null);
      }
    },
    [pendingConflict, t, setStorageMode]
  );

  const cancelConflict = useCallback(() => {
    setPendingConflict(null);
  }, []);

  /**
   * Réactive la permission d'accès suite au clic utilisateur.
   */
  const reconnectFile = useCallback(async () => {
    if (!fileHandle) return;
    try {
      const granted = await verifyHandlePermission(fileHandle, true);
      if (granted) {
        setFileStatus("connected");
        // Écrire les clients actuels dans le fichier pour synchroniser
        await writeClientsToFile(fileHandle, clients);
        setLastSavedTime(formatTimeHHMM());
        toast.success(t?.fileWriteSuccess || "Fichier local synchronisé");
      } else {
        toast.error(t?.filePermissionNeeded || "Autorisation refusée");
      }
    } catch (err) {
      console.error("Erreur reconnexion:", err);
      toast.error(t?.fileNotFoundError || "Fichier inaccessible");
    }
  }, [fileHandle, clients, t]);

  /**
   * Délie le fichier local et repasse en mode navigateur sans toucher aux fiches.
   */
  const unlinkFile = useCallback(async () => {
    const confirmMsg =
      t?.confirmUnlinkFile ||
      "Voulez-vous délier ce fichier ? Vos fiches clients restent conservées dans ce navigateur.";
    if (typeof window !== "undefined" && window.confirm && !window.confirm(confirmMsg)) {
      return;
    }

    await removeStoredFileHandle();
    setFileHandle(null);
    setFileName("");
    setFileStatus("disconnected");
    setStorageMode("browser");
  }, [t, setStorageMode]);

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
    // Phase 2 : Stockage et Fichier lié
    storageMode,
    setStorageMode,
    isSupported,
    fileHandle,
    fileName,
    fileStatus,
    lastSavedTime,
    isSavingToFile,
    linkFile,
    reconnectFile,
    unlinkFile,
    pendingConflict,
    resolveConflict,
    cancelConflict,
  };
}

export default useClients;
