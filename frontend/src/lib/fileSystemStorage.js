/**
 * @fileoverview Module technique pour le stockage IndexedDB et la File System Access API.
 * Gère le stockage persistant dans IndexedDB (copie de travail principale),
 * la migration depuis localStorage ("facturo_clients") sans suppression,
 * la synchronisation multi-onglets via BroadcastChannel,
 * et la liaison miroir avec un fichier local sur l'ordinateur.
 */

import { createClient } from "./clientModel";

const DB_NAME = "facturo_db";
const DB_VERSION = 1;
const CLIENTS_STORE = "clients";
const SETTINGS_STORE = "settings";

const STORAGE_KEY_FALLBACK = "facturo_clients";
const BROADCAST_CHANNEL_NAME = "facturo_clients_channel";

/**
 * Canal BroadcastChannel pour synchroniser les onglets ouverts.
 * @type {BroadcastChannel|null}
 */
let broadcastChannel = null;
if (typeof window !== "undefined" && typeof window.BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    broadcastChannel = null;
  }
}

/**
 * Notifie les autres onglets d'un changement dans le carnet clients.
 */
export function notifyTabsClientsChanged() {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "FACTURO_CLIENTS_UPDATED", timestamp: Date.now() });
    } catch (e) {
      /* Ignorer en cas d'erreur de postMessage */
    }
  }
}

/**
 * S'abonne aux notifications de mise à jour des autres onglets.
 * @param {Function} callback
 * @returns {Function} fonction de désabonnement
 */
export function subscribeToTabUpdates(callback) {
  if (!broadcastChannel) return () => {};
  const handler = (event) => {
    if (event?.data?.type === "FACTURO_CLIENTS_UPDATED") {
      callback();
    }
  };
  broadcastChannel.addEventListener("message", handler);
  return () => {
    broadcastChannel.removeEventListener("message", handler);
  };
}

/**
 * Ouvre ou initialise la base de données IndexedDB facturo_db.
 * @returns {Promise<IDBDatabase>}
 */
