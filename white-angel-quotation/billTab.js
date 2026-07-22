// Bill Tab Logic for White Angel Events Quotation System
window.BillTab = {
  currentQuotationId: null,
  uploadedImages: [],
  customItemCounter: 1,

  init() {
    this.renderForm();
    this.bindEvents();
    this.recalculateTotals();
  },

  renderForm() {
    const rates = window.StorageManager.getRates();

    // 1. Populate Decoration Checkpoints
    const decContainer = document.getElementById('decorationCheckpoints');
    if (decContainer) {
      decContainer.innerHTML = rates.decoration.map(item => this.createItemRowHtml({
        id: item.id,
        category: 'decoration',
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: 1,
        selected: false
      })).join('');
    }

    // 2. Populate Photography Checkpoints
    const photoContainer = document.getElementById('photographyCheckpoints');
    if (photoContainer) {
      photoContainer.innerHTML = rates.photography.map(item => this.createItemRowHtml({
        id: item.id,
        category: 'photography',
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: 1,
        selected: false
      })).join('');
    }

    // 3. Populate Transport Checkpoints
    const transContainer = document.getElementById('transportCheckpoints');
    if (transContainer) {
      transContainer.innerHTML = rates.transport.map(item => this.createItemRowHtml({
        id: item.id,
        category: 'transport',
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: 1,
        selected: false
      })).join('');
    }
  },

  createItemRowHtml(item) {
    return `
      <div class="item-row ${item.selected ? 'selected' : ''}" data-id="${item.id}" data-category="${item.category}">
        <input type="checkbox" class="item-checkbox" ${item.selected ? 'checked' : ''} onchange="window.BillTab.handleItemToggle(this)">
        <input type="text" class="item-title-input" value="${item.name}" placeholder="Item Name" onchange="window.BillTab.recalculateTotals()">
        <div class="qty-control">
          <button type="button" class="qty-btn" onclick="window.BillTab.changeQty(this, -1)">-</button>
          <input type="number" class="qty-input" value="${item.quantity || 1}" min="1" onchange="window.BillTab.recalculateTotals()">
          <button type="button" class="qty-btn" onclick="window.BillTab.changeQty(this, 1)">+</button>
        </div>
        <div class="item-price-tag">
          ₹ <input type="number" class="item-price-input" value="${item.unitPrice || 0}" min="0" onchange="window.BillTab.recalculateTotals()">
        </div>
        <button type="button" class="btn-icon" onclick="window.BillTab.deleteItemRow(this)" title="Remove Item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `;
  },

  changeQty(btn, delta) {
    const qtyInput = btn.parentElement.querySelector('.qty-input');
    let val = parseInt(qtyInput.value) || 1;
    val = Math.max(1, val + delta);
    qtyInput.value = val;
    this.recalculateTotals();
  },

  handleItemToggle(checkbox) {
    const row = checkbox.closest('.item-row');
    if (checkbox.checked) {
      row.classList.add('selected');
    } else {
      row.classList.remove('selected');
    }
    this.recalculateTotals();
  },

  deleteItemRow(btn) {
    const row = btn.closest('.item-row');
    if (row) {
      row.remove();
      this.recalculateTotals();
    }
  },

  addCustomItem(containerId, categoryName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const id = 'custom_' + Date.now() + '_' + this.customItemCounter++;
    const html = this.createItemRowHtml({
      id,
      category: categoryName,
      name: 'Custom Service Item',
      unitPrice: 1000,
      quantity: 1,
      selected: true
    });

    container.insertAdjacentHTML('beforeend', html);
    this.recalculateTotals();
  },

  recalculateTotals() {
    const rates = window.StorageManager.getRates();
    let subtotal = 0;

    // 1. Checkpoint Rows (Decoration, Photography, Transport, Custom)
    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
      const checkbox = row.querySelector('.item-checkbox');
      if (checkbox && checkbox.checked) {
        row.classList.add('selected');
        const qty = parseInt(row.querySelector('.qty-input').value) || 1;
        const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
        subtotal += (qty * price);
      } else {
        row.classList.remove('selected');
      }
    });

    // 2. Catering Calculation
    const vegCount = parseInt(document.getElementById('catVegGuests')?.value) || 0;
    const vegTotal = vegCount * rates.catering.vegPerPlate;
    if (document.getElementById('catVegTotal')) document.getElementById('catVegTotal').textContent = '₹ ' + vegTotal.toLocaleString('en-IN');
    subtotal += vegTotal;

    const nonVegCount = parseInt(document.getElementById('catNonVegGuests')?.value) || 0;
    const nonVegTotal = nonVegCount * rates.catering.nonVegPerPlate;
    if (document.getElementById('catNonVegTotal')) document.getElementById('catNonVegTotal').textContent = '₹ ' + nonVegTotal.toLocaleString('en-IN');
    subtotal += nonVegTotal;

    const sweetCount = parseInt(document.getElementById('catSweetsCount')?.value) || 0;
    const sweetTotal = sweetCount * rates.catering.sweetPerPlate;
    if (document.getElementById('catSweetsTotal')) document.getElementById('catSweetsTotal').textContent = '₹ ' + sweetTotal.toLocaleString('en-IN');
    subtotal += sweetTotal;

    // Live Counters
    for (let i = 1; i <= 5; i++) {
      const input = document.getElementById(`catLiveCounter_${i}`);
      if (input && input.value.trim() !== '') {
        subtotal += rates.catering.liveCounterPerUnit;
      }
    }

    // 3. Accommodation Calculation
    const roomsCount = parseInt(document.getElementById('accRoomsCount')?.value) || 0;
    const roomsTotal = roomsCount * rates.accommodation.perRoomPrice;
    if (document.getElementById('accRoomsTotal')) document.getElementById('accRoomsTotal').textContent = '₹ ' + roomsTotal.toLocaleString('en-IN');
    subtotal += roomsTotal;

    // 4. Discount Percentage & Amount Calculation
    const discountPercent = Math.max(0, Math.min(100, parseFloat(document.getElementById('discountPercentInput')?.value) || 0));
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const grandTotal = Math.max(0, subtotal - discountAmount);

    const advancePaid = parseFloat(document.getElementById('advancePaidInput')?.value) || 0;
    const balance = grandTotal - advancePaid;

    // Update Displays
    if (document.getElementById('displaySubtotal')) {
      document.getElementById('displaySubtotal').textContent = '₹ ' + subtotal.toLocaleString('en-IN');
    }
    if (document.getElementById('displayGrandTotal')) {
      document.getElementById('displayGrandTotal').textContent = '₹ ' + grandTotal.toLocaleString('en-IN') + (discountPercent > 0 ? ` (${discountPercent}% OFF)` : '');
    }
    if (document.getElementById('displayBalance')) {
      document.getElementById('displayBalance').textContent = '₹ ' + balance.toLocaleString('en-IN');
    }
  },

  // Fast Canvas Image Compressor
  compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  },

  // Multi-Image Upload Handler
  async handleImageUpload(files) {
    const fileList = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileList.length === 0) return;

    window.App.showToast(`Processing & optimizing ${fileList.length} photo(s)...`, 'info');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const compressedDataUrl = await this.compressImage(file);
      if (compressedDataUrl) {
        this.uploadedImages.push({
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          src: compressedDataUrl,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: 'Event Decoration Concept Reference'
        });
      }
    }

    this.renderUploadedImages();
    window.App.showToast(`Total ${this.uploadedImages.length} photos ready for PDF!`, 'success');
  },

  renderUploadedImages() {
    const grid = document.getElementById('uploadedImagesGrid');
    if (!grid) return;

    if (this.uploadedImages.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 12px;">No concept photos uploaded yet. Click or drop images above to attach them to the PDF (4 photos per page).</div>`;
      return;
    }

    grid.innerHTML = this.uploadedImages.map((img, idx) => {
      const pageNum = Math.floor(idx / 4) + 1;
      const photoSlot = (idx % 4) + 1;
      return `
        <div class="image-preview-card" data-id="${img.id}">
          <span class="page-badge">Photo Page ${pageNum} (${photoSlot}/4)</span>
          <button type="button" class="card-remove-btn" onclick="window.BillTab.removeUploadedImage('${img.id}')">&times;</button>
          <img src="${img.src}" alt="Event Photo">
          <div class="image-card-body">
            <input type="text" class="form-input" value="${img.title}" placeholder="Photo Title" onchange="window.BillTab.updateImageDetails('${img.id}', 'title', this.value)">
            <input type="text" class="form-input" value="${img.description}" placeholder="Description" onchange="window.BillTab.updateImageDetails('${img.id}', 'description', this.value)">
          </div>
        </div>
      `;
    }).join('');
  },

  updateImageDetails(id, field, value) {
    const img = this.uploadedImages.find(i => i.id === id);
    if (img) {
      img[field] = value;
    }
  },

  removeUploadedImage(id) {
    this.uploadedImages = this.uploadedImages.filter(i => i.id !== id);
    this.renderUploadedImages();
  },

  // Extract Full Quotation Object
  getQuotationData() {
    const rates = window.StorageManager.getRates();

    const selectedFunctions = [];
    document.querySelectorAll('.function-checkbox:checked').forEach(cb => {
      selectedFunctions.push(cb.value);
    });

    const items = [];
    let subtotal = 0;

    document.querySelectorAll('.item-row').forEach(row => {
      const selected = row.querySelector('.item-checkbox').checked;
      const name = row.querySelector('.item-title-input').value;
      const quantity = parseInt(row.querySelector('.qty-input').value) || 1;
      const unitPrice = parseFloat(row.querySelector('.item-price-input').value) || 0;
      const category = row.getAttribute('data-category') || 'general';

      if (selected) subtotal += (quantity * unitPrice);

      items.push({
        id: row.getAttribute('data-id'),
        category,
        name,
        quantity,
        unitPrice,
        selected
      });
    });

    const vegCount = parseInt(document.getElementById('catVegGuests')?.value) || 0;
    if (vegCount > 0) {
      subtotal += (vegCount * rates.catering.vegPerPlate);
      items.push({
        id: 'cat_veg',
        category: 'catering',
        name: `Catering - Veg Plates (${vegCount} Guests)`,
        quantity: vegCount,
        unitPrice: rates.catering.vegPerPlate,
        selected: true
      });
    }

    const nonVegCount = parseInt(document.getElementById('catNonVegGuests')?.value) || 0;
    if (nonVegCount > 0) {
      subtotal += (nonVegCount * rates.catering.nonVegPerPlate);
      items.push({
        id: 'cat_nonveg',
        category: 'catering',
        name: `Catering - Non-Veg Plates (${nonVegCount} Guests)`,
        quantity: nonVegCount,
        unitPrice: rates.catering.nonVegPerPlate,
        selected: true
      });
    }

    const sweetCount = parseInt(document.getElementById('catSweetsCount')?.value) || 0;
    if (sweetCount > 0) {
      subtotal += (sweetCount * rates.catering.sweetPerPlate);
      items.push({
        id: 'cat_sweets',
        category: 'catering',
        name: `Catering - Sweet Items (${sweetCount} Plates)`,
        quantity: sweetCount,
        unitPrice: rates.catering.sweetPerPlate,
        selected: true
      });
    }

    for (let i = 1; i <= 5; i++) {
      const input = document.getElementById(`catLiveCounter_${i}`);
      if (input && input.value.trim() !== '') {
        subtotal += rates.catering.liveCounterPerUnit;
        items.push({
          id: `cat_live_${i}`,
          category: 'catering',
          name: `Live Counter: ${input.value.trim()}`,
          quantity: 1,
          unitPrice: rates.catering.liveCounterPerUnit,
          selected: true
        });
      }
    }

    const roomsCount = parseInt(document.getElementById('accRoomsCount')?.value) || 0;
    const hotelName = document.getElementById('accHotelName')?.value || '';
    if (roomsCount > 0) {
      subtotal += (roomsCount * rates.accommodation.perRoomPrice);
      items.push({
        id: 'acc_rooms',
        category: 'accommodation',
        name: `Accommodation: ${hotelName || 'Hotel Rooms'} (${roomsCount} Rooms)`,
        quantity: roomsCount,
        unitPrice: rates.accommodation.perRoomPrice,
        selected: true
      });
    }

    const discountPercent = Math.max(0, Math.min(100, parseFloat(document.getElementById('discountPercentInput')?.value) || 0));
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const grandTotal = Math.max(0, subtotal - discountAmount);
    const advancePaid = parseFloat(document.getElementById('advancePaidInput')?.value) || 0;

    return {
      id: this.currentQuotationId || ('WA-' + Date.now().toString(36).toUpperCase()),
      clientDetails: {
        groomName: document.getElementById('groomName')?.value || '',
        brideName: document.getElementById('brideName')?.value || '',
        mobileNumber: document.getElementById('mobileNumber')?.value || '',
        alternateNumber: document.getElementById('alternateNumber')?.value || '',
        address: document.getElementById('clientAddress')?.value || '',
        email: document.getElementById('clientEmail')?.value || ''
      },
      eventDetails: {
        weddingDate: document.getElementById('weddingDate')?.value || '',
        venueName: document.getElementById('venueName')?.value || '',
        venueAddress: document.getElementById('venueAddress')?.value || '',
        eventTime: document.getElementById('eventTime')?.value || '',
        guestCount: document.getElementById('guestCount')?.value || ''
      },
      selectedFunctions,
      items,
      images: this.uploadedImages,
      payment: {
        subtotal,
        discountPercent,
        discountAmount,
        estimatedBudget: parseFloat(document.getElementById('estimatedBudgetInput')?.value) || 0,
        advancePaid,
        grandTotal,
        balanceAmount: grandTotal - advancePaid
      },
      specialInstructions: document.getElementById('specialInstructionsInput')?.value || ''
    };
  },

  // Save Quotation
  saveQuotation(e) {
    if (e && e.preventDefault) e.preventDefault();

    const data = this.getQuotationData();
    const saved = window.StorageManager.saveQuotation(data);
    if (saved) {
      this.currentQuotationId = saved.id;
      window.App.showToast(`Quotation ${saved.id} saved!`, 'success');
      if (window.SummaryTab) window.SummaryTab.loadQuotations();
    }
    return data;
  },

  // Generate PDF
  async generatePdf(e) {
    if (e && e.preventDefault) e.preventDefault();

    const data = this.saveQuotation();
    if (!data) return;

    window.App.showToast(`Generating PDF (${data.images.length} photos)...`, 'info');

    try {
      const doc = await window.PdfGenerator.generatePdf(data);
      const clientName = [data.clientDetails.groomName, data.clientDetails.brideName].filter(Boolean).join('_') || 'Client';
      const filename = `White_Angel_Quotation_${clientName}_${data.id}.pdf`;
      doc.save(filename);
      window.App.showToast('PDF generated and downloaded!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      window.App.showToast('Error generating PDF', 'error');
    }
  },

  // Send WhatsApp
  sendWhatsApp(e) {
    if (e && e.preventDefault) e.preventDefault();

    const data = this.saveQuotation();
    if (!data) return;

    const phone = data.clientDetails.mobileNumber.replace(/\D/g, '');
    const clientName = [data.clientDetails.groomName, data.clientDetails.brideName].filter(Boolean).join(' & ') || 'Client';

    const subtotal = data.payment.subtotal || 0;
    const discountStr = data.payment.discountPercent > 0 ? `\n*Discount (${data.payment.discountPercent}%):* -Rs. ${data.payment.discountAmount.toLocaleString('en-IN')}` : '';

    const message = `*WHITE ANGEL EVENTS* - Quotation Details 🌸
-------------------------------------
*Quote ID:* ${data.id}
*Client:* ${clientName}
*Event Date:* ${data.eventDetails.weddingDate || 'TBD'}
*Venue:* ${data.eventDetails.venueName || 'TBD'}
*Functions:* ${(data.selectedFunctions || []).join(', ') || 'Wedding Event'}

*Subtotal:* Rs. ${subtotal.toLocaleString('en-IN')}${discountStr}
*Grand Total:* Rs. ${data.payment.grandTotal.toLocaleString('en-IN')}
*Advance Paid:* Rs. ${(data.payment.advancePaid || 0).toLocaleString('en-IN')}
*Balance Amount:* Rs. ${data.payment.balanceAmount.toLocaleString('en-IN')}

Thank you for choosing White Angel Events!
_Creating Moments, Building Memories_ 💖`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = phone ? `https://wa.me/91${phone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
  },

  // Reset Form
  resetForm() {
    if (confirm('Clear current form to create a new blank quotation?')) {
      this.currentQuotationId = null;
      this.uploadedImages = [];
      this.renderForm();
      
      ['groomName', 'brideName', 'mobileNumber', 'alternateNumber', 'clientAddress', 'clientEmail', 
       'weddingDate', 'venueName', 'venueAddress', 'eventTime', 'guestCount', 
       'catVegGuests', 'catNonVegGuests', 'catSweetsCount', 'accRoomsCount', 'accHotelName',
       'estimatedBudgetInput', 'discountPercentInput', 'advancePaidInput', 'specialInstructionsInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`catLiveCounter_${i}`);
        if (el) el.value = '';
      }

      document.querySelectorAll('.function-checkbox').forEach(cb => cb.checked = false);
      this.renderUploadedImages();
      this.recalculateTotals();
      window.App.showToast('Form cleared for new quotation', 'info');
    }
  },

  // Load Saved Quotation into Form for Editing
  loadQuotationForEdit(quotation) {
    if (!quotation) return;
    this.currentQuotationId = quotation.id;

    // Client
    if (document.getElementById('groomName')) document.getElementById('groomName').value = quotation.clientDetails.groomName || '';
    if (document.getElementById('brideName')) document.getElementById('brideName').value = quotation.clientDetails.brideName || '';
    if (document.getElementById('mobileNumber')) document.getElementById('mobileNumber').value = quotation.clientDetails.mobileNumber || '';
    if (document.getElementById('alternateNumber')) document.getElementById('alternateNumber').value = quotation.clientDetails.alternateNumber || '';
    if (document.getElementById('clientAddress')) document.getElementById('clientAddress').value = quotation.clientDetails.address || '';
    if (document.getElementById('clientEmail')) document.getElementById('clientEmail').value = quotation.clientDetails.email || '';

    // Event
    if (document.getElementById('weddingDate')) document.getElementById('weddingDate').value = quotation.eventDetails.weddingDate || '';
    if (document.getElementById('venueName')) document.getElementById('venueName').value = quotation.eventDetails.venueName || '';
    if (document.getElementById('venueAddress')) document.getElementById('venueAddress').value = quotation.eventDetails.venueAddress || '';
    if (document.getElementById('eventTime')) document.getElementById('eventTime').value = quotation.eventDetails.eventTime || '';
    if (document.getElementById('guestCount')) document.getElementById('guestCount').value = quotation.eventDetails.guestCount || '';

    // Functions
    document.querySelectorAll('.function-checkbox').forEach(cb => {
      cb.checked = (quotation.selectedFunctions || []).includes(cb.value);
    });

    // Checkpoints
    (quotation.items || []).forEach(item => {
      const row = document.querySelector(`.item-row[data-id="${item.id}"]`);
      if (row) {
        row.querySelector('.item-checkbox').checked = item.selected;
        row.querySelector('.item-title-input').value = item.name;
        row.querySelector('.qty-input').value = item.quantity;
        row.querySelector('.item-price-input').value = item.unitPrice;
      }
    });

    // Catering
    const vegItem = (quotation.items || []).find(i => i.id === 'cat_veg');
    if (vegItem && document.getElementById('catVegGuests')) document.getElementById('catVegGuests').value = vegItem.quantity;

    const nonVegItem = (quotation.items || []).find(i => i.id === 'cat_nonveg');
    if (nonVegItem && document.getElementById('catNonVegGuests')) document.getElementById('catNonVegGuests').value = nonVegItem.quantity;

    const sweetItem = (quotation.items || []).find(i => i.id === 'cat_sweets');
    if (sweetItem && document.getElementById('catSweetsCount')) document.getElementById('catSweetsCount').value = sweetItem.quantity;

    // Payments & Discount
    if (document.getElementById('estimatedBudgetInput')) document.getElementById('estimatedBudgetInput').value = quotation.payment?.estimatedBudget || 0;
    if (document.getElementById('discountPercentInput')) document.getElementById('discountPercentInput').value = quotation.payment?.discountPercent || 0;
    if (document.getElementById('advancePaidInput')) document.getElementById('advancePaidInput').value = quotation.payment?.advancePaid || 0;

    // Special Instructions
    if (document.getElementById('specialInstructionsInput')) document.getElementById('specialInstructionsInput').value = quotation.specialInstructions || '';

    // Images
    this.uploadedImages = quotation.images || [];
    this.renderUploadedImages();

    this.recalculateTotals();
    window.App.switchTab('bill');
    window.App.showToast(`Loaded Quotation ${quotation.id} for editing`, 'info');
  },

  bindEvents() {
    const dropzone = document.getElementById('imageDropzone');
    const fileInput = document.getElementById('imageFileInput');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleImageUpload(e.target.files));

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-cyan)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-color)';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files) {
          this.handleImageUpload(e.dataTransfer.files);
        }
      });
    }
  }
};
