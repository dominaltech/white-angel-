// PDF Generator for White Angel Events
// Generates multi-page high-fidelity PDF with Cover Page, Letterhead Quotation, and 4-up Photo Gallery

window.PdfGenerator = {
  async generatePdf(quotationData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

    // Helper to load base64 or url image as HTMLImageElement
    const loadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    const assets = window.IMAGE_ASSETS || {};

    const [logoImg, coverImg, letterheadImg] = await Promise.all([
      loadImage(assets.logo || 'assets/logo.jpg'),
      loadImage(assets.coverPage || 'assets/cover_page.jpg'),
      loadImage(assets.letterhead || 'assets/letterhead_template.jpg')
    ]);

    // ----------------------------------------------------
    // PAGE 1: COVER PAGE (Exact Image 4 cover page graphic)
    // ----------------------------------------------------
    if (coverImg) {
      doc.addImage(coverImg, 'JPEG', 0, 0, pageWidth, pageHeight);
    } else {
      // Fallback
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      if (logoImg) doc.addImage(logoImg, 'JPEG', (pageWidth - 70) / 2, 30, 70, 45);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("WHITE ANGEL EVENTS", pageWidth / 2, 90, { align: 'center' });
    }

    // Elegant overlay tag for Client Name at bottom of Cover Page
    const groom = quotationData.clientDetails.groomName || '';
    const bride = quotationData.clientDetails.brideName || '';
    const clientTitle = [groom, bride].filter(Boolean).join(' & ') || 'VALUED CLIENT';

    doc.setFillColor(11, 15, 25);
    doc.setDrawColor(0, 210, 255);
    doc.setLineWidth(0.6);
    doc.roundedRect(15, pageHeight - 34, pageWidth - 30, 14, 3, 3, 'FD');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`EVENT QUOTATION FOR: ${clientTitle.toUpperCase()}`, pageWidth / 2, pageHeight - 27, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 210, 255);
    doc.text(`Date Issued: ${new Date().toLocaleDateString('en-IN')}  |  Quote Ref: ${quotationData.id}`, pageWidth / 2, pageHeight - 22, { align: 'center' });


    // ----------------------------------------------------
    // PAGE 2+: QUOTATION LETTERHEAD (Exact Image 3 letterhead)
    // ----------------------------------------------------
    let currentPage = 2;

    const drawLetterheadBackground = () => {
      if (letterheadImg) {
        doc.addImage(letterheadImg, 'JPEG', 0, 0, pageWidth, pageHeight);
      } else {
        doc.setFillColor(15, 22, 38);
        doc.rect(0, 0, pageWidth, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("WHITE ANGEL EVENTS", 15, 16);
      }
    };

    const startNewQuotationPage = () => {
      doc.addPage();
      currentPage++;
      drawLetterheadBackground();
    };

    // Add Page 2
    doc.addPage();
    drawLetterheadBackground();

    // Start content right below "QUOTATION" header title on letterhead
    let yPos = 48;

    // 1. Client & Event Info Box
    doc.setFillColor(248, 250, 254);
    doc.setDrawColor(0, 86, 179);
    doc.setLineWidth(0.4);
    doc.roundedRect(12, yPos, pageWidth - 24, 38, 2, 2, 'FD');

    doc.setTextColor(15, 22, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const col1X = 16;
    const col2X = 110;

    doc.text(`Groom's Name: ${quotationData.clientDetails.groomName || '-'}`, col1X, yPos + 7);
    doc.text(`Bride's Name: ${quotationData.clientDetails.brideName || '-'}`, col1X, yPos + 13);
    doc.text(`Mobile No: ${quotationData.clientDetails.mobileNumber || '-'}`, col1X, yPos + 19);
    doc.text(`Address: ${quotationData.clientDetails.address || '-'}`, col1X, yPos + 25);

    doc.text(`Event Date: ${quotationData.eventDetails.weddingDate || '-'}`, col2X, yPos + 7);
    doc.text(`Venue Name: ${quotationData.eventDetails.venueName || '-'}`, col2X, yPos + 13);
    doc.text(`Guest Count: ${quotationData.eventDetails.guestCount || '-'}`, col2X, yPos + 19);
    doc.text(`Event Time: ${quotationData.eventDetails.eventTime || '-'}`, col2X, yPos + 25);

    // Selected Functions
    if (quotationData.selectedFunctions && quotationData.selectedFunctions.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0, 86, 179);
      doc.text(`Selected Functions: ${quotationData.selectedFunctions.join(', ')}`, col1X, yPos + 32);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 22, 38);
    }

    yPos += 44;

    // 2. Itemized Requirements & Billing Table
    const tableHeaderHeight = 8;
    const rowHeight = 7.5;
    const maxY = pageHeight - 38;

    const drawTableHeader = (y) => {
      doc.setFillColor(0, 86, 179);
      doc.rect(12, y, pageWidth - 24, tableHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("DESCRIPTION / REQUIREMENT", 16, y + 5.5);
      doc.text("QTY", 130, y + 5.5, { align: 'center' });
      doc.text("RATE (₹)", 160, y + 5.5, { align: 'right' });
      doc.text("TOTAL (₹)", 194, y + 5.5, { align: 'right' });
    };

    drawTableHeader(yPos);
    yPos += tableHeaderHeight;

    let grandTotal = 0;
    let rowIndex = 0;

    const selectedItems = (quotationData.items || []).filter(item => item.selected);

    selectedItems.forEach((item) => {
      if (yPos + rowHeight > maxY) {
        startNewQuotationPage();
        yPos = 48;
        drawTableHeader(yPos);
        yPos += tableHeaderHeight;
      }

      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 253);
        doc.rect(12, yPos, pageWidth - 24, rowHeight, 'F');
      }

      doc.setDrawColor(230, 235, 245);
      doc.line(12, yPos + rowHeight, pageWidth - 12, yPos + rowHeight);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');

      const itemName = item.name.length > 46 ? item.name.substring(0, 43) + '...' : item.name;
      doc.text(itemName, 16, yPos + 5);

      doc.text(String(item.quantity || 1), 130, yPos + 5, { align: 'center' });

      const unitPriceStr = (item.unitPrice || 0).toLocaleString('en-IN');
      doc.text(unitPriceStr, 160, yPos + 5, { align: 'right' });

      const lineTotal = (item.quantity || 1) * (item.unitPrice || 0);
      grandTotal += lineTotal;
      doc.text(lineTotal.toLocaleString('en-IN'), 194, yPos + 5, { align: 'right' });

      yPos += rowHeight;
      rowIndex++;
    });

    // Financial Summary Box
    if (yPos + 32 > maxY) {
      startNewQuotationPage();
      yPos = 48;
    }

    yPos += 4;
    const summaryBoxHeight = 28;
    doc.setFillColor(240, 244, 250);
    doc.setDrawColor(0, 86, 179);
    doc.setLineWidth(0.4);
    doc.roundedRect(108, yPos, pageWidth - 120, summaryBoxHeight, 2, 2, 'FD');

    doc.setTextColor(15, 22, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const advancePaid = Number(quotationData.payment.advancePaid) || 0;
    const balanceAmount = grandTotal - advancePaid;

    doc.text("GRAND TOTAL:", 112, yPos + 7);
    doc.text(`₹ ${grandTotal.toLocaleString('en-IN')}`, 194, yPos + 7, { align: 'right' });

    doc.text("ADVANCE PAID:", 112, yPos + 15);
    doc.setTextColor(0, 140, 0);
    doc.text(`₹ ${advancePaid.toLocaleString('en-IN')}`, 194, yPos + 15, { align: 'right' });

    doc.setTextColor(15, 22, 38);
    doc.text("BALANCE AMOUNT:", 112, yPos + 23);
    doc.setTextColor(200, 0, 0);
    doc.text(`₹ ${balanceAmount.toLocaleString('en-IN')}`, 194, yPos + 23, { align: 'right' });

    // Special Instructions & Important Note
    yPos += summaryBoxHeight + 6;
    if (yPos + 24 > maxY) {
      startNewQuotationPage();
      yPos = 48;
    }

    if (quotationData.specialInstructions) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 86, 179);
      doc.text("SPECIAL INSTRUCTIONS:", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const splitLines = doc.splitTextToSize(quotationData.specialInstructions, pageWidth - 30);
      doc.text(splitLines, 14, yPos + 4.5);
      yPos += (splitLines.length * 4) + 6;
    }

    // Important Note Box (Image 1 style)
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
    doc.roundedRect(12, yPos, pageWidth - 24, 11, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text("IMPORTANT NOTE: 80% PAYMENT MUST BE PAID 15 DAYS BEFORE OF EVENT.", pageWidth / 2, yPos + 6.5, { align: 'center' });

    // ----------------------------------------------------
    // DEDICATED PHOTO GALLERY PAGES (4 images per page)
    // ----------------------------------------------------
    const photos = quotationData.images || [];

    if (photos.length > 0) {
      const photosPerPage = 4;
      const totalPhotoPages = Math.ceil(photos.length / photosPerPage);

      for (let pIndex = 0; pIndex < totalPhotoPages; pIndex++) {
        startNewQuotationPage();

        // Photo Section Header
        doc.setFillColor(0, 86, 179);
        doc.rect(12, 48, pageWidth - 24, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`EVENT CONCEPT & DECORATION PHOTOS (Page ${pIndex + 1} of ${totalPhotoPages})`, pageWidth / 2, 53.5, { align: 'center' });

        const pagePhotos = photos.slice(pIndex * photosPerPage, (pIndex + 1) * photosPerPage);

        const gridPositions = [
          { x: 15, y: 60 },
          { x: 110, y: 60 },
          { x: 15, y: 170 },
          { x: 110, y: 170 }
        ];

        const imgWidth = 85;
        const imgHeight = 76;

        for (let i = 0; i < pagePhotos.length; i++) {
          const photoData = pagePhotos[i];
          const pos = gridPositions[i];

          doc.setFillColor(245, 247, 250);
          doc.setDrawColor(210, 220, 235);
          doc.roundedRect(pos.x, pos.y, imgWidth, imgHeight + 22, 2, 2, 'FD');

          try {
            doc.addImage(photoData.src, 'JPEG', pos.x + 2, pos.y + 2, imgWidth - 4, imgHeight - 4);
          } catch (e) {
            console.error('Error adding photo to PDF:', e);
          }

          // Title & Description
          doc.setFillColor(15, 22, 38);
          doc.rect(pos.x + 2, pos.y + imgHeight, imgWidth - 4, 18, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          const title = photoData.title || `Photo ${pIndex * 4 + i + 1}`;
          doc.text(title.substring(0, 28), pos.x + 5, pos.y + imgHeight + 5);

          doc.setTextColor(200, 220, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          const desc = photoData.description || 'Decoration & Event Setup Reference';
          const splitDesc = doc.splitTextToSize(desc, imgWidth - 10);
          doc.text(splitDesc, pos.x + 5, pos.y + imgHeight + 11);
        }
      }
    }

    return doc;
  }
};
