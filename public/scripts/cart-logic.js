// src/scripts/cart-logic.js (REVISI FINAL: QTY TOTAL, LALU DISTRIBUSI PER UKURAN)

// --- KONSTANTA & UTILITY ---

const WHATSAPP_NUMBER = '6285171140818'; // Ganti dengan nomor Anda
// Ukuran yang tersedia
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const VALID_COUPONS = [
  {
    code: 'DISKON20K',
    type: 'fixed',
    value: 20000,
    min: 100000,
    description: 'Diskon tetap Rp 20.000',
  },
  { code: 'HEMAT10', type: 'percentage', value: 0.1, min: 200000, description: 'Diskon 10%' },
];
let activeCoupon = null; // State kupon yang aktif

// --- HARGA GROSIR BARU ---
const MIN_QTY_FOR_DISCOUNT = 10;
const REGULAR_PRICE_PER_ITEM = 120000;
const WHOLESALE_PRICE_PER_ITEM = 100000; // Harga saat totalQuantity >= 10

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// Fungsi untuk mendapatkan harga aktual berdasarkan kuantitas total
const getActualItemPrice = (totalQuantity) => {
  return totalQuantity >= MIN_QTY_FOR_DISCOUNT ? WHOLESALE_PRICE_PER_ITEM : REGULAR_PRICE_PER_ITEM;
};

// --- FUNGSI KERANJANG LOKAL ---

const getCartItems = () => {
  const cartJson = localStorage.getItem('cartItems');
  let items = [];
  try {
    items = cartJson ? JSON.parse(cartJson) : [];
  } catch (e) {
    console.error('Error parsing cartItems from localStorage:', e);
  }
  return Array.isArray(items) ? items : [];
};

const saveCartItems = (items) => {
  localStorage.setItem('cartItems', JSON.stringify(items));
  // Total count adalah jumlah semua totalQuantity dari semua produk
  const totalCount = items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  localStorage.setItem('cartCount', totalCount);
};

// Fungsi untuk menghitung total keranjang (Diubah)
const calculateTotals = (items) => {
  let subtotal = 0;

  items.forEach((item) => {
    const qty = parseInt(item.totalQuantity) || 0;
    const actualPrice = getActualItemPrice(qty);
    subtotal += actualPrice * qty;
  });

  let discount = 0;
  let couponMessage = '';

  if (activeCoupon) {
    const minAmount = activeCoupon.min;

    if (subtotal >= minAmount) {
      if (activeCoupon.type === 'fixed') {
        discount = activeCoupon.value;
      } else if (activeCoupon.type === 'percentage') {
        discount = Math.round(subtotal * activeCoupon.value);
      }
      couponMessage = `Kupon *${activeCoupon.code}* diterapkan!`;
    } else {
      couponMessage = `Kupon *${activeCoupon.code}* membutuhkan minimal order ${formatRupiah(minAmount)}.`;
      activeCoupon = null;
    }
  }

  let total = subtotal - discount;

  return { subtotal, discount, shipping: 0, total, couponMessage };
};

// --- FUNGSI MANIPULASI ITEM (UPDATE/DELETE) ---

window.deleteItem = (itemIndex) => {
  if (confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) {
    let cartItems = getCartItems();
    cartItems.splice(itemIndex, 1);
    saveCartItems(cartItems);
    renderCart();
  }
};

// Fungsi BARU: Update kuantitas total item
window.updateTotalQuantity = (itemIndex, change) => {
  let cartItems = getCartItems();
  if (cartItems[itemIndex]) {
    const newTotalQuantity = (cartItems[itemIndex].totalQuantity || 0) + change;

    if (newTotalQuantity > 0) {
      cartItems[itemIndex].totalQuantity = newTotalQuantity;
      // Saat total quantity bertambah, reset distribusi. Jika berkurang, kita biarkan saja.
      if (change > 0) {
        cartItems[itemIndex].sizeQuantities = {};
      }
      saveCartItems(cartItems);
      renderCart();
    } else {
      window.deleteItem(itemIndex);
    }
  }
};

// Fungsi BARU: Update kuantitas per ukuran
window.updateSizeQuantity = (itemIndex, size, newQty) => {
  let cartItems = getCartItems();
  if (cartItems[itemIndex]) {
    cartItems[itemIndex].sizeQuantities = cartItems[itemIndex].sizeQuantities || {};

    const totalDistributed = Object.values(cartItems[itemIndex].sizeQuantities || {}).reduce(
      (sum, qty) => sum + qty,
      0,
    );

    const totalQty = cartItems[itemIndex].totalQuantity || 0;
    const currentSizeQty = cartItems[itemIndex].sizeQuantities[size] || 0;

    // Kuantitas yang TERSISA yang belum didistribusikan ke ukuran lain
    const remainingQtyToDistribute = totalQty - totalDistributed;

    // Kuantitas maksimum yang bisa dimasukkan untuk ukuran ini
    const maxQty = currentSizeQty + remainingQtyToDistribute;

    let finalQty = Math.max(0, newQty);

    // Batasi kuantitas yang dimasukkan agar tidak melebihi totalQuantity
    if (finalQty > maxQty) {
      finalQty = maxQty;
    }

    if (finalQty > 0) {
      cartItems[itemIndex].sizeQuantities[size] = finalQty;
    } else {
      delete cartItems[itemIndex].sizeQuantities[size];
    }

    saveCartItems(cartItems);
    renderCart(); // Render ulang untuk validasi checkout
  }
};

