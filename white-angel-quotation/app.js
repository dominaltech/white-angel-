// Main App Controller for White Angel Events Quotation System
window.App = {
  activeTab: 'bill',

  init() {
    this.bindNavigation();
    
    // Initialize Sub-Controllers
    if (window.BillTab) window.BillTab.init();
    if (window.SummaryTab) window.SummaryTab.init();
    if (window.ManageTab) window.ManageTab.init();

    this.switchTab('bill');
  },

  bindNavigation() {
    // Desktop Nav Buttons
    document.querySelectorAll('.desktop-nav .nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Mobile Nav Buttons
    document.querySelectorAll('.mobile-nav .mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update Desktop Nav Buttons
    document.querySelectorAll('.desktop-nav .nav-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Mobile Nav Buttons
    document.querySelectorAll('.mobile-nav .mobile-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/Hide Tab Contents
    document.querySelectorAll('.tab-content').forEach(content => {
      if (content.id === `tab-${tabName}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Refresh Tab Data when switched
    if (tabName === 'summary' && window.SummaryTab) {
      window.SummaryTab.loadQuotations();
    } else if (tabName === 'manage' && window.ManageTab) {
      window.ManageTab.renderRatesForm();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Initialize App when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
