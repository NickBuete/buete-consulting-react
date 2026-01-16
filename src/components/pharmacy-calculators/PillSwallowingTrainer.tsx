import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
} from "../ui";
import { Checkbox } from "../ui/Checkbox";
import { cn } from "../../lib/utils";
import { jsPDF } from "jspdf";

interface Level {
  id: number;
  name: string;
  size: string;
  liquid: string;
  emoji: string;
  description: string;
  tips: string[];
  encouragement: string[];
  visualSizeMm: number; // Actual size in millimeters for visual reference
}

const levels: Level[] = [
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

export const PillSwallowingTrainer: React.FC = () => {
  const [childName, setChildName] = useState<string>("");
  const [childAge, setChildAge] = useState<string>("");
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const name = childName.trim() || "Child";
    const age = childAge.trim();

    const nextLevel = levels.find((level) => !completedLevels.has(level.id));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tablet Swallowing Progress - ${name}</title>
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #3b82f6;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #10b981;
              margin-top: 30px;
              border-left: 4px solid #10b981;
              padding-left: 15px;
            }
            h3 {
              color: #8b5cf6;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header .emoji {
              font-size: 48px;
            }
            .info-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .progress-bar {
              background: #e5e7eb;
              height: 30px;
              border-radius: 15px;
              margin: 20px 0;
              position: relative;
              overflow: hidden;
            }
            .progress-fill {
              background: linear-gradient(to right, #10b981, #3b82f6);
              height: 100%;
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding-right: 10px;
              color: white;
              font-weight: bold;
              width: ${(completedLevels.size / 5) * 100}%;
            }
            .level-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
              page-break-inside: avoid;
            }
            .level-card.completed {
              background: #d1fae5;
              border-color: #10b981;
            }
            .level-card.current {
              background: #dbeafe;
              border-color: #3b82f6;
            }
            .level-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
            }
            .level-emoji {
              font-size: 32px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              margin-left: 10px;
            }
            .badge.completed {
              background: #10b981;
              color: white;
            }
            .badge.current {
              background: #3b82f6;
              color: white;
            }
            ul {
              margin: 10px 0;
              padding-left: 25px;
            }
            li {
              margin: 5px 0;
            }
            .safety-warning {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .safety-warning h3 {
              color: #92400e;
              margin-top: 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              body {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="emoji">💊</div>
            <h1>Tablet Swallowing Training Progress</h1>
          </div>

          <div class="info-box">
            <strong>Child's Name:</strong> ${name}<br>
            ${age ? `<strong>Age:</strong> ${age}<br>` : ''}
            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Completed Levels:</strong> ${completedLevels.size} of 5
          </div>

          <div class="progress-bar">
            <div class="progress-fill">${Math.round((completedLevels.size / 5) * 100)}%</div>
          </div>

          <h2>Training Levels</h2>

          ${levels.map((level) => {
            const isCompleted = completedLevels.has(level.id);
            const isCurrent = nextLevel?.id === level.id;
            return `
              <div class="level-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="level-header">
                  <span class="level-emoji">${level.emoji}</span>
                  <div>
                    <strong>Level ${level.id}: ${level.name}</strong>
                    ${isCompleted ? '<span class="badge completed">✓ Completed</span>' : ''}
                    ${isCurrent && !isCompleted ? '<span class="badge current">Current Level</span>' : ''}
                  </div>
                </div>
                <p><strong>Size:</strong> ${level.size}</p>
                <p><strong>Practice with:</strong> ${level.liquid}</p>
                <p>${level.description}</p>
                <h4>Tips for Success:</h4>
                <ul>
                  ${level.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
              </div>
            `;
          }).join('')}

          <div class="safety-warning">
            <h3>⚠️ Important Safety Information</h3>
            <ul>
              <li>NEVER use real medication for practice - only use lolly pieces or empty capsules</li>
              <li>Always supervise your child during practice sessions</li>
              <li>Go at your child's pace - no pressure or rushing</li>
              <li>Some children may need weeks or months to progress through levels</li>
              <li>If your child has difficulty swallowing, consult your doctor or speech therapist</li>
            </ul>
          </div>

          <h2>General Tips</h2>

          <h3>For Kids:</h3>
          <ul>
            <li>Practice when you're feeling happy and relaxed</li>
            <li>Don't tilt your head back - keep it straight or slightly forward</li>
            <li>Take a BIG drink of water, not a tiny sip</li>
            <li>Swallow confidently in one smooth motion</li>
            <li>It's okay to take your time - no rushing!</li>
          </ul>

          <h3>For Parents:</h3>
          <ul>
            <li>Use warm water - it's easier to swallow</li>
            <li>Make it fun, not stressful</li>
            <li>Celebrate small victories</li>
            <li>Practice regularly but keep sessions short</li>
            <li>Ask your pharmacist for empty gelatin capsules for Level 5</li>
          </ul>

          <div class="footer">
            <p>Based on Royal Children's Hospital Melbourne evidence-based guidelines</p>
            <p>Buete Consulting - Pharmacy Tools</p>
            <p>Printed: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Component to render visual size reference
  const SizeVisual: React.FC<{ sizeMm: number; levelId: number }> = ({ sizeMm, levelId }) => {
    // Scale: 1mm = 4px for visibility (scale factor of 4)
    const scale = 4;
    const pixelSize = sizeMm * scale;

    // Different colors for each level
    const colors = [
      "#f59e0b", // amber for level 1
      "#3b82f6", // blue for level 2
      "#10b981", // green for level 3
      "#8b5cf6", // purple for level 4
      "#ec4899", // pink for level 5
    ];

    const color = colors[levelId - 1] || "#6b7280";

    // For capsule (level 5), show elongated shape
    const isCapsule = levelId === 5;

    return (
      <div className="flex items-center gap-4 p-3 bg-white rounded border border-gray-200">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Actual Size Reference (view on screen):
          </div>
          <div className="flex items-center gap-3">
            {/* Visual representation */}
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: isCapsule ? `${pixelSize}px` : `${pixelSize}px`,
                height: isCapsule ? `${pixelSize * 0.4}px` : `${pixelSize}px`,
                backgroundColor: color,
                borderRadius: isCapsule ? '999px' : '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            {/* Measurement line */}
            <div className="flex flex-col items-start">
              <div className="text-xs font-mono font-bold" style={{ color }}>
                {sizeMm}mm
              </div>
              <div className="text-[10px] text-gray-500">
                {isCapsule ? '(capsule length)' : '(diameter)'}
              </div>
            </div>
          </div>
        </div>
        {/* Cutting guide for lollies */}
        {!isCapsule && (
          <div className="text-xs text-gray-600 border-l pl-3">
            <div className="font-semibold mb-1">💡 Cutting Tip:</div>
            <div>Cut a snake lolly into</div>
            <div className="font-mono font-bold" style={{ color }}>~{sizeMm}mm pieces</div>
          </div>
        )}
      </div>
    );
  };

  const downloadCertificate = () => {
    const name = childName.trim() || "_______________________";
    const age = childAge.trim();

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Set background with gradient effect (using rectangles)
    doc.setFillColor(240, 253, 250); // Mint background
    doc.rect(0, 0, 297, 210, "F");

    // Decorative border
    doc.setDrawColor(59, 130, 246); // Blue border
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setDrawColor(16, 185, 129); // Green inner border
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Trophy emoji at top (using text)
    doc.setFontSize(48);
    doc.text("🏆", 148.5, 40, { align: "center" });

    // Title
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // Blue
    doc.text("CERTIFICATE OF ACHIEVEMENT", 148.5, 55, { align: "center" });

    // Subtitle line
    doc.setDrawColor(156, 163, 175); // Gray
    doc.setLineWidth(0.5);
    doc.line(60, 62, 237, 62);

    // "This certifies that" text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // Gray
    doc.text("This certifies that", 148.5, 75, { align: "center" });

    // Child's name
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55); // Dark gray
    doc.text(name, 148.5, 90, { align: "center" });

    // Age (if provided)
    if (age) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128); // Medium gray
      doc.text(`Age: ${age}`, 148.5, 100, { align: "center" });
    }

    // Achievement text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    const yPosition = age ? 115 : 110;
    doc.text("has successfully completed all 5 levels of the", 148.5, yPosition, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Green
    doc.text("TABLET SWALLOWING TRAINING PROGRAM", 148.5, yPosition + 10, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text("and is now a", 148.5, yPosition + 20, { align: "center" });

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246); // Purple
    doc.text("TABLET SWALLOWING CHAMPION!", 148.5, yPosition + 30, { align: "center" });

    // Stars
    doc.setFontSize(24);
    doc.text("⭐ ⭐ ⭐ ⭐ ⭐", 148.5, yPosition + 42, { align: "center" });

    // Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Completed: ${new Date().toLocaleDateString()}`, 148.5, yPosition + 55, { align: "center" });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text("Based on Royal Children's Hospital Melbourne evidence-based guidelines", 148.5, 188, { align: "center" });
    doc.text("Buete Consulting - Pharmacy Tools", 148.5, 193, { align: "center" });

    // Save the PDF
    const filename = childName.trim()
      ? `${childName.replace(/\s+/g, '-')}-tablet-swallowing-certificate.pdf`
      : "tablet-swallowing-certificate.pdf";
    doc.save(filename);
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
        {/* Child Information */}
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 space-y-3">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <span className="text-xl">👤</span>
            Child's Information (Optional)
          </h3>
          <p className="text-sm text-blue-800">
            Add your child's name and age to personalize their certificate!
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="childName" className="text-sm font-medium">
                Child's Name
              </Label>
              <Input
                id="childName"
                type="text"
                placeholder="e.g. Sarah"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childAge" className="text-sm font-medium">
                Child's Age
              </Label>
              <Input
                id="childAge"
                type="text"
                placeholder="e.g. 7 years"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </div>

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

                  {/* Size Visual Reference */}
                  {!isLocked && (
                    <SizeVisual sizeMm={level.visualSizeMm} levelId={level.id} />
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

        {/* Cutting Guide Visual */}
        <div className="rounded-lg border-2 border-pink-300 bg-pink-50 p-4 space-y-3">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <span className="text-xl">✂️</span>
            How to Cut Snake Lollies
          </h3>
          <p className="text-sm text-pink-800">
            Use a snake lolly and cut it into pieces of different sizes for each level.
            Below are visual guides showing approximately how big each piece should be:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {levels.slice(0, 4).map((level) => (
              <div key={level.id} className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Level {level.id}
                </div>
                <div className="flex justify-center items-center h-16">
                  <div
                    className="rounded-full"
                    style={{
                      width: `${level.visualSizeMm * 4}px`,
                      height: `${level.visualSizeMm * 4}px`,
                      backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][level.id - 1],
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
                <div className="text-xs font-mono font-bold mt-2">
                  ~{level.visualSizeMm}mm
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {level.size.split('(')[1]?.replace(')', '') || level.size}
                </div>
              </div>
            ))}
            <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Level 5
              </div>
              <div className="flex justify-center items-center h-16">
                <div
                  className="rounded-full"
                  style={{
                    width: `72px`,
                    height: `28px`,
                    backgroundColor: "#ec4899",
                    borderRadius: '999px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              <div className="text-xs font-mono font-bold mt-2">
                Empty capsule
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                from pharmacist
              </div>
            </div>
          </div>
          <div className="text-xs text-pink-700 bg-white rounded p-3 border border-pink-200">
            <strong>💡 Tip:</strong> Use a ruler to measure and mark your lolly snake before cutting.
            Start with Level 1 pieces and keep the larger pieces for later levels!
          </div>
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
                <li>Provide a straw or cup to allow for continual swallowing  </li>
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
