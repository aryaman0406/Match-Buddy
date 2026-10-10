// Types for Match Buddy cricket companion
export interface MatchSituation {
  teams: [string, string];
  series: string;
  score: string;
  overs: string;
  totalOvers: number;
  target: number;
  ballsLeft: number;
  runsNeeded: number;
  requiredRunRate: number;
  currentOverBalls?: number; // e.g. 2 for 14.2
}

export interface Player {
  id: string;
  name: string;
  role: "Batter" | "Bowler";
  onField: string;
  country: string;
  homeState: string;
  formats: string[];
  isStriker?: boolean;
  avatarInitials: string;
  keyFacts: string[];
  fallbackIntro: {
    en: string;
    hinglish: string;
  };
}

export type EventType = "free-hit" | "drs" | "wicket" | "powerplay" | "impact-player";

export interface MatchEvent {
  id: string;
  over: string;
  type: EventType;
  title: string;
  term: string;
  badgeText: string;
  badgeColor: string;
  timestamp?: string;
  fallbackExplain: {
    en: string;
    hinglish: string;
  };
}

export interface SimulationStep {
  score: string;
  overs: string;
  ballsLeft: number;
  runsNeeded: number;
  requiredRunRate: number;
  commentary: string;
  batterScores: { [id: string]: string };
  bowlerFigures: { [id: string]: string };
  strikerId: string;
  newEvent?: MatchEvent;
}

// Initial match state
export const match: MatchSituation = {
  teams: ["IND", "AUS"],
  series: "2nd T20I",
  score: "112/3",
  overs: "14.2",
  totalOvers: 20,
  target: 166,
  ballsLeft: 34,
  runsNeeded: 54,
  requiredRunRate: 9.5,
  currentOverBalls: 2,
};

// Players active on the field
export const players: Player[] = [
  {
    id: "hardik-pandya",
    name: "Hardik Pandya",
    role: "Batter",
    onField: "41* (28)",
    country: "India",
    homeState: "Gujarat",
    formats: ["T20I", "ODI", "IPL"],
    isStriker: true,
    avatarInitials: "HP",
    keyFacts: [
      // TODO verify
      "Born in Chansad, Gujarat",
      "Premier pace-bowling all-rounder and finisher for India",
      "Captained Gujarat Titans to the IPL title in their inaugural 2022 season",
    ],
    fallbackIntro: {
      en: "Hardik Pandya is India's premier pace-bowling all-rounder, renowned for his calm mindset and explosive boundary-hitting during tight chases. Batting at 41* (28), his presence at the crease is the deciding factor in whether India scales the 54-run target in the death overs.",
      hinglish: "Hardik Pandya India ke star all-rounder hain jo aakhri overs me game finish karne ke liye jaane jaate hain. Abhi 41* runs pe batting kar rahe hain aur match jeetne ke liye unka aakhri ball tak tikna sabse zaroori hai.",
    },
  },
  {
    id: "suryakumar-yadav",
    name: "Suryakumar Yadav",
    role: "Batter",
    onField: "22* (14)",
    country: "India",
    homeState: "Maharashtra",
    formats: ["T20I", "ODI", "IPL"],
    isStriker: false,
    avatarInitials: "SK",
    keyFacts: [
      // TODO verify
      "Born in Mumbai, Maharashtra",
      "Former ICC Men's No. 1 ranked T20I batter",
      "Known worldwide for his 360-degree sweep and scoop shots behind square",
    ],
    fallbackIntro: {
      en: "Suryakumar Yadav is an inventive 360-degree stroke maker capable of dismantling any bowling attack with unorthodox angles. At 22* off 14, his partnership with Hardik keeps Australia's pacers under intense scoreboard pressure.",
      hinglish: "Surya India ke 360-degree batter hain jo ground ke har kone me aasaani se shots laga sakte hain. Abhi 22* runs bana chuke hain aur Hardik ke saath milkar chase ko control me rakh rahe hain.",
    },
  },
  {
    id: "mitchell-starc",
    name: "Mitchell Starc",
    role: "Bowler",
    onField: "2.2-0-18-1",
    country: "Australia",
    homeState: "New South Wales",
    formats: ["Test", "ODI", "T20I"],
    avatarInitials: "MS",
    keyFacts: [
      // TODO verify
      "Born in Baulkham Hills, Sydney, Australia",
      "Fastest bowler in cricket history to reach 150 and 200 ODI wickets",
      "Legendary left-arm fast bowler famous for 145+ km/h inswinging yorkers",
    ],
    fallbackIntro: {
      en: "Mitchell Starc is Australia's elite left-arm spearhead whose lethal reverse-swing and pinpoint yorkers make him devastating at the death. Currently bowling to Hardik, his remaining deliveries could tilt the contest in one over.",
      hinglish: "Mitchell Starc duniya ke sabse tez left-arm fast bowler hain jinki yorkers batter ke stumps uda deti hain. Abhi ball daal rahe hain aur unka yeh over match ka rukh badal sakta hai.",
    },
  },
  {
    id: "pat-cummins",
    name: "Pat Cummins",
    role: "Bowler",
    onField: "3-0-26-1",
    country: "Australia",
    homeState: "New South Wales",
    formats: ["Test", "ODI", "T20I"],
    avatarInitials: "PC",
    keyFacts: [
      // TODO verify
      "Born in Westmead, Sydney, Australia",
      "Captained Australia to the 2023 World Test Championship and 2023 ODI World Cup",
      "Right-arm fast bowler with deadly off-cutters and high release",
    ],
    fallbackIntro: {
      en: "Pat Cummins is Australia's talismanic leader and high-impact fast bowler who consistently breaks big partnerships. Having removed Tilak Varma earlier, his final over will be Australia's biggest defensive weapon.",
      hinglish: "Pat Cummins Australia ke World Cup winning captain hain jo pressure me hamesha wicket chatkate hain. Inhone Tilak ka wicket liya tha aur inka aakhri over aana baaki hai.",
    },
  },
];

