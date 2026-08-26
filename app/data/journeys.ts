export type JourneyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position?: string;
  directoryPosition?: string;
  directoryMobilePosition?: string;
};

export type JourneyDayOption = {
  title: string;
  description: string;
  points: string[];
};

export type JourneyDay = {
  day: number;
  title: string;
  subtitle: string;
  route: string;
  drive?: string;
  paragraphs: string[];
  experiences: string[];
  overnight: string;
  note?: string;
  options?: JourneyDayOption[];
  images?: JourneyImage[];
};

export type Journey = {
  slug: string;
  status: "published" | "draft";
  collection: string;
  listingDescription: string;
  title: string;
  subtitle: string;
  route: string;
  duration: { days: number; nights: number; label: string };
  startLocation: string;
  endLocation: string;
  travelStyle: string;
  activityLevel: string;
  priceNote: string;
  hero: JourneyImage;
  heroEyebrow: string;
  primaryHref: string;
  questionHref: string;
  heroFacts: string[];
  promises: string[];
  overview: string[];
  facts: [label: string, value: string][];
  highlights: [title: string, description: string][];
  highlightImages: JourneyImage[];
  routeStops: [place: string, days: string][];
  days: JourneyDay[];
  suitable: string[];
  included: string[];
  excluded: string[];
  conditions: string[];
  inquiryEyebrow: string;
  inquiryFacts: { label: string; value: string }[];
  inquiryPromise: string;
  finalCta: {
    eyebrow: string;
    title: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  seo: { title: string; description: string; ogImage?: JourneyImage };
};

const imageRoot = "/images/journeys/yunnan-slowly";

export const journeys: Journey[] = [{
  slug: "yunnan-slowly",
  status: "published",
  collection: "Yunnan, Slowly",
  listingDescription:
    "A private nine-day route from Kunming to Lijiang, with overnight stays in Weishan and Shaxi, selected experiences around Dali and an adaptable high-country walk.",
  title: "9-Day Private Yunnan Tour: Weishan, Dali, Shaxi & Lijiang",
  subtitle:
    "Ancient towns, Bai and Naxi traditions, Erhai landscapes and a guided day in Laoyao Mountain.",
  route: "Kunming → Weishan → Dali → Shaxi → Lijiang",
  duration: { days: 9, nights: 8, label: "9 Days / 8 Nights" },
  startLocation: "Kunming",
  endLocation: "Lijiang",
  travelStyle: "Private & Tailor-Made",
  activityLevel: "Easy to Moderate",
  priceNote: "Tailored quotation",
  hero: {
    src: imageRoot + "/laoyao-mountain-yunnan-2560.webp",
    alt: "High-country meadow and mountain ridges at Laoyao Mountain in Yunnan",
    width: 2560,
    height: 1440,
    position: "58% center",
    directoryPosition: "center 46%",
    directoryMobilePosition: "62% center",
  } satisfies JourneyImage,
  heroEyebrow: "Private · Tailor-Made",
  primaryHref: "/plan-my-trip/?journey=Yunnan%2C%20Slowly&source=journey-detail&intent=plan",
  questionHref: "/plan-my-trip/?journey=Yunnan%2C%20Slowly&source=journey-detail&intent=question",
  heroFacts: ["9 Days / 8 Nights", "Kunming → Lijiang", "Private Journey", "Easy to Moderate"],
  promises: [
    "Yunnan-Based Team",
    "Private Vehicle & English-Speaking Guide",
    "Reply Within 24 Hours",
    "No Compulsory Shopping",
  ],
  overview: [
    "This nine-day private journey travels from Kunming to Lijiang through Weishan, Dali and Shaxi. Old towns and village life introduce Yi, Bai and Naxi culture, while Cangshan, Erhai and the high country of Laoyao Mountain bring a changing sequence of lake, forest and mountain landscapes.",
    "The route is private and tailor-made by our Yunnan-based team. We plan transport, guides and overnight stays around the people travelling, then adjust individual visits to suit your dates, interests, preferred pace and conditions on the ground. Market days, craft encounters and mountain walking remain flexible so that weather, local availability and energy levels can shape the final itinerary. You still have a clear day-by-day structure, with enough room to make practical changes without turning the journey into a rushed checklist. The pace stays comfortable across the full nine days.",
  ],
  facts: [
    ["Duration", "9 Days / 8 Nights"],
    ["Start", "Kunming"],
    ["Finish", "Lijiang"],
    ["Travel Style", "Private & Tailor-Made"],
    ["Activity Level", "Easy to Moderate"],
    ["Best Seasons", "March–June / September–November"],
  ],
  highlights: [
    ["Stay inside Weishan Ancient Town", "Walk beneath its historic gate towers, try local er si and experience the streets after day visitors have left."],
    ["Meet traditions through local makers", "Choose one focused introduction—such as Bai tie-dye, Jia Ma printing, tile-cat making or Naxi metalwork—according to your interests."],
    ["See a quieter side of Dali and Erhai", "Balance Cangshan views with selected villages and calmer stretches of the western shore instead of racing around the lake."],
    ["Spend two nights in Shaxi", "See Sideng Square before the shops open, walk towards Yujin Bridge at sunset and visit Friday market when dates align."],
    ["Explore Naxi culture in Baisha and Shuhe", "Go beyond central Lijiang through one carefully arranged experience with writing, paper, metalwork or music."],
    ["Walk in Laoyao Mountain’s high country", "Follow a locally guided route through forest, pasture and seasonal rhododendrons, adjusted to weather and ability."],
  ],
  highlightImages: [
    {
      src: imageRoot + "/dali-tile-cat-artisan-2160.webp",
      alt: "An artisan shaping a traditional tile cat sculpture in Dali",
      width: 2160,
      height: 1440,
    },
    {
      src: imageRoot + "/erhai-fishing-boats.webp",
      alt: "Small fishing boats resting on calm water at Erhai Lake",
      width: 1080,
      height: 810,
    },
  ] satisfies JourneyImage[],
  routeStops: [
    ["Kunming", "Start"],
    ["Weishan", "Days 1–2"],
    ["Dali", "Days 2–4"],
    ["Shaxi", "Days 5–6"],
    ["Lijiang", "Days 7–9"],
  ],
  days: [
    {
      day: 1,
      title: "Kunming to Weishan",
      subtitle: "A Quieter Beginning",
      route: "Kunming → Weishan",
      drive: "Approx. 4 hours by private vehicle",
      paragraphs: [
        "Leave Kunming and travel west to Weishan. After checking in inside the old town, explore the streets around Gongchen Tower and Xinggong Tower with time to notice the arcades, courtyards and everyday shops between the landmarks.",
        "When opening hours allow, the Nanzhao Museum adds context to the region’s early history. Try local er si or yi gen mian; if your dates align with a suitable local event, a Yi song-and-dance gathering may also be included.",
      ],
      experiences: ["Weishan Ancient Town", "Nanzhao history", "Local er si or yi gen mian"],
      overnight: "Weishan Ancient Town",
      note: "Museum access and community gatherings depend on local opening times and your travel date.",
      images: [{
        src: imageRoot + "/weishan-ancient-town-gate-1450.webp",
        alt: "Historic gate tower above a street in Weishan Ancient Town",
        width: 1450,
        height: 2200,
        position: "center 40%",
      }],
    },
    {
      day: 2,
      title: "Weishan to Dali",
      subtitle: "Traditions Made by Hand",
      route: "Weishan → Dali",
      drive: "Approx. 1.5 hours by private vehicle",
      paragraphs: [
        "Begin with one traditional making experience selected around your interests and the practitioners available. It might be indigo tie-dye, Jia Ma woodblock printing or the making of a Yunnan tile cat—not every activity compressed into one morning.",
        "Continue to Dali in the afternoon. After checking in, take an introductory walk through Dali Old Town as the busiest daytime period begins to ease.",
      ],
      experiences: ["One craft experience matched to your interests", "Private transfer to Dali", "Early-evening old town walk"],
      overnight: "Dali Old Town or a quieter Erhai-side village",
      note: "The specific craft is confirmed around your interests, date and local availability.",
      images: [{
        src: imageRoot + "/bai-tie-dye-artisan.webp",
        alt: "A Bai artisan presenting a detailed indigo tie-dyed textile near Dali",
        width: 784,
        height: 495,
      }],
    },
    {
      day: 3,
      title: "Cangshan and Erhai",
      subtitle: "Mountain Views and the Western Shore",
      route: "Dali · Cangshan · Erhai West Shore",
      drive: "Short local transfers",
      paragraphs: [
        "Travel towards the Gantong Cableway area for a mountain morning shaped by current access. Jizhao An and a gentle section of the Jade Belt Cloud Road can open broad views across Erhai without turning the day into a demanding hike.",
        "Return to the western shore in the afternoon and choose a quieter lakeside area such as Chongyi, Majiuyi or another suitable village. Finish with the changing light over Erhai.",
      ],
      experiences: ["Cangshan viewpoints", "A gentle mountain path", "A selected Erhai-side village"],
      overnight: "Dali",
      note: "The mountain section changes if weather, cableway operations or trail conditions require it.",
      images: [{
        src: imageRoot + "/erhai-lake-dali-yunnan-2200.webp",
        alt: "A village peninsula extending into Erhai Lake beneath mountains near Dali",
        width: 2200,
        height: 1375,
      }],
    },
    {
      day: 4,
      title: "Choose Your Side of Dali",
      subtitle: "A Private Choice Day",
      route: "Dali · Tailored around your interests",
      paragraphs: [
        "Choose a day led by Erhai’s landscapes or spend more time with Bai culture and living traditions. Both versions are selective, with depth and a comfortable pace taking priority over a rushed full-lake circuit.",
      ],
      experiences: ["A landscape or culture focus", "Selected stops", "Planning based on current local conditions"],
      overnight: "Dali",
      note: "The final choice is agreed around your interests, the season and responsible local arrangements.",
      options: [
        {
          title: "Option A · Erhai Landscapes",
          description: "Follow selected sections of the lake according to light, traffic and pace.",
          points: ["Xizhou", "Shuanglang", "Selected viewpoints and waterside walks"],
        },
        {
          title: "Option B · Bai Culture",
          description: "Spend more time with Bai architecture, food and making traditions.",
          points: ["Zhoucheng tie-dye", "Fengyu or another suitable village", "A date-appropriate local tradition"],
        },
      ],
      images: [{
        src: imageRoot + "/dali-tie-dye-cloths.webp",
        alt: "Indigo tie-dyed cloths hanging in a Bai courtyard near Dali",
        width: 1080,
        height: 720,
      }],
    },
    {
      day: 5,
      title: "Dali to Shaxi",
      subtitle: "Into the Old Tea Horse Road",
      route: "Dali → Shaxi",
      drive: "Approx. 2.5 hours, including mountain roads",
      paragraphs: [
        "Drive north to Shaxi and settle inside the old town. Walk through Sideng Street towards the old theatre stage and Xingjiao Temple, then continue towards Yujin Bridge as the afternoon cools.",
        "Fire-roasted tea may be arranged in the evening. Staying overnight matters: once day traffic eases, the square and lanes settle into a rhythm that a brief visit rarely reveals.",
      ],
      experiences: ["Sideng Street and temple courtyards", "Yujin Bridge at sunset", "Fire-roasted tea when available"],
      overnight: "Shaxi Ancient Town",
      images: [{
        src: imageRoot + "/shaxi-ancient-town-lane-1468.webp",
        alt: "A narrow stone lane lined with traditional homes in Shaxi Ancient Town",
        width: 1468,
        height: 2200,
        position: "center 44%",
      }],
    },
    {
      day: 6,
      title: "A Full Day in Shaxi",
      subtitle: "Market, Fields and Time to Pause",
      route: "Shaxi Ancient Town and surrounding fields",
      paragraphs: [
        "When your stay includes Friday, begin at Shaxi market as families from surrounding villages arrive with vegetables, herbs, cheese and mountain produce. On other dates, the morning can focus on the lanes before they become busy.",
        "One suitable making experience may be arranged, with time left for the Pioneer Bookstore, surrounding fields, tea and independent walking.",
      ],
      experiences: ["Friday market when dates align", "One available craft introduction", "Fields, tea and independent walking"],
      overnight: "Shaxi Ancient Town",
      note: "Market and maker visits are date-dependent; alternatives are confirmed before travel.",
      images: [{
        src: imageRoot + "/shaxi-old-houses-yunnan-1468.webp",
        alt: "Weathered timber houses and a quiet courtyard lane in Shaxi",
        width: 1468,
        height: 2200,
        position: "center 42%",
      }],
    },
    {
      day: 7,
      title: "Shaxi to Lijiang",
      subtitle: "Naxi Traditions in Baisha and Shuhe",
      route: "Shaxi → Baisha → Shuhe",
      drive: "Approx. 1.5–2 hours",
      paragraphs: [
        "Travel to the Lijiang area and use Shuhe or another quieter neighbourhood as your base. Continue to Baisha for old streets, family courtyards and mountain views when the weather is clear.",
        "Arrange one deeper introduction to Naxi tradition—such as Dongba writing, traditional paper or metalwork. Naxi ancient music can be considered when a suitable performance is scheduled.",
      ],
      experiences: ["A quieter base near Lijiang", "Baisha and Naxi cultural context", "One focused craft or music encounter"],
      overnight: "Shuhe or a quieter area near Lijiang",
      note: "Craft visits and music depend on practitioner and performance schedules.",
      images: [{
        src: imageRoot + "/jade-dragon-snow-mountain-2200.webp",
        alt: "Snow-covered ridges of Jade Dragon Snow Mountain above forest near Lijiang",
        width: 2200,
        height: 1468,
      }],
    },
    {
      day: 8,
      title: "Laoyao Mountain",
      subtitle: "A Private Day in the High Country",
      route: "Lijiang area → Laoyao Mountain → Lijiang area",
      drive: "Access plan confirmed before travel",
      paragraphs: [
        "Travel into Laoyao Mountain with someone familiar with current local conditions. The standard walk is approximately four to six kilometres and takes around three to four hours, moving through forest, pasture and seasonal rhododendrons at elevations approaching 3,400 metres.",
        "When visibility allows, there may be distant views towards Yulong and Haba Snow Mountains. Route, timing and distance change with weather, road access, fitness and altitude response.",
      ],
      experiences: ["A privately guided high-country walk", "Forest, pasture and rhododendrons", "A route adapted to the guest"],
      overnight: "Shuhe or Lijiang",
      note: "High altitude, mountain weather and road conditions may shorten or change the planned walk.",
      images: [
        {
          src: imageRoot + "/laoyao-mountain-rhododendron-hiker-1600.webp",
          alt: "A hiker walking among flowering rhododendrons on Laoyao Mountain",
          width: 1600,
          height: 2400,
          position: "center 38%",
        },
        {
          src: imageRoot + "/laoyao-mountain-rhododendron-hut.webp",
          alt: "A mountain shelter beside flowering rhododendrons in Laoyao Mountain high country",
          width: 1329,
          height: 886,
        },
      ],
    },
    {
      day: 9,
      title: "A Final Day Shaped Around You",
      subtitle: "Classic Scenery or a Gentler Ending",
      route: "Lijiang area · Departure day",
      paragraphs: [
        "Shape the final day around your energy and the departure time of your flight or train. Choose the classic scenery of Jade Dragon Snow Mountain and Blue Moon Valley, subject to reservations and weather, or a gentler ending around Lashi Lake, Yuhu Village or Baisha.",
        "The plan will not force every remaining landmark into the schedule. Your final airport or station transfer is timed around the confirmed services in your personal proposal.",
      ],
      experiences: ["A classic or gentle ending", "Timing shaped around departure", "Final transfer where confirmed"],
      overnight: "Journey concludes in Lijiang",
      note: "Reservations, weather and departure schedules determine what can be included comfortably.",
      options: [
        {
          title: "Option A · Classic Mountain Landscapes",
          description: "A more structured final excursion, subject to reservations and conditions.",
          points: ["Jade Dragon Snow Mountain", "Blue Moon Valley", "Departure transfer"],
        },
        {
          title: "Option B · A Gentler Ending",
          description: "A lighter day for travellers who prefer an unhurried departure.",
          points: ["Lashi Lake", "Yuhu Village", "A return to Baisha"],
        },
      ],
    },
  ] satisfies JourneyDay[],
  suitable: [
    "Travellers interested in old towns, local food and living cultures",
    "People who prefer private pacing to a large group",
    "Guests comfortable with one adaptable high-altitude walk",
    "Couples, families and small private groups",
  ],
  included: [
    "Private transport during the journey",
    "English-speaking guiding services as confirmed",
    "Accommodation selected for the final proposal",
    "Entrance tickets and experiences listed in the final itinerary",
    "Trip planning and local support",
    "Airport or station transfers where confirmed",
  ],
  excluded: [
    "International and domestic flights or trains unless stated",
    "Personal expenses and travel insurance",
    "Meals not listed in the final proposal",
    "Optional activities requested during the journey",
    "Gratuities",
  ],
  conditions: [
    "50% deposit to confirm the journey",
    "Remaining balance paid before the journey begins",
    "Free cancellation up to 30 days before departure",
    "No compulsory shopping stops",
    "Confirmed services shown in the final travel contract",
  ],
  inquiryEyebrow: "Private & Tailor-Made",
  inquiryFacts: [
    { label: "Duration", value: "9 Days / 8 Nights" },
    { label: "Route", value: "Kunming to Lijiang" },
    { label: "Travel Style", value: "Private & Tailor-Made" },
    { label: "Price", value: "Tailored quotation" },
  ],
  inquiryPromise: "Personal reply within 24 hours",
  finalCta: {
    eyebrow: "Private journey · shaped in Yunnan",
    title: "Make This Journey Your Own",
    body: "Tell us what interests you most, how you like to travel and when you are thinking of visiting. We’ll shape the route around your time, pace and interests.",
    primaryLabel: "Plan This Journey",
    secondaryLabel: "Ask a Question",
  },
  seo: {
    title: "9-Day Private Yunnan Tour | Weishan, Dali, Shaxi & Lijiang",
    description: "Travel from Kunming to Weishan, Dali, Shaxi and Lijiang on a private 9-day Yunnan tour shaped around local culture, traditional crafts, Erhai landscapes and a guided Laoyao Mountain walk.",
  },
}];

export const publishedJourneys = journeys.filter((journey) => journey.status === "published");

export function getJourneyBySlug(slug: string) {
  return publishedJourneys.find((journey) => journey.slug === slug);
}