// --- RENDER & DISPLAY ---

// Fungsi untuk menghitung sisa kuantitas yang belum didistribusikan
const getRemainingQuantity = (item) => {
  const totalDistributed = Object.values(item.sizeQuantities || {}).reduce(
    (sum, qty) => sum + qty,
    0,
  );
  return (item.totalQuantity || 0) - totalDistributed;
};

// Fungsi untuk membuat template item keranjang (REVISI BESAR)
const createCartItemTemplate = (item, index) => {
  const actualPrice = getActualItemPrice(item.totalQuantity);
  const totalPrice = actualPrice * item.totalQuantity;
  const isWholesale = item.totalQuantity >= MIN_QTY_FOR_DISCOUNT;
  const remainingQty = getRemainingQuantity(item);

  // Tampilkan harga koreksi dan tag diskon jika berlaku
  const priceDisplay = isWholesale
    ? `<span class="text-xs text-gray-500 line-through mr-1">${formatRupiah(REGULAR_PRICE_PER_ITEM)}</span> <span class="font-bold text-red-600">${formatRupiah(actualPrice)}</span> <span class="text-xs text-red-600">(Grosir)</span>`
    : `<span class="font-bold text-gray-800">${formatRupiah(actualPrice)}</span>`;

  // Template untuk Distribusi Ukuran
  const sizeDistributionHtml = AVAILABLE_SIZES.map((size) => {
    const currentQty = item.sizeQuantities?.[size] || 0;

    // Kuantitas maksimum yang bisa di-input untuk ukuran ini
    const maxInputQty = currentQty + remainingQty;
    // Cek apakah tombol tambah bisa diklik (hanya jika ada sisa kuantitas atau kuantitas saat ini > 0)
    const canIncrease = remainingQty > 0;

    return `
      <div class="flex items-center space-x-2 text-sm">
        <span class="font-medium w-12">${size}</span>
        <div class="flex items-center border border-gray-300 rounded-md p-1 w-28">
            <button onclick="updateSizeQuantity(${index}, '${size}', ${currentQty - 1})" 
                    class="text-gray-500 hover:text-red-600 p-1 disabled:opacity-50" 
                    aria-label="Kurangi ${size}"
                    ${currentQty === 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-minus fa-xs"></i>
            </button>
            
            <input type="number" 
                   value="${currentQty}" 
                   onchange="updateSizeQuantity(${index}, '${size}', parseInt(this.value) || 0)"
                   min="0"
                   max="${maxInputQty}"
                   class="w-10 text-center border-none p-0 text-xs focus:ring-0 focus:border-0"
                   aria-label="Kuantitas ${size}"
                   />
                   
            <button onclick="updateSizeQuantity(${index}, '${size}', ${currentQty + 1})" 
                    class="text-gray-500 hover:text-red-600 p-1 disabled:opacity-50" 
                    aria-label="Tambah ${size}"
                    ${!canIncrease && currentQty === 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-plus fa-xs"></i>
            </button>
        </div>
      </div>
    `;
  }).join('');

  // Tampilkan peringatan jika sisa kuantitas belum nol
  const sizeValidationAlert =
    remainingQty !== 0
      ? `<p class="text-sm font-semibold text-red-600 mt-2 p-2 bg-red-100 rounded-lg flex items-center">
          <i class="fa-solid fa-triangle-exclamation mr-2"></i> 
          Wajib Distribusikan ${remainingQty} item tersisa ke ukuran di bawah.
       </p>`
      : '';

  return `
    <div class="bg-white p-4 rounded-xl shadow-lg border ${remainingQty !== 0 ? 'border-red-400' : 'border-gray-200'}">
        <div class="flex items-start">
            <img src="${item.imageUrl || '/asset/images/item-placeholder-default.jpg'}" 
                 alt="${item.name}" 
                 class="h-20 w-20 object-cover rounded-md mr-4 border p-1">
            
            <div class="flex-grow">
                <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
                <p class="text-sm text-gray-600 mb-2">Harga Satuan: ${priceDisplay}</p>
                
                <div>
                    <label class="block text-xs font-medium text-gray-700">Kuantitas Total</label>
                    <div class="flex items-center mt-1 space-x-1 border border-gray-300 rounded-md p-1 w-32">
                        <button onclick="updateTotalQuantity(${index}, -1)" class="text-gray-500 hover:text-red-600 p-1" aria-label="Kurangi Total Kuantitas"><i class="fa-solid fa-minus fa-xs"></i></button>
                        <span class="text-sm font-medium w-8 text-center">${item.totalQuantity}</span>
                        <button onclick="updateTotalQuantity(${index}, 1)" class="text-gray-500 hover:text-red-600 p-1" aria-label="Tambah Total Kuantitas"><i class="fa-solid fa-plus fa-xs"></i></button>
                    </div>
                </div>
                
                <p class="text-lg font-bold text-red-600 mt-3 border-t pt-2">Total Item: ${formatRupiah(totalPrice)}</p>
                
            </div>
            
            <button onclick="deleteItem(${index})" class="text-red-500 hover:text-red-700 text-sm ml-4 p-1 flex-shrink-0">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        
        <div class="mt-4 pt-4 border-t border-dashed">
            <h4 class="text-base font-semibold text-gray-800 mb-2">Pembagian Ukuran:</h4>
            ${sizeValidationAlert}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                ${sizeDistributionHtml}
            </div>
            
            <p class="text-xs text-gray-500 mt-2">Sisa yang harus didistribusikan: <span class="${remainingQty !== 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}">${remainingQty}</span></p>
        </div>
    </div>
  `;
};

