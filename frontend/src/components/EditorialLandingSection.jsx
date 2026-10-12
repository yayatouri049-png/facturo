import React, { useState } from "react";
import {
  FileText,
  FileCheck2,
  Receipt,
  FileDiff,
  BookOpen,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Download,
  Users,
  Sparkles,
  ArrowRight,
  Calculator,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorialLandingSection({
  t,
  lang = "fr",
  dir = "ltr",
  onOpenGuide,
}) {
  const [openFaq, setOpenFaq] = useState({
    0: true, // Première question ouverte par défaut
  });

  const toggleFaq = (index) => {
    setOpenFaq((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isAr = lang === "ar";
  const isEn = lang === "en";

  // Documents commerciaux
  const commercialDocuments = [
    {
      id: "devis",
      icon: FileCheck2,
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      title: isAr ? "عرض الأسعار (Devis)" : isEn ? "Commercial Quote / Estimate" : "Le Devis commercial",
      role: isAr ? "مرحلة ما قبل البيع والاتفاق الأولي" : isEn ? "Pre-sales & Initial Agreement" : "Phase d'avant-vente & Accord initial",
      desc: isAr
        ? "تقدير مالي مفصل للسلع أو الخدمات قبل بدء العمل. يحدد الأسعار والشروط بوضوح، ويتحول إلى التزام تعاقدي ملزم بمجرد توقيعه من العميل مع عبارة «موافق»."
        : isEn
        ? "A detailed financial estimate of products or services before project start. Defines prices and conditions, turning into a binding contract once signed by the client."
        : "Estimation chiffrée et détaillée des prestations ou biens avant commande. Il fixe les tarifs et conditions de vente, devenant un contrat ferme dès lors qu'il est signé avec la mention « Bon pour accord ».",
    },
    {
      id: "bonDeCommande",
      icon: Receipt,
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      title: isAr ? "سند الطلبية (Bon de commande)" : isEn ? "Purchase Order (PO)" : "Le Bon de commande",
      role: isAr ? "تأكيد الشراء والالتزام الرسمي" : isEn ? "Purchase Confirmation & Order Commitment" : "Validation d'achat & Engagement réciproque",
      desc: isAr
        ? "وثيقة رسمية يوافق العميل من خلالها على الشراء الفعلي للبنود والكميات والأسعار المحددة. تسمح ببدء التصنيع أو تسليم المنتجات بثقة وأمان قانوني."
        : isEn
        ? "Official document where the client formally commits to buying specified items, quantities, and prices. Authorizes delivery or service execution."
        : "Document officiel formalisant l'accord irrévocable du client pour l'achat de prestations ou marchandises selon les termes convenus, avant facturation définitive.",
    },
    {
      id: "facture",
      icon: FileText,
      badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
      title: isAr ? "الفاتورة القانونية (Facture)" : isEn ? "Commercial & Legal Invoice" : "La Facture légale",
      role: isAr ? "سند الاستحقاق المالي والمحاسبي" : isEn ? "Proof of Debt & Accounting Document" : "Titre exécutoire de paiement & Pièce comptable",
      desc: isAr
        ? "الوثيقة الجبائية والمحاسبية الإلزامية التي تثبت تسليم الخدمة أو السلعة وتجعل دفع المبلغ مستحقًا قانونيًا. ضرورية للتصريحات الضريبية وحساب TVA."
        : isEn
        ? "The primary accounting document establishing formal proof of debt after delivery. Mandatory for tax reporting, VAT claims, and revenue justification."
        : "Pièce maîtresse de la comptabilité constatant la créance et rendant le paiement exigible. Obligatoire pour la justification du chiffre d'affaires et la déclaration de TVA.",
    },
    {
      id: "avoir",
      icon: FileDiff,
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      title: isAr ? "فاتورة إشعار دائن (Avoir)" : isEn ? "Credit Note / Refund (Avoir)" : "La Facture d'avoir",
      role: isAr ? "تصحيح الفواتير وإرجاع المبالغ" : isEn ? "Invoice Correction & Credit" : "Rectification légale, retour ou remise a posteriori",
      desc: isAr
        ? "فاتورة تصحيحية تلغي جزئيًا أو كليًا فاتورة محررة سابقًا (في حال إرجاع بضاعة، خطأ تسعير، أو خصم لاحق). تضمن تسوية محاسبية قانونية دون حذف الفاتورة الأصلية."
        : isEn
        ? "A corrective invoice that partially or totally cancels a previously issued invoice (goods returned, billing error, rebate). Ensures legal accounting balance."
        : "Document comptable rectificatif indispensable pour annuler ou réduire une facture déjà émise (retour marchandise, erreur de montant, remise commerciale), dans le respect strict des règles fiscales.",
    },
  ];

  // FAQ spécifique
  const faqItems = [
    {
      q: isAr
        ? "ما الفرق بين عرض الأسعار، سند الطلبية، الفاتورة وإشعار الدائن على Facturo ؟"
        : isEn
        ? "What is the difference between a quote, purchase order, invoice, and credit note on Facturo?"
        : "Quelle est la différence entre un devis, un bon de commande, une facture et un avoir sur Facturo ?",
      a: isAr
        ? "لكل وثيقة دور زمني وقانوني محدد: عرض الأسعار (Devis) هو اقتراح أولي لتقدير التكلفة قبل الموافقة. سند الطلبية (Bon de commande) يؤكد طلب الشراء وبدء التنفيذ. الفاتورة (Facture) هي الوثيقة الرسمية الملزمة التي تلزم العميل بالدفع وتدخل في السجلات المحاسبية. وأخيرًا، إشعار الدائن (Avoir) يُستخدم لتعديل أو إلغاء فاتورة سابقة قانونيًا في حال التراجع أو التخفيض."
        : isEn
        ? "Each document follows the commercial lifecycle: A Quote (Devis) is an initial price proposal. A Purchase Order (Bon de commande) confirms the buyer's formal agreement. An Invoice (Facture) is the legally binding document that makes payment due. Finally, a Credit Note (Avoir) rectifies or cancels an existing invoice in case of returns or refunds."
        : "Ces quatre documents structurent le cycle commercial : le Devis estime le coût avant accord ; le Bon de commande matérialise l'ordre d'achat ferme du client ; la Facture constate la vente et rend le paiement exigible aux yeux de la loi et de la comptabilité ; et l'Avoir corrige ou annule une facture émise (annulation, retour, rabais) sans jamais enfreindre la chronologie comptable.",
    },
    {
      q: isAr
        ? "ما هي فائدة الفاتورة التصحيحية (Avoir) وكيف يتم تحريرها في التطبيق ؟"
        : isEn
        ? "What is a credit note (avoir) used for and how do you create one?"
        : "À quoi sert un avoir et comment en éditer un sur Facturo ?",
      a: isAr
        ? "وفقًا للقانون الجبائي والمحاسبي، يُمنع منعًا باتًا حذف أو تعديل فاتورة تم إصدارها وإرسالها للعميل. إذا وُجد خطأ أو أرجع العميل منتجًا، يجب إصدار «فاتورة إشعار دائن» (Avoir). على Facturo، ما عليك سوى اختيار نوع المستند «إشعار دائن» (Avoir) من القائمة المنسدلة، إدخال رقم الفاتورة الأصلية، ووضع المبالغ المرجعة. سيتم وسم المستند بوضوح وتوليد ملف PDF مطابق للمواصفات القانونية."
        : isEn
        ? "Tax laws strictly prohibit deleting or modifying an invoice once issued. If an error occurs, or if goods are returned, you must issue a Credit Note (Avoir). On Facturo, simply select 'Avoir' from the Document Type dropdown, specify the items to be credited, and reference the original invoice number."
        : "La législation fiscale interdit formellement de supprimer ou modifier une facture déjà émise et numérotée. L'Avoir permet de rectifier une erreur de montant, accorder une ristourne ou acter un retour de marchandise en toute conformité. Sur Facturo, sélectionnez simplement « Avoir » dans le sélecteur Type de document : l'en-tête et les mentions s'adaptent automatiquement pour produire un document comptable conforme.",
    },
    {
      q: isAr
        ? "كيف يعمل التخزين المحلي للبيانات (IndexedDB / LocalStorage) لضمان الخصوصية وسرية الأعمال ؟"
        : isEn
        ? "How does local data storage (IndexedDB / LocalStorage) work to guarantee complete privacy?"
        : "Comment fonctionne le stockage local des données (IndexedDB / LocalStorage) pour garantir la confidentialité ?",
      a: isAr
        ? "يعتمد Facturo على تقنية «من جانب العميل 100%» (Client-Side). جميع بياناتك (أسماء عملائك، أرقام هواتفهم، فواتيرك، أسعارك ورقم معاملاتك) تُحفظ حصرًا داخل متصفح جهازك عبر تقنيتي LocalStorage وIndexedDB. لا يتم إرسال أي معلومة إلى أي خادم خارجي، مما يوفر سرية مطلقة لحساباتك دون خطر تسريب البيانات."
        : isEn
        ? "Facturo operates 100% client-side. Your financial figures, client addresses, and invoice items are stored strictly within your browser's private sandbox (using localStorage and IndexedDB). No financial data is ever uploaded to our servers, ensuring total commercial secrecy and zero tracking."
        : "Facturo a été conçu selon le principe de la confidentialité absolue (Privacy by Design) : 100% du traitement se fait dans votre propre navigateur. Vos fiches clients, articles, coordonnées et montants sont enregistrés directement dans la mémoire locale de votre appareil (LocalStorage & IndexedDB). Aucune donnée commerciale ne transite ni n'est stockée sur un serveur distant, vous garantissant une confidentialité totale.",
    },
    {
      q: isAr
        ? "كيف يمكن نسخ بياناتي احتياطيًا أو استرجاعها بصيغة JSON ؟"
        : isEn
        ? "How do I backup or restore my invoices and client records as JSON files?"
        : "Comment sauvegarder ou restaurer ses documents et son carnet au format JSON ?",
      a: isAr
        ? "من خلال لوحة «دفتر العملاء» أو «سجل الفواتير»، يمكنك الضغط على زر «تصدير» لتحميل ملف بصيغة JSON يحتوي على جميع بياناتك. يمكنك حفظ هذا الملف على فلاش ديسك أو قرص صلب. لاسترجاع البيانات على أي حاسوب أو متصفح آخر، اضغط ببساطة على «استيراد» وحدد الملف، وسيقوم Facturo بدمج البيانات بدقة دون تكرار."
        : isEn
        ? "In the 'Invoice History' or 'Clients' drawer, click 'Export' to download a timestamped JSON file containing your complete records. To restore or migrate to another device, click 'Import' and select your JSON file. Facturo safely merges records without duplicating entries."
        : "Dans le panneau « Historique » ou « Carnet clients », cliquez sur le bouton « Exporter » pour télécharger instantanément un fichier standard JSON horodaté de vos données. Pour transférer votre travail sur un autre ordinateur ou après un changement de navigateur, cliquez sur « Importer » : Facturo fusionne intelligemment vos fiches clients et factures sans créer de doublons.",
    },
    {
      q: isAr
        ? "ما هي البيانات القانونية الإلزامية التي يجب تضمينها في المستندات التجارية ؟"
        : isEn
        ? "What are the mandatory legal requirements for commercial documents?"
        : "Quelles sont les mentions légales obligatoires à respecter sur ses documents commerciaux ?",
      a: isAr
        ? "يجب أن يتضمن المستند التجاري القانوني: هوية البائع الكاملة (الاسم التجاري، العنوان، الهاتف، الشكل القانوني ورأس المال)، المعرفات الجبائية في الجزائر (NIF، NIS، السجل التجاري RC، ورقم المادة الضريبية AI)، هوية العميل، تاريخ الإصدار وتاريخ الاستحقاق، رقم تسلسلي متواصل، تفصيل المبالغ خارج الضريبة (HT) ونسب الرسم على القيمة المضافة (TVA)، المبلغ الكلي (TTC)، مع كتابة المبلغ بالحروف وختم وتوقيع المؤسسة."
        : isEn
        ? "A legal commercial document must include: Seller identity (legal name, address, corporate form, share capital), tax identifiers (Tax ID/NIF, Statistical ID/NIS, Commercial Register/RC, Tax assessment/AI), client details, chronological invoice number, issue and due dates, subtotal HT, VAT rates & amounts, total TTC, amount in words, and company stamp/signature."
        : "Pour être juridiquement et fiscalement conforme, un document commercial doit afficher : l'identité du vendeur (raison sociale, adresse, forme juridique, capital social), les identifiants fiscaux légaux (NIF, NIS, RC, AI pour l'Algérie), les coordonnées complètes du client, un numéro de document chronologique sans rupture de séquence, la date d'émission et d'échéance, la décomposition HT/TVA/TTC, la somme arrêtée en toutes lettres, ainsi que l'encart cachet et signature.",
    },
  ];

  return (
    <section
      data-testid="editorial-landing-section"
      className="app-no-print mx-auto max-w-[1600px] px-4 pt-12 pb-6 sm:px-6"
    >
      {/* 1. PRÉSENTATION ENRICHIE & PROPOSITION DE VALEUR */}
      <div className="rounded-3xl border border-[#1e2333] bg-[#0c0f18]/90 p-6 sm:p-10 backdrop-blur-md shadow-2xl space-y-10">
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isAr
                ? "الحل المتكامل للفوترة وإدارة المستندات التجارية"
                : isEn
                ? "Complete Invoicing & Commercial Document Suite"
                : "Suite complète de facturation & gestion commerciale"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {isAr
              ? "Facturo : أنشئ وأدر فواتيرك، عروض أسعارك، طلبياتك وإشعارات الدائن باحترافية وسرية تامة"
              : isEn
              ? "Facturo: Create & Manage Quotes, Purchase Orders, Invoices, and Credit Notes"
              : "Facturo — Éditez et gérez vos devis, bons de commande, factures et avoirs en toute simplicité"}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isAr
              ? "صُمم Facturo خصيصًا لتلبية احتياجات أصحاب المشاريع الفردية، الحرفيين، المستشارين والمؤسسات الصغيرة والمتوسطة (TPE/PME). يتيح لك البرنامج تحرير مستندات تجارية عالية الدقة ومطابقة للمعايير القانونية والمحاسبية الدولية والجزائرية، دون الحاجة إلى تثبيت أي برامج أو إنشاء حساب أو دفع اشتراكات شهرية."
              : isEn
              ? "Designed for freelancers, craftsmen, contractors, and small businesses, Facturo delivers a frictionless, privacy-first platform to generate compliant commercial documents in seconds—100% free, with no signup and zero installation."
              : "Pensé pour les auto-entrepreneurs, artisans, professions libérales, commerçants et TPE-PME, Facturo est l'outil gratuit par excellence pour piloter votre cycle de facturation. Créez des documents impeccables conformes aux exigences comptables et fiscales (notamment algériennes et internationales) sans aucune installation de logiciel, sans abonnement et sans création de compte."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={onOpenGuide}
              data-testid="editorial-open-guide-btn"
              className="h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm px-5 shadow-lg shadow-amber-500/20"
            >
              <BookOpen className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isAr ? "دليل الاستخدام والتوجيه" : isEn ? "User Guide & Tutorial" : "Consulter le guide & tutoriel"}
            </Button>

            <a
              href="/guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-10 rounded-md border border-[#282e42] bg-[#141826] px-4 text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-[#1e2333] transition-colors"
            >
              <span>{isAr ? "الصفحة الشاملة للوثائق (Guide Web)" : isEn ? "Detailed Web Guide & Specs" : "Documentation détaillée (Web)"}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
        </div>

        {/* LES 4 DOCUMENTS COMMERCIAUX */}
        <div className="space-y-4 pt-4 border-t border-[#1e2333]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-400" />
              {isAr
                ? "المستندات التجارية الأربعة الأساسية المدعومة في Facturo"
                : isEn
                ? "The Four Essential Commercial Documents Managed by Facturo"
                : "Les 4 documents commerciaux indispensables gérés par Facturo"}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? "تتيح لك القائمة المنسدلة في النموذج التبديل الفوري بين هذه الوثائق مع تعديل المسميات والعناصر التلقائية."
                : isEn
                ? "Seamlessly switch between document types using the top dropdown selector with automatic title and layout adjustments."
                : "Basculez à tout moment d'un type de document à l'autre via le sélecteur du formulaire : l'en-tête, les calculs et les mentions s'adaptent instantanément."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commercialDocuments.map((doc) => {
              const IconComp = doc.icon;
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-[#23283a] bg-[#101422] p-5 space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181d2e] text-white">
                        <IconComp className="h-5 w-5 text-indigo-300" />
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${doc.badgeColor}`}>
                        {doc.role}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{doc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. MINI-GUIDE / TUTORIEL EN 4 ÉTAPES */}
        <div className="space-y-4 pt-6 border-t border-[#1e2333]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {isAr
                ? "دليل مبسط : كيف تنشئ مستندك التجاري في 4 خطوات"
                : isEn
                ? "Quick Tutorial: Create Your Commercial Document in 4 Steps"
                : "Mini-guide : Créer votre document commercial en 4 étapes simples"}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? "خطوات سريعة وسهلة لإنشاء وتنزيل ملفاتك في أقل من دقيقتين."
                : isEn
                ? "A fast and straightforward workflow to finalize your document in under two minutes."
                : "Un parcours intuitif pour concevoir, vérifier et télécharger votre PDF en moins de 2 minutes."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Étape 1 */}
            <div className="rounded-2xl border border-[#23283a] bg-[#101422] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 font-bold text-xs">
                  1
                </span>
                <h4 className="font-semibold text-white text-xs">
                  {isAr ? "معلومات المؤسسة (المُصدِر)" : isEn ? "Company Profile" : "Profil de l'entreprise"}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "أدخل شعارك، اسم الشركة، وبياناتك الضريبية والقانونية (NIF، NIS، RC، AI). تُحفظ هذه البيانات محليًا تلقائيًا للاستخدام الدائم."
                  : isEn
                  ? "Upload logo, specify company name, address, and legal IDs (Tax ID, RC, AI). Automatically saved in your browser for future reuse."
                  : "Téléversez votre logo, renseignez vos coordonnées et mentions légales (NIF, NIS, RC, AI, capital). Sauvegardé automatiquement dans votre navigateur."}
              </p>
            </div>

            {/* Étape 2 */}
            <div className="rounded-2xl border border-[#23283a] bg-[#101422] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs">
                  2
                </span>
                <h4 className="font-semibold text-white text-xs">
                  {isAr ? "بيانات العميل (الدفتر)" : isEn ? "Client Selection" : "Sélection du client"}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "املأ تفاصيل العميل أو اختره مباشرة من دفتر العملاء بنقرة واحدة. يمكنك حفظ العملاء الجدد ومزامنتهم في ملف خارجي."
                  : isEn
                  ? "Fill in customer details or load them instantly from your Client Book. Supports disk file mirroring via File System API."
                  : "Renseignez le destinataire ou chargez-le depuis votre carnet en 1 clic. Enregistrez vos clients récurrents pour gagner du temps."}
              </p>
            </div>

            {/* Étape 3 */}
            <div className="rounded-2xl border border-[#23283a] bg-[#101422] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-300 font-bold text-xs">
                  3
                </span>
                <h4 className="font-semibold text-white text-xs">
                  {isAr ? "المنتجات، الحسابات والضرائب" : isEn ? "Items, VAT & Calculations" : "Articles, taxes & acompte"}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "أضف بنود الخدمات، الكميات، الأسعار، نسب الخصم وضريبة TVA. يحسب النظام الإجمالي والدفعة المقدمة والمبلغ بالحروف آليًا."
                  : isEn
                  ? "Add line items, quantities, discounts, and VAT rates. Facturo automatically calculates totals, down payments, and amount in words."
                  : "Ajoutez vos lignes, prix unitaires, remises et TVA. Facturo calcule automatiquement les totaux, le reste à payer et la somme en toutes lettres."}
              </p>
            </div>

            {/* Étape 4 */}
            <div className="rounded-2xl border border-[#23283a] bg-[#101422] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600/30 text-pink-300 font-bold text-xs">
                  4
                </span>
                <h4 className="font-semibold text-white text-xs">
                  {isAr ? "المعاينة، التصدير والطباعة" : isEn ? "A4 Preview & PDF Export" : "Modèle visuel & Export PDF"}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "اختر من بين 4 قوالب ألوان راقية، راجع المعاينة المباشرة A4، ثم حمّل ملف PDF عالي الجودة أو اطبع فورًا بزر واحد."
                  : isEn
                  ? "Pick from 4 professional themes, review live A4 output, and download a pixel-perfect PDF or print natively."
                  : "Sélectionnez votre thème graphique, vérifiez le rendu A4 en temps réel, puis téléchargez votre PDF prêt à l'envoi ou lancez l'impression."}
              </p>
            </div>
          </div>
        </div>

        {/* 3. SECTION FAQ EXHAUSTIVE */}
        <div className="space-y-4 pt-6 border-t border-[#1e2333]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-400" />
              {isAr
                ? "الأسئلة الشائعة حول الفوترة والأمان في Facturo (FAQ)"
                : isEn
                ? "Frequently Asked Questions (FAQ): Invoicing, Legal & Security"
                : "Foire Aux Questions (FAQ) : Facturation, Mentions légales & Sécurité"}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? "إجابات واضحة ودقيقة حول كيفية استخدام التطبيق، سرية البيانات، والإجراءات المحاسبية."
                : isEn
                ? "Clear, comprehensive answers regarding document management, data confidentiality, and legal compliance."
                : "Retrouvez ici les réponses détaillées sur l'utilisation des documents, la sécurité des données et les règles fiscales."}
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = !!openFaq[idx];
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#23283a] bg-[#101422] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left rtl:text-right hover:bg-[#141a2c] transition-colors focus:outline-none"
                  >
                    <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="text-amber-400 font-extrabold text-sm">Q.</span>
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-[#1e2333]/60 pt-3">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. GARANTIES DE SÉCURITÉ & PROPRIÉTÉ */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">
                {isAr
                  ? "أمان معطياتك وسرية معاملاتك التجارية مضمونة 100%"
                  : isEn
                  ? "100% Client-Side Privacy & Commercial Secrecy Guaranteed"
                  : "Engagement de confidentialité & Respect du secret des affaires"}
              </h4>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                {isAr
                  ? "لا نقوم أبدًا بحفظ فواتيرك أو أسماء عملائك على أي خوادم وسيطة. كل العمليات تُنجز مباشرة داخل حاسوبك."
                  : isEn
                  ? "We never log or host your customer files, invoices, or revenue numbers on external servers. All operations happen inside your browser."
                  : "Facturo n'héberge aucune base de données de vos factures. Vos fichiers clients et montants demeurent exclusivement sur votre machine locale."}
              </p>
            </div>
          </div>
          <a
            href="/confidentialite.html"
            className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-emerald-300 hover:text-emerald-200 underline"
          >
            <span>{isAr ? "سياسة الخصوصية الكاملة" : isEn ? "Privacy Policy" : "Politique de confidentialité"}</span>
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </section>
  );
}
