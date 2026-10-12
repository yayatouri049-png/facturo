import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  FileText,
  Database,
  ExternalLink,
  Info,
  DollarSign,
  Printer,
  Sparkles,
} from "lucide-react";

export default function GuideModal({ open, onOpenChange, t, dir = "ltr", lang = "fr" }) {
  const [activeTab, setActiveTab] = useState("quickstart");

  const isRtl = dir === "rtl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        data-testid="guide-modal-dialog"
        className="border-[#282e42] bg-[#141826] text-slate-200 sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl"
      >
        {/* En-tête */}
        <DialogHeader className="p-6 pb-4 border-b border-[#1e2333] bg-[#0f1320] text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/40 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                {t.guideTitle || "Guide d'utilisation & Bonnes pratiques"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                {t.guideSubtitle || "Maîtrisez la facturation professionnelle, la sécurité de vos données et les fonctionnalités de Facturo."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Corps avec onglets */}
        <div className="flex-1 overflow-y-auto ff-scroll p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full bg-[#0b0e17] border border-[#23283a] p-1 rounded-xl mb-6">
              <TabsTrigger
                value="quickstart"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-xs py-2 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.tabQuickstart || "Démarrage rapide"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="legal"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-xs py-2 gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{t.tabLegal || "Mentions légales"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-xs py-2 gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.tabSecurity || "Sécurité & Stockage"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-xs py-2 gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{t.tabFaq || "FAQ & Astuces"}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DÉMARRAGE RAPIDE */}
            <TabsContent value="quickstart" className="space-y-4 focus-visible:outline-none">
              <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 text-xs text-violet-200 flex items-start gap-3">
                <Info className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">
                    {lang === "ar"
                      ? "كيفية إنشاء فاتورة في 5 خطوات بسيطة :"
                      : lang === "en"
                      ? "How to create an invoice in 5 simple steps:"
                      : "Créer une facture professionnelle en 5 étapes simples :"}
                  </strong>
                  <span>
                    {lang === "ar"
                      ? "كل تعديل تجريه على النموذج في اليسار ينعكس فورًا وبدقة على المعاينة المباشرة بحجم A4 على اليمين."
                      : lang === "en"
                      ? "Every change you make on the left form is instantly updated in real-time on the A4 preview on the right."
                      : "Toute modification saisie dans le formulaire de gauche s'affiche instantanément sur la prévisualisation A4 en temps réel à droite."}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Étape 1 */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 font-bold text-sm">
                    1
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-semibold text-white">
                      {lang === "ar" ? "ملف المصدِر (شركتك)" : lang === "en" ? "Company Profile (Issuer)" : "Votre entreprise (Émetteur)"}
                    </h4>
                    <p className="text-slate-400">
                      {lang === "ar"
                        ? "أضف شعارك، اسم مؤسستك، عنوانك ومعلوماتك القانونية (NIF، NIS، RC، AI). تُحفظ هذه البيانات تلقائيًا للاستخدام المستقبلي."
                        : lang === "en"
                        ? "Add your logo, company name, address, and legal IDs (Tax ID, Trade Register). Automatically saved for future invoices."
                        : "Téléversez votre logo, renseignez vos coordonnées et vos mentions fiscales (NIF, NIS, RC, AI). Sauvegardé automatiquement."}
                    </p>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 font-bold text-sm">
                    2
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-semibold text-white">
                      {lang === "ar" ? "معلومات العميل" : lang === "en" ? "Client Information" : "Coordonnées du client"}
                    </h4>
                    <p className="text-slate-400">
                      {lang === "ar"
                        ? "أدخل بيانات العميل أو اختره مباشرة من دفتر العملاء بنقرة واحدة. يمكنك أيضًا حفظ أي عميل جديد في دفترك."
                        : lang === "en"
                        ? "Fill in recipient details or select directly from your Client Book in one click. You can also save new clients on the fly."
                        : "Saisissez les informations du client ou chargez-le depuis votre carnet en 1 clic. Vous pouvez enregistrer tout nouveau client."}
                    </p>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-sm">
                    3
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-semibold text-white">
                      {lang === "ar" ? "نوع الوثيقة والتفاصيل" : lang === "en" ? "Document Type & Details" : "Type de document & Numérotation"}
                    </h4>
                    <p className="text-slate-400">
                      {lang === "ar"
                        ? "اختر نوع المستند (فاتورة، عرض أسعار، طلبية، إشعار دائن)، حدد رقم المستند المتسلسل، وتواريخ الإصدار والاستحقاق."
                        : lang === "en"
                        ? "Select document type (Invoice, Quote, Purchase Order, Credit Note), set sequential number, issue and due dates."
                        : "Sélectionnez le type (Facture, Devis, Bon de commande, Avoir), définissez le numéro séquentiel et les dates d'émission/échéance."}
                    </p>
                  </div>
                </div>

                {/* Étape 4 */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 font-bold text-sm">
                    4
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-semibold text-white">
                      {lang === "ar" ? "المنتجات، الضرائب والدفع" : lang === "en" ? "Items, Taxes & Payment" : "Articles, TVA & Règlement"}
                    </h4>
                    <p className="text-slate-400">
                      {lang === "ar"
                        ? "أضف بنود الخدمات والسلع، حدد الكميات والأسعار، نسبة الخصم والضريبة. يدعم التطبيق الدفعة المقدمة والمبلغ المتبقي."
                        : lang === "en"
                        ? "Add service lines, set quantities, unit prices, discounts and VAT. Supports deposit/down payment and remaining balance."
                        : "Ajoutez vos prestations, quantités, prix unitaires, remises et TVA. Renseignez l'acompte et le RIB/IBAN pour le règlement."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 5 - Pleine largeur */}
              <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-600/20 text-pink-400 font-bold text-sm">
                  5
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">
                    {lang === "ar" ? "التخصيص، التصدير والطباعة" : lang === "en" ? "Theme, Export & Print" : "Choix du modèle & Exportation"}
                  </h4>
                  <p className="text-slate-400">
                    {lang === "ar"
                      ? "اختر من بين 4 نماذج ألوان أنيقة (البنفسجي الملكي، الأزرق، الزمردي، الأسود والذهبي). حمّل فاتورتك بصيغة PDF عالية الجودة أو اطبعها فورًا."
                      : lang === "en"
                      ? "Pick from 4 elegant themes (Royal Violet, Ocean Blue, Emerald, Black & Gold). Download high-res PDF or print natively on A4."
                      : "Choisissez parmi 4 modèles visuels (Violet Royal, Bleu Océan, Émeraude, Noir & Or). Téléchargez votre PDF comptable ou imprimez directement."}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: MENTIONS LÉGALES & CONFORMITÉ */}
            <TabsContent value="legal" className="space-y-4 focus-visible:outline-none">
              <div className="text-xs text-slate-300 leading-relaxed bg-[#0f1320] border border-[#23283a] p-4 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {lang === "ar"
                    ? "البيانات القانونية الواجب توفرها في الفاتورة التجارية"
                    : lang === "en"
                    ? "Mandatory Legal Requirements on Commercial Invoices"
                    : "Les mentions obligatoires pour une facture conforme"}
                </h4>
                <p className="text-slate-400 mb-3">
                  {lang === "ar"
                    ? "وفقًا للتشريعات التجارية والجبائية، لكي تكون الفاتورة صحيحة ومقبولة قانونيًا ومحاسبيًا، يجب أن تتضمن العناصر التالية التي يوفرها Facturo تلقائيًا :"
                    : lang === "en"
                    ? "In accordance with commercial and tax regulations, for an invoice to be compliant and legally valid, it must include the following elements:"
                    : "Selon les réglementations comptables et fiscales (Algérie et international), une facture doit comporter les mentions obligatoires ci-dessous :"}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "1. هوية البائع (المُصدِر)" : lang === "en" ? "1. Seller / Issuer Identity" : "1. Identité complète du vendeur"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "الاسم أو التسمية التجارية، العنوان القانوني، الشكل القانوني (SARL, EURL...) ورأس المال، ورقم الهاتف والبريد."
                          : lang === "en"
                          ? "Legal name, registered address, legal structure (SARL, LLC, Corp) and share capital, phone & email."
                          : "Raison sociale, adresse du siège, forme juridique (SARL, EURL, SPA...) et capital social, téléphone et email."}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "2. المعرفات الجبائية والتجارية" : lang === "en" ? "2. Tax & Commercial IDs" : "2. Identifiants fiscaux & fiscaux algériens"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "رقم التعريف الجبائي (NIF)، رقم التعريف الإحصائي (NIS)، السجل التجاري (RC)، ورقم المادة الضريبية (AI)."
                          : lang === "en"
                          ? "Tax Identification Number (NIF/TIN), Statistical ID (NIS), Commercial Register (RC), and Tax Assessment Article (AI)."
                          : "Numéro d'Identification Fiscale (NIF), Numéro Statistique (NIS), Registre de Commerce (RC) et Article d'Imposition (AI)."}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "3. هوية المشتري (العميل)" : lang === "en" ? "3. Buyer / Client Identity" : "3. Coordonnées précises du client"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "الاسم الكامل أو اسم المؤسسة، العنوان الجغرافي، والمعرفات الجبائية إذا كان العميل شركة."
                          : lang === "en"
                          ? "Full name or corporate name, address, and client tax identifiers (NIF/NIS/RC) when applicable."
                          : "Nom ou raison sociale, adresse de facturation et identifiants fiscaux (NIF, NIS, RC) si entreprise."}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "4. التسلسل الزمني والرقم التسلسلي" : lang === "en" ? "4. Chronology & Invoice Number" : "4. Numérotation continue & Dates"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "رقم تسلسلي فريد متواصل زمنيًا دون فراغات، تاريخ تحرير الفاتورة، وتاريخ الاستحقاق أو أجل الدفع."
                          : lang === "en"
                          ? "Unique sequential numbering without gaps, date of issue, and payment due date."
                          : "Numéro séquentiel unique basé sur une série ininterrompue, date d'émission et date d'échéance."}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "5. التفصيل المالي والمبلغ بالحروف" : lang === "en" ? "5. Financial Breakdown & Words" : "5. Ventilation financière & Montant en lettres"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "المبلغ الإجمالي خارج الضريبة (HT)، تفصيل الرسم على القيمة المضافة (TVA)، والمبلغ الإجمالي بكل الرسوم (TTC) مع كتابة المبلغ بالأحرف كاملة."
                          : lang === "en"
                          ? "Subtotal before tax, applicable VAT rates and amounts, Total TTC, and amount in words written automatically."
                          : "Total HT, taux et montant de TVA, Total TTC, acompte, et mention manuscrite/automatique de la somme arrêtée en toutes lettres."}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141826] border border-[#282e42]">
                      <strong className="text-white block font-medium">
                        {lang === "ar" ? "6. الختم، الإمضاء وحالة الدفع" : lang === "en" ? "6. Stamp, Signature & Status" : "6. Cachet, Signature & Statut"}
                      </strong>
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "مربع مخصص لختم المؤسسة وتوقيع المفوض، مع ختم حالة الدفع (مدفوعة، قيد الانتظار، ملغاة)."
                          : lang === "en"
                          ? "Dedicated space for company stamp and signature, with optional status badge (Paid, Pending, Cancelled)."
                          : "Emplacement réservé au cachet et signature de l'émetteur, tampon de statut de paiement optionnel."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: SÉCURITÉ & STOCKAGE DES DONNÉES */}
            <TabsContent value="security" className="space-y-4 focus-visible:outline-none">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">
                    {lang === "ar"
                      ? "خصوصية تامة 100% : لا خوادم، لا تتبع لمعاملاتك"
                      : lang === "en"
                      ? "100% Client-Side Privacy: Zero Server Storage"
                      : "Architecture 100% locale : Zéro stockage sur serveur"}
                  </strong>
                  <span>
                    {lang === "ar"
                      ? "تطبيق Facturo يعمل بالكامل داخل متصفحك. فواتيرك، أسماء عملائك، أسعارك وأرقام معاملاتك لا تُرسل أبدًا إلى أي خادم خارجي."
                      : lang === "en"
                      ? "Facturo runs entirely in your local browser. Your invoices, client identities, prices, and turnovers are never sent to external servers."
                      : "Facturo fonctionne entièrement dans votre navigateur. Vos factures, clients, tarifs et chiffres d'affaires ne sont JAMAIS transmis à un serveur tiers."}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Database className="h-4 w-4 text-blue-400" />
                    <h4>{lang === "ar" ? "1. التخزين المحلي في المتصفح" : lang === "en" ? "1. Browser Local Storage" : "1. Stockage local (LocalStorage / IndexedDB)"}</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === "ar"
                      ? "يتم حفظ ملف شركتك، آخر فاتورة محررة، وسجل الفواتير تلقائيًا في ذاكرة المتصفح المخصصة. عند إعادة فتح الموقع، تجد كل شيء كما تركته."
                      : lang === "en"
                      ? "Your company profile, current invoice, and history are preserved in your browser's local sandbox. When reopening Facturo, everything is intact."
                      : "Vos paramètres, dernière facture et historique sont enregistrés dans le stockage isolé de votre navigateur. En réouvrant Facturo, vous retrouvez tout instantanément."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <FileText className="h-4 w-4 text-amber-400" />
                    <h4>{lang === "ar" ? "2. المزامنة بملف محلي (JSON)" : lang === "en" ? "2. Local File Link (JSON)" : "2. Mode Fichier Lié (clients.json)"}</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === "ar"
                      ? "يوفر دفتر العملاء ميزة ربط ملف محلي على قرصك الصلب عبر تقنية File System API، بحيث تُحفظ التعديلات مباشرة على جهازك دون خوف من مسح ذاكرة التخزين المؤقت."
                      : lang === "en"
                      ? "The Client Book supports linking a real JSON file on your hard drive via the File System API, mirroring your clients directly to disk."
                      : "Le carnet de clients permet de lier un fichier réel sur votre disque dur via la File System API, garantissant une synchronisation directe à l'abri du vidage de cache."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-violet-400" />
                    <h4>{lang === "ar" ? "3. التصدير والاستيراد (Backups)" : lang === "en" ? "3. Export & Import Backups" : "3. Sauvegardes & Restauration JSON"}</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === "ar"
                      ? "يمكنك في أي لحظة تنزيل نسخة احتياطية كاملة لدفتر العملاء أو لسجل الفواتير بصيغة JSON، واسترجاعها على أي جهاز كمبيوتر أو متصفح آخر."
                      : lang === "en"
                      ? "At any time, you can export a complete JSON backup of your Client Book and Invoice History, and import it into another device or browser."
                      : "Téléchargez à tout moment une sauvegarde JSON complète de votre carnet clients et de votre historique, et réimportez-la sur n'importe quel ordinateur."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <h4>{lang === "ar" ? "4. إعادة التعيين الآمنة" : lang === "en" ? "4. Safe Profile Reset" : "4. Réinitialisation sécurisée"}</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === "ar"
                      ? "زر «إعادة تعيين الملف» يمسح فقط معلومات البائع إذا أردت إدخال مؤسسة جديدة، ولا يمسح أبدًا فواتيرك السابقة أو قائمة عملائك."
                      : lang === "en"
                      ? "The 'Reset Profile' button clears only company issuer details without touching your client records or saved invoice history."
                      : "Le bouton « Réinitialiser le profil » efface uniquement les coordonnées de l'émetteur sans jamais supprimer vos clients ni votre historique."}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: FAQ & QUESTIONS CLÉS */}
            <TabsContent value="faq" className="space-y-3 focus-visible:outline-none">
              <div className="space-y-2.5 text-xs">
                {/* Q1: Différence entre Devis, Bon de commande, Facture et Avoir */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-3.5">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    {lang === "ar"
                      ? "ما الفرق بين عرض الأسعار (Devis)، سند الطلبية (Bon de commande)، الفاتورة (Facture) وإشعار الدائن (Avoir) ؟"
                      : lang === "en"
                      ? "What is the difference between a quote, purchase order, invoice, and credit note on Facturo?"
                      : "Quelle est la différence entre un devis, un bon de commande, une facture et un avoir sur Facturo ?"}
                  </h4>
                  <p className="text-slate-400 pl-6 rtl:pr-6 rtl:pl-0 leading-relaxed">
                    {lang === "ar"
                      ? "يغطي Facturo الدورة التجارية بأكملها: (1) عرض الأسعار يحدد التقدير المالي الأولي للعميل؛ (2) سند الطلبية يثبت موافقة العميل الرسمية وبدء التنفيذ؛ (3) الفاتورة هي الوثيقة المحاسبية الإلزامية التي تجعل الدفع مستحقًا وتُستخدم في التصريح الضريبي؛ (4) إشعار الدائن يلغي أو يخفض فاتورة سابقة قانونيًا دون مخالفة التسلسل الزمني."
                      : lang === "en"
                      ? "Facturo covers the complete commercial cycle: (1) Quote (Devis) provides pre-sale pricing estimates; (2) Purchase Order (BC) confirms formal order agreement; (3) Invoice (Facture) establishes legal debt and accounting proof; (4) Credit Note (Avoir) legally rectifies or cancels an existing invoice."
                      : "Ces quatre documents jalonnent le cycle de vente : (1) Le Devis chiffre la proposition avant accord ; (2) Le Bon de commande formalise l'engagement ferme d'achat du client ; (3) La Facture constate la vente et rend le paiement légalement exigible ; (4) L'Avoir rectifie ou annule une facture émise (annulation, retour marchandise ou rabais) en conformité stricte avec la comptabilité."}
                  </p>
                </div>

                {/* Q2: Utilité d'un avoir et édition */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-3.5">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    {lang === "ar"
                      ? "إلى ماذا يصلح إشعار الدائن (Avoir) وكيف يتم تحريره ؟"
                      : lang === "en"
                      ? "What is a credit note (avoir) used for and how do you create one?"
                      : "À quoi sert un avoir et comment en éditer un ?"}
                  </h4>
                  <p className="text-slate-400 pl-6 rtl:pr-6 rtl:pl-0 leading-relaxed">
                    {lang === "ar"
                      ? "القوانين الجبائية تمنع حذف الفواتير الصادرة. إذا حدث خطأ في المبلغ أو تم إرجاع سلع، يجب إصدار «فاتورة إشعار دائن». في Facturo، اختر نوع المستند «إشعار دائن (Avoir)» من أعلى النموذج، وسيتغير المسمى وتنسيق الوثيقة تلقائيًا ليتوافق مع المعايير المحاسبية."
                      : lang === "en"
                      ? "Tax regulations prohibit deleting issued invoices. If a billing error occurs or goods are returned, you must issue a Credit Note (Avoir). On Facturo, select 'Avoir' from the Document Type selector: layout and legal wording adjust automatically."
                      : "La loi fiscale interdit la suppression pure et simple d'une facture déjà émise et numérotée. L'Avoir permet de corriger un trop-perçu, enregistrer un retour de marchandise ou accorder une remise a posteriori. Dans Facturo, sélectionnez simplement « Avoir » dans le champ Type de document : le titre et la présentation s'adaptent automatiquement."}
                  </p>
                </div>

                {/* Q3: Stockage local et IndexedDB */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-3.5">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    {lang === "ar"
                      ? "كيف يعمل التخزين المحلي للبيانات (IndexedDB) لضمان الخصوصية التامة ؟"
                      : lang === "en"
                      ? "How does local storage (IndexedDB) guarantee absolute data privacy?"
                      : "Comment fonctionne le stockage local des données (IndexedDB) pour garantir la confidentialité ?"}
                  </h4>
                  <p className="text-slate-400 pl-6 rtl:pr-6 rtl:pl-0 leading-relaxed">
                    {lang === "ar"
                      ? "Facturo يعمل بنسبة 100% داخل متصفح جهازك. تُخزن بيانات شركتك، فواتيرك، وقائمة عملائك في التخزين المحلي المشفر للمتصفح (LocalStorage وIndexedDB). لا يتم رفع أي معلومة تجارية إلى خوادمنا، مما يضمن سرية مالية مطلقة بدون أي احتمال للتسريب."
                      : lang === "en"
                      ? "Facturo executes entirely in your browser sandbox. Company profiles, client lists, and invoice drafts reside strictly in local browser databases (LocalStorage & IndexedDB). Zero financial data is sent to external servers, providing unmatched confidentiality."
                      : "Facturo fonctionne entièrement côté client (100% Client-Side). Vos fiches clients, articles et montants sont mémorisés dans l'environnement isolé de votre navigateur (LocalStorage & IndexedDB). Aucune information ne transite par nos serveurs, vous garantissant un secret commercial absolu."}
                  </p>
                </div>

                {/* Q4: Sauvegardes JSON */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-3.5">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    {lang === "ar"
                      ? "كيف أحفظ أو أسترجع مستنداتي ودفتر عملائي بصيغة JSON ؟"
                      : lang === "en"
                      ? "How do I backup or restore my documents and clients in JSON format?"
                      : "Comment sauvegarder ou restaurer ses documents au format JSON ?"}
                  </h4>
                  <p className="text-slate-400 pl-6 rtl:pr-6 rtl:pl-0 leading-relaxed">
                    {lang === "ar"
                      ? "من خلال زر «تصدير» في دفتر العملاء أو سجل الفواتير، يمكنك تنزيل ملف JSON يحتوي على نسخة احتياطية كاملة. لاسترجاع البيانات على حاسوب آخر أو بعد مسح الذاكرة، اضغط على «استيراد» وحدد الملف؛ وسيقوم Facturo بدمج المعطيات بسلاسة."
                      : lang === "en"
                      ? "Click 'Export' in the Client Book or History panel to download a timestamped JSON backup file. To restore or migrate to another device, click 'Import': Facturo safely merges records without duplicates."
                      : "Dans le panneau « Historique » ou « Carnet clients », cliquez sur « Exporter » pour télécharger une sauvegarde JSON horodatée. Pour restaurer vos données sur une nouvelle machine, cliquez sur « Importer » : Facturo fusionne vos fiches sans doublons."}
                  </p>
                </div>

                {/* Q5: Mentions légales obligatoires */}
                <div className="rounded-xl border border-[#23283a] bg-[#0f1320] p-3.5">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    {lang === "ar"
                      ? "ما هي البيانات القانونية الإلزامية التي يجب احترامها في الوثائق التجارية ؟"
                      : lang === "en"
                      ? "What are the mandatory legal requirements for commercial documents?"
                      : "Quelles sont les mentions légales obligatoires à respecter sur ses documents commerciaux ?"}
                  </h4>
                  <p className="text-slate-400 pl-6 rtl:pr-6 rtl:pl-0 leading-relaxed">
                    {lang === "ar"
                      ? "تشمل البيانات الإلزامية: هوية البائع (الاسم، العنوان، الشكل القانوني ورأس المال)، المعرفات الجبائية (NIF، NIS، RC، AI)، هوية العميل، تاريخ الإصدار والاستحقاق، رقم تسلسلي متواصل، تفصيل المبالغ (HT، TVA، TTC)، كتابة المبلغ بالحروف، وختم وتوقيع المؤسسة."
                      : lang === "en"
                      ? "Mandatory mentions include: Seller details (name, address, corporate structure, share capital), legal tax IDs (Tax ID/NIF, Statistical ID/NIS, Commercial Register/RC, AI), buyer identity, sequential number, issue/due dates, HT/VAT/TTC breakdown, amount in words, and signature block."
                      : "Un document commercial légal doit comporter : les coordonnées complètes du vendeur (raison sociale, siège, forme juridique, capital), les identifiants fiscaux légaux (NIF, NIS, RC, AI en Algérie), l'identité du client, la numérotation séquentielle continue, la date d'émission et d'échéance, la ventilation HT/TVA/TTC, le montant en toutes lettres et le bloc cachet/signature."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pied de dialogue avec liens utiles */}
        <div className="p-4 border-t border-[#1e2333] bg-[#0f1320] flex flex-wrap items-center justify-between gap-3">
          <a
            href="/guide.html"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="guide-open-full-page-link"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t.guideOpenFullPage || "Consulter le guide complet (version web détaillée)"}</span>
          </a>

          <Button
            type="button"
            data-testid="guide-modal-close-button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="h-8 border-[#282e42] bg-[#141826] text-slate-200 hover:text-white hover:bg-[#1f2538] text-xs px-4"
          >
            {t.guideClose || "Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
