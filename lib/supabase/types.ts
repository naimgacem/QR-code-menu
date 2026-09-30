/**
 * Hand-written mirror of `supabase/schema.sql`.
 *
 * Kept manual rather than generated so the repo has no Supabase CLI
 * dependency. If you change the schema, change this file in the same commit.
 */

export type CategoryRow = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  title_ar: string | null;
  subtitle_fr: string | null;
  subtitle_en: string | null;
  subtitle_ar: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type DishRow = {
  id: string;
  category_id: string;
  slug: string;
  name_fr: string;
  name_en: string | null;
  name_ar: string | null;
  description_fr: string | null;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  is_available: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

/** Columns the database fills in for you, so callers may omit them. */
type Insertable<T extends { id: string; created_at: string; updated_at: string }> =
  Omit<T, "id" | "created_at" | "updated_at"> & { id?: string };

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Insertable<CategoryRow>;
        Update: Partial<Insertable<CategoryRow>>;
        Relationships: [];
      };
      dishes: {
        Row: DishRow;
        Insert: Insertable<DishRow>;
        Update: Partial<Insertable<DishRow>>;
        // Declared so `.select("*, dishes(*)")` on categories infers
        // `dishes` as DishRow[] instead of a SelectQueryError.
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/** Storage bucket holding dish photos uploaded from the admin dashboard. */
export const MENU_IMAGES_BUCKET = "menu-images";
