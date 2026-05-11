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

    noticeLabel: "Bon à savoir",
    noticeTeaser: "Salle, terrasse & pause café",
    noticeP1:
      "Veuillez noter que les plats traditionnels sont servis uniquement au rez-de-chaussée, tandis que la terrasse est réservée exclusivement aux poissons, et vice versa. Si vous souhaitez une exception, un supplément de 30 % sera appliqué.",
    noticeP2:
      "Pause café disponible à partir de 16h00, ou en accompagnement du dîner.",

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

    noticeLabel: "Good to know",
    noticeTeaser: "Indoor, terrace & coffee break",
    noticeP1:
      "Please note that traditional dishes are served only on the ground floor, while the terrace is reserved exclusively for fish, and vice versa. A 30% surcharge applies if you request an exception.",
    noticeP2:
      "Coffee break available from 4 PM, or alongside dinner.",

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

    noticeLabel: "للعلم",
    noticeTeaser: "الصالة والشرفة وراحة القهوة",
    noticeP1:
      "يرجى العلم أن الأطباق التقليدية تقدم في الطابق الأرضي فقط، بينما الشرفة محجوزة حصريا للأسماك، والعكس صحيح. في حال طلب استثناء، تُطبق زيادة بنسبة 30٪.",
    noticeP2:
      "راحة القهوة متوفرة ابتداء من الساعة 16:00، أو مع العشاء.",

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