// Fungsi utama untuk me-render keranjang dan ringkasan
const renderCart = () => {
  const cartItems = getCartItems();
  const container = document.getElementById('cart-items-container');
  const subtotalDisplay = document.getElementById('subtotal-display');
  const discountDisplay = document.getElementById('discount-display');
  const totalDisplay = document.getElementById('total-display');
  const checkoutButton = document.getElementById('checkout-button');
  const loadingMessage = document.getElementById('loading-message');
  const emptyCartText = document.getElementById('empty-cart-text');
  const couponMessageDisplay = document.getElementById('coupon-message');

  // Ambil Data Penerima
  const ordererName = document.getElementById('orderer-name')?.value.trim();
  const ordererContact = document.getElementById('orderer-contact')?.value.trim();
  const shippingAddress = document.getElementById('shipping-address')?.value.trim();

  // VALIDASI KRITIS BARU: Apakah semua item memiliki pembagian ukuran yang sesuai?
  const isEveryItemDistributed = cartItems.every((item) => getRemainingQuantity(item) === 0);

  // VALIDASI FORMULIR: Apakah data penerima diisi?
  const isFormFilled = ordererName && ordererContact && shippingAddress;

  if (loadingMessage) {
    loadingMessage.style.display = 'none';
  }

  // KONDISI KERANJANG KOSONG
  if (cartItems.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-10">Keranjang Anda kosong.</p>`;
    subtotalDisplay.textContent = formatRupiah(0);
    discountDisplay.textContent = formatRupiah(0);
    totalDisplay.textContent = formatRupiah(0);
    checkoutButton.disabled = true;
    emptyCartText.classList.remove('hidden');
    if (couponMessageDisplay) couponMessageDisplay.classList.add('hidden');
    activeCoupon = null;
  } else {
    // KONDISI KERANJANG ADA ISI
    emptyCartText.classList.add('hidden');
    container.innerHTML = cartItems.map(createCartItemTemplate).join('');

    // AKTIFKAN/DISABLE TOMBOL CHECKOUT
    const isCheckoutAllowed = isEveryItemDistributed && isFormFilled;
    checkoutButton.disabled = !isCheckoutAllowed;

    // Tambahkan event listener pada input formulir untuk trigger renderCart
    [
      document.getElementById('orderer-name'),
      document.getElementById('orderer-contact'),
      document.getElementById('shipping-address'),
    ].forEach((input) => {
      if (input && !input.hasListener) {
        input.oninput = renderCart;
        input.hasListener = true;
      }
    });

    const { subtotal, discount, total, couponMessage } = calculateTotals(cartItems);

    // Update Ringkasan Pesanan
    subtotalDisplay.textContent = formatRupiah(subtotal);
    discountDisplay.textContent = discount > 0 ? `-${formatRupiah(discount)}` : formatRupiah(0);
    discountDisplay.classList.toggle('text-red-600', discount > 0);
    discountDisplay.classList.toggle('text-green-600', discount > 0);
    totalDisplay.textContent = formatRupiah(total);

    // Tampilkan pesan kupon
    if (couponMessageDisplay) {
      if (couponMessage) {
        couponMessageDisplay.textContent = couponMessage;
        couponMessageDisplay.classList.remove('hidden');
        couponMessageDisplay.classList.toggle('bg-red-100', !activeCoupon);
        couponMessageDisplay.classList.toggle('text-red-800', !activeCoupon);
        couponMessageDisplay.classList.toggle('bg-green-100', activeCoupon && discount > 0);
        couponMessageDisplay.classList.toggle('text-green-800', activeCoupon && discount > 0);
      } else {
        couponMessageDisplay.classList.add('hidden');
      }
    }
  }
};

