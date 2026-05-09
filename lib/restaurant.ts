export const restaurant = {
  name: "Dar El Baraka",
  tagline: "Cuisine traditionnelle algérienne",
  city: "Alger",
  district: "Casbah",
  address: "Restaurant Dar El Baraka, Casbah, Alger",
  hours: "09:00 — 22:00",
  phone: "0553764385",
  phoneDisplay: "05 53 76 43 85",
  whatsapp: "213553764385",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Restaurant+Dar+El+Baraka+Casbah",
  instagram: "https://www.instagram.com/restaurant_dar_el_baraka/",
  facebook: "https://www.facebook.com/profile.php?id=100060742335033",
  logoUrl:
    "https://quiikly.com/storage/restaurant/logo/17469810766820d0d42c549.jpg",
  notices: {
    seating:
      "Les plats traditionnels sont servis au rez-de-chaussée. La terrasse est réservée aux poissons. Toute exception entraîne un supplément de 30 %.",
    coffee:
      "Pause café disponible à partir de 16h00, ou en accompagnement du dîner.",
  },
} as const;

export type Restaurant = typeof restaurant;
