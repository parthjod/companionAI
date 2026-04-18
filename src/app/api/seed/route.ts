import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const REMINISCENCE_PROMPTS = [
  { type: 'reminiscence', decade: '1940s', content: 'What do you remember about the end of World War II? How did your family celebrate?' },
  { type: 'reminiscence', decade: '1940s', content: 'What was your neighborhood like when you were growing up in the 1940s?' },
  { type: 'reminiscence', decade: '1940s', content: 'Do you remember your first radio? What programs did you listen to?' },
  { type: 'reminiscence', decade: '1950s', content: 'What was your favorite song from the 1950s? Who did you dance with?' },
  { type: 'reminiscence', decade: '1950s', content: 'Tell me about drive-in movies. Did you ever go to one?' },
  { type: 'reminiscence', decade: '1950s', content: 'What was your first car? How did it make you feel to drive it?' },
  { type: 'reminiscence', decade: '1950s', content: 'Do you remember when television first came to your home? What shows did you watch?' },
  { type: 'reminiscence', decade: '1960s', content: 'What do you remember about the moon landing in 1969?' },
  { type: 'reminiscence', decade: '1960s', content: 'How did the music of the 1960s make you feel? Did you have a favorite band?' },
  { type: 'reminiscence', decade: '1960s', content: 'What was your fashion style in the 1960s?' },
  { type: 'reminiscence', decade: '1960s', content: 'Tell me about a special holiday memory from the 1960s.' },
  { type: 'reminiscence', decade: '1970s', content: 'What was the best vacation you took in the 1970s?' },
  { type: 'reminiscence', decade: '1970s', content: 'Do you remember disco? Did you ever go to a disco?' },
  { type: 'reminiscence', decade: '1970s', content: 'What were Sundays like for your family in the 1970s?' },
  { type: 'reminiscence', decade: '1970s', content: 'Tell me about your favorite meal that someone used to cook for you.' },
  { type: 'reminiscence', decade: '1980s', content: 'What technological change surprised you the most in the 1980s?' },
  { type: 'reminiscence', decade: '1980s', content: 'Do you remember when you first used a computer? What did you think of it?' },
  { type: 'reminiscence', decade: '1980s', content: 'What family traditions did you start in the 1980s?' },
  { type: 'reminiscence', decade: '1990s', content: 'What was the most exciting thing about the 1990s for you?' },
  { type: 'reminiscence', decade: '1990s', content: 'How did your life change in the 1990s?' },
  { type: 'reminiscence', decade: '1990s', content: 'What hobby did you enjoy most in the 1990s?' },
  { type: 'reminiscence', decade: '1940s', content: 'What games did you play as a child? Who did you play with?' },
  { type: 'reminiscence', decade: '1950s', content: 'Tell me about your school days. Who was your favorite teacher?' },
  { type: 'reminiscence', decade: '1960s', content: 'What was your first job? How old were you?' },
  { type: 'reminiscence', decade: '1970s', content: 'What is the most beautiful place you have ever visited?' },
  { type: 'reminiscence', decade: '1940s', content: 'Do you remember a special holiday tradition from when you were young?' },
  { type: 'reminiscence', decade: '1950s', content: 'What was your wedding day like? Or a special celebration you remember?' },
  { type: 'reminiscence', decade: '1980s', content: 'Tell me about a proud moment you had with your family.' },
  { type: 'reminiscence', decade: '1990s', content: 'What is a skill you learned that you are proud of?' },
  { type: 'reminiscence', decade: '1950s', content: 'What did you and your friends do for fun on weekend nights?' },
];

