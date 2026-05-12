export const SUPPORTED_LANGS = ["fr", "en", "ar"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "fr";

export const LANG_LABEL: Record<Lang, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

export const LANG_NAME: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const LANG_DIR: Record<Lang, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  ar: "rtl",
};

export type LocalizedText = {
  fr: string;
  en?: string;
  ar?: string;
};

export const pick = (text: LocalizedText | undefined, lang: Lang): string => {
  if (!text) return "";
  return text[lang] ?? text.fr;
};

type Replacements = Record<string, string | number>;

const interp = (str: string, r?: Replacements) => {
  if (!r) return str;
  return Object.entries(r).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    str
  );
};

const M = {
  fr: {
    skipToMenu: "Aller au menu",

    statusOpen: "Ouvert · ferme à {h}h00",
    statusClosedToday: "Fermé · ouvre à {h}h00",
    statusClosedTomorrow: "Fermé · ouvre demain à {h}h00",

    location: "Casbah, Alger",

    noticeTitle: "Informations importantes",
    noticeIntro1:
      "Les plats traditionnels sont servis uniquement au rez-de-chaussée.",
    noticeIntro2:
      "La terrasse est réservée exclusivement aux plats de poisson.",
    noticeRulesEyebrow: "Suppléments de prix",
    noticeRule1Where: "Poisson au rez-de-chaussée",
    noticeRule2Where: "Plats traditionnels en terrasse (sauf bourak)",
    noticeOutro: "Merci pour votre compréhension.",
    noticeAcknowledge: "J'ai compris",
    noticeBanner: "Informations importantes concernant les plats et les espaces",
    noticeReopen: "Rouvrir les informations importantes",
    noticeClose: "Fermer",

    categoriesLabel: "Catégories du menu",

    pricePrefix: "Prix : ",
    photoOf: "Photo de {name}",

    contactLabel: "Contact",
    contactHours: "Ouvert tous les jours · {hours}",
    contactCall: "Appeler le restaurant",
    contactWhatsapp: "Écrire sur WhatsApp",
    contactMaps: "Itinéraire sur Google Maps",
    contactInstagram: "Suivre sur Instagram",
    contactFacebook: "Page Facebook",
    contactCopyright: "© {year} Dar El Baraka",

    fabBackToTop: "Retour en haut",
    fabCall: "Appeler le restaurant",

    orderTitle: "Ma commande",
    orderOpen: "Voir ma commande",
    orderOpenAria: "Voir ma commande ({n})",
    orderClose: "Fermer la commande",
    orderAdd: "Ajouter",
    orderAddAria: "Ajouter {name} à ma commande",
    orderIncrease: "Augmenter la quantité",
    orderDecrease: "Réduire la quantité",
    orderRemove: "Retirer de la commande",
    orderClear: "Tout effacer",
    orderTotal: "Total",
    orderEmpty: "Votre sélection est vide",
    orderEmptyHint: "Touchez « Ajouter » sur un plat pour commencer.",
    orderShowWaiter: "Présentez cette sélection au serveur.",

    langPickerLabel: "Choisir la langue",
  },
  en: {
    skipToMenu: "Skip to menu",

    statusOpen: "Open · closes at {h}:00",
    statusClosedToday: "Closed · opens at {h}:00",
    statusClosedTomorrow: "Closed · opens tomorrow at {h}:00",

    location: "Casbah, Algiers",

    noticeTitle: "Important information",
    noticeIntro1: "Traditional dishes are served only on the ground floor.",
    noticeIntro2: "The terrace is reserved exclusively for fish dishes.",
    noticeRulesEyebrow: "Price surcharges",
    noticeRule1Where: "Fish on the ground floor",
    noticeRule2Where: "Traditional dishes on the terrace (bourak excluded)",
    noticeOutro: "Thank you for your understanding.",
    noticeAcknowledge: "Got it",
    noticeBanner: "Important information about dishes and seating",
    noticeReopen: "Re-open the important information",
    noticeClose: "Close",

    categoriesLabel: "Menu categories",

    pricePrefix: "Price: ",
    photoOf: "Photo of {name}",

    contactLabel: "Contact",
    contactHours: "Open every day · {hours}",
    contactCall: "Call the restaurant",
    contactWhatsapp: "Message on WhatsApp",
    contactMaps: "Directions on Google Maps",
    contactInstagram: "Follow on Instagram",
    contactFacebook: "Facebook page",
    contactCopyright: "© {year} Dar El Baraka",

    fabBackToTop: "Back to top",
    fabCall: "Call the restaurant",

    orderTitle: "My order",
    orderOpen: "View my order",
    orderOpenAria: "View my order ({n})",
    orderClose: "Close order panel",
    orderAdd: "Add",
    orderAddAria: "Add {name} to my order",
    orderIncrease: "Increase quantity",
    orderDecrease: "Decrease quantity",
    orderRemove: "Remove from order",
    orderClear: "Clear all",
    orderTotal: "Total",
    orderEmpty: "Your selection is empty",
    orderEmptyHint: "Tap “Add” on any dish to start.",
    orderShowWaiter: "Show this selection to your waiter.",

    langPickerLabel: "Choose language",
  },
  ar: {
    skipToMenu: "انتقل إلى القائمة",

    statusOpen: "مفتوح · يغلق على الساعة {h}:00",
    statusClosedToday: "مغلق · يفتح على الساعة {h}:00",
    statusClosedTomorrow: "مغلق · يفتح غدا على الساعة {h}:00",

    location: "القصبة، الجزائر",

    noticeTitle: "معلومات مهمة",
    noticeIntro1: "الأطباق التقليدية تقدم في الطابق الأرضي فقط.",
    noticeIntro2: "الشرفة محجوزة حصريا للأطباق السمكية.",
    noticeRulesEyebrow: "زيادة في السعر",
    noticeRule1Where: "السمك في الطابق الأرضي",
    noticeRule2Where: "الأطباق التقليدية في الشرفة (ما عدا البوراك)",
    noticeOutro: "شكرا لتفهمكم.",
    noticeAcknowledge: "فهمت",
    noticeBanner: "معلومات مهمة عن الأطباق والأماكن",
    noticeReopen: "إعادة فتح المعلومات المهمة",
    noticeClose: "إغلاق",

    categoriesLabel: "أصناف القائمة",

    pricePrefix: "السعر: ",
    photoOf: "صورة {name}",

    contactLabel: "تواصل",
    contactHours: "مفتوح كل يوم · {hours}",
    contactCall: "اتصل بالمطعم",
    contactWhatsapp: "راسلنا على واتساب",
    contactMaps: "الاتجاهات على خرائط جوجل",
    contactInstagram: "تابعنا على إنستغرام",
    contactFacebook: "صفحة فيسبوك",
    contactCopyright: "© {year} دار البركة",

    fabBackToTop: "العودة إلى الأعلى",
    fabCall: "اتصل بالمطعم",

    orderTitle: "طلبيتي",
    orderOpen: "عرض طلبيتي",
    orderOpenAria: "عرض طلبيتي ({n})",
    orderClose: "إغلاق لوحة الطلب",
    orderAdd: "إضافة",
    orderAddAria: "إضافة {name} إلى طلبيتي",
    orderIncrease: "زيادة الكمية",
    orderDecrease: "إنقاص الكمية",
    orderRemove: "إزالة من الطلب",
    orderClear: "مسح الكل",
    orderTotal: "المجموع",
    orderEmpty: "اختياركم فارغ",
    orderEmptyHint: "اضغط « إضافة » على أي طبق للبدء.",
    orderShowWaiter: "اعرض هذا الاختيار على النادل.",

    langPickerLabel: "اختيار اللغة",
  },
} as const;

type FrBundle = typeof M.fr;
export type MessageKey = keyof FrBundle;

export const t = (lang: Lang, key: MessageKey, r?: Replacements): string => {
  const bundle = M[lang] as FrBundle;
  return interp(bundle[key], r);
};
