import { jsPDF } from 'jspdf';

export const downloadPillTrainerCertificate = ({
  childName,
  childAge,
}: {
  childName: string;
  childAge: string;
}): void => {
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

  // Decorative trophy icon (using symbols that render in standard fonts)
  doc.setFontSize(48);
  doc.setTextColor(255, 193, 7); // Gold color
  doc.text("*", 148.5, 32, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text("CHAMPION", 148.5, 38, { align: "center" });

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

  // Stars (using asterisks as stars don't render in standard PDF fonts)
  doc.setFontSize(24);
  doc.setTextColor(255, 193, 7); // Gold color for stars
  doc.text("* * * * *", 148.5, yPosition + 42, { align: "center" });

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