// Timeline events (newest first)
export const initialEvents: MatchEvent[] = [
  {
    id: "evt-free-hit",
    over: "14.1",
    type: "free-hit",
    title: "No-ball & FREE HIT",
    term: "Free Hit",
    badgeText: "FREE HIT",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    fallbackExplain: {
      en: "The bowler overstepped the crease resulting in a no-ball penalty run and an immediate Free Hit. On the subsequent delivery, the batter cannot be dismissed by bowled, caught, or LBW, offering a golden risk-free chance to hit a boundary.",
      hinglish: "Bowler ka paav crease ke aage chala gaya, isliye umpire ne no-ball dekar Free Hit diya. Agli ball par batter catch ya bowled out nahi ho sakta, toh khul kar chhakka maar sakta hai.",
    },
  },
  {
    id: "evt-drs",
    over: "13.4",
    type: "drs",
    title: "DRS Review: LBW Not Out",
    term: "DRS Review",
    badgeText: "DRS",
    badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    fallbackExplain: {
      en: "Australia used the Decision Review System to challenge the umpire's Not Out decision for LBW against Hardik Pandya. Ball tracking confirmed the impact occurred outside off-stump, keeping the batter safe and costing Australia one review.",
      hinglish: "Australia ne Hardik ke khilaf umpire ke Not Out faisle par DRS review manga tha. Replay me ball stumps ke bahar impact karti dikhi, isliye Hardik bach gaye aur Australia ka review waste hua.",
    },
  },
  {
    id: "evt-wicket",
    over: "11.2",
    type: "wicket",
    title: "Wicket! Tilak c & b Cummins",
    term: "Caught & Bowled",
    badgeText: "WICKET",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    fallbackExplain: {
      en: "Tilak Varma mistimed a slower off-cutter straight back into Pat Cummins' hands, snapping a vital 45-run stand. This dismissal brought Hardik Pandya to the crease with India needing 68 from 52 balls.",
      hinglish: "Tilak Varma Pat Cummins ki slow ball ko padh nahi paaye aur seedha bowler ke haath me catch de baithe. Is wicket ke girne ke baad Hardik Pandya batting karne aaye the.",
    },
  },
  {
    id: "evt-impact-player",
    over: "10.0",
    type: "impact-player",
    title: "Impact Player: Rinku Singh In",
    term: "Impact Player Rule",
    badgeText: "IMPACT SUB",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    fallbackExplain: {
      en: "India tactically substituted specialist spinner Kuldeep Yadav with explosive death-overs finisher Rinku Singh. This tactical move deepens the batting lineup for the tense final sprint of this run chase.",
      hinglish: "India ne chase ko finish karne ke liye bowler ki jagah explosive batter Rinku Singh ko Impact Player ke taur par utara. Is tactical badlaav se India ki batting last over tak strong ho gayi hai.",
    },
  },
  {
    id: "evt-powerplay",
    over: "6.0",
    type: "powerplay",
    title: "Powerplay Ends (48/1)",
    term: "Powerplay Restrictions",
    badgeText: "POWERPLAY",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    fallbackExplain: {
      en: "The first 6 overs with mandatory fielding restrictions have concluded, permitting Australia to spread up to 5 fielders outside the 30-yard ring. India built a steady 48/1 base but now rely on strike rotation through middle overs.",
      hinglish: "Pehle 6 overs ka Powerplay khatam ho gaya hai, ab Australia boundary par 5 fielders rakh sakti hai. India ne 48/1 ka achha score banaya tha, par ab singles-doubles zyada lene honge.",
    },
  },
];

