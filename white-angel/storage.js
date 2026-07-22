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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Error reading rates master from storage:', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_RATES));
  },

  saveRates(rates) {
    try {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
      return true;
    } catch (e) {
      console.error('Error saving rates master to storage:', e);
      return false;
    }
  },

  resetRates() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RATES);
      return this.getRates();
    } catch (e) {
      console.error('Error resetting rates master:', e);
    }
  },

  // Helper to generate simple sequential serial numbers: 1, 2, 3...
  getNextQuoteId() {
    const list = this.getQuotations();
    let maxId = 0;
    if (Array.isArray(list)) {
      list.forEach(q => {
        const num = parseInt(q.id, 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      });
    }
    return (maxId + 1).toString();
  },

  // Saved Quotations Management (Sequential Serial IDs 1, 2, 3...)
  getQuotations() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      if (saved) {
        let list = JSON.parse(saved);
        if (Array.isArray(list)) {
          // Migration: Auto-convert any legacy alphanumeric IDs (like WA-MRW4KJEW) to sequential numeric IDs 1, 2, 3...
          let needsResave = false;
          list.forEach((q, idx) => {
            if (!q || !q.id || isNaN(parseInt(q.id, 10))) {
              if (q) q.id = (list.length - idx).toString();
              needsResave = true;
            }
          });

          if (needsResave) {
            localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
          }

          return list;
        }
      }
    } catch (e) {
      console.error('Error reading quotations from storage:', e);
    }
    return [];
  },

  saveQuotation(quotation) {
    if (!quotation) return null;

    try {
      const list = this.getQuotations();
      
      // Ensure quotation has a simple numeric sequential serial number (1, 2, 3...)
      if (!quotation.id || isNaN(parseInt(quotation.id, 10))) {
        quotation.id = this.getNextQuoteId();
      }

      const existingIndex = list.findIndex(q => String(q.id) === String(quotation.id));
      
      const now = new Date().toISOString();
      quotation.updatedAt = now;

      // Copy object to prevent mutating active memory state
      const quoteToStore = JSON.parse(JSON.stringify(quotation));

      if (existingIndex >= 0) {
        list[existingIndex] = quoteToStore;
      } else {
        quoteToStore.createdAt = quoteToStore.createdAt || now;
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
    return list.find(q => String(q.id) === String(id)) || null;
  },

  deleteQuotation(id) {
    try {
      let list = this.getQuotations();
      list = list.filter(q => String(q.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Error deleting quotation:', e);
      return false;
    }
  }
};
