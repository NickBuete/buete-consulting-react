import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "../ui";
import { Checkbox } from "../ui/Checkbox";
import { cn } from "../../lib/utils";

interface Level {
  id: number;
  name: string;
  size: string;
  liquid: string;
  emoji: string;
  description: string;
  tips: string[];
  encouragement: string[];
}

const levels: Level[] = [
  {
    id: 1,
    name: "Tiny Lolly Pieces",
    size: "2-3mm (like a sprinkle)",
    liquid: "Yogurt",
    emoji: "✨",
    description: "Start super small! These tiny pieces are easy to swallow.",
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

export const PillSwallowingTrainer: React.FC = () => {
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(
    new Set()
  );
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [showTips, setShowTips] = useState<Set<number>>(new Set([1]));
  const [encouragementMessage, setEncouragementMessage] = useState<
    string | null
  >(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const allLevelsComplete = completedLevels.size === 5;

  useEffect(() => {
    if (allLevelsComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [allLevelsComplete, showConfetti]);

  const toggleLevelComplete = (levelId: number) => {
    const newCompleted = new Set(completedLevels);
    if (newCompleted.has(levelId)) {
      newCompleted.delete(levelId);
    } else {
      newCompleted.add(levelId);
      // Auto-advance to next level
      if (levelId < 5) {
        setCurrentLevel(levelId + 1);
        // Auto-expand tips for next level
        const newShowTips = new Set(showTips);
        newShowTips.add(levelId + 1);
        setShowTips(newShowTips);
      }
    }
    setCompletedLevels(newCompleted);
  };

  const handlePractice = (level: Level) => {
    const randomMessage =
      level.encouragement[
        Math.floor(Math.random() * level.encouragement.length)
      ];
    setEncouragementMessage(randomMessage);
    setTimeout(() => setEncouragementMessage(null), 4000);
  };

  const toggleTips = (levelId: number) => {
    const newShowTips = new Set(showTips);
    if (newShowTips.has(levelId)) {
      newShowTips.delete(levelId);
    } else {
      newShowTips.add(levelId);
    }
    setShowTips(newShowTips);
  };

  const printProgress = () => {
    window.print();
  };

  const downloadCertificate = () => {
    const certificate = `
🏆 CERTIFICATE OF ACHIEVEMENT 🏆

This certifies that

_______________________

has successfully completed all 5 levels of the
TABLET SWALLOWING TRAINING PROGRAM

and is now a TABLET SWALLOWING CHAMPION!

Completed: ${new Date().toLocaleDateString()}

Based on Royal Children's Hospital Melbourne guidelines

⭐⭐⭐⭐⭐
    `;

    const blob = new Blob([certificate], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tablet-swallowing-certificate.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    "#10b981",
                    "#3b82f6",
                    "#8b5cf6",
                    "#f59e0b",
                    "#ec4899",
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        </div>
      )}

      <CardHeader className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
        <CardTitle className="font-heading flex items-center gap-3 text-2xl">
          <span className="text-3xl">💊</span>
          Tablet Swallowing Trainer
        </CardTitle>
        <CardDescription className="font-body text-base">
          A fun, step-by-step program to help kids learn to swallow tablets
          safely. Based on Royal Children's Hospital Melbourne guidelines.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Safety Warning */}
        <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
          <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            Important Safety Information for Parents
          </h3>
          <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
            <li>
              NEVER use real medication for practice - only use lolly pieces or
              empty capsules
            </li>
            <li>
              Always supervise your child during practice sessions
            </li>
            <li>Go at your child's pace - no pressure or rushing</li>
            <li>
              Some children may need weeks or months to progress through levels
            </li>
            <li>
              If your child has difficulty swallowing, consult your doctor or
              speech therapist
            </li>
          </ul>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">
              Your Progress
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {completedLevels.size} of 5 levels complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full transition-all duration-500 ease-out flex items-center justify-end px-2"
              style={{ width: `${(completedLevels.size / 5) * 100}%` }}
            >
              {completedLevels.size > 0 && (
                <span className="text-white text-xs font-bold">
                  {Math.round((completedLevels.size / 5) * 100)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {levels.map((level) => (
              <div
                key={level.id}
                className={cn(
                  "text-2xl transition-all duration-300",
                  completedLevels.has(level.id)
                    ? "scale-110 opacity-100"
                    : "opacity-30 grayscale"
                )}
                title={level.name}
              >
                {completedLevels.has(level.id) ? "⭐" : level.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement Message */}
        {encouragementMessage && (
          <div className="rounded-lg bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 p-4 animate-bounce-gentle">
            <p className="text-center text-lg font-bold text-green-800">
              {encouragementMessage}
            </p>
          </div>
        )}

        {/* Success Message */}
        {allLevelsComplete && (
          <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 p-6 text-center space-y-3">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-purple-900">
              CONGRATULATIONS!
            </h3>
            <p className="text-lg text-purple-800">
              You've completed all 5 levels! You're officially a tablet
              swallowing champion!
            </p>
            <Button
              onClick={downloadCertificate}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
              size="lg"
            >
              <span className="text-xl mr-2">🏆</span>
              Download Your Certificate
            </Button>
          </div>
        )}

        {/* Levels */}
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold">
            Training Levels
          </h3>

          {levels.map((level) => {
            const isCompleted = completedLevels.has(level.id);
            const isCurrent = currentLevel === level.id;
            const isLocked =
              level.id > 1 && !completedLevels.has(level.id - 1);

            return (
              <div
                key={level.id}
                className={cn(
                  "rounded-lg border-2 transition-all duration-300",
                  isCompleted
                    ? "border-green-400 bg-green-50"
                    : isCurrent
                    ? "border-blue-400 bg-blue-50 shadow-lg"
                    : isLocked
                    ? "border-gray-300 bg-gray-50 opacity-60"
                    : "border-gray-300 bg-white"
                )}
              >
                <div className="p-4 space-y-3">
                  {/* Level Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl mt-1">{level.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-heading font-bold text-lg">
                            Level {level.id}: {level.name}
                          </h4>
                          {isCompleted && (
                            <Badge className="bg-green-500">
                              <span className="mr-1">✓</span>Complete
                            </Badge>
                          )}
                          {isCurrent && !isCompleted && (
                            <Badge className="bg-blue-500">Current</Badge>
                          )}
                          {isLocked && (
                            <Badge
                              variant="outline"
                              className="bg-gray-200 text-gray-600"
                            >
                              🔒 Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {level.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Size:</span>{" "}
                            {level.size}
                          </div>
                          <div>
                            <span className="font-semibold">With:</span>{" "}
                            {level.liquid}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`level-${level.id}`}
                        checked={isCompleted}
                        onCheckedChange={() => toggleLevelComplete(level.id)}
                        disabled={isLocked}
                        className="w-6 h-6"
                      />
                      <label
                        htmlFor={`level-${level.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Done
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isLocked && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePractice(level)}
                        disabled={isLocked}
                        className={cn(
                          "flex-1",
                          isCompleted
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        )}
                        size="lg"
                      >
                        <span className="text-lg mr-2">
                          {isCompleted ? "🎯" : "🚀"}
                        </span>
                        {isCompleted ? "Practice Again" : "Try This Level"}
                      </Button>
                      <Button
                        onClick={() => toggleTips(level.id)}
                        variant="outline"
                        size="lg"
                      >
                        {showTips.has(level.id) ? "Hide" : "Show"} Tips
                      </Button>
                    </div>
                  )}

                  {/* Tips Section */}
                  {showTips.has(level.id) && !isLocked && (
                    <div className="rounded-md bg-white border border-gray-200 p-3 space-y-2">
                      <h5 className="font-semibold text-sm flex items-center gap-2">
                        <span>💡</span>
                        Tips for Success
                      </h5>
                      <ul className="space-y-1 ml-6 list-disc text-sm">
                        {level.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* General Tips Section */}
        <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4 space-y-3">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <span className="text-xl">🎓</span>
            Pro Tips for Parents & Kids
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900">For Kids:</h4>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Practice when you're feeling happy and relaxed</li>
                <li>
                  Don't tilt your head back - keep it straight or slightly
                  forward
                </li>
                <li>Take a BIG drink of water, not a tiny sip</li>
                <li>Swallow confidently in one smooth motion</li>
                <li>Provide a straw or cup to allow for continual swallowing</li>
                <li>It's okay to take your time - no rushing!</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900">For Parents:</h4>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Use warm water - it's easier to swallow</li>
                <li>
                  Some meds taste bitter - yogurt can mask the flavor
                </li>
                <li>Make it fun, not stressful</li>
                <li>Celebrate small victories</li>
                <li>Practice regularly but keep sessions short</li>
                <li>Ask your pharmacist for empty gelatin capsules</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex gap-3 print:hidden">
          <Button
            onClick={printProgress}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <span className="text-lg mr-2">🖨️</span>
            Print Progress Tracker
          </Button>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center border-t pt-4">
          Based on evidence-based guidelines from Royal Children's Hospital
          Melbourne. This is an educational tool only. Always consult with your
          healthcare provider or pharmacist about medication administration.
        </div>
      </CardContent>

      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out 3;
        }

        @media print {
          .confetti-container {
            display: none;
          }
        }
      `}</style>
    </Card>
  );
};
