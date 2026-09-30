/**
 * Input validation for the dashboard forms.
 *
 * Hand-rolled rather than zod: the shapes are two small objects, the rules
 * are all length/range checks, and the customer bundle stays free of another
 * dependency. Every message is French and phrased for the restaurant owner,
 * not for a developer.
 *
 * These run on the SERVER inside the actions. The client re-runs the same
 * functions for instant feedback, but the server call is the one that counts —
 * a form can always be bypassed.
 */

export const LIMITS = {
  name: 80,
  categoryTitle: 60,
  subtitle: 80,
  description: 400,
  /** 9 999 999 DA — far above any plausible dish, low enough to catch a
   * fat-fingered extra digit. */
  price: 9_999_999,
} as const;

export type FieldErrors = Record<string, string>;

export type DishInput = {
  categoryId: string;
  nameFr: string;
  descriptionFr: string;
  price: number;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  isAvailable: boolean;
};

export type CategoryInput = {
  titleFr: string;
  subtitleFr: string;
};

const isBlank = (value: string) => value.trim().length === 0;

/** Shared by the dish form and the dish list's inline price edit. */
export function validatePrice(price: number): string | null {
  if (!Number.isFinite(price)) return "Indiquez un prix.";
  if (!Number.isInteger(price))
    return "Le prix doit être un nombre entier de dinars.";
  if (price < 0) return "Le prix ne peut pas être négatif.";
  if (price > LIMITS.price) return "Ce prix semble incorrect. Vérifiez le montant.";
  return null;
}

export function validateDish(input: DishInput): FieldErrors {
  const errors: FieldErrors = {};

  if (isBlank(input.nameFr)) {
    errors.nameFr = "Le nom du plat est obligatoire.";
  } else if (input.nameFr.trim().length > LIMITS.name) {
    errors.nameFr = `Le nom ne peut pas dépasser ${LIMITS.name} caractères.`;
  }

  if (!input.categoryId) {
    errors.categoryId = "Choisissez une catégorie.";
  }

  const priceError = validatePrice(input.price);
  if (priceError) errors.price = priceError;

  if (input.descriptionFr.trim().length > LIMITS.description) {
    errors.descriptionFr = `La description ne peut pas dépasser ${LIMITS.description} caractères.`;
  }

  return errors;
}

export function validateCategory(input: CategoryInput): FieldErrors {
  const errors: FieldErrors = {};

  if (isBlank(input.titleFr)) {
    errors.titleFr = "Le nom de la catégorie est obligatoire.";
  } else if (input.titleFr.trim().length > LIMITS.categoryTitle) {
    errors.titleFr = `Le nom ne peut pas dépasser ${LIMITS.categoryTitle} caractères.`;
  }

  if (input.subtitleFr.trim().length > LIMITS.subtitle) {
    errors.subtitleFr = `Le sous-titre ne peut pas dépasser ${LIMITS.subtitle} caractères.`;
  }

  return errors;
}

export const hasErrors = (errors: FieldErrors) =>
  Object.keys(errors).length > 0;

/** Empty string → null, so blank optional fields are stored as NULL rather
 * than "" (which `localized()` would otherwise treat as present). */
export const nullIfBlank = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
