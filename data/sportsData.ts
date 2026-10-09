import { Player, MatchEvent } from "./match";

export type SportId = "cricket" | "football" | "basketball" | "tennis" | "f1" | "kabaddi" | "custom";

export interface SportSimulationStep {
  scorePrimary: string;
  progressText: string;
  progressPercent: number;
  secondaryStatus: string;
  activePerformerId: string;
  playerStatsUpdates?: { [playerId: string]: string };
  winProbability?: { team1: number; team2: number };
  commentary?: string;
  newEvent?: MatchEvent;
}

export interface SportMatchConfig {
  id: string;
  sportId: SportId;
  sportName: string;
  sportIcon: string;
  matchTitle: string;
  seriesOrLeague: string;
  teams: [string, string];
  teamFullNames: [string, string];
  winProbability: { team1: number; team2: number };
  scoreDisplay: {
    primary: string;
    primaryLabel: string;
    progress: string;
    progressPercent: number;
    secondaryStatus: string;
  };
  players: Player[];
  events: MatchEvent[];
  storyFallback: {
    en: string;
    hinglish: string;
  };
  quickQuestions: string[];
  rulesDictionary: Record<string, { term: string; en: string; hinglish: string }>;
  simulationSequence?: SportSimulationStep[];
}

export const allSportsMatches: SportMatchConfig[] = [
  // 1. CRICKET (India vs Australia)
  {
    id: "cricket-ind-aus",
    sportId: "cricket",
    sportName: "Cricket",
    sportIcon: "🏏",
    matchTitle: "IND vs AUS",
    seriesOrLeague: "2nd T20I, Mumbai",
    teams: ["IND", "AUS"],
    teamFullNames: ["India", "Australia"],
    winProbability: { team1: 64, team2: 36 },
    scoreDisplay: {
      primary: "112/3",
      primaryLabel: "IND",
      progress: "14.2 / 20 Overs",
      progressPercent: 71,
      secondaryStatus: "Need 54 off 34 balls · RRR 9.5",
    },
    players: [
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
          "Premier pace-bowling all-rounder and finisher for India",
          "Captained Gujarat Titans to the IPL title in their inaugural 2022 season",
          "Renowned for extreme composure and maximum hits under pressure",
        ],
        fallbackIntro: {
          en: "Hardik Pandya is India's premier pace-bowling all-rounder, renowned for calm finishing under pressure. At 41* (28), his presence at the crease is the deciding factor in whether India scales the 54-run target.",
          hinglish: "Hardik Pandya India ke star all-rounder hain jo aakhri overs me game finish karne ke liye jaane jaate hain. Abhi 41* runs pe batting kar rahe hain aur unka tikna sabse zaroori hai.",
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
          "Former ICC Men's No. 1 ranked T20I batter worldwide",
          "Famous for his unorthodox 360-degree sweep and ramp shots",
          "Captain of India's T20 international squad",
        ],
        fallbackIntro: {
          en: "Suryakumar Yadav is a 360-degree stroke maker capable of dismantling any bowling attack with unorthodox angles. At 22* off 14, his partnership with Hardik keeps Australia under immense scoreboard pressure.",
          hinglish: "Surya India ke 360-degree batter hain jo ground ke har kone me aasaani se shots laga sakte hain. Abhi 22* runs bana chuke hain aur Hardik ke saath chase ko control me rakh rahe hain.",
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
          "Fastest bowler in history to reach 150 and 200 ODI wickets",
          "Legendary left-arm fast bowler known for 145+ km/h inswinging yorkers",
          "Two-time ODI World Cup and T20 World Cup champion",
        ],
        fallbackIntro: {
          en: "Mitchell Starc is Australia's elite left-arm spearhead whose lethal reverse-swing and pinpoint yorkers make him devastating at the death. Currently bowling to Hardik, his remaining deliveries could tilt the contest.",
          hinglish: "Mitchell Starc duniya ke sabse tez left-arm fast bowler hain jinki yorkers stumps uda deti hain. Abhi ball daal rahe hain aur unka yeh over match ka rukh badal sakta hai.",
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
          "Captained Australia to the 2023 World Test Championship and 2023 ODI World Cup",
          "Right-arm fast bowler with deadly off-cutters and relentless discipline",
          "Consistently dismisses top-order batters in high-stakes matches",
        ],
        fallbackIntro: {
          en: "Pat Cummins is Australia's talismanic leader and high-impact fast bowler who consistently breaks big partnerships. Having removed Tilak Varma earlier, his final over will be Australia's biggest defensive weapon.",
          hinglish: "Pat Cummins Australia ke World Cup winning captain hain jo pressure me hamesha wicket nikaalte hain. Inka aakhri over aana baaki hai jo game decide karega.",
        },
      },
    ],
    events: [
      {
        id: "evt-free-hit",
        over: "14.1",
        type: "free-hit",
        title: "No-ball & FREE HIT",
        term: "Free Hit",
        badgeText: "FREE HIT",
        badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        fallbackExplain: {
          en: "The bowler overstepped the crease resulting in a no-ball penalty run and an immediate Free Hit. On the next delivery, the batter cannot be out bowled, caught, or LBW.",
          hinglish: "Bowler ka paav crease ke aage chala gaya, isliye no-ball par Free Hit mila. Agli ball par batter catch ya bowled out nahi ho sakta, toh khul kar shot maar sakta hai.",
        },
      },
      {
        id: "evt-drs",
        over: "13.4",
        type: "drs",
        title: "DRS Review: LBW Not Out",
        term: "DRS Review",
        badgeText: "DRS",
        badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        fallbackExplain: {
          en: "Australia used the Decision Review System to challenge the umpire's Not Out decision for LBW against Hardik Pandya. Ball tracking confirmed the impact occurred outside off-stump.",
          hinglish: "Australia ne Hardik ke khilaf Not Out faisle par DRS review manga tha. Replay me ball stumps ke bahar lagi dikhi, isliye Hardik bach gaye aur review waste hua.",
        },
      },
      {
        id: "evt-wicket",
        over: "11.2",
        type: "wicket",
        title: "Wicket! Tilak c & b Cummins",
        term: "Caught & Bowled",
        badgeText: "WICKET",
        badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        fallbackExplain: {
          en: "Tilak Varma mistimed a slower cutter back to Pat Cummins, ending a vital 45-run stand. This brought Hardik Pandya to the crease with India needing 68 from 52 balls.",
          hinglish: "Tilak Varma Pat Cummins ki slow ball ko padh nahi paaye aur seedha bowler ke haath me catch de baithe. Iske baad Hardik Pandya batting karne aaye the.",
        },
      },
    ],
    storyFallback: {
      en: "India stumbled early losing Rohit in the 3rd over, but recovered through a disciplined 45-run partnership. Now Hardik Pandya (41*) and Suryakumar Yadav (22*) have taken control. India need 54 runs off the remaining 34 balls at a required run rate of 9.5.",
      hinglish: "India ne Rohit ka wicket jaldi gawa diya tha, par solid partnership se recovery hui. Ab Hardik aur Surya boundary lagakar match ko aage badha rahe hain. 34 balls me 54 runs chahiye jo achievable target hai.",
    },
    quickQuestions: ["What is DLS?", "What is LBW?", "What is a super over?", "What is Powerplay?"],
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
    },
    simulationSequence: [
      {
        scorePrimary: "116/3",
        progressText: "14.3 / 20 Overs",
        progressPercent: 72,
        secondaryStatus: "Need 50 off 33 balls · RRR 9.09",
        activePerformerId: "hardik-pandya",
        winProbability: { team1: 71, team2: 29 },
        playerStatsUpdates: { "hardik-pandya": "45* (29)", "mitchell-starc": "2.3-0-22-1" },
        newEvent: {
          id: "sim-four-14-3",
          over: "14.3",
          type: "free-hit",
          title: "FOUR! Cracking Cover Drive by Hardik",
          term: "Boundary (4 Runs)",
          badgeText: "BOUNDARY",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
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
        playerStatsUpdates: { "suryakumar-yadav": "28* (15)", "mitchell-starc": "2.5-0-29-1" },
        newEvent: {
          id: "sim-six-14-5",
          over: "14.5",
          type: "free-hit",
          title: "SIX! Trademark SKY Scoop Ramp",
          term: "Maximum (6 Runs)",
          badgeText: "MAXIMUM",
          badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
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
        playerStatsUpdates: { "hardik-pandya": "50* (31)", "pat-cummins": "3.1-0-30-1" },
        newEvent: {
          id: "sim-fifty-15-1",
          over: "15.1",
          type: "free-hit",
          title: "50 FOR HARDIK PANDYA! (31b)",
          term: "Half-Century Milestone",
          badgeText: "50 RUNS",
          badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          fallbackExplain: {
            en: "Hardik Pandya brings up a clutch 31-ball fifty under intense chase pressure. India are now firm favorites.",
            hinglish: "Hardik ne sirf 31 balls me apni fifty poori ki! Match ab poori tarah India ke control me hai.",
          },
        },
      },
    ],
  },

  // 2. FOOTBALL / SOCCER (Real Madrid vs Barcelona - El Clásico)
  {
    id: "football-el-clasico",
    sportId: "football",
    sportName: "Football",
    sportIcon: "⚽",
    matchTitle: "RMA vs FCB",
    seriesOrLeague: "La Liga · El Clásico, Santiago Bernabéu",
    teams: ["RMA", "FCB"],
    teamFullNames: ["Real Madrid", "Barcelona"],
    winProbability: { team1: 68, team2: 32 },
    scoreDisplay: {
      primary: "2 - 1",
      primaryLabel: "RMA vs FCB",
      progress: "74' 2nd Half",
      progressPercent: 82,
      secondaryStatus: "16 mins + stoppage left · Barcelona pressing high",
    },
    players: [
      {
        id: "vinicius-jr",
        name: "Vinícius Júnior",
        role: "Batter",
        onField: "1 Goal, 1 Assist",
        country: "Brazil",
        homeState: "Rio de Janeiro",
        formats: ["La Liga", "UCL", "Brazil"],
        isStriker: true,
        avatarInitials: "VJ",
        keyFacts: [
          "Ballon d'Or runner-up and Real Madrid's chief counter-attacking weapon",
          "Scored the winning goal in the 2022 Champions League Final",
          "Famous for electric acceleration and step-overs down the left wing",
        ],
        fallbackIntro: {
          en: "Vinícius Júnior is Real Madrid's explosive Brazilian winger whose lethal pace terrorizes Barcelona's high defensive line. With 1 goal and 1 assist tonight, his breaks on the counter are the match's biggest threat.",
          hinglish: "Vinícius Jr Real Madrid ke star Brazilian winger hain jinki speed Barça ki defense ke liye khatarnaak hai. Aaj unhone 1 goal aur 1 assist kiya hai aur counter-attack me game khatam kar sakte hain.",
        },
      },
      {
        id: "jude-bellingham",
        name: "Jude Bellingham",
        role: "Batter",
        onField: "89% Pass Acc, 4 Tackles",
        country: "England",
        homeState: "Birmingham",
        formats: ["La Liga", "UCL", "England"],
        isStriker: false,
        avatarInitials: "JB",
        keyFacts: [
          "Golden Boy and Kopa Trophy winner, Real Madrid's talismanic number 5",
          "Scored iconic stoppage-time winners in both Clásicos in his debut season",
          "Master of late runs into the penalty box and tireless pressing",
        ],
        fallbackIntro: {
          en: "Jude Bellingham is Madrid's powerhouse midfielder who dominates both penalty boxes with box-to-box stamina and clutch instincts. Controlling midfield tempo, he anchors Madrid's 2-1 lead.",
          hinglish: "Jude Bellingham Madrid ke complete box-to-box midfielder hain jo defense aur attack dono sambhalte hain. Clásico me late goals marne ke liye mashhoor hain aur lead maintain kar rahe hain.",
        },
      },
      {
        id: "robert-lewandowski",
        name: "Robert Lewandowski",
        role: "Bowler",
        onField: "1 Goal (58')",
        country: "Poland",
        homeState: "Warsaw",
        formats: ["La Liga", "UCL", "Poland"],
        avatarInitials: "RL",
        keyFacts: [
          "One of the greatest pure number 9 strikers of the modern era with 600+ career goals",
          "Two-time FIFA The Best Men's Player",
          "Clinical inside the penalty box with elite aerial ability and positioning",
        ],
        fallbackIntro: {
          en: "Robert Lewandowski is Barcelona's clinical spearhead who pulled one back in the 58th minute with a predator's finish. Needing an equalizer, all of Barça's attacking service is directed into his path.",
          hinglish: "Lewandowski Barcelona ke clinical striker hain jinhone 58ve minute me goal karke comeback shuru kiya. Barcelona ko barabari ke liye abhi bas unke paas ball supply karni hai.",
        },
      },
      {
        id: "lamine-yamal",
        name: "Lamine Yamal",
        role: "Bowler",
        onField: "5 Dribbles, 3 Key Passes",
        country: "Spain",
        homeState: "Mataró",
        formats: ["La Liga", "UCL", "Spain"],
        avatarInitials: "LY",
        keyFacts: [
          "Euro 2024 Young Player of the Tournament and champion with Spain at age 17",
          "La Masia prodigy famous for dipping left-footed curling shots and silky balance",
          "Youngest goalscorer in La Liga and El Clásico history",
        ],
        fallbackIntro: {
          en: "Lamine Yamal is Barcelona's 17-year-old wonderkid whose left-footed wizardry on the right flank keeps Madrid's left-back pinned back. His teasing crosses are creating constant danger in the final third.",
          hinglish: "Lamine Yamal Spain aur Barça ke 17 saal ke superstar winger hain jo right flank se jabardast dribbling aur crosses kar rahe hain. Har attack unhi ke pairon se create ho raha hai.",
        },
      },
    ],
    events: [
      {
        id: "evt-var-check",
        over: "69'",
        type: "drs",
        title: "VAR Check: Penalty Overruled",
        term: "VAR & Penalty Rule",
        badgeText: "VAR CHECK",
        badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        fallbackExplain: {
          en: "The referee consulted the pitchside VAR monitor to review a handball shout in Madrid's penalty area. Replay confirmed the arm was in a natural supporting position, keeping the score at 2-1.",
          hinglish: "Referee ne pitchside VAR monitor par check kiya ki penalty honi chahiye ya nahi. Replay me ball natural arm position pe lagi thi, isliye penalty reject ho gayi.",
        },
      },
      {
        id: "evt-lewa-goal",
        over: "58'",
        type: "free-hit",
        title: "GOAL! Lewandowski Header",
        term: "Offside Trap Beaten",
        badgeText: "GOAL (2-1)",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        fallbackExplain: {
          en: "Lewandowski timed his run to perfection behind Madrid's central defense, nodding home Yamal's pinpoint cross to slash the deficit to 2-1 and reignite the match.",
          hinglish: "Lewandowski ne Madrid ke offside trap ko beat kiya aur Yamal ke cross par khubsurat header markar score 2-1 kar diya. Match me zabardast thrill wapas aa gaya hai.",
        },
      },
    ],
    storyFallback: {
      en: "Real Madrid took commanding 2-0 control through Vinícius's solo brilliance and a swift transition strike. Barcelona altered their formation at halftime, pulling one back through Lewandowski at 58'. Barcelona are now throwing numbers forward in search of an equalizer with 16 minutes left.",
      hinglish: "Real Madrid ne pehle half me Vinícius ke dum par 2-0 ki lead le li thi. Second half me Barça ne aggressive pressing ki aur Lewandowski ke goal se score 2-1 ho gaya. Ab aakhri 16 minute me Barça equalise karne ke liye poora zor laga rahi hai.",
    },
    quickQuestions: ["What is Offside in football?", "How does VAR work?", "What causes a Red Card?", "What is Extra Time?"],
    rulesDictionary: {
      offside: {
        term: "Offside Rule",
        en: "An attacking player is caught offside if any part of their head, body, or feet is closer to the opponent's goal line than both the ball and the second-last opponent when the pass is played.",
        hinglish: "Agar pass dete waqt attacking player opponent ke aakhri defender aur ball dono se aage khada ho, toh referee offside ka whistle baja deta hai.",
      },
      var: {
        term: "Video Assistant Referee (VAR)",
        en: "VAR is a video review technology used for four match-changing situations: goals, penalty decisions, direct red cards, and mistaken player identity.",
        hinglish: "VAR ek video replay system hai jo referee ko 4 bade faislon me madad karta hai: goals, penalties, direct red cards aur galat player ko card dene par.",
      },
      penalty: {
        term: "Penalty Kick",
        en: "Awarded when a direct foul or handball occurs inside the defending team's penalty box. Taken from the 12-yard penalty spot with only the goalkeeper defending.",
        hinglish: "Jab penalty box ke andar foul ya handball hota hai, toh 12 yard se direct penalty milti hai jisme sirf goalkeeper saamne hota hai.",
      },
    },
    simulationSequence: [
      {
        scorePrimary: "2 - 2",
        progressText: "82' 2nd Half",
        progressPercent: 91,
        secondaryStatus: "EQUALIZER! Lamine Yamal curler from 20 yards!",
        activePerformerId: "lamine-yamal",
        winProbability: { team1: 45, team2: 55 },
        playerStatsUpdates: { "lamine-yamal": "1 Goal, 1 Assist, 6 Dribbles" },
        newEvent: {
          id: "sim-fb-yamal-goal",
          over: "82'",
          type: "free-hit",
          title: "GOAL! 17-Yr-Old Yamal Stunner (2-2)",
          term: "Curled Top Corner Strike",
          badgeText: "EQUALIZER",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          fallbackExplain: {
            en: "Lamine Yamal cut inside from the right wing and curled an unstoppable left-footed missile into the top corner. El Clásico is level at 2-2!",
            hinglish: "Lamine Yamal ne right wing se cut karke top corner me zabardast goal daal diya! Score 2-2 barabar ho gaya!",
          },
        },
      },
      {
        scorePrimary: "3 - 2",
        progressText: "90+1' Stoppage",
        progressPercent: 98,
        secondaryStatus: "GOAL! JUDE BELLINGHAM 91st-MIN WINNER!",
        activePerformerId: "jude-bellingham",
        winProbability: { team1: 94, team2: 6 },
        playerStatsUpdates: { "jude-bellingham": "1 Goal (91'), 5 Tackles" },
        newEvent: {
          id: "sim-fb-jude-winner",
          over: "90+1'",
          type: "free-hit",
          title: "GOAL! Bellingham Stoppage-Time Winner!",
          term: "Clutch Match Winner",
          badgeText: "WINNER 91'",
          badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          fallbackExplain: {
            en: "Jude Bellingham stormed into the 6-yard box and converted Vinícius's cutback in the 91st minute. The Bernabéu erupts as Madrid lead 3-2!",
            hinglish: "Bellingham ne 91ve minute me Vini ke pass par winning goal daal diya! Real Madrid 3-2 se aage ho gayi!",
          },
        },
      },
    ],
  },

  // 3. BASKETBALL (Los Angeles Lakers vs Golden State Warriors)
  {
    id: "basketball-nba",
    sportId: "basketball",
    sportName: "Basketball",
    sportIcon: "🏀",
    matchTitle: "LAL vs GSW",
    seriesOrLeague: "NBA Western Conference Clash · Crypto.com Arena",
    teams: ["LAL", "GSW"],
    teamFullNames: ["Los Angeles Lakers", "Golden State Warriors"],
    winProbability: { team1: 62, team2: 38 },
    scoreDisplay: {
      primary: "108 - 104",
      primaryLabel: "LAL vs GSW",
      progress: "Q4 2:45 (14s Shot Clock)",
      progressPercent: 94,
      secondaryStatus: "Lakers lead by 4 · Warriors call 20s timeout",
    },
    players: [
      {
        id: "lebron-james",
        name: "LeBron James",
        role: "Batter",
        onField: "28 Pts, 8 Reb, 9 Ast",
        country: "USA",
        homeState: "Ohio",
        formats: ["NBA", "Team USA"],
        isStriker: true,
        avatarInitials: "LJ",
        keyFacts: [
          "NBA's all-time leading scorer with 40,000+ career regular-season points",
          "4-time NBA Champion, 4-time Finals MVP, and 4-time regular-season MVP",
          "Unmatched basketball IQ and freight-train downhill transition drives",
        ],
        fallbackIntro: {
          en: "LeBron James is the NBA's all-time scoring leader who commands the floor with unmatched court vision. Sitting on 28 points and 9 assists, he orchestrates every fourth-quarter possession for the Lakers.",
          hinglish: "LeBron James basketball history ke sabse bade legend aur all-time top scorer hain. 28 points aur 9 assists bana chuke hain aur fourth quarter ke crucial moments me game unhi ke hath me hai.",
        },
      },
      {
        id: "anthony-davis",
        name: "Anthony Davis",
        role: "Batter",
        onField: "22 Pts, 14 Reb, 4 Blk",
        country: "USA",
        homeState: "Illinois",
        formats: ["NBA", "Team USA"],
        isStriker: false,
        avatarInitials: "AD",
        keyFacts: [
          "Elite two-way big man and premier rim protector in the NBA",
          "9-time NBA All-Star and 2020 NBA Champion",
          "Dominates the paint with rim-rattling lobs and chasedown blocks",
        ],
        fallbackIntro: {
          en: "Anthony Davis is the defensive anchor of the Lakers whose 14 rebounds and 4 blocks shut down the paint completely. His rim protection prevents easy floaters and fuels fast-break points.",
          hinglish: "Anthony Davis Lakers ke sabse bade defensive shield hain jinhone 14 rebounds aur 4 blocks kiye hain. Paint me unki presence Warriors ke players ko easy basket banane se rok rahi hai.",
        },
      },
      {
        id: "stephen-curry",
        name: "Stephen Curry",
        role: "Bowler",
        onField: "32 Pts, 7/13 3PM",
        country: "USA",
        homeState: "North Carolina",
        formats: ["NBA", "Team USA"],
        avatarInitials: "SC",
        keyFacts: [
          "The greatest shooter in basketball history, single-handedly revolutionizing the 3-point game",
          "4-time NBA Champion and 2-time regular-season MVP",
          "Limitless shooting range extending well beyond 35 feet",
        ],
        fallbackIntro: {
          en: "Stephen Curry is the greatest 3-point marksman in history whose limitless range stretches defenses past half-court. With 7 triples tonight and Warriors down 4, every screen is designed to free him.",
          hinglish: "Steph Curry basketball ke sabse deadly 3-point shooter hain. 7 three-pointers maar chuke hain aur aakhri do minute me unka ek single shot match ko tie ya jeeta sakta hai.",
        },
      },
      {
        id: "draymond-green",
        name: "Draymond Green",
        role: "Bowler",
        onField: "8 Pts, 9 Reb, 10 Ast, 2 Stl",
        country: "USA",
        homeState: "Michigan",
        formats: ["NBA", "Team USA"],
        avatarInitials: "DG",
        keyFacts: [
          "Former NBA Defensive Player of the Year and vocal heartbeat of the Warriors dynasty",
          "4-time NBA Champion with unmatched screening and playmaking from the forward spot",
          "Master of quarterbacking team defense and pushing the transition pace",
        ],
        fallbackIntro: {
          en: "Draymond Green is Golden State's emotional heartbeat and defensive mastermind who sets the bone-crunching screens that liberate Curry. He directs defensive switches to keep the Warriors within striking distance.",
          hinglish: "Draymond Green Warriors ke defensive mastermind hain jo team ke saare passes aur screens control karte hain. Curry ko open shot dilane me unka sabse bada role hota hai.",
        },
      },
    ],
    events: [
      {
        id: "evt-curry-three",
        over: "Q4 3:12",
        type: "free-hit",
        title: "Curry Step-Back 3-Pointer!",
        term: "3-Point Shot",
        badgeText: "DEEP THREE",
        badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        fallbackExplain: {
          en: "Curry used a crossover dribble and stepped back behind the 24-foot arc to drill an off-balance three-pointer, cutting the Lakers lead to just 4 points.",
          hinglish: "Curry ne defender ko crossover se jhulaya aur 24-foot ki line ke peeche se step-back 3-pointer daal diya! Lead ab sirf 4 points ki reh gayi hai.",
        },
      },
    ],
    storyFallback: {
      en: "The game was a back-and-forth dogfight through three quarters. LeBron and Davis dominated inside the paint to build a 9-point cushion, but Steph Curry responded with three clutch fourth-quarter triples. With 2:45 remaining, the Lakers cling to a tense 108-104 lead.",
      hinglish: "Teeno quarters tak dono teams barabar chal rahi thi. Fourth quarter me LeBron aur Davis ne paint me control banaya, par Steph Curry ne clutch 3-pointers maare. Ab 2:45 minutes bache hain aur match kaafi tight hai.",
    },
    quickQuestions: ["What is the Shot Clock rule?", "What is a Triple-Double?", "What is Traveling?", "What is Goaltending?"],
    rulesDictionary: {
      "shot clock": {
        term: "24-Second Shot Clock",
        en: "The offensive team has 24 seconds from gaining possession to attempt a shot that at least touches the rim, otherwise a turnover is called.",
        hinglish: "Attacking team ko ball milne ke baad 24 seconds me rim pe shot lagana padta hai, warna ball dusri team ko mil jaati hai.",
      },
      "triple-double": {
        term: "Triple-Double",
        en: "Achieved when a player records double digits (10 or more) in three of the five positive statistical categories: points, rebounds, assists, steals, or blocks.",
        hinglish: "Jab ek player 10 ya usse zyada points, rebounds aur assists teen alag stats me bana leta hai, use triple-double kehte hain.",
      },
    },
    simulationSequence: [
      {
        scorePrimary: "108 - 107",
        progressText: "Q4 1:45",
        progressPercent: 96,
        secondaryStatus: "Curry drills another triple! 1-point game!",
        activePerformerId: "stephen-curry",
        winProbability: { team1: 52, team2: 48 },
        playerStatsUpdates: { "stephen-curry": "35 Pts, 8/14 3PM" },
        newEvent: {
          id: "sim-bb-curry-clutch",
          over: "Q4 1:45",
          type: "free-hit",
          title: "CURRY CLUTCH THREE! (35 PTS)",
          term: "Transition 3-Pointer",
          badgeText: "1-PT GAME",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          fallbackExplain: {
            en: "Steph Curry pulled up from 30 feet in transition to bury his 8th triple! The arena is on its feet.",
            hinglish: "Curry ne 30 feet door se bina ruke 8va three-pointer daal diya! Ab sirf 1 point ka gap hai.",
          },
        },
      },
      {
        scorePrimary: "112 - 107",
        progressText: "Q4 0:24",
        progressPercent: 99,
        secondaryStatus: "LeBron and-one drive seals it!",
        activePerformerId: "lebron-james",
        winProbability: { team1: 96, team2: 4 },
        playerStatsUpdates: { "lebron-james": "31 Pts, 9 Reb, 10 Ast" },
        newEvent: {
          id: "sim-bb-lebron-andone",
          over: "Q4 0:24",
          type: "free-hit",
          title: "LEBRON AND-ONE DOWNHILL DRIVE!",
          term: "Basket + Free Throw (And-One)",
          badgeText: "CLUTCH AND-1",
          badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          fallbackExplain: {
            en: "LeBron James absorbed contact through Draymond Green to finish the layup off the glass and hit the ensuing free throw.",
            hinglish: "LeBron ne foul hone ke bawajood basket complete kiya aur free throw se lead 5 points ki kar di!",
          },
        },
      },
    ],
  },

  // 4. TENNIS (Carlos Alcaraz vs Novak Djokovic)
  {
    id: "tennis-slam",
    sportId: "tennis",
    sportName: "Tennis",
    sportIcon: "🎾",
    matchTitle: "Alcaraz vs Djokovic",
    seriesOrLeague: "Wimbledon Men's Singles Final · Centre Court",
    teams: ["ALC", "DJO"],
    teamFullNames: ["Carlos Alcaraz", "Novak Djokovic"],
    winProbability: { team1: 56, team2: 44 },
    scoreDisplay: {
      primary: "6-4, 4-6, 4-3",
      primaryLabel: "Alcaraz vs Djokovic",
      progress: "Set 3 · Game 8 (40-30)",
      progressPercent: 62,
      secondaryStatus: "Alcaraz serving on game point · High tension rally",
    },
    players: [
      {
        id: "carlos-alcaraz",
        name: "Carlos Alcaraz",
        role: "Batter",
        onField: "Set 3 (4-3, 40-30) · 38 Winners",
        country: "Spain",
        homeState: "El Palmar, Murcia",
        formats: ["ATP", "Grand Slams"],
        isStriker: true,
        avatarInitials: "CA",
        keyFacts: [
          "4-time Grand Slam champion across hard, clay, and grass surfaces at just 21",
          "Youngest world No. 1 in ATP history",
          "Electric speed, booming inside-out forehand, and disguised drop shots",
        ],
        fallbackIntro: {
          en: "Carlos Alcaraz is tennis's dynamic Spanish prodigy whose blistering footspeed and devastating forehand test Djokovic's baseline stamina. Serving at 40-30, holding puts him one game from taking the 3rd set.",
          hinglish: "Carlos Alcaraz Spain ke superstar hain jinki speed aur forehand power zabardast hai. Abhi 40-30 par serve kar rahe hain aur teesra set jeetne ki taraf badhenge.",
        },
      },
      {
        id: "novak-djokovic",
        name: "Novak Djokovic",
        role: "Bowler",
        onField: "Set 3 (3-4) · 88% Net Points",
        country: "Serbia",
        homeState: "Belgrade",
        formats: ["ATP", "Grand Slams"],
        avatarInitials: "ND",
        keyFacts: [
          "All-time record holder with 24 Grand Slam Men's singles titles",
          "Greatest return of serve and baseline defensive wall in tennis history",
          "Unrivaled mental toughness in tiebreaks and five-set epics",
        ],
        fallbackIntro: {
          en: "Novak Djokovic is the all-time 24-time Grand Slam champion renowned for his elastic defense and clutch return. Looking to break back, he is probing Alcaraz's backhand.",
          hinglish: "Novak Djokovic 24 Grand Slam jeet kar tennis ke GOAT hain. Unki return aur baseline defense se nikalna mushkil hota hai.",
        },
      },
    ],
    events: [
      {
        id: "evt-break-point",
        over: "Set 3 Gm 7",
        type: "drs",
        title: "Break Point Saved! 130 mph Ace",
        term: "Break Point & Ace",
        badgeText: "ACE SAVER",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        fallbackExplain: {
          en: "Alcaraz faced break point down 30-40 and fired an untouchable 130 mph wide slice ace on the line to level the game at deuce.",
          hinglish: "Alcaraz par break point ka khatra tha aur unhone line par 130 mph ka ace maara jisse game deuce ho gaya.",
        },
      },
    ],
    storyFallback: {
      en: "Alcaraz captured the first set 6-4 with aggressive baseline hitting, but Djokovic roared back to take the second 6-4. Alcaraz leads 4-3 and is serving at 40-30 in game 8.",
      hinglish: "Pehle set me Alcaraz ne 6-4 se baazi maari, par second set me Djokovic ne barabari kar li. Ab teesre set me Alcaraz 4-3 se aage serve kar rahe hain.",
    },
    quickQuestions: ["What is Break Point?", "How does Deuce work?", "What is a Tiebreak?"],
    rulesDictionary: {
      "break point": {
        term: "Break Point",
        en: "A situation where the receiving player is one point away from winning the game against the server's delivery.",
        hinglish: "Jab return karne wala player bas 1 point door hota hai server ki game chheen lene se, use break point kehte hain.",
      },
    },
    simulationSequence: [
      {
        scorePrimary: "6-4, 4-6, 5-3",
        progressText: "Set 3 · Game 9",
        progressPercent: 70,
        secondaryStatus: "Alcaraz holds with 132mph Ace! Leads 5-3",
        activePerformerId: "carlos-alcaraz",
        winProbability: { team1: 72, team2: 28 },
        playerStatsUpdates: { "carlos-alcaraz": "Set 3 (5-3) · 40 Winners" },
        newEvent: {
          id: "sim-tn-ace-hold",
          over: "Set 3 Gm 8",
          type: "free-hit",
          title: "ACE! Alcaraz Holds for 5-3 Lead",
          term: "Service Hold",
          badgeText: "GAME HOLD",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          fallbackExplain: {
            en: "Carlos Alcaraz blasted a flat 132 mph ace down the T to seal the hold. He is now one game from capturing the critical 3rd set.",
            hinglish: "Alcaraz ne seedha 132 mph ka ace maarkar game jeeta aur 5-3 ki lead bana li.",
          },
        },
      },
      {
        scorePrimary: "6-4, 4-6, 6-3",
        progressText: "Set 4 · Game 1",
        progressPercent: 80,
        secondaryStatus: "SET ALCARAZ! Spanish star breaks Djokovic!",
        activePerformerId: "carlos-alcaraz",
        winProbability: { team1: 82, team2: 18 },
        playerStatsUpdates: { "carlos-alcaraz": "2 Sets to 1 · 43 Winners" },
        newEvent: {
          id: "sim-tn-set-won",
          over: "Set 3 Gm 9",
          type: "free-hit",
          title: "BREAK & SET! Alcaraz Takes Set 3 (6-3)",
          term: "Set Point Conversion",
          badgeText: "SET 3 WON",
          badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          fallbackExplain: {
            en: "Alcaraz hit a running forehand passing shot down the line on set point to break Djokovic and take a 2-1 sets lead!",
            hinglish: "Alcaraz ne line par passing shot markar Djokovic ki serve todi aur teesra set 6-3 se jeet liya!",
          },
        },
      },
    ],
  },

  // 5. FORMULA 1 (Monaco Grand Prix)
  {
    id: "f1-monaco",
    sportId: "f1",
    sportName: "Formula 1",
    sportIcon: "🏎️",
    matchTitle: "VER vs LEC vs NOR",
    seriesOrLeague: "Formula 1 Grand Prix de Monaco · Circuit de Monaco",
    teams: ["RBR", "FER"],
    teamFullNames: ["Red Bull Racing", "Ferrari"],
    winProbability: { team1: 78, team2: 22 },
    scoreDisplay: {
      primary: "Lap 54 / 78",
      primaryLabel: "VER (P1)",
      progress: "Gap: +1.428s",
      progressPercent: 69,
      secondaryStatus: "Leclerc (P2) chasing within DRS window · Tyre graining reported",
    },
    players: [
      {
        id: "max-verstappen",
        name: "Max Verstappen",
        role: "Batter",
        onField: "P1 (Leader) · Interval: +1.4s · Hard Tyres",
        country: "Netherlands",
        homeState: "Hasselt",
        formats: ["Formula 1", "Red Bull Racing"],
        isStriker: true,
        avatarInitials: "MV",
        keyFacts: [
          "Multiple-time F1 World Champion renowned for ruthless racecraft and wet-weather mastery",
          "Record holder for most consecutive Grand Prix wins in a single season (10)",
          "Incredible tyre management and metronomic lap time consistency",
        ],
        fallbackIntro: {
          en: "Max Verstappen leads the Monaco Grand Prix in his Red Bull, driving with surgical precision between the armco barriers. Avoiding backmarker traffic is his primary battle.",
          hinglish: "Max Verstappen Monaco Grand Prix me P1 par lead kar rahe hain. Leclerc unke peeche 1.4 seconds ke fasle par hain aur ek galti bhi crash kara sakti hai.",
        },
      },
      {
        id: "charles-leclerc",
        name: "Charles Leclerc",
        role: "Bowler",
        onField: "P2 · Fast Lap (1:13.821) · Medium Tyres",
        country: "Monaco",
        homeState: "Monte Carlo",
        formats: ["Formula 1", "Scuderia Ferrari"],
        avatarInitials: "CL",
        keyFacts: [
          "Ferrari's Monegasque qualifying specialist driving on his home streets",
          "Holder of the current fastest lap of the race",
          "Chasing victory in Monte Carlo with superior medium-compound grip",
        ],
        fallbackIntro: {
          en: "Charles Leclerc is hunting Verstappen on his home circuit of Monaco with blistering lap times. Needing an overtake, he is watching the pit windows.",
          hinglish: "Charles Leclerc apne home track Monaco par Ferrari ke saath second number par chase kar rahe hain.",
        },
      },
    ],
    events: [
      {
        id: "evt-fastest-lap",
        over: "Lap 51",
        type: "free-hit",
        title: "Purple Sector! Fastest Lap by Leclerc",
        term: "Fastest Lap Bonus Point",
        badgeText: "FASTEST LAP",
        badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        fallbackExplain: {
          en: "Leclerc set all three sectors purple to record a 1:13.821 lap time, claiming the provisional championship bonus point.",
          hinglish: "Leclerc ne teeno sectors me fastest time nikaal kar race ka fastest lap banaya.",
        },
      },
    ],
    storyFallback: {
      en: "Verstappen defended into Sainte Devote at the start. Ferrari kept Leclerc out on medium tyres to build an offset strategy. As tyre wear sets in, the gap has shrunk to 1.4 seconds with 24 laps to go.",
      hinglish: "Verstappen ne start se hi lead banaye rakhi thi, lekin Ferrari ne Leclerc ke saath different tyre strategy apnayi. Lap 54 par gap sirf 1.4 seconds reh gaya hai.",
    },
    quickQuestions: ["How does DRS work?", "What is an Undercut?", "What are Safety Car rules?"],
    rulesDictionary: {
      drs: {
        term: "Drag Reduction System (DRS)",
        en: "A hydraulic flap on the rear wing that opens in designated zones when a car is within 1 second of the car ahead, reducing aerodynamic drag to aid overtaking.",
        hinglish: "DRS rear wing ka ek flap hota hai jo car ke aage wali car se 1 second ke andar hone par khulta hai aur speed badhata hai taaki overtake aasan ho sake.",
      },
    },
    simulationSequence: [
      {
        scorePrimary: "Lap 63 / 78",
        progressText: "Gap: +0.782s (DRS Open)",
        progressPercent: 81,
        secondaryStatus: "Leclerc within 0.8s! DRS activated into Nouvelle Chicane!",
        activePerformerId: "charles-leclerc",
        winProbability: { team1: 65, team2: 35 },
        playerStatsUpdates: { "charles-leclerc": "P2 · Gap: +0.78s (Fastest Sector 1)" },
        newEvent: {
          id: "sim-f1-drs-attack",
          over: "Lap 63",
          type: "free-hit",
          title: "DRS ATTACK! Leclerc within 0.78s",
          term: "DRS Window Overtake Attempt",
          badgeText: "DRS ACTIVE",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          fallbackExplain: {
            en: "Leclerc has closed inside 1 second to deploy his rear wing DRS flap through the tunnel exit, threatening Verstappen's lead.",
            hinglish: "Leclerc ne fasla 1 second se kam kar diya aur tunnel exit par DRS khol kar Verstappen par pressure bana diya.",
          },
        },
      },
      {
        scorePrimary: "Lap 74 / 78",
        progressText: "Gap: +2.140s",
        progressPercent: 95,
        secondaryStatus: "Verstappen masters backmarker traffic · 4 laps to flag!",
        activePerformerId: "max-verstappen",
        winProbability: { team1: 94, team2: 6 },
        playerStatsUpdates: { "max-verstappen": "P1 · Gap: +2.14s" },
        newEvent: {
          id: "sim-f1-lead-secured",
          over: "Lap 74",
          type: "free-hit",
          title: "Verstappen Clears Traffic, Gap Widens to 2.1s",
          term: "Race Control in Monaco",
          badgeText: "P1 EXTENDED",
          badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          fallbackExplain: {
            en: "Verstappen sliced cleanly through lapped cars at Rascasse while Leclerc lost half a second, pushing the cushion to 2.1 seconds.",
            hinglish: "Verstappen ne traffic ko clean tareeqe se overtake kiya aur lead 2.1 seconds tak badha li.",
          },
        },
      },
    ],
  },

  // 6. KABADDI (Patna Pirates vs Puneri Paltan)
  {
    id: "kabaddi-pkl",
    sportId: "kabaddi",
    sportName: "Kabaddi",
    sportIcon: "🤼",
    matchTitle: "PAT vs PUN",
    seriesOrLeague: "Pro Kabaddi League · Finals, Hyderabad",
    teams: ["PAT", "PUN"],
    teamFullNames: ["Patna Pirates", "Puneri Paltan"],
    winProbability: { team1: 66, team2: 34 },
    scoreDisplay: {
      primary: "32 - 28",
      primaryLabel: "Patna Pirates",
      progress: "2nd Half · 34' Mins",
      progressPercent: 85,
      secondaryStatus: "Patna lead by 4 · Do-or-Die Raid coming up for Puneri",
    },
    players: [
      {
        id: "sachin-tanwar",
        name: "Sachin Tanwar",
        role: "Batter",
        onField: "11 Raid Points · Super 10",
        country: "India",
        homeState: "Rajasthan",
        formats: ["Pro Kabaddi", "India"],
        isStriker: true,
        avatarInitials: "ST",
        keyFacts: [
          "One of PKL's most consistent do-or-die specialists",
          "Renowned for quick hand touches, toe touches, and deceptive frog jumps",
          "Scored a Super 10 in tonight's championship battle",
        ],
        fallbackIntro: {
          en: "Sachin Tanwar is Patna Pirates' premier raider who excels under do-or-die pressure with lighting-fast toe touches. Having crossed his Super 10 tonight, his patience is starving Puneri's defenders.",
          hinglish: "Sachin Tanwar Patna Pirates ke main raider hain jo do-or-die raids me point nikaalne me expert hain. Super 10 bana chuke hain aur Patna ki 4 point lead maintain kar rahe hain.",
        },
      },
      {
        id: "mohammadreza-shadloui",
        name: "Mohammadreza Shadloui",
        role: "Bowler",
        onField: "6 Tackle Points · High 5",
        country: "Iran",
        homeState: "Tehran",
        formats: ["Pro Kabaddi", "Iran"],
        avatarInitials: "MS",
        keyFacts: [
          "Fierce Iranian left-corner defender and PKL's top tackle-point scorer",
          "Master of the ankle hold, diving thigh hold, and back holds",
          "Single-handedly sparks super tackles against multi-man attacks",
        ],
        fallbackIntro: {
          en: "Mohammadreza Shadloui is Puneri Paltan's Iranian defensive titan who locks down the left corner with ferocious ankle holds. With a High 5 tonight, one tackle from him can trigger an all-out against Patna.",
          hinglish: "Mohammadreza Shadloui Iran ke zabardast left-corner defender hain jo ankle hold lagane me maahir hain. Unka ek tackle game ka paasa palat sakta hai.",
        },
      },
    ],
    events: [
      {
        id: "evt-super-tackle",
        over: "31' Mins",
        type: "drs",
        title: "SUPER TACKLE! (2 Points)",
        term: "Super Tackle Rule",
        badgeText: "SUPER TACKLE",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        fallbackExplain: {
          en: "With only 3 defenders on the mat, Puneri captured Patna's raider to earn 2 bonus tackle points and avoid an all-out.",
          hinglish: "Mat par sirf 3 defenders the, isliye raider ko out karne par Puneri ko 2 points mile aur all-out tal gaya.",
        },
      },
    ],
    storyFallback: {
      en: "Puneri Paltan dominated early defense with Shadloui's ankle holds. However, Sachin Tanwar led Patna's comeback with a dazzling 3-point Super Raid. Patna lead 32-28 with 6 minutes remaining in a thrilling PKL showdown.",
      hinglish: "Pehle half me Puneri ne defense se dabav banaya, par Sachin Tanwar ke Super Raid ne Patna ko lead dila di. Ab aakhri 6 minutes bache hain aur score 32-28 hai.",
    },
    quickQuestions: ["What is a Do-or-Die Raid?", "What is a Super Tackle?", "What is an All-Out?"],
    rulesDictionary: {
      "do-or-die": {
        term: "Do-or-Die Raid",
        en: "If a team conducts two consecutive empty raids with zero points scored, their third raid is designated do-or-die. The raider must score a point or be declared out.",
        hinglish: "Agar lagataar do raids me koi point nahi banta, toh teesri raid Do-or-Die hoti hai jisme point lena zaroori hota hai warna raider out ho jaata hai.",
      },
    },
    simulationSequence: [
      {
        scorePrimary: "33 - 30",
        progressText: "2nd Half · 37' Mins",
        progressPercent: 92,
        secondaryStatus: "SHADLOUI ANKLE HOLD! Super tackle brings Puneri close!",
        activePerformerId: "mohammadreza-shadloui",
        winProbability: { team1: 58, team2: 42 },
        playerStatsUpdates: { "mohammadreza-shadloui": "8 Tackle Points (2 Super Tackles)" },
        newEvent: {
          id: "sim-kb-super-tackle-2",
          over: "37' Mins",
          type: "free-hit",
          title: "SHADLOUI SUPER TACKLE! (2 Pts)",
          term: "Crucial Super Tackle",
          badgeText: "SUPER TACKLE",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          fallbackExplain: {
            en: "Shadloui executed a vicious diving ankle lock to bring down Patna's raider in a 3-man defense, reviving Puneri's chances.",
            hinglish: "Shadloui ne diving ankle hold lagakar raider ko gira diya aur Puneri ko 2 points dila kar match me zinda rakha.",
          },
        },
      },
      {
        scorePrimary: "36 - 31",
        progressText: "Full Time · 40' Mins",
        progressPercent: 100,
        secondaryStatus: "PATNA PIRATES WIN PKL TITLE! Sachin 3-point multi-touch raid!",
        activePerformerId: "sachin-tanwar",
        winProbability: { team1: 100, team2: 0 },
        playerStatsUpdates: { "sachin-tanwar": "14 Raid Points · Final MVP" },
        newEvent: {
          id: "sim-kb-title-win",
          over: "40' Mins",
          type: "free-hit",
          title: "PATNA PIRATES CROWNED PKL CHAMPIONS!",
          term: "Championship Victory",
          badgeText: "CHAMPIONS",
          badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          fallbackExplain: {
            en: "Sachin Tanwar crossed the midline with two defenders on his back as the final whistle blows. Patna Pirates secure the championship 36-31!",
            hinglish: "Sachin ne aakhri raid me 2 points lekar midline cross ki aur Patna Pirates ne trophy jeet li!",
          },
        },
      },
    ],
  },
];