// Fallback response for "Story so far"
export const storyFallback = {
  en: "India stumbled early losing Rohit in the 3rd over, but recovered through a disciplined 45-run partnership. Tilak Varma's dismissal in the 12th over momentarily gave Australia control. Now, Hardik Pandya and Suryakumar Yadav have settled in with a counter-attacking stand. India need 54 runs off the remaining 34 balls at an achievable required run rate of 9.5.",
  hinglish: "Match ki shuruaat me India ne Rohit Sharma ka wicket jaldi gawa diya, par team ne 48 runs ka solid Powerplay nikala. 12ve over me Tilak out hue, lekin tabhi se Hardik aur Surya ne boundary markar match me wapsi kar li hai. Ab 34 balls me 54 runs chahiye aur required rate 9.5 ka hai, jo easily chase ho sakta hai.",
};

// Common cricket rules fallback answers for quick chips or search
export const rulesDictionary: Record<string, { term: string; en: string; hinglish: string }> = {
  dls: {
    term: "Duckworth-Lewis-Stern (DLS) Method",
    en: "DLS is a mathematical formula used in rain-interrupted cricket matches to set a revised target. It factors in remaining overs and wickets in hand so neither side gets an unfair advantage.",
    hinglish: "DLS ek mathematical formula hai jo baarish se rukne wale matches me naya target calculate karta hai. Yeh bache huye overs aur bachi hui wickets dono ko dekh kar fair score nikalta hai.",
  },
  lbw: {
    term: "Leg Before Wicket (LBW)",
    en: "LBW occurs when the ball strikes any part of the batter's body (usually the pad) that would otherwise have gone on to hit the stumps. It cannot be given out if the ball pitched outside leg-stump or was hit by the bat first.",
    hinglish: "LBW tab hota hai jab ball bat se pehle batter ke pad ya body pe lagti hai aur seedha stumps ko hit kar rahi hoti hai. Agar ball leg stump ke bahar pitch hui ho toh out nahi diya jaata.",
  },
  "super over": {
    term: "Super Over",
    en: "A Super Over is a one-over tie-breaker played when both teams finish with the exact same total score. Each team bats for 6 balls with 2 wickets allowed, and whoever scores more runs in that single over wins the match.",
    hinglish: "Jab match tie ho jaata hai, tab faisla karne ke liye dono teams ko 1-1 over (6 balls) khelne milta hai. Har team ke paas 2 wickets hote hain, aur jo team us over me zyada runs banati hai woh jeet jaati hai.",
  },
  offside: {
    term: "Off-Side (Cricket)",
    en: "In cricket, the off-side is the side of the pitch in front of the batter's chest and bat-face when taking guard (the right side for a right-handed batter). It contains fielding positions like cover, point, and slip.",
    hinglish: "Cricket me off-side woh hissa hota hai jo right-handed batter ke saamne (right side) hota hai. Slip, point aur cover jaise fielders off-side me hi khade rehte hain.",
  },
};

