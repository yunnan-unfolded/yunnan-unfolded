export type Journey = {
  title: string;
  route: string;
  description: string;
  image: string;
  alt: string;
  startingPrice?: string;
};

export const journeys: Journey[] = [
  {
    title: "Beyond the Snow Mountains",
    route: "Northwest Yunnan · High country",
    description: "A journey through high valleys and remote mountain worlds, from Lijiang and Haba to the trails of Yubeng.",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Temporary alpine lake and mountain landscape placeholder",
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