const TRIVIA_PROMPTS = [
  { type: 'trivia', decade: '1950s', content: 'In what year did Elvis Presley release "Heartbreak Hotel"? (1956)' },
  { type: 'trivia', decade: '1960s', content: 'Who was the first person to walk on the moon? (Neil Armstrong)' },
  { type: 'trivia', decade: '1950s', content: 'What popular toy was introduced in 1952 and is still around today? (Mr. Potato Head)' },
  { type: 'trivia', decade: '1960s', content: 'Which TV show featured a talking horse? (Mr. Ed)' },
  { type: 'trivia', decade: '1970s', content: 'What was the name of the first space station launched in 1971? (Salyut 1)' },
  { type: 'trivia', decade: '1970s', content: 'What movie won Best Picture in 1977? (Rocky)' },
  { type: 'trivia', decade: '1980s', content: 'What was the best-selling toy of the 1980s? (Cabbage Patch Kids)' },
  { type: 'trivia', decade: '1980s', content: 'In what year did the Berlin Wall fall? (1989)' },
  { type: 'trivia', decade: '1990s', content: 'What was the first widely used internet browser? (Mosaic/Netscape)' },
  { type: 'trivia', decade: '1940s', content: 'What candy was included in soldiers rations during WWII? (Tootsie Rolls)' },
  { type: 'trivia', decade: '1950s', content: 'What was the name of the first commercial airline jet? (De Havilland Comet)' },
  { type: 'trivia', decade: '1960s', content: 'What color were the first postage stamps in the US? (They were 5-cent Benjamin Franklin stamps in brown and 10-cent Washington stamps in red)' },
  { type: 'trivia', decade: '1970s', content: 'What was the highest grossing film of the 1970s? (Star Wars)' },
  { type: 'trivia', decade: '1980s', content: 'What video game was hugely popular in the 1980s arcade era? (Pac-Man)' },
  { type: 'trivia', decade: '1990s', content: 'What was the Tamagotchi? (A virtual pet from Japan)' },
  { type: 'trivia', decade: '1940s', content: 'What famous song was recorded by Bing Crosby in 1942 and became the best-selling single ever? (White Christmas)' },
  { type: 'trivia', decade: '1950s', content: 'What was the price of a first-class stamp in 1950? (3 cents)' },
  { type: 'trivia', decade: '1960s', content: 'What day did Martin Luther King Jr. deliver his "I Have a Dream" speech? (August 28, 1963)' },
  { type: 'trivia', decade: '1970s', content: 'What was the popular dance craze of 1975? (The Hustle)' },
  { type: 'trivia', decade: '1980s', content: 'What show featured the catchphrase "Where is the beef?" (Wendys commercial, 1984)' },
];

const JOKE_PROMPTS = [
  { type: 'joke', decade: null, content: 'Why dont scientists trust atoms? Because they make up everything!' },
  { type: 'joke', decade: null, content: 'What do you call a sleeping dinosaur? A dino-snore!' },
  { type: 'joke', decade: null, content: 'Why did the scarecrow win an award? Because he was outstanding in his field!' },
  { type: 'joke', decade: null, content: 'What do you call a fish without eyes? A fsh!' },
  { type: 'joke', decade: null, content: 'Why dont eggs tell jokes? They would crack each other up!' },
  { type: 'joke', decade: null, content: 'What did the ocean say to the beach? Nothing, it just waved!' },
  { type: 'joke', decade: null, content: 'Why did the bicycle fall over? Because it was two-tired!' },
  { type: 'joke', decade: null, content: 'What do you call a bear with no teeth? A gummy bear!' },
  { type: 'joke', decade: null, content: 'Why cant your nose be 12 inches long? Because then it would be a foot!' },
  { type: 'joke', decade: null, content: 'What did one wall say to the other wall? Ill meet you at the corner!' },
];

export async function POST() {
  try {
    // Check if the table already has prompts
    const existingCount = await db.promptLibrary.count();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Prompt library already seeded',
      });
    }

    const allPrompts = [
      ...REMINISCENCE_PROMPTS,
      ...TRIVIA_PROMPTS,
      ...JOKE_PROMPTS,
    ];

    const result = await db.promptLibrary.createMany({
      data: allPrompts.map((p) => ({
        type: p.type,
        decade: p.decade,
        content: p.content,
        active: true,
      })),
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Seeded ${result.count} prompts`,
    });
  } catch (error) {
    console.error('Error seeding prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed prompt library' },
      { status: 500 }
    );
  }
}
