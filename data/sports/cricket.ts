import { SportMatchConfig } from "../types";

export function getCricketPhaseTag(overStr: string): "POWERPLAY" | "MIDDLE OVERS" | "DEATH OVERS" {
  const [oversPart, ballsPart] = overStr.split(".");
  const completedOvers = parseInt(oversPart, 10);
  const balls = ballsPart ? parseInt(ballsPart, 10) : 0;
  // If e.g. "6.0", completedOvers is 6 with 0 extra balls (end of over 6 / Powerplay)
  // If "6.1", over 7 is underway (Middle overs)
  const currentOverNumber = isNaN(completedOvers)
    ? 1
    : balls === 0 && completedOvers > 0
    ? completedOvers
    : completedOvers + 1;

  if (currentOverNumber <= 6) return "POWERPLAY";
  if (currentOverNumber <= 15) return "MIDDLE OVERS";
  return "DEATH OVERS";
}

export const cricketMatch: SportMatchConfig = {
  id: "cricket-ind-aus",
  sportId: "cricket",
  sportName: "Cricket",
  sportIcon: "🏏",
  matchTitle: "IND vs AUS",
  seriesOrLeague: "2nd T20I, Mumbai",
  formatsLabel: "Formats",
  teams: ["IND", "AUS"],
  teamFullNames: ["India", "Australia"],
  winProbability: { team1: 62, team2: 38 },
  scoreDisplay: {
    primary: "112/3",
    primaryLabel: "IND",
    progress: "14.2 / 20 Overs",
    progressPercent: 71,
    secondaryStatus: "Need 54 off 34 balls · RRR 9.53",
  },
  // TODO verify: Cricket player roster
  players: [
    {
      id: "hardik-pandya",
      name: "Hardik Pandya",
      role: "Batter",
      onField: "41* (28)",
      country: "India",
      homeState: "Born in Chansad, Gujarat",
      formats: ["T20I", "ODI", "IPL"],
      isStriker: true, // Star / strike icon represents the active batter currently on strike facing the bowler
      avatarInitials: "HP",
      // TODO verify: Hardik Pandya key facts
      keyFacts: [
        "Born in Chansad, Gujarat",
        "Premier pace-bowling all-rounder and finisher for India",
        "Captained Gujarat Titans to the IPL title in their inaugural 2022 season",
        "Renowned for extreme composure and maximum hits under pressure",
      ],
      fallbackIntro: {
        en: "Hardik Pandya is batting on 41* off 28 balls with India at 112/3 in 14.2 overs. Needing 54 runs from 34 balls at an RRR of 9.53, he anchors India's chase.",
        hinglish: "Hardik Pandya 14.2 overs me 41* (28) par batting kar rahe hain jab India ka score 112/3 hai. India ko jeet ke liye 34 balls me 54 runs chahiye.",
      },
    },
    {
      id: "suryakumar-yadav",
      name: "Suryakumar Yadav",
      role: "Batter",
      onField: "22* (14)",
      country: "India",
      homeState: "Born in Mumbai, Maharashtra",
      formats: ["T20I", "ODI", "IPL"],
      isStriker: false,
      avatarInitials: "SK",
      // TODO verify: Suryakumar Yadav key facts
      keyFacts: [
        "Born in Mumbai, Maharashtra",
        "Former ICC Men's No. 1 ranked T20I batter worldwide",
        "Famous for his unorthodox 360-degree sweep and ramp shots",
        "Captain of India's T20 international squad",
      ],
      fallbackIntro: {
        en: "Suryakumar Yadav is on 22* off 14 balls, partnering Hardik with India requiring 54 off 34 deliveries. His quick boundary scoring keeps Australia under sustained pressure.",
        hinglish: "Suryakumar Yadav 22* (14) par unbeaten hain aur Hardik ke saath 54 runs ke target chase me RRR ko 9.53 par control kar rahe hain.",
      },
    },
    {
      id: "pat-cummins",
      name: "Pat Cummins",
      role: "Bowler",
      onField: "3.0-0-28-1",
      country: "Australia",
      homeState: "Born in Westmead, Sydney, New South Wales",
      formats: ["Test", "ODI", "T20I", "IPL"],
      avatarInitials: "PC",
      // TODO verify: Pat Cummins key facts
      keyFacts: [
        "Born in Westmead, Sydney, New South Wales",
        "Captain of Australia's 2023 World Test Championship and ODI World Cup triumphs",
        "ICC Men's Cricketer of the Year 2023",
        "High-release right-arm fast bowler who hits the hard deck with seam movement",
      ],
      fallbackIntro: {
        en: "Pat Cummins has returned figures of 3.0-0-28-1 as Australia defend 166. Defending 54 runs in 34 balls, his bowling changes dictate Australia's defense.",
        hinglish: "Pat Cummins ne 3 overs me 28 dekar 1 wicket liya hai. Australia 166 defend kar rahi hai aur unhe Hardik-Surya ki partnership todni hai.",
      },
    },
    {
      id: "mitchell-starc",
      name: "Mitchell Starc",
      role: "Bowler",
      onField: "2.2-0-18-1",
      country: "Australia",
      homeState: "Born in Baulkham Hills, Sydney, New South Wales",
      formats: ["T20I", "ODI", "IPL"],
      avatarInitials: "MS",
      // TODO verify: Mitchell Starc key facts
      keyFacts: [
        "Born in Baulkham Hills, Sydney, New South Wales",
        "Left-arm express pacer with 145+ km/h toe-crushing reverse-swinging yorkers",
        "All-time leading wicket-taker in ICC Men's Cricket World Cup tournaments",
        "Player of the Match in the 2024 IPL Final",
      ],
      fallbackIntro: {
        en: "Mitchell Starc has taken 1 for 18 in 2.2 overs with 145 km/h deliveries. He has 10 balls remaining to defend 54 runs against Hardik and Surya.",
        hinglish: "Mitchell Starc 2.2 overs me 18 run dekar 1 wicket nikal chuke hain. Australia ke liye unke aakhri 10 deliveries match-defining hain.",
      },
    },
  ],
  events: [
    {
      id: "evt-starc-yorker",
      over: "14.2",
      type: "free-hit",
      category: "skill",
      title: "Starc's yorker dug out, single taken",
      term: "Inswinging Yorker",
      badgeText: getCricketPhaseTag("14.2"),
      badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
      fallbackExplain: {
        en: "Mitchell Starc nailed a 144 km/h inswinging yorker at Hardik Pandya's boots. Hardik jammed the bat down in time to squeeze a single into the covers.",
        hinglish: "Starc ne 144 km/h ki deadly yorker daali jise Hardik ne aakhri second par jam karke 1 run liya.",
      },
    },
    {
      id: "evt-sky-boundary",
      over: "13.5",
      type: "free-hit",
      category: "shot",
      title: "FOUR! Surya 360 Scoop Over Fine Leg",
      term: "360-Degree Ramp",
      badgeText: getCricketPhaseTag("13.5"),
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      fallbackExplain: {
        en: "Suryakumar Yadav got down on one knee and ramped Cummins over short fine leg for a boundary, cutting the required run rate below 10.",
        hinglish: "Surya ne Cummins ki ball ko fine leg ke upar scoop markar 4 runs liye, jisse required rate control me aa gaya.",
      },
    },
    {
      id: "evt-drs-review",
      over: "12.3",
      type: "drs",
      category: "review",
      title: "DRS: Australia Review Lost, Decision Stands",
      term: "Decision Review System (DRS)",
      badgeText: "REVIEW LOST",
      badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
      fallbackExplain: {
        en: "Australia reviewed an on-field not-out LBW decision against Hardik Pandya. Ball tracking confirmed impact was outside off-stump, meaning the on-field decision stands and Australia lost their review.",
        hinglish: "Australia ne Hardik Pandya ke khilaf on-field not-out decision par DRS review liya. Ball tracking me impact outside off raha, isliye on-field decision barkarar raha aur Australia ne apna review gawa diya.",
      },
    },
  ],
  storyFallback: {
    en: "Chasing 166, India suffered early blows before Hardik Pandya and Suryakumar Yadav stabilized the chase. Needing 54 off 34 balls at an RRR of 9.53, India hold a slight edge with 7 wickets in hand.",
    hinglish: "166 runs ke chase me shuruaati jhatkon ke baad Hardik Pandya aur Suryakumar Yadav ne paari ko sambhala hai. India ko 34 balls me 54 runs chahiye aur 7 wickets baaki hain.",
  },
  quickQuestions: ["What is DLS method?", "Explain LBW rule in cricket", "What is a Super Over?", "What is Powerplay?"],
  rulesDictionary: {
    dls: {
      term: "Duckworth-Lewis-Stern (DLS)",
      en: "DLS is a mathematical formula used in rain-affected cricket matches to set a revised target based on overs and wickets remaining.",
      hinglish: "DLS ek mathematical formula hai jo baarish ke baad naya target nikalta hai, remaining overs aur wickets ko count karke.",
    },
    lbw: {
      term: "Leg Before Wicket (LBW)",
      en: "LBW occurs when the ball strikes the batter's leg or pad and would have gone on to hit the stumps without bat contact.",
      hinglish: "LBW tab hota hai jab ball bat se pehle pad pe lagti hai aur seedha stumps ko hit kar rahi hoti hai.",
    },
    "super over": {
      term: "Super Over",
      en: "A 1-over tie-breaker where each team bats 6 balls with 2 wickets. The team scoring the most runs wins.",
      hinglish: "Tie match ka faisla karne ke liye dono teams 1-1 over (6 balls) khelti hain. Zyada run banane wali team jeet jaati hai.",
    },
    powerplay: {
      term: "Powerplay",
      en: "Mandatory fielding restriction overs where only 2 fielders are permitted outside the 30-yard ring, encouraging attacking shots.",
      hinglish: "Shuruaat ke overs me sirf 2 fielders 30-yard boundary ke bahar reh sakte hain, jisse batters zyada boundaries laga sakein.",
    },
    "free hit": {
      term: "Free Hit Rule",
      en: "Awarded after any no-ball delivery in limited-overs cricket. The batter cannot be dismissed off a free hit except through run out, obstructing the field, or hitting the ball twice.",
      hinglish: "No-ball ke agle delivery par Free Hit milta hai, jisme batter sirf run out ya fielding me rukawat daalne par hi out ho sakta hai.",
    },
    "no ball": {
      term: "No-Ball Delivery",
      en: "An illegal delivery caused by overstepping the crease, a waist-high full toss, or fielding circle infractions, awarding 1 penalty run plus an immediate Free Hit.",
      hinglish: "Line cross karne ya kamar se upar full toss daalne par umpire no-ball deta hai, jisse 1 penalty run aur Free Hit milta hai.",
    },
    drs: {
      term: "Decision Review System (DRS)",
      en: "A technology-assisted system allowing teams to challenge on-field umpire decisions using UltraEdge ball-tracking and Hawk-Eye trajectory. If the on-field decision stands, the reviewing team loses a review.",
      hinglish: "DRS ke through teams umpire ke decision ko challenge karti hain. UltraEdge aur ball-tracking se check kiya jata hai. Agar decision change nahi hota toh review loss hota hai.",
    },
    wide: {
      term: "Wide Ball Delivery",
      en: "A delivery judged too wide outside off or leg stump for the batter to hit with a standard stroke, penalizing the bowling team 1 extra run and requiring the ball to be bowled again.",
      hinglish: "Batter ki normal reach se door jaane wali delivery ko umpire wide deta hai. 1 extra run milta hai aur ball dobara phenkni padti hai.",
    },
  },
  simulationSequence: [
    {
      scorePrimary: "116/3",
      progressText: "14.3 / 20 Overs",
      progressPercent: 72,
      secondaryStatus: "Need 50 off 33 balls · RRR 9.09",
      activePerformerId: "hardik-pandya",
      winProbability: { team1: 71, team2: 29 },
      cricketState: { runsNeeded: 50, ballsLeft: 33, wicketsInHand: 7, currentRunRate: 8.0, requiredRunRate: 9.09 },
      playerStatsUpdates: { "hardik-pandya": "45* (29)", "mitchell-starc": "2.3-0-22-1" },
      newEvent: {
        id: "sim-four-14-3",
        over: "14.3",
        type: "free-hit",
        category: "shot",
        title: "FOUR! Cracking Cover Drive by Hardik",
        term: "Boundary (4 Runs)",
        badgeText: getCricketPhaseTag("14.3"),
        badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        fallbackExplain: {
          en: "Hardik opened the face of the blade and pierced extra cover for four. India are now within 50 runs of victory.",
          hinglish: "Hardik ne Starc ki ball ko khubsurat cover drive markar 4 runs liye. Target ab 50 runs ka reh gaya hai.",
        },
      },
    },
    {
      scorePrimary: "123/3",
      progressText: "14.5 / 20 Overs",
      progressPercent: 73,
      secondaryStatus: "Need 43 off 31 balls · RRR 8.32",
      activePerformerId: "suryakumar-yadav",
      winProbability: { team1: 79, team2: 21 },
      cricketState: { runsNeeded: 43, ballsLeft: 31, wicketsInHand: 7, currentRunRate: 8.3, requiredRunRate: 8.32 },
      playerStatsUpdates: { "suryakumar-yadav": "28* (15)", "mitchell-starc": "2.5-0-29-1" },
      newEvent: {
        id: "sim-six-14-5",
        over: "14.5",
        type: "free-hit",
        category: "shot",
        title: "SIX! Trademark SKY Scoop Ramp",
        term: "Maximum (6 Runs)",
        badgeText: getCricketPhaseTag("14.5"),
        badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
        fallbackExplain: {
          en: "Surya used Starc's 144 km/h pace to ramp the ball deep over fine leg. RRR plunges down to 8.32.",
          hinglish: "Surya ne ghutne par baith kar fine leg ke upar se 6 runs maar diye! Australia pressure me aa gaya hai.",
        },
      },
    },
    {
      scorePrimary: "128/3",
      progressText: "15.1 / 20 Overs",
      progressPercent: 76,
      secondaryStatus: "Need 38 off 29 balls · RRR 7.86",
      activePerformerId: "hardik-pandya",
      winProbability: { team1: 86, team2: 14 },
      cricketState: { runsNeeded: 38, ballsLeft: 29, wicketsInHand: 7, currentRunRate: 8.4, requiredRunRate: 7.86 },
      playerStatsUpdates: { "hardik-pandya": "50* (31)", "pat-cummins": "3.1-0-30-1" },
      newEvent: {
        id: "sim-fifty-15-1",
        over: "15.1",
        type: "free-hit",
        category: "skill",
        title: "50 FOR HARDIK PANDYA! (31b)",
        term: "Half-Century Milestone",
        badgeText: getCricketPhaseTag("15.1"),
        badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        fallbackExplain: {
          en: "Hardik Pandya brings up a clutch 31-ball fifty under intense chase pressure. India are now firm favorites.",
          hinglish: "Hardik ne sirf 31 balls me apni fifty poori ki! Match ab poori tarah India ke control me hai.",
        },
      },
    },
  ],
};