// Simulation sequence
export const simulationSteps: SimulationStep[] = [
  {
    score: "112/3",
    overs: "14.2",
    ballsLeft: 34,
    runsNeeded: 54,
    requiredRunRate: 9.5,
    commentary: "Starc steams in, bowls a full yorker to Hardik who digs it out.",
    batterScores: { "hardik-pandya": "41* (28)", "suryakumar-yadav": "22* (14)" },
    bowlerFigures: { "mitchell-starc": "2.2-0-18-1", "pat-cummins": "3-0-26-1" },
    strikerId: "hardik-pandya",
  },
  {
    score: "116/3",
    overs: "14.3",
    ballsLeft: 33,
    runsNeeded: 50,
    requiredRunRate: 9.09,
    commentary: "FOUR! Hardik carves Starc through extra cover with pure timing!",
    batterScores: { "hardik-pandya": "45* (29)", "suryakumar-yadav": "22* (14)" },
    bowlerFigures: { "mitchell-starc": "2.3-0-22-1", "pat-cummins": "3-0-26-1" },
    strikerId: "hardik-pandya",
    newEvent: {
      id: "sim-evt-four-14-3",
      over: "14.3",
      type: "free-hit",
      title: "FOUR! Cracking Drive by Hardik",
      term: "Boundary (4 Runs)",
      badgeText: "BOUNDARY",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      fallbackExplain: {
        en: "Hardik opened the bat face and pierced the infield gap for a boundary. This brings India within 50 runs of victory and reduces the required run rate to 9.09.",
        hinglish: "Hardik ne ball ki length parakhte hue khubsurat cover drive mara aur 4 runs bator liye. Ab target 50 runs ka reh gaya hai aur pressure kam hua hai.",
      },
    },
  },
  {
    score: "117/3",
    overs: "14.4",
    ballsLeft: 32,
    runsNeeded: 49,
    requiredRunRate: 9.18,
    commentary: "Pushed to long-on for a brisk single. Hardik moves to 46*.",
    batterScores: { "hardik-pandya": "46* (30)", "suryakumar-yadav": "22* (14)" },
    bowlerFigures: { "mitchell-starc": "2.4-0-23-1", "pat-cummins": "3-0-26-1" },
    strikerId: "suryakumar-yadav",
  },
  {
    score: "123/3",
    overs: "14.5",
    ballsLeft: 31,
    runsNeeded: 43,
    requiredRunRate: 8.32,
    commentary: "SIX! SKY goes down on one knee and scoops Starc over fine leg into the stands!",
    batterScores: { "hardik-pandya": "46* (30)", "suryakumar-yadav": "28* (15)" },
    bowlerFigures: { "mitchell-starc": "2.5-0-29-1", "pat-cummins": "3-0-26-1" },
    strikerId: "suryakumar-yadav",
    newEvent: {
      id: "sim-evt-six-14-5",
      over: "14.5",
      type: "free-hit",
      title: "SIX! Trademark SKY Scoop",
      term: "Maximum (6 Runs)",
      badgeText: "SIX",
      badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
      fallbackExplain: {
        en: "Suryakumar Yadav used Starc's 144 km/h pace to ramp the ball high over the fine leg boundary. A stunning stroke that brings the required run rate right down to 8.32.",
        hinglish: "Surya ne Starc ki tezi ka fayda uthaya aur ghutne par baith kar fine-leg par 6 runs maar diye! Is shot ne Australian bowlers ke hosh uda diye hain.",
      },
    },
  },
  {
    score: "124/3",
    overs: "15.0",
    ballsLeft: 30,
    runsNeeded: 42,
    requiredRunRate: 8.4,
    commentary: "Single down to third man. Over ends: 12 runs off it for India!",
    batterScores: { "hardik-pandya": "46* (30)", "suryakumar-yadav": "29* (16)" },
    bowlerFigures: { "mitchell-starc": "3.0-0-30-1", "pat-cummins": "3-0-26-1" },
    strikerId: "hardik-pandya",
  },
  {
    score: "128/3",
    overs: "15.1",
    ballsLeft: 29,
    runsNeeded: 38,
    requiredRunRate: 7.86,
    commentary: "FOUR! Hardik punches Cummins off the backfoot through covers! FIFTY for Hardik Pandya!",
    batterScores: { "hardik-pandya": "50* (31)", "suryakumar-yadav": "29* (16)" },
    bowlerFigures: { "mitchell-starc": "3.0-0-30-1", "pat-cummins": "3.1-0-30-1" },
    strikerId: "hardik-pandya",
    newEvent: {
      id: "sim-evt-fifty-15-1",
      over: "15.1",
      type: "free-hit",
      title: "50 FOR HARDIK PANDYA! (31b)",
      term: "Half-Century Milestone",
      badgeText: "MILESTONE",
      badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",

      fallbackExplain: {
        en: "Hardik Pandya brings up a blistering half-century off just 31 deliveries under intense chase pressure. India are now firmly in the driver's seat with only 38 required off 29 balls.",
        hinglish: "Hardik Pandya ne sirf 31 balls me apni zabardast fifty poori ki! Match ab poori tarah India ke hath me hai kyunki 29 balls me bas 38 runs bache hain.",
      },
    },
  },
];