export function openFacturoDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB non disponible dans cet environnement"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(CLIENTS_STORE)) {
        db.createObjectStore(CLIENTS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Lit tous les clients depuis IndexedDB.
 * En cas de base vide, réalise une migration automatique transparente depuis localStorage
 * sans supprimer la clé d'origine "facturo_clients".
 * En cas d'échec IndexedDB, se replie gracieusement sur localStorage.
 *
 * @returns {Promise<Array<import("./clientModel").Client>>}
 */
export async function getClientsFromStorage() {
  try {
    const db = await openFacturoDB();
    const clients = await new Promise((resolve, reject) => {
      const tx = db.transaction(CLIENTS_STORE, "readonly");
      const store = tx.objectStore(CLIENTS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (Array.isArray(clients) && clients.length > 0) {
      return clients.map(createClient).filter(Boolean);
    }

    // Base vide : tentative de migration depuis localStorage
    const migrated = migrateFromLocalStorage();
    if (migrated.length > 0) {
      await saveClientsToStorage(migrated, false);
      return migrated;
    }

    return [];
  } catch (error) {
    console.warn("IndexedDB inaccessible, repli sur localStorage:", error);
    return getClientsFromLocalStorageFallback();
  }
}

/**
 * Sauvegarde la liste complète des clients dans IndexedDB.
 * Met également à jour le miroir localStorage de sécurité.
 *
 * @param {Array<import("./clientModel").Client>} clients
 * @param {boolean} [broadcast=true] notifier les autres onglets
 * @returns {Promise<boolean>}
 */
export async function saveClientsToStorage(clients, broadcast = true) {
  // Toujours maintenir la copie de secours localStorage
  saveClientsToLocalStorageFallback(clients);

  try {
    const db = await openFacturoDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(CLIENTS_STORE, "readwrite");
      const store = tx.objectStore(CLIENTS_STORE);
      store.clear();
      clients.forEach((c) => {
        store.put(c);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (broadcast) {
      notifyTabsClientsChanged();
    }
    return true;
  } catch (error) {
    console.warn("Échec d'écriture IndexedDB, sauvegarde localStorage maintenue:", error);
    return false;
  }
}

/**
 * Migration automatique depuis localStorage ("facturo_clients") sans suppression.
 * @returns {Array<import("./clientModel").Client>}
 */
function migrateFromLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FALLBACK);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(createClient).filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * Repli de lecture localStorage en cas de défaillance IndexedDB.
 * @returns {Array<import("./clientModel").Client>}
 */
function getClientsFromLocalStorageFallback() {
  return migrateFromLocalStorage();
}

/**
 * Repli d'écriture localStorage de secours.
 * @param {Array<import("./clientModel").Client>} clients
 */
function saveClientsToLocalStorageFallback(clients) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_FALLBACK, JSON.stringify(clients));
  } catch (e) {
    /* Ignorer erreur quota sur repli */
  }
}

// ==========================================================
// GESTION DU HANDLE FICHIER LIÉ (INDEXEDDB SETTINGS STORE)
// ==========================================================

const HANDLE_KEY = "facturo_clients_file_handle";
const STORAGE_MODE_KEY = "facturo_clients_storage_mode";
const LAST_SAVED_KEY = "facturo_clients_last_saved_time";

/**
 * Sauvegarde le descripteur de fichier (FileSystemFileHandle) dans IndexedDB.
 * @param {FileSystemFileHandle} handle
 * @returns {Promise<void>}
 */
export async function storeFileHandle(handle) {
  try {
    const db = await openFacturoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, "readwrite");
      const store = tx.objectStore(SETTINGS_STORE);
      store.put({ key: HANDLE_KEY, handle, name: handle.name, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("Impossible de mémoriser le handle dans IndexedDB:", e);
  }
}

/**
 * Récupère le descripteur de fichier mémorisé dans IndexedDB.
 * @returns {Promise<FileSystemFileHandle|null>}
 */
export async function getStoredFileHandle() {
  try {
    const db = await openFacturoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SETTINGS_STORE, "readonly");
      const store = tx.objectStore(SETTINGS_STORE);
      const req = store.get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result ? req.result.handle : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Supprime le descripteur de fichier mémorisé dans IndexedDB.
 * @returns {Promise<void>}
 */
export async function removeStoredFileHandle() {
  try {
    const db = await openFacturoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SETTINGS_STORE, "readwrite");
      const store = tx.objectStore(SETTINGS_STORE);
      store.delete(HANDLE_KEY);
      store.delete(LAST_SAVED_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    /* Ignorer */
  }
}

/**
 * Lit ou enregistre le mode de stockage ("browser" | "file").
 */
export function getSavedStorageMode() {
  if (typeof window === "undefined" || !window.localStorage) return "browser";
  return localStorage.getItem(STORAGE_MODE_KEY) || "browser";
}

export function saveStorageMode(mode) {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

// ==========================================================
// FILE SYSTEM ACCESS API NATIVE
// ==========================================================

/**
 * Vérifie si le navigateur prend en charge l'API File System Access.
 * @returns {boolean}
 */
export function isFileSystemAccessSupported() {
  return typeof window !== "undefined" && typeof window.showSaveFilePicker === "function";
}

/**
 * Ouvre le sélecteur natif pour choisir ou créer le fichier de sauvegarde local.
 * @returns {Promise<FileSystemFileHandle|null>}
 */
export async function pickClientsFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API non supportée");
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "facturo_clients.json",
      types: [
        {
          description: "Fichier JSON (*.json)",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    return handle;
  } catch (error) {
    // Annulation volontaire par l'utilisateur
    if (error.name === "AbortError") {
      return null;
    }
    throw error;
  }
}

/**
 * Vérifie ou sollicite les droits d'accès en lecture/écriture sur le fichier.
 * @param {FileSystemFileHandle} handle
 * @param {boolean} [request=false] true pour déclencher la boîte d'autorisation native
 * @returns {Promise<boolean>}
 */
export async function verifyHandlePermission(handle, request = false) {
  if (!handle || typeof handle.queryPermission !== "function") return false;
  try {
    const status = await handle.queryPermission({ mode: "readwrite" });
    if (status === "granted") return true;
    if (request && typeof handle.requestPermission === "function") {
      const reqStatus = await handle.requestPermission({ mode: "readwrite" });
      return reqStatus === "granted";
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Lit et analyse le contenu d'un fichier lié.
 * @param {FileSystemFileHandle} handle
 * @returns {Promise<Array<import("./clientModel").Client>>}
 */
export async function readClientsFromFile(handle) {
  if (!handle) return [];
  const file = await handle.getFile();
  const text = await file.text();
  if (!text || !text.trim()) return [];

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("Fichier JSON invalide ou corrompu");
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.clients)
      ? parsed.clients
      : [];

  return rawList.map(createClient).filter(Boolean);
}

/**
 * Écrit de façon atomique la liste des clients dans le fichier lié.
 * @param {FileSystemFileHandle} handle
 * @param {Array<import("./clientModel").Client>} clients
 * @returns {Promise<boolean>}
 */
export async function writeClientsToFile(handle, clients) {
  if (!handle) return false;
  const writable = await handle.createWritable();
  const data = JSON.stringify(clients, null, 2);
  await writable.write(data);
  await writable.close();
  return true;
}
