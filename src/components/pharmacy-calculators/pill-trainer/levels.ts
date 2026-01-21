export type PillTrainerLevel = {
  id: number;
  name: string;
  size: string;
  liquid: string;
  emoji: string;
  description: string;
  tips: string[];
  encouragement: string[];
  visualSizeMm: number; // Actual size in millimeters for visual reference
};

export const levels: PillTrainerLevel[] = [
  {
    id: 1,
    name: "Tiny Lolly Pieces",
    size: "2-3mm (like a sprinkle)",
    liquid: "Yogurt",
    emoji: "✨",
    description: "Start super small! These tiny pieces are easy to swallow.",
    visualSizeMm: 2.5,
    tips: [
      "Mix the tiny lolly piece into a spoonful of yogurt",
      "Take a normal bite and swallow like usual",
      "You won't even notice it's there!",
    ],
    encouragement: [
      "You're doing great! That was easy, right?",
      "Awesome job! You're a natural!",
      "Look at you go! Ready for the next level?",
      "Amazing! You made that look easy!",
    ],
  },
  {
    id: 2,
    name: "Small Lolly Pieces",
    size: "4-5mm (like a tic-tac)",
    liquid: "Yogurt",
    emoji: "🌟",
    description: "A bit bigger now, but still nice and easy!",
    visualSizeMm: 4.5,
    tips: [
      "Place the small piece in yogurt",
      "Take a good-sized spoonful",
      "Swallow without thinking about it too much",
    ],
    encouragement: [
      "Fantastic! You're getting so good at this!",
      "Wow! Level 2 complete - you're a champion!",
      "That was smooth! Keep up the great work!",
      "Brilliant! You're halfway there!",
    ],
  },
  {
    id: 3,
    name: "Medium Lolly Pieces",
    size: "6-8mm (like a small smartie)",
    liquid: "Milk",
    emoji: "⭐",
    description: "Getting bigger! Time to try with milk instead of yogurt.",
    visualSizeMm: 7,
    tips: [
      "Put the lolly piece on your tongue",
      "Take a good sip of milk (not too little!)",
      "Tilt your head forward slightly and swallow",
      "The milk helps it slide down easily",
    ],
    encouragement: [
      "Incredible! You're really mastering this!",
      "Super star! That was a big step!",
      "You make it look so easy! Great job!",
      "Amazing work! Almost there now!",
    ],
  },
  {
    id: 4,
    name: "Large Lolly Pieces",
    size: "8-10mm (like a large smartie)",
    liquid: "Water",
    emoji: "💫",
    description: "Almost there! Now we'll use water like with real tablets.",
    visualSizeMm: 9,
    tips: [
      "Place the lolly piece on your tongue",
      "Take a big sip of water (fill your mouth!)",
      "Keep your head forward or neutral (not tilted back)",
      "Swallow confidently in one go",
    ],
    encouragement: [
      "Spectacular! You're almost a tablet-swallowing expert!",
      "Outstanding! One more level to go!",
      "You're crushing it! So impressive!",
      "Phenomenal! Ready for the final challenge?",
    ],
  },
  {
    id: 5,
    name: "Practice Capsule",
    size: "Full-size empty capsule",
    liquid: "Water",
    emoji: "🏆",
    description: "The final challenge! A real empty capsule - you've got this!",
    visualSizeMm: 18,
    tips: [
      "Use an empty gelatin capsule (ask your pharmacist)",
      "Take a BIG sip of water (really fill your mouth)",
      "Keep your chin tucked down slightly",
      "Swallow with confidence - you're a pro now!",
      "Try the 'bottle method': use a flexible bottle, sip, and squeeze while swallowing",
    ],
    encouragement: [
      "YOU DID IT! You're officially a tablet-swallowing champion!",
      "AMAZING! You've mastered all 5 levels!",
      "CONGRATULATIONS! You're ready for real tablets!",
      "INCREDIBLE! You should be so proud of yourself!",
    ],
  },
];
