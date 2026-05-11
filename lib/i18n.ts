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
    noticeBullet1:
      "Consommer du poisson au rez-de-chaussée entraîne un supplément de 20 %.",
    noticeBullet2:
      "Consommer des plats traditionnels en terrasse entraîne un supplément de 30 %.",
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
    noticeBullet1: "Eating fish on the ground floor incurs a 20% surcharge.",
    noticeBullet2:
      "Eating traditional dishes on the terrace incurs a 30% surcharge.",
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
    noticeBullet1:
      "تناول السمك في الطابق الأرضي يستوجب زيادة بنسبة 20٪.",
    noticeBullet2:
      "تناول الأطباق التقليدية في الشرفة يستوجب زيادة بنسبة 30٪.",
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

    langPickerLabel: "اختيار اللغة",
  },
} as const;

type FrBundle = typeof M.fr;
export type MessageKey = keyof FrBundle;

export const t = (lang: Lang, key: MessageKey, r?: Replacements): string => {
  const bundle = M[lang] as FrBundle;
  return interp(bundle[key], r);
};
