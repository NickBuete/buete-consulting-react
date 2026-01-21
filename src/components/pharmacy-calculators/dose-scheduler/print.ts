const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const printDoseSchedule = ({
  childName,
  contentHtml,
}: {
  childName: string;
  contentHtml: string;
}): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const safeName = escapeHtml(childName.trim() || 'Patient');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medication Schedule - ${safeName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          .print-only {
            display: block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 2px solid #000;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        ${contentHtml}
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
