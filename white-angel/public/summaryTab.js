// Summary Tab Logic for White Angel Events Quotation System
window.SummaryTab = {
  init() {
    this.loadQuotations();
  },

  loadQuotations() {
    const container = document.getElementById('savedQuotesGrid');
    if (!container) return;

    const searchTerm = (document.getElementById('summarySearchInput')?.value || '').toLowerCase().trim();
    const quotations = window.StorageManager.getQuotations();

    const filtered = quotations.filter(q => {
      if (!searchTerm) return true;
      const text = `${q.id} ${q.clientDetails.groomName} ${q.clientDetails.brideName} ${q.clientDetails.mobileNumber} ${q.eventDetails.venueName}`.toLowerCase();
      return text.includes(searchTerm);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          <h3>No Quotations Saved Yet</h3>
          <p style="font-size: 0.85rem; margin-top: 6px;">Create a new quotation in the Bill tab to save and manage it here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(q => {
      const clientName = [q.clientDetails.groomName, q.clientDetails.brideName].filter(Boolean).join(' & ') || 'Valued Client';
      
      let grandTotal = 0;
      (q.items || []).filter(i => i.selected).forEach(i => {
        grandTotal += (i.quantity * i.unitPrice);
      });

      const advancePaid = q.payment?.advancePaid || 0;
      const balance = grandTotal - advancePaid;
      const dateFormatted = q.updatedAt ? new Date(q.updatedAt).toLocaleDateString('en-IN') : 'Recent';

      return `
        <div class="quote-card" data-id="${q.id}">
          <div class="quote-card-header">
            <div>
              <h3>${clientName}</h3>
              <span class="quote-id-badge">${q.id}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${dateFormatted}</span>
          </div>

          <div class="quote-meta-list">
            <div>📅 <strong>Event Date:</strong> ${q.eventDetails.weddingDate || 'N/A'}</div>
            <div>📍 <strong>Venue:</strong> ${q.eventDetails.venueName || 'N/A'}</div>
            <div>📞 <strong>Contact:</strong> ${q.clientDetails.mobileNumber || 'N/A'}</div>
          </div>

          <div class="quote-total-bar">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">GRAND TOTAL</div>
              <div class="quote-total-amount">₹ ${grandTotal.toLocaleString('en-IN')}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; color: var(--text-muted);">BALANCE</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #ef4444;">₹ ${balance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="quote-card-actions">
            <button type="button" class="btn-secondary" style="padding: 8px;" onclick="window.BillTab.loadQuotationForEdit(window.StorageManager.getQuotationById('${q.id}'))" title="Edit Quotation">
              ✏️ Edit
            </button>

            <button type="button" class="btn-secondary" style="padding: 8px;" onclick="window.SummaryTab.regeneratePdf('${q.id}')" title="Download PDF">
              📄 PDF
            </button>

            <button type="button" class="btn-whatsapp" style="padding: 8px; font-size: 0.8rem;" onclick="window.SummaryTab.sendWhatsApp('${q.id}')" title="Send WhatsApp">
              💬 Share
            </button>

            <button type="button" class="btn-secondary" style="padding: 8px; color: #ef4444; border-color: rgba(239,68,68,0.3);" onclick="window.SummaryTab.deleteQuotation('${q.id}')" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async regeneratePdf(id) {
    const q = window.StorageManager.getQuotationById(id);
    if (!q) return;

    window.App.showToast(`Generating PDF for ${id}...`, 'info');
    try {
      const doc = await window.PdfGenerator.generatePdf(q);
      const filename = `White_Angel_Quotation_${q.clientDetails.groomName || 'Client'}_${q.id}.pdf`;
      doc.save(filename);
      window.App.showToast('PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      window.App.showToast('Error generating PDF', 'error');
    }
  },

  sendWhatsApp(id) {
    const q = window.StorageManager.getQuotationById(id);
    if (!q) return;
    window.BillTab.loadQuotationForEdit(q);
    window.BillTab.sendWhatsApp();
  },

  deleteQuotation(id) {
    if (confirm(`Are you sure you want to delete Quotation ${id}?`)) {
      window.StorageManager.deleteQuotation(id);
      window.App.showToast(`Quotation ${id} deleted`, 'info');
      this.loadQuotations();
    }
  }
};
