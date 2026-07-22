// LocalStorage Helper for White Angel Events Quotation System
const STORAGE_KEYS = {
  RATES: 'wa_price_master_v1',
  QUOTES: 'wa_saved_quotations_v1'
};

window.StorageManager = {
  // Rate Card Management
  getRates() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading rates:', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_RATES));
  },

  saveRates(rates) {
    try {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
      return true;
    } catch (e) {
      console.error('Error saving rates:', e);
      return false;
    }
  },

  resetRates() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RATES);
      return this.getRates();
    } catch (e) {
      console.error('Error resetting rates:', e);
    }
  },

  // Saved Quotations Management
  getQuotations() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading quotations:', e);
    }
    return [];
  },

  saveQuotation(quotation) {
    try {
      const list = this.getQuotations();
      const existingIndex = list.findIndex(q => q.id === quotation.id);
      
      const now = new Date().toISOString();
      quotation.updatedAt = now;

      if (existingIndex >= 0) {
        list[existingIndex] = quotation;
      } else {
        quotation.createdAt = quotation.createdAt || now;
        quotation.id = quotation.id || 'WA-' + Date.now().toString(36).toUpperCase();
        list.unshift(quotation);
      }

      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
      return quotation;
    } catch (e) {
      console.error('Error saving quotation:', e);
      return null;
    }
  },

  getQuotationById(id) {
    const list = this.getQuotations();
    return list.find(q => q.id === id) || null;
  },

  deleteQuotation(id) {
    try {
      let list = this.getQuotations();
      list = list.filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Error deleting quotation:', e);
      return false;
    }
  }
};
