import { db } from "@/lib/db";

interface PromptEntry {
  type: "reminiscence" | "trivia" | "joke";
  decade?: string;
  topicTags: string[];
  content: string;
}

const PROMPTS: PromptEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // REMINISCENCE PROMPTS — 30+ across decades
  // ═══════════════════════════════════════════════════════════

  // 1940s
  {
    type: "reminiscence",
    decade: "1940s",
    topicTags: ["world-war-2", "community", "radio"],
    content:
      "Do you remember listening to the radio with your family in the evenings? What programs did you enjoy the most?",
  },
  {
    type: "reminiscence",
    decade: "1940s",
    topicTags: ["world-war-2", "victory-garden", "community"],
    content:
      "Many families planted victory gardens during the war. Did your family have one? What did you grow?",
  },
  {
    type: "reminiscence",
    decade: "1940s",
    topicTags: ["music", "big-band", "dancing"],
    content:
      "Big band music was everywhere in the 1940s. Did you ever go dancing? Which band or singer did you love?",
  },

  // 1950s
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["school", "childhood", "memories"],
    content:
      "What was your school like in the 1950s? Do you remember your favorite teacher?",
  },
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["drive-in", "movies", "dating"],
    content:
      "Drive-in movies were so popular back then. Did you ever go to one? What movie did you see?",
  },
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["food", "cooking", "family"],
    content:
      "What was Sunday dinner like at your house? Who did the cooking, and what was always on the table?",
  },
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["music", "elvis", "rock-and-roll"],
    content:
      "Rock and roll was brand new! Did you listen to Elvis or other rock and roll stars? What did your parents think?",
  },

  // 1960s
  {
    type: "reminiscence",
    decade: "1960s",
    topicTags: ["space", "moon-landing", "science"],
    content:
      "Do you remember watching the moon landing in 1969? Where were you and who were you with?",
  },
  {
    type: "reminiscence",
    decade: "1960s",
    topicTags: ["music", "beatles", "culture"],
    content:
      "The Beatles took the world by storm. Were you a fan? Did you have a favorite Beatle?",
  },
  {
    type: "reminiscence",
    decade: "1960s",
    topicTags: ["cars", "first-car", "freedom"],
    content:
      "Tell me about your first car. What was it like? Where did you drive it?",
  },
  {
    type: "reminiscence",
    decade: "1960s",
    topicTags: ["fashion", "style", "culture"],
    content:
      "Fashion changed so much in the 1960s! What styles did you wear? Did you have a favorite outfit?",
  },

  // 1970s
  {
    type: "reminiscence",
    decade: "1970s",
    topicTags: ["music", "disco", "dancing"],
    content:
      "Disco was huge in the 70s! Did you ever go to a disco? What was the atmosphere like?",
  },
  {
    type: "reminiscence",
    decade: "1970s",
    topicTags: ["television", "family", "evenings"],
    content:
      "What TV shows did your family watch together in the 1970s? Did you have a favorite?",
  },
  {
    type: "reminiscence",
    decade: "1970s",
    topicTags: ["cooking", "food", "recipes"],
    content:
      "Casseroles and Jell-O molds were all the rage. What was the most memorable dish from a potluck or family gathering?",
  },
  {
    type: "reminiscence",
    decade: "1970s",
    topicTags: ["travel", "vacation", "memories"],
    content:
      "Did your family take road trips in the 70s? Where did you go? What do you remember most about those trips?",
  },

  // 1980s
  {
    type: "reminiscence",
    decade: "1980s",
    topicTags: ["technology", "computers", "firsts"],
    content:
      "Computers started entering everyday life in the 80s. Do you remember your first experience with a computer?",
  },
  {
    type: "reminiscence",
    decade: "1980s",
    topicTags: ["music", "mtv", "pop"],
    content:
      "MTV launched in 1981 and changed music forever. Did you watch it? What videos stood out to you?",
  },
  {
    type: "reminiscence",
    decade: "1980s",
    topicTags: ["movies", "blockbusters", "culture"],
    content:
      "The 80s gave us so many iconic movies — E.T., Back to the Future, Ghostbusters. Which ones did you see at the theater?",
  },
  {
    type: "reminiscence",
    decade: "1980s",
    topicTags: ["career", "work", "ambition"],
    content:
      "What was your career like in the 1980s? What were you most proud of accomplishing during that decade?",
  },

  // 1990s
  {
    type: "reminiscence",
    decade: "1990s",
    topicTags: ["internet", "technology", "change"],
    content:
      "The internet became mainstream in the 90s. When did you first go online? What did you think of it?",
  },
  {
    type: "reminiscence",
    decade: "1990s",
    topicTags: ["family", "traditions", "holidays"],
    content:
      "What family traditions did you establish in the 1990s? Are any still going strong today?",
  },
  {
    type: "reminiscence",
    decade: "1990s",
    topicTags: ["television", "sitcoms", "entertainment"],
    content:
      "Shows like Seinfeld and Friends were must-see TV. What did you and your family watch together?",
  },

  // 1940s–1950s cross-decade
  {
    type: "reminiscence",
    decade: "1940s",
    topicTags: ["holidays", "christmas", "family"],
    content:
      "What do you remember about holiday celebrations when you were young? What was the most special part?",
  },
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["neighbors", "community", "friendship"],
    content:
      "Neighbors really knew each other back then. Tell me about the people who lived on your street.",
  },

  // 1960s–1970s cross-decade
  {
    type: "reminiscence",
    decade: "1960s",
    topicTags: ["weddings", "love", "family"],
    content:
      "Tell me about your wedding day or a special wedding you attended. What made it memorable?",
  },
  {
    type: "reminiscence",
    decade: "1970s",
    topicTags: ["hobbies", "crafts", "creativity"],
    content:
      "Did you have any hobbies or crafts you enjoyed in the 70s? Macrame, knitting, woodworking?",
  },

  // Additional reminiscence
  {
    type: "reminiscence",
    decade: "1940s",
    topicTags: ["ice-cream", "treats", "childhood"],
    content:
      "Do you remember the ice cream truck or going to the soda fountain? What was your favorite treat?",
  },
  {
    type: "reminiscence",
    decade: "1950s",
    topicTags: ["summer", "outdoors", "childhood"],
    content:
      "What did summers feel like when you were young? Did you play outside until the streetlights came on?",
  },
  {
    type: "reminiscence",
    decade: "1980s",
    topicTags: ["exercise", "health", "aerobics"],
    content:
      "Aerobics and jogging became really popular in the 80s. Did you try any fitness trends back then?",
  },
  {
    type: "reminiscence",
    decade: "1990s",
    topicTags: ["grandchildren", "family", "joy"],
    content:
      "If you had grandchildren in the 90s, what was that like? What are your favorite memories with them?",
  },

  // ═══════════════════════════════════════════════════════════
  // TRIVIA QUESTIONS — 20+ era-matched
  // ═══════════════════════════════════════════════════════════

  // 1940s Trivia
  {
    type: "trivia",
    decade: "1940s",
    topicTags: ["world-war-2", "history"],
    content:
      "Trivia: What year did D-Day take place? (Answer: 1944) — Would you like to talk about what you remember from that time?",
  },
  {
    type: "trivia",
    decade: "1940s",
    topicTags: ["presidents", "history"],
    content:
      "Trivia: Who was the U.S. President for most of the 1940s? (Answer: Franklin D. Roosevelt) — Did you ever hear him on the radio?",
  },
  {
    type: "trivia",
    decade: "1940s",
    topicTags: ["music", "culture"],
    content:
      "Trivia: What famous song by Bing Crosby became the best-selling single of all time? (Answer: White Christmas) — Do you remember hearing it for the first time?",
  },

  // 1950s Trivia
  {
    type: "trivia",
    decade: "1950s",
    topicTags: ["tv", "culture"],
    content:
      "Trivia: What was the first coast-to-coast color TV broadcast in 1954? (Answer: The Tournament of Roses Parade) — Did your family have a color TV?",
  },
  {
    type: "trivia",
    decade: "1950s",
    topicTags: ["food", "inventions"],
    content:
      "Trivia: What popular fast-food chain was founded in 1955 by Ray Kroc? (Answer: McDonald's) — Do you remember when fast food was new?",
  },
  {
    type: "trivia",
    decade: "1950s",
    topicTags: ["space", "science"],
    content:
      "Trivia: What animal was the first to orbit the Earth? (Answer: Laika the dog, 1957) — What did you think about the space race?",
  },
  {
    type: "trivia",
    decade: "1950s",
    topicTags: ["toys", "childhood"],
    content:
      "Trivia: What iconic toy was introduced in 1952 and came with a potato body? (Answer: Mr. Potato Head) — Did your kids have one?",
  },

  // 1960s Trivia
  {
    type: "trivia",
    decade: "1960s",
    topicTags: ["space", "history"],
    content:
      "Trivia: Who was the first person to walk on the moon? (Answer: Neil Armstrong, 1969) — Where were you when it happened?",
  },
  {
    type: "trivia",
    decade: "1960s",
    topicTags: ["music", "culture"],
    content:
      "Trivia: What famous music festival took place in 1969 on a dairy farm? (Answer: Woodstock) — Did you know anyone who went?",
  },
  {
    type: "trivia",
    decade: "1960s",
    topicTags: ["inventions", "everyday"],
    content:
      "Trivia: What household convenience was first sold in 1967? (Answer: The microwave oven for home use) — When did you get your first microwave?",
  },
  {
    type: "trivia",
    decade: "1960s",
    topicTags: ["civil-rights", "history"],
    content:
      "Trivia: Who gave the famous 'I Have a Dream' speech in 1963? (Answer: Dr. Martin Luther King Jr.) — How did that moment affect you?",
  },

  // 1970s Trivia
  {
    type: "trivia",
    decade: "1970s",
    topicTags: ["technology", "inventions"],
    content:
      "Trivia: What was the first commercially successful personal computer, released in 1977? (Answer: Apple II) — Did you ever use one?",
  },
  {
    type: "trivia",
    decade: "1970s",
    topicTags: ["movies", "culture"],
    content:
      "Trivia: What 1977 movie became one of the highest-grossing films of all time? (Answer: Star Wars) — Did you see it in theaters?",
  },
  {
    type: "trivia",
    decade: "1970s",
    topicTags: ["music", "disco"],
    content:
      "Trivia: What 1977 movie made disco a worldwide phenomenon? (Answer: Saturday Night Fever) — Did you do the disco?",
  },
  {
    type: "trivia",
    decade: "1970s",
    topicTags: ["sports", "history"],
    content:
      "Trivia: What sport's 'Battle of the Sexes' match drew 90 million TV viewers in 1973? (Answer: Tennis — Billie Jean King vs. Bobby Riggs) — Did you watch it?",
  },

  // 1980s Trivia
  {
    type: "trivia",
    decade: "1980s",
    topicTags: ["technology", "phones"],
    content:
      "Trivia: What was the first commercially available cell phone, released in 1983? (Answer: Motorola DynaTAC 8000X) — When did you get your first cell phone?",
  },
  {
    type: "trivia",
    decade: "1980s",
    topicTags: ["music", "pop-culture"],
    content:
      "Trivia: What 1985 charity song raised millions for famine relief in Africa? (Answer: 'We Are the World') — Did you buy the record?",
  },
  {
    type: "trivia",
    decade: "1980s",
    topicTags: ["history", "world-events"],
    content:
      "Trivia: What historic event happened in November 1989? (Answer: The fall of the Berlin Wall) — How did you feel when you heard the news?",
  },
  {
    type: "trivia",
    decade: "1980s",
    topicTags: ["toys", "culture"],
    content:
      "Trivia: What puzzle toy invented by a Hungarian professor became a craze in 1980? (Answer: The Rubik's Cube) — Were you ever able to solve it?",
  },

  // 1990s Trivia
  {
    type: "trivia",
    decade: "1990s",
    topicTags: ["technology", "internet"],
    content:
      "Trivia: What website, founded in 1995, was one of the first major online marketplaces? (Answer: eBay) — When did you start shopping online?",
  },
  {
    type: "trivia",
    decade: "1990s",
    topicTags: ["science", "animals"],
    content:
      "Trivia: What famous sheep was cloned in 1996? (Answer: Dolly the sheep) — What did you think about that news?",
  },
  {
    type: "trivia",
    decade: "1990s",
    topicTags: ["sports", "history"],
    content:
      "Trivia: The 1996 Olympics were held in which U.S. city? (Answer: Atlanta) — Did you watch any of the events?",
  },

  // ═══════════════════════════════════════════════════════════
  // CLEAN JOKES — 10+
  // ═══════════════════════════════════════════════════════════

  {
    type: "joke",
    topicTags: ["animals", "classic"],
    content:
      "Why don't elephants use computers? Because they're afraid of the mouse! 😄",
  },
  {
    type: "joke",
    topicTags: ["food", "classic"],
    content:
      "What did the grape do when it got stepped on? It let out a little wine! 🍇",
  },
  {
    type: "joke",
    topicTags: ["nature", "weather"],
    content:
      "What does a cloud wear under its raincoat? Thunderwear! ⛈️",
  },
  {
    type: "joke",
    topicTags: ["animals", "silly"],
    content:
      "Why do cows wear bells? Because their horns don't work! 🐄",
  },
  {
    type: "joke",
    topicTags: ["food", "silly"],
    content:
      "What do you call cheese that isn't yours? Nacho cheese! 🧀",
  },
  {
    type: "joke",
    topicTags: ["classic", "wordplay"],
    content:
      "I told my wife she was drawing her eyebrows too high. She looked surprised! 😮",
  },
  {
    type: "joke",
    topicTags: ["animals", "silly"],
    content:
      "What do you call a fish without eyes? A fsh! 🐟",
  },
  {
    type: "joke",
    topicTags: ["everyday", "classic"],
    content:
      "I used to hate facial hair, but then it grew on me! 🧔",
  },
  {
    type: "joke",
    topicTags: ["nature", "silly"],
    content:
      "Why don't skeletons fight each other? They don't have the guts! 💀",
  },
  {
    type: "joke",
    topicTags: ["animals", "classic"],
    content:
      "What do you call a dog that does magic? A Labracadabrador! 🐕✨",
  },
  {
    type: "joke",
    topicTags: ["food", "wordplay"],
    content:
      "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
  },
  {
    type: "joke",
    topicTags: ["music", "silly"],
    content:
      "What kind of music do mummies listen to? Wrap music! 🎵",
  },
];

/**
 * Seed the PromptLibrary table if it is empty.
 * Safe to call multiple times — will only insert if table is empty.
 */
export async function seedPromptLibrary(): Promise<void> {
  const existingCount = await db.promptLibrary.count();

  if (existingCount > 0) {
    console.log(
      `[seed] PromptLibrary already has ${existingCount} entries — skipping seed.`
    );
    return;
  }

  console.log(`[seed] Seeding PromptLibrary with ${PROMPTS.length} entries...`);

  for (const prompt of PROMPTS) {
    await db.promptLibrary.create({
      data: {
        type: prompt.type,
        decade: prompt.decade ?? null,
        topicTags: JSON.stringify(prompt.topicTags),
        content: prompt.content,
        active: true,
      },
    });
  }

  console.log(`[seed] PromptLibrary seeded successfully.`);
}
