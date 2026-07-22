// Main App Orchestrator for White Angel Events Quotation System
window.App = {
  init() {
    this.initTheme();
    this.bindNavigation();
    this.initModules();
  },

  // Default to Day Mode ☀️ every time the system is opened
  initTheme() {
    const defaultTheme = 'light';
    document.documentElement.setAttribute('data-theme', defaultTheme);
    this.updateThemeIcon(defaultTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('wa_theme_mode', nextTheme);
    this.updateThemeIcon(nextTheme);
    this.showToast(`Switched to ${nextTheme === 'light' ? 'Day Mode ☀️' : 'Night Mode 🌙'}`, 'info');
  },

  updateThemeIcon(theme) {
    const iconBtn = document.getElementById('themeToggleBtn');
    if (!iconBtn) return;
    if (theme === 'light') {
      // Show Moon icon (Click to switch to Night mode)
      iconBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
      iconBtn.setAttribute('title', 'Switch to Night Mode 🌙');
    } else {
      // Show Sun icon (Click to switch to Day mode)
      iconBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      iconBtn.setAttribute('title', 'Switch to Day Mode ☀️');
    }
  },

  bindNavigation() {
    // Desktop & Mobile Nav Tab switching
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  },

  switchTab(tabId) {
    // Update active tab buttons
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update active content panels
    document.querySelectorAll('.tab-content').forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Refresh sub-module views on tab switch
    if (tabId === 'summary' && window.SummaryTab) {
      window.SummaryTab.loadQuotations();
    }
    if (tabId === 'manage' && window.ManageTab) {
      window.ManageTab.renderRatesForm();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  initModules() {
    if (window.BillTab) window.BillTab.init();
    if (window.SummaryTab) window.SummaryTab.init();
    if (window.ManageTab) window.ManageTab.init();
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0284c7'};
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      pointer-events: auto;
      animation: slideIn 0.25s ease;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialize App when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
