import type { CityProfile } from "@/lib/types";

export const cityProfiles: CityProfile[] = [
  {
    id: "freiburg",
    city: "Freiburg",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    timeZone: "Europe/Berlin",
    latitude: 47.999,
    longitude: 7.8421,
    landmarks: ["Freiburg Minster", "Bachle canals", "old town", "Black Forest"],
    visualKeywords: [
      "Gothic cathedral spire",
      "red tiled medieval roofs",
      "narrow stone streets",
      "small water channels",
      "green tram",
      "forested hill"
    ],
    description:
      "A compact medieval university city at the edge of the Black Forest, known for its cathedral, red roofs, tram lines, and small street canals.",
    imageFocus:
      "A Gothic cathedral in the center, old town blocks around it, thin canals cutting through walkable streets, and a green wooded ridge behind the city.",
    palette: {
      roof: "#b94736",
      landmark: "#8d9188",
      water: "#5db8d7",
      landscape: "#3d8f62"
    }
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    timeZone: "Asia/Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    landmarks: ["Tokyo Tower", "Shibuya crossing", "Sumida River", "modern rail lines"],
    visualKeywords: [
      "orange lattice tower",
      "dense mid-rise buildings",
      "elevated rail",
      "wide crossing",
      "river bend",
      "neon signs without text"
    ],
    description:
      "A dense metropolitan city with rail infrastructure, layered roads, a dramatic tower landmark, compact buildings, and river corridors.",
    imageFocus:
      "A warm orange tower rising from dense blocks, elevated train tracks, a crossing shape, and a blue river segment cutting across the miniature scene.",
    palette: {
      roof: "#7f8d98",
      landmark: "#e56f3f",
      water: "#4aa8d8",
      landscape: "#4f9c74"
    }
  },
  {
    id: "kyoto",
    city: "Kyoto",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    timeZone: "Asia/Tokyo",
    latitude: 35.0116,
    longitude: 135.7681,
    landmarks: ["Kiyomizu-dera", "traditional machiya", "temple gardens", "Higashiyama hills"],
    visualKeywords: [
      "wooden temple terrace",
      "traditional tiled roofs",
      "narrow lanes",
      "garden ponds",
      "maple trees",
      "hillside shrine"
    ],
    description:
      "A historic city of temples, traditional wooden houses, garden paths, and wooded hills.",
    imageFocus:
      "A wooden temple terrace on a hillside, rows of traditional townhouses, small gardens, stone paths, and a calm pond.",
    palette: {
      roof: "#8f4d32",
      landmark: "#b87045",
      water: "#5aa2bd",
      landscape: "#4e9462"
    }
  },
  {
    id: "yokohama",
    city: "Yokohama",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    timeZone: "Asia/Tokyo",
    latitude: 35.4437,
    longitude: 139.638,
    landmarks: ["Minato Mirai", "Cosmo Clock", "Yokohama Bay", "waterfront towers"],
    visualKeywords: [
      "bayfront skyline",
      "large ferris wheel",
      "glass towers",
      "harbor promenade",
      "curved coastline",
      "small boats"
    ],
    description:
      "A port city with a recognizable bayfront skyline, waterfront promenades, glass towers, and a ferris wheel.",
    imageFocus:
      "A curved harbor edge, a ferris wheel, compact waterfront towers, boats, piers, and green public spaces.",
    palette: {
      roof: "#8799a6",
      landmark: "#e3865f",
      water: "#3f91c7",
      landscape: "#4f9f78"
    }
  },
  {
    id: "helsinki",
    city: "Helsinki",
    country: "Finland",
    countryCode: "FI",
    flag: "🇫🇮",
    timeZone: "Europe/Helsinki",
    latitude: 60.1699,
    longitude: 24.9384,
    landmarks: ["Helsinki Cathedral", "Market Square", "harbor islands", "Nordic blocks"],
    visualKeywords: [
      "white neoclassical cathedral",
      "harbor square",
      "Nordic city blocks",
      "ferry terminal",
      "small islands",
      "cool sea light"
    ],
    description:
      "A Nordic coastal capital with a white cathedral, harbor market, clean street grid, ferry docks, and nearby islands.",
    imageFocus:
      "A white cathedral with green domes, a harbor square, ferries, neat Nordic blocks, and small islands in a cold blue sea.",
    palette: {
      roof: "#6e8aa0",
      landmark: "#ece9dd",
      water: "#4f8fb7",
      landscape: "#609b7b"
    }
  }
];

export function getCityProfile(city: string): CityProfile | undefined {
  const normalized = normalizeCityId(city);

  return cityProfiles.find(
    (profile) =>
      profile.id === normalized || profile.city.toLowerCase() === city.trim().toLowerCase()
  );
}

export function normalizeCityId(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
