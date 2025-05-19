import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateCertificate = (user, training) => {
  // Create PDF document with landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm'
  });

  // Certificate ID
  const certificateId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Add elegant background with gradient effect
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  // Background gradient effect (light blue to white)
  for (let i = 0; i < height; i += 0.5) {
    // Calculate gradient color from light blue to white
    const shade = Math.floor(235 + (i / height) * 20);
    doc.setFillColor(shade, shade + 9, shade + 15);
    doc.rect(0, i, width, 0.5, 'F');
  }
  
  // Decorative border
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(1.5);
  doc.roundedRect(10, 10, width - 20, height - 20, 5, 5, 'S');
  
  // Inner decorative border
  doc.setDrawColor(100, 149, 237);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, width - 30, height - 30, 3, 3, 'S');
  
  // Add decorative corner ornaments
  addCornerOrnament(doc, 10, 10, 'topleft');
  addCornerOrnament(doc, width - 10, 10, 'topright');
  addCornerOrnament(doc, 10, height - 10, 'bottomleft');
  addCornerOrnament(doc, width - 10, height - 10, 'bottomright');
  
  // Certificate title with shadow effect
  doc.setFontSize(32);
  doc.setTextColor(70, 90, 170);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE', 148, 45, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(90, 110, 190);
  doc.text('OF ACHIEVEMENT', 148, 55, { align: 'center' });
  
  // Decorative line under title
  doc.setLineWidth(0.75);
  doc.setDrawColor(70, 130, 180);
  doc.line(80, 62, 217, 62);
  
  // Small decorative element
  doc.setDrawColor(70, 130, 180);
  doc.setFillColor(70, 130, 180);
  doc.circle(148, 62, 1.5, 'F');
  doc.circle(80, 62, 1, 'F');
  doc.circle(217, 62, 1, 'F');
  
  // "This is to certify that" text
  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'italic');
  doc.text('This is to certify that', 148, 75, { align: 'center' });
  
  // Recipient name - larger and emphasized
  doc.setFontSize(28);
  doc.setTextColor(25, 25, 112);
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.name} ${user.lastName}`, 148, 90, { align: 'center' });
  
  // Decorative underline for the name
  const nameWidth = doc.getStringUnitWidth(`${user.name} ${user.lastName}`) * 28 / doc.internal.scaleFactor;
  doc.setLineWidth(0.5);
  doc.setDrawColor(25, 25, 112, 0.5);
  doc.line(148 - nameWidth * 0.5, 94, 148 + nameWidth * 0.5, 94);
  
  // Training details with improved formatting
  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the training course:', 148, 105, { align: 'center' });
  
  // Training title - highlighted
  doc.setFontSize(20);
  doc.setTextColor(70, 130, 180);
  doc.setFont('helvetica', 'bold');
  doc.text(`${training.title}`, 148, 115, { align: 'center' });
  
  // Date with improved formatting
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed on ${formattedDate}`, 148, 130, { align: 'center' });
  
  // Add duration if available
  if (training.duration) {
    doc.text(`Duration: ${training.duration}`, 148, 140, { align: 'center' });
  }
  
  // Signature section with improved styling
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  
  // First signature
  doc.line(65, 160, 125, 160);
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Trainer Signature', 95, 166, { align: 'center' });
  
  // Second signature
  doc.line(172, 160, 232, 160);
  doc.text('Wellness Center Director', 202, 166, { align: 'center' });
  
  // Add seal/stamp effect
  addSealEffect(doc, 202, 145);
  
  // Footer with certificate ID and verification info
  doc.setFillColor(70, 130, 180);
  // Use a lighter shade for footer background
  doc.setFillColor(230, 240, 250);
  doc.rect(0, height - 18, width, 18, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(70, 90, 120);
  doc.setFont('helvetica', 'italic');
  doc.text('This certificate is awarded as recognition of dedication and successful completion of the training program.', 148, height - 12, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate ID: ${certificateId} • Issue Date: ${formattedDate} • Wellness Center`, 148, height - 6, { align: 'center' });
  
  return doc;
};

// Function to add decorative corner ornaments
function addCornerOrnament(doc, x, y, position) {
  const size = 8;
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.75);
  
  switch(position) {
    case 'topleft':
      doc.line(x, y + size, x, y);
      doc.line(x, y, x + size, y);
      break;
    case 'topright':
      doc.line(x - size, y, x, y);
      doc.line(x, y, x, y + size);
      break;
    case 'bottomleft':
      doc.line(x, y - size, x, y);
      doc.line(x, y, x + size, y);
      break;
    case 'bottomright':
      doc.line(x - size, y, x, y);
      doc.line(x, y, x, y - size);
      break;
  }
  
  // Add small dot at corner
  doc.setFillColor(70, 130, 180);
  doc.circle(x, y, 1.2, 'F');
}

// Function to add a seal/stamp effect
function addSealEffect(doc, x, y) {
  const radius = 15;
  
  // Outer circle
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.75);
  doc.circle(x, y, radius, 'S');
  
  // Inner circle
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.5);
  doc.circle(x, y, radius - 3, 'S');
  
  // Inner decoration
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.25);
  for (let i = 0; i < 360; i += 45) {
    const angle = i * Math.PI / 180;
    const innerX = x + (radius - 7) * Math.cos(angle);
    const innerY = y + (radius - 7) * Math.sin(angle);
    const outerX = x + (radius - 5) * Math.cos(angle);
    const outerY = y + (radius - 5) * Math.sin(angle);
    doc.line(innerX, innerY, outerX, outerY);
  }
  
  // Center dot
  doc.setFillColor(70, 130, 180);
  doc.circle(x, y, 2, 'F');
  
  // Text "APPROVED"
  doc.setFontSize(8);
  doc.setTextColor(70, 130, 180);
  doc.setFont('helvetica', 'bold');
  doc.text('APPROVED', x, y + 2, { align: 'center' });
}