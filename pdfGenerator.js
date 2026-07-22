// PDF Generator for White Angel Events
// Generates multi-page high-fidelity PDF with Cover Page (Page 1), Letterhead Quotation (Page 2), 
// and Normal White Pages for Page 3+ & Photo Gallery (4-up per page).

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

    // Helper to format currency safely for jsPDF standard fonts (using Rs. instead of unicode symbol)
    const formatCurrency = (val) => {
      const num = Number(val) || 0;
      return 'Rs. ' + num.toLocaleString('en-IN');
    };

    // ----------------------------------------------------
    // PAGE 1: COVER PAGE (Exact Image 4 cover page graphic)
    // ----------------------------------------------------
    if (coverImg) {
      doc.addImage(coverImg, 'JPEG', 0, 0, pageWidth, pageHeight);
    } else {
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
    // PAGE 2: QUOTATION LETTERHEAD (ONLY Page 2 uses Letterhead)
    // ----------------------------------------------------
    doc.addPage();
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

    let yPos = 48;

    // Helper for Normal Pages (Page 3 onwards - NO Letterhead graphic background)
    const startNormalPage = (title = "EVENT QUOTATION") => {
      doc.addPage();
      // Simple clean header bar for normal pages
      doc.setFillColor(15, 22, 38);
      doc.rect(0, 0, pageWidth, 20, 'F');

      if (logoImg) {
        doc.addImage(logoImg, 'JPEG', 12, 3, 24, 14);
      }
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("WHITE ANGEL EVENTS", 40, 12);
      
      doc.setFontSize(9);
      doc.setTextColor(0, 210, 255);
      doc.text(title, pageWidth - 14, 12, { align: 'right' });

      doc.setDrawColor(0, 136, 255);
      doc.setLineWidth(0.5);
      doc.line(0, 20, pageWidth, 20);

      // Clean footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`White Angel Events  |  Contact: 8149634555  |  Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    };


    // 1. Client & Event Info Box (Includes Event / Function Types)
    doc.setFillColor(248, 250, 254);
    doc.setDrawColor(0, 86, 179);
    doc.setLineWidth(0.4);
    doc.roundedRect(12, yPos, pageWidth - 24, 42, 2, 2, 'FD');

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

    // Event / Function Type(s) Mentioned Prominently
    const functionsStr = (quotationData.selectedFunctions && quotationData.selectedFunctions.length > 0)
      ? quotationData.selectedFunctions.join(', ')
      : 'Wedding Event';

    doc.setFillColor(0, 86, 179, 0.08);
    doc.rect(13, yPos + 29, pageWidth - 26, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 86, 179);
    doc.text(`EVENT / FUNCTION TYPE(S): ${functionsStr.toUpperCase()}`, col1X, yPos + 36);

    yPos += 48;


    // 2. Itemized Requirements & Billing Table
    const tableHeaderHeight = 8;
    const rowHeight = 7.5;
    const maxPage2Y = pageHeight - 38;

    const drawTableHeader = (y) => {
      doc.setFillColor(0, 86, 179);
      doc.rect(12, y, pageWidth - 24, tableHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("DESCRIPTION / REQUIREMENT", 16, y + 5.5);
      doc.text("QTY", 130, y + 5.5, { align: 'center' });
      doc.text("RATE (Rs.)", 160, y + 5.5, { align: 'right' });
      doc.text("TOTAL (Rs.)", 193, y + 5.5, { align: 'right' });
    };

    drawTableHeader(yPos);
    yPos += tableHeaderHeight;

    let grandTotal = 0;
    let rowIndex = 0;

    const selectedItems = (quotationData.items || []).filter(item => item.selected);

    selectedItems.forEach((item) => {
      // Check overflow: if exceeds page 2, start a Normal Page (NOT Letterhead)
      if (yPos + rowHeight > (doc.internal.getNumberOfPages() === 2 ? maxPage2Y : pageHeight - 25)) {
        startNormalPage("QUOTATION DETAILS");
        yPos = 26;
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
      doc.text(lineTotal.toLocaleString('en-IN'), 193, yPos + 5, { align: 'right' });

      yPos += rowHeight;
      rowIndex++;
    });

    // Financial Summary Box (Fixed Alignment so numbers sit perfectly inside)
    if (yPos + 34 > (doc.internal.getNumberOfPages() === 2 ? maxPage2Y : pageHeight - 25)) {
      startNormalPage("QUOTATION SUMMARY");
      yPos = 26;
    }

    yPos += 4;
    const summaryBoxWidth = 92;
    const summaryBoxX = pageWidth - 12 - summaryBoxWidth; // X = 106mm to 198mm
    const summaryBoxHeight = 28;

    doc.setFillColor(240, 244, 250);
    doc.setDrawColor(0, 86, 179);
    doc.setLineWidth(0.5);
    doc.roundedRect(summaryBoxX, yPos, summaryBoxWidth, summaryBoxHeight, 2, 2, 'FD');

    doc.setTextColor(15, 22, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const advancePaid = Number(quotationData.payment.advancePaid) || 0;
    const balanceAmount = grandTotal - advancePaid;

    // Left labels
    doc.text("GRAND TOTAL:", summaryBoxX + 4, yPos + 7);
    doc.text("ADVANCE PAID:", summaryBoxX + 4, yPos + 15);
    doc.text("BALANCE AMOUNT:", summaryBoxX + 4, yPos + 23);

    // Right values (aligned cleanly at X = 193mm inside the box)
    const rightValX = summaryBoxX + summaryBoxWidth - 5; // 193mm

    doc.text(formatCurrency(grandTotal), rightValX, yPos + 7, { align: 'right' });

    doc.setTextColor(0, 140, 0);
    doc.text(formatCurrency(advancePaid), rightValX, yPos + 15, { align: 'right' });

    doc.setTextColor(200, 0, 0);
    doc.text(formatCurrency(balanceAmount), rightValX, yPos + 23, { align: 'right' });

    // Special Instructions & Important Note
    yPos += summaryBoxHeight + 6;
    if (yPos + 24 > (doc.internal.getNumberOfPages() === 2 ? maxPage2Y : pageHeight - 25)) {
      startNormalPage("SPECIAL INSTRUCTIONS");
      yPos = 26;
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

    // Important Note Box
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
    doc.roundedRect(12, yPos, pageWidth - 24, 11, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text("IMPORTANT NOTE: 80% PAYMENT MUST BE PAID 15 DAYS BEFORE OF EVENT.", pageWidth / 2, yPos + 6.5, { align: 'center' });


    // ----------------------------------------------------
    // DEDICATED PHOTO GALLERY PAGES (Normal Pages - 4 photos per page)
    // ----------------------------------------------------
    const photos = quotationData.images || [];

    if (photos.length > 0) {
      const photosPerPage = 4;
      const totalPhotoPages = Math.ceil(photos.length / photosPerPage);

      for (let pIndex = 0; pIndex < totalPhotoPages; pIndex++) {
        // Always use Normal Page (Clean white page with header) for photo gallery
        startNormalPage(`CONCEPT PHOTOS (${pIndex + 1}/${totalPhotoPages})`);

        doc.setFillColor(0, 86, 179);
        doc.rect(12, 26, pageWidth - 24, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`EVENT CONCEPT & DECORATION PHOTOS (Page ${pIndex + 1} of ${totalPhotoPages})`, pageWidth / 2, 31.5, { align: 'center' });

        const pagePhotos = photos.slice(pIndex * photosPerPage, (pIndex + 1) * photosPerPage);

        // 2x2 Grid Layout
        const gridPositions = [
          { x: 14, y: 38 },
          { x: 109, y: 38 },
          { x: 14, y: 154 },
          { x: 109, y: 154 }
        ];

        const imgWidth = 87;
        const imgHeight = 92;

        for (let i = 0; i < pagePhotos.length; i++) {
          const photoData = pagePhotos[i];
          const pos = gridPositions[i];

          // Outer Card
          doc.setFillColor(248, 250, 254);
          doc.setDrawColor(210, 220, 235);
          doc.setLineWidth(0.4);
          doc.roundedRect(pos.x, pos.y, imgWidth, imgHeight + 18, 2, 2, 'FD');

          try {
            doc.addImage(photoData.src, 'JPEG', pos.x + 2, pos.y + 2, imgWidth - 4, imgHeight - 4);
          } catch (e) {
            console.error('Error adding photo to PDF:', e);
          }

          // Caption Box
          doc.setFillColor(15, 22, 38);
          doc.rect(pos.x + 2, pos.y + imgHeight, imgWidth - 4, 16, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          const title = photoData.title || `Photo ${pIndex * 4 + i + 1}`;
          doc.text(title.substring(0, 30), pos.x + 5, pos.y + imgHeight + 5);

          doc.setTextColor(200, 220, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          const desc = photoData.description || 'Decoration & Event Setup Reference';
          const splitDesc = doc.splitTextToSize(desc, imgWidth - 10);
          doc.text(splitDesc, pos.x + 5, pos.y + imgHeight + 10.5);
        }
      }
    }

    return doc;
  }
};
