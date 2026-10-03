/**
 * @fileoverview Tiroir latéral (Sheet) pour la gestion du carnet clients Facturo.
 * Comprend la recherche en direct par nom et NIF, l'affichage des fiches avec badges légaux,
 * les actions d'injection par copie, d'édition, de suppression, d'import/export JSON,
 * le bloc de choix de stockage (navigateur ou fichier lié si supporté),
 * et le bandeau d'information préventif.
 */

import React, { useState, useRef, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  FilePlus2,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  HardDrive,
  Globe,
  RefreshCw,
  Unlink,
  Link,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "bg-[#0e1220] border-[#282e42] text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500";

/**
 * Tiroir latéral du carnet clients.
 *
 * @param {Object} props
 * @param {boolean} props.open - État d'ouverture du tiroir
 * @param {Function} props.onOpenChange - Callback d'ouverture/fermeture
 * @param {Array<import("@/lib/clientModel").Client>} props.clients - Liste des clients
 * @param {Object} props.t - Dictionnaire de traductions
 * @param {string} props.dir - Direction d'affichage ('ltr' | 'rtl')
 * @param {string} props.lang - Langue active
 * @param {Function} props.onSelectClient - Injection du client dans la facture
 * @param {Function} props.onAddClient - Ajout d'un nouveau client
 * @param {Function} props.onUpdateClient - Modification d'un client existant
 * @param {Function} props.onDeleteClient - Suppression d'un client
 * @param {Function} props.onExport - Export du carnet
 * @param {Function} props.onImport - Import de sauvegarde
 * @param {string} [props.storageMode="browser"] - "browser" | "file"
 * @param {Function} [props.onStorageModeChange] - Changement de mode de stockage
 * @param {boolean} [props.isSupported=false] - Support de l'API File System Access
 * @param {string} [props.fileName=""] - Nom du fichier lié
 * @param {string} [props.fileStatus="disconnected"] - Statut de connexion du fichier
 * @param {string} [props.lastSavedTime=""] - Heure de la dernière sauvegarde
 * @param {boolean} [props.isSavingToFile=false] - Enregistrement fichier en cours
 * @param {Function} [props.onLinkFile] - Lier un fichier
 * @param {Function} [props.onReconnectFile] - Réactiver la sauvegarde du fichier
 * @param {Function} [props.onUnlinkFile] - Délier le fichier
 * @param {Object|null} [props.pendingConflict=null] - Conflit de fichier existant
 * @param {Function} [props.onResolveConflict] - Résoudre le conflit
 * @param {Function} [props.onCancelConflict] - Annuler le conflit
 */
export default function ClientsDrawer({
  open,
  onOpenChange,
  clients = [],
  t = {},
  dir = "ltr",
  lang = "fr",
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onExport,
  onImport,
  // Phase 2
  storageMode = "browser",
  onStorageModeChange,
  isSupported = false,
  fileName = "",
  fileStatus = "disconnected",
  lastSavedTime = "",
  isSavingToFile = false,
  onLinkFile,
  onReconnectFile,
  onUnlinkFile,
  pendingConflict = null,
  onResolveConflict,
  onCancelConflict,
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editingClient, setEditingClient] = useState(null);
  const fileRef = useRef(null);

  // Formulaire local d'édition/ajout
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    nif: "",
    nis: "",
    rc: "",
    ai: "",
  });

  // Filtrage en direct sur nom et NIF
  const filteredClients = useMemo(() => {
    if (!query || typeof query !== "string") return clients;
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const matchName = (c.name || "").toLowerCase().includes(q);
      const matchNif = (c.nif || "").toLowerCase().includes(q);
      return matchName || matchNif;
    });
  }, [clients, query]);

  // Ouverture du formulaire pour un nouveau client
  const handleOpenAddForm = () => {
    setEditingClient(null);
    setForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      nif: "",
      nis: "",
      rc: "",
      ai: "",
    });
    setView("form");
  };

  // Ouverture du formulaire pour modifier un client existant
  const handleOpenEditForm = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      address: client.address || "",
      phone: client.phone || "",
      email: client.email || "",
      nif: client.nif || "",
      nis: client.nis || "",
      rc: client.rc || "",
      ai: client.ai || "",
    });
    setView("form");
  };

  // Soumission du formulaire (Ajout ou Modification)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    const trimmedName = (form.name || "").trim();
    if (!trimmedName) {
      toast.error(t.clientNameRequired || "Le nom du client est obligatoire.");
      return;
    }

    if (editingClient) {
      // Modification
      if (typeof onUpdateClient === "function") {
        onUpdateClient(editingClient.id, {
          name: trimmedName,
          address: form.address || "",
          phone: form.phone || "",
          email: form.email || "",
          nif: form.nif || "",
          nis: form.nis || "",
          rc: form.rc || "",
          ai: form.ai || "",
        });
      }
      toast.success(t.saved || "Client mis à jour");
    } else {
      // Ajout
      if (typeof onAddClient === "function") {
        onAddClient({
          name: trimmedName,
          address: form.address || "",
          phone: form.phone || "",
          email: form.email || "",
          nif: form.nif || "",
          nis: form.nis || "",
          rc: form.rc || "",
          ai: form.ai || "",
        });
      }
      toast.success(t.clientSavedToBook || "Client enregistré dans votre carnet");
    }

    setView("list");
  };

  // Suppression d'un client
  const handleDeleteClient = (client) => {
    if (typeof onDeleteClient === "function") {
      const deleted = onDeleteClient(client.id);
      if (deleted) {
        toast.success(t.deletedInvoice || "Client supprimé du carnet");
      }
    }
  };

  // Déclencheur du fichier d'import JSON
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (typeof onImport === "function") {
      await onImport(file);
    }
    // Réinitialise l'input pour permettre de réimporter le même fichier
    e.target.value = "";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={dir === "rtl" ? "left" : "right"}
        data-testid="clients-drawer"
        className="w-full border-[#282e42] bg-[#0e1220] text-slate-200 sm:max-w-lg overflow-y-auto ff-scroll flex flex-col p-0"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-[#282e42] bg-[#141826]">
          <SheetHeader className="text-start">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="flex items-center gap-2 text-white text-lg">
                <Users className="h-5 w-5 text-blue-400" />
                {t.clientsTitle || "Carnet clients"}
                <span className="ml-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
                  {clients.length}
                </span>
              </SheetTitle>
              {view === "list" && (
                <Button
                  data-testid="add-client-btn"
                  onClick={handleOpenAddForm}
                  size="sm"
                  className="h-8 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.newClient || "Nouveau client"}</span>
                </Button>
              )}
            </div>
            <SheetDescription className="text-slate-400 text-xs mt-1">
              {t.clientsSubtitle || "Gérez vos fiches clients et réutilisez-les dans vos factures."}
            </SheetDescription>
          </SheetHeader>

          {/* BLOC STOCKAGE DES CLIENTS (affiché UNIQUEMENT si l'API File System Access est supportée) */}
          {view === "list" && isSupported && (
            <div className="mt-4 rounded-xl border border-[#282e42] bg-[#101422] p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-blue-400" />
                  {t.clientsStorageTitle || "Stockage des clients"}
                </span>
                {storageMode === "file" && isSavingToFile && (
                  <span className="text-[11px] text-blue-400 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    {t.savingToFile || "Enregistrement..."}
                  </span>
                )}
              </div>

              {/* 2 Choix : Dans ce navigateur / Sur mon ordinateur (fichier lié) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  data-testid="storage-mode-browser-btn"
                  onClick={() => onStorageModeChange && onStorageModeChange("browser")}
                  className={`flex flex-col items-start p-2 rounded-lg border transition-all text-start ${
                    storageMode === "browser"
                      ? "border-blue-500/60 bg-blue-500/10 text-white shadow-sm ring-1 ring-blue-500/30"
                      : "border-[#282e42] bg-[#171b2b] text-slate-400 hover:text-slate-200 hover:bg-[#1b2133]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    {t.storageModeBrowser || "Dans ce navigateur"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {t.storageModeBrowserDesc || "Par défaut, fonctionne partout"}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="storage-mode-file-btn"
                  onClick={() => onStorageModeChange && onStorageModeChange("file")}
                  className={`flex flex-col items-start p-2 rounded-lg border transition-all text-start ${
                    storageMode === "file"
                      ? "border-blue-500/60 bg-blue-500/10 text-white shadow-sm ring-1 ring-blue-500/30"
                      : "border-[#282e42] bg-[#171b2b] text-slate-400 hover:text-slate-200 hover:bg-[#1b2133]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    <HardDrive className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {t.storageModeFile || "Sur mon ordinateur"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {t.storageModeFileDesc || "Fichier lié"}
                  </span>
                </button>
              </div>

              {/* Détails du mode fichier lié */}
              {storageMode === "file" && (
                <div className="pt-2 border-t border-[#282e42]/60">
                  {!fileName || fileStatus === "disconnected" ? (
                    <Button
                      type="button"
                      data-testid="link-file-btn"
                      onClick={onLinkFile}
                      size="sm"
                      className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Link className="h-3.5 w-3.5" />
                      <span>{t.linkLocalFile || "Lier un fichier"}</span>
                    </Button>
                  ) : fileStatus === "need_permission" ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>{t.filePermissionNeeded || "Autorisation requise"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          data-testid="reconnect-file-btn"
                          onClick={onReconnectFile}
                          size="sm"
                          className="h-7 px-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {t.reconnectFile || "Réactiver la sauvegarde"}
                        </Button>
                        <Button
                          type="button"
                          data-testid="unlink-file-btn"
                          onClick={onUnlinkFile}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-slate-400 hover:text-rose-400 text-xs"
                        >
                          {t.unlinkFile || "Délier"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-300 truncate">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        <span className="truncate">
                          {t.fileLinkedPrefix || "Fichier lié :"} <bdi dir="ltr" className="font-semibold text-white">{fileName}</bdi>, {t.lastSavedAt || "dernière sauvegarde à"} <bdi dir="ltr" className="font-semibold text-emerald-200">{lastSavedTime}</bdi>
                        </span>
                      </div>
                      <Button
                        type="button"
                        data-testid="unlink-file-btn"
                        onClick={onUnlinkFile}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-slate-400 hover:text-rose-400 text-xs shrink-0"
                      >
                        <Unlink className="h-3 w-3 mr-1" />
                        {t.unlinkFile || "Délier"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DIALOGUE DE CONFLIT LORS DE LA LIAISON D'UN FICHIER AVEC CLIENTS */}
          {pendingConflict && (
            <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 space-y-3 text-start animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    {t.conflictTitle || "Ce fichier contient déjà des clients"}
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                    {t.conflictDesc || "Le fichier sélectionné contient des fiches clients. Que souhaitez-vous faire ?"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  data-testid="conflict-load-btn"
                  onClick={() => onResolveConflict && onResolveConflict("load")}
                  size="sm"
                  className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold justify-start"
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  {t.conflictLoad || "Charger ces clients"}
                </Button>
                <Button
                  type="button"
                  data-testid="conflict-merge-btn"
                  onClick={() => onResolveConflict && onResolveConflict("merge")}
                  size="sm"
                  className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold justify-start"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {t.conflictMerge || "Fusionner"}
                </Button>
                <Button
                  type="button"
                  data-testid="conflict-overwrite-btn"
                  onClick={() => onResolveConflict && onResolveConflict("overwrite")}
                  size="sm"
                  variant="outline"
                  className="h-8 border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-white text-xs justify-start"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
                  {t.conflictOverwrite || "Écraser le fichier avec mes clients actuels"}
                </Button>
                <Button
                  type="button"
                  data-testid="conflict-cancel-btn"
                  onClick={onCancelConflict}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-slate-400 hover:text-white text-xs self-center"
                >
                  {t.adCancel || "Annuler"}
                </Button>
              </div>
            </div>
          )}

          {/* Actions globales Export / Import (uniquement en vue liste) */}
          {view === "list" && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                data-testid="clients-export-btn"
                onClick={onExport}
                disabled={clients.length === 0}
                size="sm"
                variant="outline"
                className="h-8 flex-1 border-[#282e42] bg-[#171b2b] text-slate-200 hover:bg-[#1f2638] hover:text-white disabled:opacity-40 text-xs"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                {t.exportBackup || "Exporter"}
              </Button>
              <Button
                data-testid="clients-import-btn"
                onClick={() => fileRef.current && fileRef.current.click()}
                size="sm"
                variant="outline"
                className="h-8 flex-1 border-[#282e42] bg-[#171b2b] text-slate-200 hover:bg-[#1f2638] hover:text-white text-xs"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                {t.importBackup || "Importer"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 p-6 space-y-4">
          {view === "form" ? (
            /* VUE FORMULAIRE (AJOUT / MODIFICATION) */
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#282e42]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-blue-400" />
                  {editingClient ? (t.editClient || "Modifier le client") : (t.newClient || "Nouveau client")}
                </h3>
                <Button
                  type="button"
                  onClick={() => setView("list")}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t.adCancel || "Annuler"}
                </Button>
              </div>

              {/* Nom du client (SEUL OBLIGATOIRE) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <span>{t.clientName || "Nom du client / Entreprise"}</span>
                  <span className="text-rose-400 font-bold">*</span>
                </Label>
                <Input
                  data-testid="client-form-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t.placeholderClientName || "Ex: SARL Dassawen Distribution"}
                  className={inputCls}
                  autoFocus
                />
              </div>

              {/* Adresse */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  {t.address || "Adresse"}
                </Label>
                <Textarea
                  data-testid="client-form-address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder={t.placeholderClientAddress || "Zone Industrielle, Oued Smar, Alger"}
                  rows={2}
                  className={inputCls}
                />
              </div>

              {/* Téléphone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    {t.phone || "Téléphone"}
                  </Label>
                  <Input
                    data-testid="client-form-phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="0550 00 00 00"
                    dir="ltr"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    {t.email || "Email"}
                  </Label>
                  <Input
                    data-testid="client-form-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="contact@client.dz"
                    dir="ltr"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Identifiants légaux algériens : NIF, NIS, RC, AI */}
              <div className="pt-2 border-t border-[#282e42]/60">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t.legalIdentifiersOptional || "Identifiants fiscaux & légaux (facultatifs)"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-300">NIF</Label>
                    <Input
                      data-testid="client-form-nif"
                      value={form.nif}
                      onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))}
                      placeholder="000000000000000"
                      dir="ltr"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-300">{t.nisLabel || "NIS"}</Label>
                    <Input
                      data-testid="client-form-nis"
                      value={form.nis}
                      onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))}
                      placeholder="0000000000"
                      dir="ltr"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-300">RC</Label>
                    <Input
                      data-testid="client-form-rc"
                      value={form.rc}
                      onChange={(e) => setForm((f) => ({ ...f, rc: e.target.value }))}
                      placeholder="16/00-0000000B00"
                      dir="ltr"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-300">AI</Label>
                    <Input
                      data-testid="client-form-ai"
                      value={form.ai}
                      onChange={(e) => setForm((f) => ({ ...f, ai: e.target.value }))}
                      placeholder="00000000000"
                      dir="ltr"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Boutons d'action du formulaire */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#282e42]">
                <Button
                  type="button"
                  onClick={() => setView("list")}
                  variant="outline"
                  size="sm"
                  className="border-[#282e42] bg-[#171b2b] text-slate-300 hover:bg-[#1f2638] text-xs"
                >
                  {t.adCancel || "Annuler"}
                </Button>
                <Button
                  type="submit"
                  data-testid="client-form-submit-btn"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {t.save || "Enregistrer"}
                </Button>
              </div>
            </form>
          ) : (
            /* VUE LISTE AVEC RECHERCHE EN DIRECT ET CARTES CLIENTS */
            <>
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  data-testid="clients-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.clientsSearchPlaceholder || "Rechercher par nom ou NIF..."}
                  className="pl-9 bg-[#101422] border-[#282e42] text-slate-100 placeholder:text-slate-500 text-xs h-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Liste des cartes ou état vide */}
              {clients.length === 0 ? (
                /* État vide carnet */
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#282e42] bg-[#141826]/40 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {t.clientsEmptyTitle || "Votre carnet est vide"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    {t.clientsEmptySubtitle ||
                      "Enregistrez vos clients pour remplir vos prochaines factures en un seul clic."}
                  </p>
                  <Button
                    data-testid="empty-add-client-btn"
                    onClick={handleOpenAddForm}
                    size="sm"
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.addFirstClient || "Ajouter un premier client"}</span>
                  </Button>
                </div>
              ) : filteredClients.length === 0 ? (
                /* Recherche infructueuse */
                <div className="py-10 text-center text-xs text-slate-400">
                  {t.noResults || "Aucun résultat trouvé pour votre recherche."}
                </div>
              ) : (
                /* Grille de cartes clients */
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      data-testid={`client-card-${client.id}`}
                      className="group rounded-xl border border-[#282e42] bg-[#141826] p-4 transition-all hover:border-blue-500/40 hover:bg-[#171c2e] space-y-3"
                    >
                      {/* En-tête de carte : Nom + Actions Modifier/Supprimer */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                            {client.name}
                          </h4>
                          {client.address && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                              <span className="line-clamp-1">{client.address}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            data-testid={`edit-client-${client.id}`}
                            onClick={() => handleOpenEditForm(client)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title={t.editClient || "Modifier"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-client-${client.id}`}
                            onClick={() => handleDeleteClient(client)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title={t.deleteItem || "Supprimer"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Coordonnées : Téléphone & Email */}
                      {(client.phone || client.email) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          {client.phone && (
                            <span className="flex items-center gap-1" dir="ltr">
                              <Phone className="h-3 w-3 text-slate-500" />
                              <bdi dir="ltr">{client.phone}</bdi>
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1" dir="ltr">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <bdi dir="ltr">{client.email}</bdi>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Badges légaux : NIF, NIS, RC, AI (isolés en LTR) */}
                      {(client.nif || client.nis || client.rc || client.ai) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {client.nif && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#1f2638] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-[#2e374f]">
                              <span className="text-slate-500 font-semibold">NIF</span>
                              <bdi dir="ltr">{client.nif}</bdi>
                            </span>
                          )}
                          {client.nis && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#1f2638] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-[#2e374f]">
                              <span className="text-slate-500 font-semibold">NIS</span>
                              <bdi dir="ltr">{client.nis}</bdi>
                            </span>
                          )}
                          {client.rc && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#1f2638] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-[#2e374f]">
                              <span className="text-slate-500 font-semibold">RC</span>
                              <bdi dir="ltr">{client.rc}</bdi>
                            </span>
                          )}
                          {client.ai && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#1f2638] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-[#2e374f]">
                              <span className="text-slate-500 font-semibold">AI</span>
                              <bdi dir="ltr">{client.ai}</bdi>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action principale : Créer un document */}
                      <div className="pt-2 border-t border-[#282e42]/60">
                        <Button
                          data-testid={`create-doc-client-${client.id}`}
                          onClick={() => {
                            if (typeof onSelectClient === "function") {
                              onSelectClient(client);
                            }
                            onOpenChange(false);
                          }}
                          size="sm"
                          className="w-full h-8 bg-[#1a2133] hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <FilePlus2 className="h-3.5 w-3.5" />
                          <span>{t.createDocumentForClient || "Créer un document"}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER : BANDEAU D'INFORMATION PERSISTANT */}
        <div className="p-4 border-t border-[#282e42] bg-[#141826]">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-amber-200/90 text-xs leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="flex-1">
              {t.clientBackupBanner ||
                "Conseil important : vos données sont conservées en sécurité dans ce navigateur ou dans votre fichier lié. Si vous utilisez le stockage navigateur, ne supprimez pas les cookies et données du site sous peine d'effacer vos clients. Notez que le carnet sauvegarde uniquement vos CLIENTS (l'historique des factures s'exporte séparément depuis le panneau Historique)."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
