export type Journey = {
  title: string;
  route: string;
  description: string;
  image: string;
  alt: string;
  href?: string;
  startingPrice?: string;
};

export const journeys: Journey[] = [
  {
    title: "Yunnan, Slowly",
    route: "Kunming to Lijiang · 9 days",
    description: "Ancient towns, living traditions and one memorable day in the high country, shaped at an unhurried pace.",
    image: "/images/journeys/yunnan-slowly/laoyao-mountain-yunnan-2560.webp",
    alt: "Laoyao Mountain meadows beneath cloud-covered peaks in Yunnan",
    href: "/journeys/yunnan-slowly",
  },
  {
    title: "The Old Roads of Yunnan",
    route: "Dali to Nuodeng · Culture & food",
    description: "Ancient towns, village tables and the living traditions found along Yunnan’s quieter old roads.",
    image: "https://images.pexels.com/photos/6513729/pexels-photo-6513729.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Temporary rural fields and mountain ridges placeholder",
  },
  {
    title: "South into the Green",
    route: "Tropical Yunnan · Tea & rainforest",
    description: "From lakes and old towns into tropical forests, coffee country and the ancient tea landscapes of the south.",
    image: "https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Temporary green terraced hills landscape placeholder",
  },
];

export const guides = [
  { title: "A First-Timer’s Guide to Yunnan", category: "Start here", image: "https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Temporary traditional rooftops and mountain sky placeholder" },
  { title: "When Is the Best Time to Visit Yunnan?", category: "Seasonal notes", image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Temporary mountain landscape placeholder in soft seasonal light" },
  { title: "Yunnan on Foot: Where to Begin", category: "Walking", image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Temporary quiet forest path placeholder" },
];

export const walkingRoutes = [
  {
    title: "Yubeng & Meili Snow Mountains",
    region: "Northwest Yunnan",
    duration: "4–6 days",
    difficulty: "Challenging",
    description: "Pilgrimage paths, glacial valleys and high mountain villages beneath the sacred peaks of Meili.",
    image: "https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Mountain trail through a dramatic alpine landscape",
  },
  {
    title: "Tiger Leaping Gorge",
    region: "Lijiang · Shangri-La",
    duration: "2–3 days",
    difficulty: "Moderate",
    description: "A classic high trail above one of the world’s deepest river gorges, walked at an unhurried pace.",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "High mountain ridges reflected in an alpine lake",
  },
  {
    title: "Haba & Black Lake",
    region: "Haba Snow Mountain",
    duration: "2–4 days",
    difficulty: "Moderate",
    description: "Forest paths, alpine lakes and quiet highland camps on the slopes of Haba Snow Mountain.",
    image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "A quiet walking path winding through a mountain forest",
  },
  {
    title: "Ancient Tea Horse Road",
    region: "Shaxi · Nuodeng",
    duration: "2–5 days",
    difficulty: "Easy–Moderate",
    description: "Old caravan paths linking market towns, farming villages, temples and family kitchens.",
    image: "https://images.pexels.com/photos/6513729/pexels-photo-6513729.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Fields and mountain ridges along an old road in Yunnan",
  },
];