// --- FUNGSI KUPON & CHECKOUT (DIPERBARUI UNTUK MENGGUNAKAN sizeQuantities) ---

window.applyCoupon = () => {
  const couponInput = document.getElementById('coupon');
  const couponCode = couponInput?.value.trim().toUpperCase();

  const couponData = VALID_COUPONS.find((c) => c.code === couponCode);

  if (!couponData) {
    alert('Kode Kupon tidak valid. Mohon periksa kembali.');
    activeCoupon = null;
    renderCart();
    return;
  }

  activeCoupon = couponData;
  renderCart();
};

window.checkoutToWhatsapp = () => {
  const cartItems = getCartItems();

  // Validasi Form dan Distribusi
  const isEveryItemDistributed = cartItems.every((item) => getRemainingQuantity(item) === 0);
  const ordererName = document.getElementById('orderer-name')?.value.trim();
  const ordererContact = document.getElementById('orderer-contact')?.value.trim();
  const shippingAddress = document.getElementById('shipping-address')?.value.trim();

  if (!ordererName || !ordererContact || !shippingAddress) {
    alert('Mohon lengkapi semua Data Penerima (Nama, Kontak WA, dan Alamat) sebelum melanjutkan.');
    return;
  }

  if (!isEveryItemDistributed) {
    alert('Mohon distribusikan semua kuantitas total ke ukuran yang sesuai sebelum melanjutkan.');
    return;
  }

  // Hitung Total dan Buat Pesan
  const { subtotal, discount, total } = calculateTotals(cartItems);

  let message = 'Halo JersyKita! Saya ingin memesan produk berikut:\n\n';

  // --- Detail Data Pemesan ---
  message += '=== DATA PEMESAN ===\n';
  message += `Nama: ${ordererName}\n`;
  message += `Kontak WA: ${ordererContact}\n`;
  message += `Alamat Pengiriman:\n${shippingAddress}\n`;
  message += '====================\n\n';

  // --- Detail Item Keranjang ---
  message += '=== DETAIL PESANAN ===\n';
  cartItems.forEach((item, index) => {
    const actualPrice = getActualItemPrice(item.totalQuantity);
    const isWholesale = item.totalQuantity >= MIN_QTY_FOR_DISCOUNT;

    // List pembagian ukuran
    const sizeBreakdown = Object.entries(item.sizeQuantities || {})
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => `${qty} pcs (${size})`)
      .join(', ');

    let options = `Pembagian Ukuran: ${sizeBreakdown || 'Belum didistribusikan'}`;

    if (item.customName || item.customNumber) {
      const name = item.customName ? item.customName.toUpperCase() : 'Tanpa Nama';
      const number = item.customNumber ? item.customNumber : 'Tanpa Nomor';
      options += `\nKustom: ${name} / ${number}`;
    }

    const priceText = isWholesale
      ? `${formatRupiah(actualPrice)} (Harga Grosir)`
      : formatRupiah(actualPrice);

    message += `${index + 1}. ${item.name}\n`;
    message += `   - Total Qty: ${item.totalQuantity} pcs\n`;
    message += `   - ${options}\n`;
    message += `   - Harga Satuan: ${priceText}\n`;
    message += `   - Total Harga: ${formatRupiah(actualPrice * item.totalQuantity)}\n`;
  });
  message += '======================\n\n';

  // --- Ringkasan Total ---
  message += '--- RINGKASAN TOTAL ---\n';
  message += `Subtotal: ${formatRupiah(subtotal)}\n`;

  if (activeCoupon) {
    message += `Kupon Diterapkan: ${activeCoupon.code}\n`;
  }

  message += `Diskon Kupon: ${discount > 0 ? `-${formatRupiah(discount)}` : formatRupiah(0)}\n`;
  message += `Pengiriman: Akan dihitung dan dikonfirmasi oleh admin.\n`;
  message += `------------------------\n`;
  message += `*Perkiraan Total: ${formatRupiah(total)}* (Belum termasuk Ongkir)\n\n`;
  message += 'Mohon diproses segera. Terima kasih!';
  // -------------------------

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};

// Panggil fungsi renderCart saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const applyCouponButton = document.getElementById('apply-coupon-button');
  if (applyCouponButton) {
    applyCouponButton.addEventListener('click', window.applyCoupon);
  }
});
