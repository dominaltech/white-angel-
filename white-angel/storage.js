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

  // Saved Quotations Management (with Exception Fallback to prevent storage limits)
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

      // Copy object to prevent mutating active memory state
      const quoteToStore = JSON.parse(JSON.stringify(quotation));

      if (existingIndex >= 0) {
        list[existingIndex] = quoteToStore;
      } else {
        quoteToStore.createdAt = quoteToStore.createdAt || now;
        quoteToStore.id = quoteToStore.id || 'WA-' + Date.now().toString(36).toUpperCase();
        list.unshift(quoteToStore);
      }

      try {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
      } catch (quotaError) {
        console.warn('LocalStorage quota limit reached, saving quote metadata without heavy image payloads:', quotaError);
        // Fallback: Strip heavy base64 image strings from history list to fit in storage
        const lightweightList = list.map(q => ({
          ...q,
          images: (q.images || []).map(img => ({ id: img.id, title: img.title, description: img.description }))
        }));
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(lightweightList));
      }

      return quotation;
    } catch (e) {
      console.error('Error saving quotation:', e);
      return quotation;
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
