import { SportMatchConfig } from "../types";

export const footballMatch: SportMatchConfig = {
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
  // TODO verify: Football player roster
  players: [
    {
      id: "vinicius-jr",
      name: "Vinícius Júnior",
      role: "Attacker",
      onField: "1 Goal, 1 Assist",
      country: "Brazil",
      homeState: "Rio de Janeiro",
      formats: ["La Liga", "UCL", "Brazil"],
      isStriker: true,
      avatarInitials: "VJ",
      // TODO verify: Vinícius Júnior key facts
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
      role: "Midfielder",
      onField: "89% Pass Acc, 4 Tackles",
      country: "England",
      homeState: "Birmingham",
      formats: ["La Liga", "UCL", "England"],
      isStriker: false,
      avatarInitials: "JB",
      // TODO verify: Jude Bellingham key facts
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
      role: "Attacker",
      onField: "1 Goal (58')",
      country: "Poland",
      homeState: "Warsaw",
      formats: ["La Liga", "UCL", "Poland"],
      isStriker: false,
      avatarInitials: "RL",
      // TODO verify: Robert Lewandowski key facts
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
      role: "Attacker",
      onField: "5 Dribbles, 3 Key Passes",
      country: "Spain",
      homeState: "Mataró",
      formats: ["La Liga", "UCL", "Spain"],
      isStriker: false,
      avatarInitials: "LY",
      // TODO verify: Lamine Yamal key facts
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
      badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
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
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
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
      en: "A video review system that assists the main referee in overturning clear and obvious errors in goals, penalty decisions, direct red cards, and mistaken identity.",
      hinglish: "VAR video replay system hai jo referee ko penalties, goals aur red cards ke clear decisions check karne me help karta hai.",
    },
  },
  simulationSequence: [
    {
      scorePrimary: "2 - 1",
      progressText: "82' 2nd Half",
      progressPercent: 91,
      secondaryStatus: "Courtois fingertip save denies Yamal curler!",
      activePerformerId: "lamine-yamal",
      winProbability: { team1: 74, team2: 26 },
      playerStatsUpdates: { "lamine-yamal": "7 Dribbles, 4 Key Passes" },
      newEvent: {
        id: "sim-fb-save-82",
        over: "82'",
        type: "free-hit",
        title: "WHAT A SAVE! Courtois Denies Yamal",
        term: "Diving Save & Corner Kick",
        badgeText: "BIG CHANCE",
        badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        fallbackExplain: {
          en: "Courtois flew across his goal to tip Lamine Yamal's 20-yard curling strike around the far post, keeping Madrid in front.",
          hinglish: "Courtois ne diving save karke Yamal ke top-corner shot ko bahar nikaala. Real Madrid abhi bhi 2-1 aage hai.",
        },
      },
    },
    {
      scorePrimary: "3 - 1",
      progressText: "89' 2nd Half",
      progressPercent: 98,
      secondaryStatus: "Vinícius counter-attack seals the win!",
      activePerformerId: "vinicius-jr",
      winProbability: { team1: 98, team2: 2 },
      playerStatsUpdates: { "vinicius-jr": "2 Goals, 1 Assist" },
      newEvent: {
        id: "sim-fb-goal-89",
        over: "89'",
        type: "free-hit",
        title: "GOAL! Vinicius Jr Breakaway Seal",
        term: "Counter-Attack Goal",
        badgeText: "GOAL (3-1)",
        badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        fallbackExplain: {
          en: "With Barcelona pushed completely forward, Vinícius sprinted 50 meters and slotted past the keeper to seal El Clásico.",
          hinglish: "Barcelona sab aage aayi hui thi aur Vinícius ne 50 meter tez bhaag kar akele goal maar diya! Score 3-1 ho gaya.",
        },
      },
    },
  ],
};
