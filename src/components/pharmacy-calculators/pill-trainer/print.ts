import type { PillTrainerLevel } from './levels';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildPillTrainerPrintHtml = ({
  childName,
  childAge,
  levels,
  completedLevels,
}: {
  childName: string;
  childAge: string;
  levels: PillTrainerLevel[];
  completedLevels: Set<number>;
}): string => {
  const name = childName.trim() || 'Child';
  const age = childAge.trim();
  const safeName = escapeHtml(name);
  const safeAge = escapeHtml(age);

  const nextLevel = levels.find((level) => !completedLevels.has(level.id));

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tablet Swallowing Progress - ${safeName}</title>
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
          <strong>Child's Name:</strong> ${safeName}<br>
          ${safeAge ? `<strong>Age:</strong> ${safeAge}<br>` : ''}
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
  `;
};
