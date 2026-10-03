/**
 * @fileoverview Tiroir latéral (Sheet) pour la gestion du carnet clients Facturo.
 * Comprend la recherche en direct par nom et NIF, l'affichage des fiches avec badges légaux,
 * les actions d'injection par copie, d'édition, de suppression, d'import/export JSON,
 * ainsi que le bandeau d'avertissement sur la persistance locale des données.
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
 */
export default function ClientsDrawer({
  open,
  onOpenChange,
  clients = [],
  t,
  dir = "ltr",
  lang = "fr",
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onExport,
  onImport,
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

  // Ouverture du formulaire pour ajout
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

  // Ouverture du formulaire pour modification
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

  // Sauvegarde du formulaire (ajout ou mise à jour)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error(t.clientNameRequired || "Le nom du client est obligatoire.");
      return;
    }

    if (editingClient) {
      const updated = onUpdateClient(editingClient.id, {
        ...form,
        name: trimmedName,
      });
      if (updated) {
        toast.success(t.clientUpdated || "Client mis à jour");
        setView("list");
      }
    } else {
      const created = onAddClient({
        ...form,
        name: trimmedName,
      });
      if (created) {
        toast.success(t.clientSavedToBook || "Client enregistré dans votre carnet");
        setView("list");
      }
    }
  };

  // Gestion du fichier d'import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && typeof onImport === "function") {
      onImport(file);
    }
    e.target.value = "";
  };

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        dir={dir}
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
                  className="h-7 text-xs text-slate-400 hover:text-white"
                >
                  <BackIcon className="h-3.5 w-3.5 mr-1" />
                  {t.adCancel || "Annuler"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">
                  {t.clientName || "Nom du client / Entreprise"} <span className="text-red-400">*</span>
                </Label>
                <Input
                  data-testid="client-form-name"
                  className={inputCls}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: SARL Batimatec"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">{t.address || "Adresse"}</Label>
                <Textarea
                  data-testid="client-form-address"
                  className={inputCls}
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ex: 12 Rue Didouche Mourad, Alger"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.phone || "Téléphone"}</Label>
                  <Input
                    data-testid="client-form-phone"
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Ex: 0550 12 34 56"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.email || "Email"}</Label>
                  <Input
                    data-testid="client-form-email"
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ex: contact@client.dz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.clientNif || "NIF (optionnel)"}</Label>
                  <Input
                    data-testid="client-form-nif"
                    className={inputCls}
                    value={form.nif}
                    onChange={(e) => setForm({ ...form, nif: e.target.value })}
                    placeholder="000116..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.clientNis || "NIS (optionnel)"}</Label>
                  <Input
                    data-testid="client-form-nis"
                    className={inputCls}
                    value={form.nis}
                    onChange={(e) => setForm({ ...form, nis: e.target.value })}
                    placeholder="123456..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.clientRc || "RC (optionnel)"}</Label>
                  <Input
                    data-testid="client-form-rc"
                    className={inputCls}
                    value={form.rc}
                    onChange={(e) => setForm({ ...form, rc: e.target.value })}
                    placeholder="16/00-..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">{t.clientAi || "AI (optionnel)"}</Label>
                  <Input
                    data-testid="client-form-ai"
                    className={inputCls}
                    value={form.ai}
                    onChange={(e) => setForm({ ...form, ai: e.target.value })}
                    placeholder="1601..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#282e42]">
                <Button
                  type="button"
                  onClick={() => setView("list")}
                  variant="outline"
                  className="border-[#282e42] bg-transparent text-slate-300 hover:bg-[#1f2638] text-xs h-9"
                >
                  {t.adCancel || "Annuler"}
                </Button>
                <Button
                  type="submit"
                  data-testid="submit-client-form-btn"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 font-medium flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{t.save || "Enregistrer"}</span>
                </Button>
              </div>
            </form>
          ) : (
            /* VUE LISTE ET RECHERCHE */
            <>
              {/* Barre de recherche en direct */}
              {clients.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 rtl:right-3 rtl:left-auto" />
                  <Input
                    data-testid="clients-search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.clientsSearchPlaceholder || "Rechercher par nom ou NIF..."}
                    className={`h-9 bg-[#141826] border-[#282e42] text-xs text-slate-200 placeholder:text-slate-500 ${
                      dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white rtl:left-2.5 rtl:right-auto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* LISTE DES CARTES CLIENTS */}
              {clients.length === 0 ? (
                /* ÉTAT VIDE ACCUEILLANT */
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#282e42] bg-[#141826]/40">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-3 ring-1 ring-blue-500/20">
                    <Users className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {t.clientsEmptyTitle || "Votre carnet est vide"}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
                    {t.clientsEmptySubtitle ||
                      "Enregistrez vos clients pour remplir vos prochaines factures en un seul clic."}
                  </p>
                  <Button
                    data-testid="empty-add-client-btn"
                    onClick={handleOpenAddForm}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t.addFirstClient || "Ajouter un premier client"}</span>
                  </Button>
                </div>
              ) : filteredClients.length === 0 ? (
                /* AUCUN RÉSULTAT DE RECHERCHE */
                <div className="py-8 text-center text-xs text-slate-400">
                  {t.noResults || "Aucun résultat."}
                </div>
              ) : (
                /* CARTES CLIENTS */
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      data-testid={`client-card-${client.id}`}
                      className="rounded-xl border border-[#282e42] bg-[#141826] p-4 transition-all hover:border-[#38425d] space-y-3"
                    >
                      {/* En-tête de carte */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            {client.name}
                          </h4>
                          {client.address && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                              <span>{client.address}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            data-testid={`edit-client-${client.id}`}
                            onClick={() => handleOpenEditForm(client)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-[#1f2638]"
                            title={t.editClient || "Modifier"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            data-testid={`delete-client-${client.id}`}
                            onClick={() => onDeleteClient(client.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title={t.deleteItem || "Supprimer"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Coordonnées Téléphone / Email */}
                      {(client.phone || client.email) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-500" />
                              <bdi dir="ltr">{client.phone}</bdi>
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span>{client.email}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Badges légaux : NIF, NIS, RC, AI */}
                      {(client.nif || client.nis || client.rc || client.ai) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {client.nif && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-500/30">
                              <span>NIF:</span>
                              <bdi dir="ltr">{client.nif}</bdi>
                            </span>
                          )}
                          {client.nis && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                              <span>NIS:</span>
                              <bdi dir="ltr">{client.nis}</bdi>
                            </span>
                          )}
                          {client.rc && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
                              <span>RC:</span>
                              <bdi dir="ltr">{client.rc}</bdi>
                            </span>
                          )}
                          {client.ai && (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/30">
                              <span>AI:</span>
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
                "Conseil important : vos données sont conservées dans ce navigateur. Ne supprimez pas les cookies et données de navigation de ce site, sous peine d'effacer vos clients et factures. Le bouton Exporter ci-dessus sauvegarde uniquement vos clients (l'historique de vos factures s'exporte séparément depuis le panneau Historique)."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
