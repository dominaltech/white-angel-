// Manage Tab Logic for White Angel Events Quotation System (Rate Card Master)
window.ManageTab = {
  init() {
    this.renderRatesForm();
  },

  renderRatesForm() {
    const rates = window.StorageManager.getRates();

    // 1. Decoration Rates
    const decContainer = document.getElementById('manageDecorationRates');
    if (decContainer) {
      decContainer.innerHTML = rates.decoration.map((item, idx) => `
        <div class="form-group" style="flex-direction: row; align-items: center; justify-content: space-between; background: #0d1424; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.9rem; font-weight: 500;">${item.name}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: var(--accent-cyan); font-size: 0.85rem;">₹</span>
            <input type="number" class="form-input rate-dec-input" data-index="${idx}" value="${item.unitPrice}" min="0" style="width: 110px; text-align: right;">
          </div>
        </div>
      `).join('');
    }

    // 2. Catering Rates
    if (document.getElementById('rateVegPerPlate')) document.getElementById('rateVegPerPlate').value = rates.catering.vegPerPlate;
    if (document.getElementById('rateNonVegPerPlate')) document.getElementById('rateNonVegPerPlate').value = rates.catering.nonVegPerPlate;
    if (document.getElementById('rateSweetPerPlate')) document.getElementById('rateSweetPerPlate').value = rates.catering.sweetPerPlate;
    if (document.getElementById('rateLiveCounterUnit')) document.getElementById('rateLiveCounterUnit').value = rates.catering.liveCounterPerUnit;

    // 3. Photography Rates
    const photoContainer = document.getElementById('managePhotoRates');
    if (photoContainer) {
      photoContainer.innerHTML = rates.photography.map((item, idx) => `
        <div class="form-group" style="flex-direction: row; align-items: center; justify-content: space-between; background: #0d1424; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.9rem; font-weight: 500;">${item.name}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: var(--accent-cyan); font-size: 0.85rem;">₹</span>
            <input type="number" class="form-input rate-photo-input" data-index="${idx}" value="${item.unitPrice}" min="0" style="width: 110px; text-align: right;">
          </div>
        </div>
      `).join('');
    }

    // 4. Accommodation & Transport
    if (document.getElementById('ratePerRoom')) document.getElementById('ratePerRoom').value = rates.accommodation.perRoomPrice;

    const transContainer = document.getElementById('manageTransportRates');
    if (transContainer) {
      transContainer.innerHTML = rates.transport.map((item, idx) => `
        <div class="form-group" style="flex-direction: row; align-items: center; justify-content: space-between; background: #0d1424; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.9rem; font-weight: 500;">${item.name}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: var(--accent-cyan); font-size: 0.85rem;">₹</span>
            <input type="number" class="form-input rate-trans-input" data-index="${idx}" value="${item.unitPrice}" min="0" style="width: 110px; text-align: right;">
          </div>
        </div>
      `).join('');
    }
  },

  saveRatesFromForm() {
    const rates = window.StorageManager.getRates();

    // Decoration
    document.querySelectorAll('.rate-dec-input').forEach(input => {
      const idx = parseInt(input.getAttribute('data-index'));
      if (rates.decoration[idx]) {
        rates.decoration[idx].unitPrice = parseFloat(input.value) || 0;
      }
    });

    // Catering
    rates.catering.vegPerPlate = parseFloat(document.getElementById('rateVegPerPlate')?.value) || 0;
    rates.catering.nonVegPerPlate = parseFloat(document.getElementById('rateNonVegPerPlate')?.value) || 0;
    rates.catering.sweetPerPlate = parseFloat(document.getElementById('rateSweetPerPlate')?.value) || 0;
    rates.catering.liveCounterPerUnit = parseFloat(document.getElementById('rateLiveCounterUnit')?.value) || 0;

    // Photography
    document.querySelectorAll('.rate-photo-input').forEach(input => {
      const idx = parseInt(input.getAttribute('data-index'));
      if (rates.photography[idx]) {
        rates.photography[idx].unitPrice = parseFloat(input.value) || 0;
      }
    });

    // Accommodation & Transport
    rates.accommodation.perRoomPrice = parseFloat(document.getElementById('ratePerRoom')?.value) || 0;

    document.querySelectorAll('.rate-trans-input').forEach(input => {
      const idx = parseInt(input.getAttribute('data-index'));
      if (rates.transport[idx]) {
        rates.transport[idx].unitPrice = parseFloat(input.value) || 0;
      }
    });

    window.StorageManager.saveRates(rates);
    window.App.showToast('Rate Master updated successfully!', 'success');

    // Re-sync Bill Tab form rates
    window.BillTab.renderForm();
    window.BillTab.recalculateTotals();
  },

  resetDefaults() {
    if (confirm('Reset all prices to original default rates?')) {
      window.StorageManager.resetRates();
      this.renderRatesForm();
      window.BillTab.renderForm();
      window.BillTab.recalculateTotals();
      window.App.showToast('Rates reset to default values', 'info');
    }
  }
};
