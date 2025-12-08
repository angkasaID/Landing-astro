// public/scripts/header-logic.js (FINAL & SIMPLIFIED: Direct Overflow Management)

// ===============================================
// Global State
// ===============================================
let currentProductId = null;
let currentProductName = null;
let currentProductPrice = null;
let currentProductImageUrl = null; // TAMBAHAN: Menyimpan URL gambar yang aktif

// ===============================================
// Helper Functions: Direct Overflow Control & Custom Toast
// ===============================================

/**
 * Menampilkan Custom Toast Notifikasi.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {number} [duration=3000] - Durasi tampil (ms).
 */
window.showToast = (message, duration = 3000) => {
  const toast = document.getElementById('custom-toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;

  // Hentikan notifikasi yang sedang berjalan
  clearTimeout(toast.timeoutId);

  toastMessage.textContent = message;

  // Menampilkan toast (opacity-0 -> opacity-100)
  toast.classList.remove('hidden', 'opacity-0');
  toast.classList.add('opacity-100');

  // Menyembunyikan setelah durasi
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');

    // Sembunyikan sepenuhnya setelah animasi selesai (500ms dari CSS)
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 500);
  }, duration);
};

window.closeProductModal = () => {
  const productModal = document.getElementById('product-detail-modal');
  if (productModal) {
    productModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
};

window.closeFAQModal = () => {
  const faqModal = document.getElementById('faq-modal');
  if (faqModal) {
    faqModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
};

window.openCategorySidebar = () => {
  const sidebar = document.getElementById('category-sidebar');
  const overlay = document.getElementById('category-sidebar-overlay');
  if (sidebar && overlay) {
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    requestAnimationFrame(() => {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
  }
};

window.closeCategorySidebar = () => {
  const sidebar = document.getElementById('category-sidebar');
  const overlay = document.getElementById('category-sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');

    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 300);
  }
};

window.openMobileMenu = () => {
  const mobileMenu = document.getElementById('mobile-menu-sidebar');
  const overlay = document.getElementById('mobile-menu-overlay');
  if (mobileMenu && overlay) {
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    requestAnimationFrame(() => {
      mobileMenu.classList.remove('translate-x-full');
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
  }
};

window.closeMobileMenu = () => {
  const mobileMenu = document.getElementById('mobile-menu-sidebar');
  const overlay = document.getElementById('mobile-menu-overlay');
  if (mobileMenu && overlay) {
    mobileMenu.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');

    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden'); // PENGHAPUSAN LANGSUNG
    }, 300);
  }
};

window.toggleSizeChart = () => {
  const chartContent = document.getElementById('size-chart-content');
  if (chartContent) {
    chartContent.classList.toggle('hidden');
  }
};

window.changeMainImage = (thumbnailElement) => {
  const mainImageDiv = document.getElementById('modal-product-image-main');
  const fullImageUrl = thumbnailElement.getAttribute('data-full-image');

  if (mainImageDiv && fullImageUrl) {
    mainImageDiv.style.backgroundImage = `url('${fullImageUrl}')`;

    // UPDATE GLOBAL STATE DENGAN GAMBAR YANG DIPILIH
    currentProductImageUrl = fullImageUrl; // <<-- MODIFIKASI: Simpan URL gambar yang baru dipilih

    const allThumbnails = document.querySelectorAll('#modal-image-thumbnails .thumbnail-item');

    allThumbnails.forEach((img) => {
      img.classList.remove('border-red-600', 'opacity-100');
      img.classList.add('border-transparent', 'opacity-70');
    });

    thumbnailElement.classList.add('border-red-600', 'opacity-100');
    thumbnailElement.classList.remove('border-transparent', 'opacity-70');
  }
};

/**
 * Membuka Modal Produk (Mendukung 4 argumen untuk dinamis)
 */
window.openProductModal = (id, name, price, imagesJson) => {
  currentProductId = id;
  currentProductName = name;
  currentProductPrice = price;
  // currentProductImageUrl akan diset di bawah

  const productModal = document.getElementById('product-detail-modal');
  const modalProductNameHeader = document.getElementById('modal-product-name-header');
  const modalProductName = document.getElementById('modal-product-name');
  const modalProductPrice = document.getElementById('modal-product-price');
  const modalProductImageMain = document.getElementById('modal-product-image-main');
  const modalImageThumbnails = document.getElementById('modal-image-thumbnails');

  // --- LOGIKA SET TEXT & PRICE ---
  function formatRupiah(numberStr) {
    let number = parseInt(numberStr, 10);
    if (isNaN(number)) return 'Rp 0';
    return 'Rp ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  if (modalProductNameHeader) modalProductNameHeader.textContent = `Opsi Produk: ${name}`;
  if (modalProductName) modalProductName.textContent = name;
  if (modalProductPrice) modalProductPrice.textContent = formatRupiah(price);

  // --- LOGIKA DINAMIS GAMBAR ---
  const defaultImageUrl = `https://picsum.photos/seed/item${id}/400/400`;
  let images = [];

  try {
    if (imagesJson && imagesJson !== '[]') {
      images = JSON.parse(imagesJson);
    }
  } catch (e) {
    console.error('Gagal parse imagesJson:', e);
  }

  // 1. Set Main Image URL
  const mainImageUrl = images.length > 0 ? images[0]?.full : defaultImageUrl;
  if (modalProductImageMain) {
    modalProductImageMain.style.backgroundImage = `url('${mainImageUrl}')`;
  }

  // SIMPAN GAMBAR UTAMA KE GLOBAL STATE
  currentProductImageUrl = mainImageUrl; // <<-- MODIFIKASI: Simpan URL gambar utama/default

  // 2. Set Thumbnails
  if (modalImageThumbnails) {
    modalImageThumbnails.innerHTML = ''; // Kosongkan thumbnail

    const finalImages =
      images.length > 0 ? images : [{ thumb: defaultImageUrl, full: defaultImageUrl }];

    finalImages.forEach((image, index) => {
      const isFirst = index === 0;
      const thumbnailHtml = `
            <div class="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer thumbnail-item transition border-2 ${
              isFirst ? 'border-red-600 opacity-100' : 'border-transparent opacity-70'
            }"
                data-full-image="${image.full}"
                onclick="window.changeMainImage(this)"
                style="background-image: url('${
                  image.thumb
                }'); background-size: cover; background-position: center;">
            </div>`;
      modalImageThumbnails.insertAdjacentHTML('beforeend', thumbnailHtml);
    });
  }
  // --- END LOGIKA DINAMIS GAMBAR ---

  // Reset input fields
  const customName = document.getElementById('custom-name');
  const customNumber = document.getElementById('custom-number');
  const quantityInput = document.getElementById('quantity-input');
  const sizeL = document.getElementById('sizeL');

  if (customName) customName.value = '';
  if (customNumber) customNumber.value = '';
  if (quantityInput) quantityInput.value = '1';
  if (sizeL) sizeL.checked = true;

  if (productModal) {
    productModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
};

// ===============================================
// Core E-commerce & Helper Logic (FIXED ADD TO CART)
// ===============================================

/**
 * Memperbarui badge hitungan item di ikon keranjang.
 */
const updateCartCount = (count) => {
  const element = document.getElementById('cart-count');
  const totalCount = parseInt(count) || 0;

  if (element) {
    element.textContent = totalCount;
    element.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }
};

/**
 * Logika inti untuk menambahkan produk ke keranjang (menggunakan localStorage).
 */
const handleAddToCart = () => {
  if (!currentProductId || !currentProductPrice || !currentProductName) {
    window.showToast('Gagal menambahkan produk. Data produk tidak lengkap.', 4000);
    return;
  } // PASTIKAN GAMBAR ADA

  if (!currentProductImageUrl) {
    window.showToast('Gagal menambahkan produk. URL gambar tidak ditemukan.', 4000);
    return;
  } // --- 1. AMBIL DATA DARI MODAL ---

  const selectedSizeElement = document.querySelector('input[name="size"]:checked');
  const size = selectedSizeElement ? selectedSizeElement.value : 'N/A';
  const customName = document.getElementById('custom-name')?.value.trim() || '';
  const customNumber = document.getElementById('custom-number')?.value.trim() || '';
  const quantity = parseInt(document.getElementById('quantity-input')?.value) || 1;

  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  } catch (e) {
    console.error('Error parsing cartItems from localStorage:', e);
    cartItems = [];
  } // Konversi harga ke integer untuk perhitungan

  const priceInt = parseInt(currentProductPrice, 10); // --- 2. DEFINISI NEW ITEM (DIPERBAIKI UNTUK MENGAMBIL SEMUA DATA MODAL) ---

  const newItem = {
    id: Date.now(), // ID unik untuk setiap item di keranjang
    productId: currentProductId,
    name: currentProductName,
    price: priceInt,
    totalQuantity: 1,
    size: size, // ✅ Data size dari modal
    customName: customName, // ✅ Data kustom nama dari modal
    customNumber: customNumber, // ✅ Data kustom nomor dari modal
    quantity: quantity, // ✅ Data quantity dari modal
    imageUrl: currentProductImageUrl,
  };

  cartItems.push(newItem);
  localStorage.setItem('cartItems', JSON.stringify(cartItems)); // --- 3. PERHITUNGAN TOTAL COUNT (DIPERBAIKI UNTUK MENGGUNAKAN item.quantity) ---

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  localStorage.setItem('cartCount', totalCount);
  updateCartCount(totalCount);

  window.showToast(
    `${quantity}x ${currentProductName} (Size ${size}) berhasil ditambahkan ke keranjang!`,
  );
  window.closeProductModal();
};

/**
 * Fungsi untuk menangani submit pencarian dan redirect.
 */
const handleSearchSubmit = (inputElement) => {
  const query = inputElement.value.trim();

  if (query.length > 2) {
    window.location.href = `/search-results?q=${encodeURIComponent(query)}`;
    if (inputElement.id === 'desktop-search-input') {
      closeDesktopSearch();
    }
  } else {
    window.showToast('Masukkan minimal 3 karakter untuk melakukan pencarian.', 4000);
    inputElement.focus();
  }
};

// ===============================================
// Search Expand/Collapse Logic (FIXED CART SELECTOR)
// ===============================================

const openDesktopSearch = () => {
  const desktopInput = document.getElementById('desktop-search-input');
  const openSearchBtn = document.getElementById('open-search');
  const cartIconContainer = document.getElementById('cart-icon-container');

  if (desktopInput && openSearchBtn) {
    desktopInput.classList.remove('w-0', 'opacity-0');
    desktopInput.classList.add('w-64', 'opacity-100');

    if (cartIconContainer) {
      cartIconContainer.classList.add('hidden');
    }

    desktopInput.focus();
    openSearchBtn.setAttribute('data-search-state', 'open');
  }
};

const closeDesktopSearch = () => {
  const desktopInput = document.getElementById('desktop-search-input');
  const openSearchBtn = document.getElementById('open-search');
  const cartIconContainer = document.getElementById('cart-icon-container');

  if (desktopInput && openSearchBtn) {
    desktopInput.classList.remove('w-64', 'opacity-100');
    desktopInput.classList.add('w-0', 'opacity-0');

    if (cartIconContainer) {
      cartIconContainer.classList.remove('hidden');
    }

    openSearchBtn.setAttribute('data-search-state', 'closed');
    desktopInput.value = '';
  }
};

// ===============================================
// Main DOMContentLoaded Listener (FIXED ICON SCROLL SELECTOR)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENT INIT ---
  const header = document.getElementById('main-header');
  const searchOverlay = document.getElementById('search-overlay');
  const openSearchBtn = document.getElementById('open-search');
  const closeSearchBtn = document.getElementById('close-search');
  const desktopInput = document.getElementById('desktop-search-input');
  const mobileInput = searchOverlay?.querySelector('input');
  const addCartBtn = document.getElementById('add-to-cart-button');
  const productModal = document.getElementById('product-detail-modal');
  const productCloseBtn = document.getElementById('product-detail-close-button');
  const productBackdrop = document.getElementById('product-detail-backdrop');
  const faqModal = document.getElementById('faq-modal');
  const faqLinks = document.querySelectorAll('.open-faq-modal, a[href="#faq-modal"]');
  const faqBackdrop = document.getElementById('faq-backdrop');
  const faqCloseBtn = document.getElementById('faq-close-button');
  const buyButtons = document.querySelectorAll(
    ".open-product-modal, button[onclick^='openProductModal']",
  );

  // Sidebar Category Elements
  const openCategoryBtn = document.getElementById('open-category-sidebar');
  const categorySidebarOverlay = document.getElementById('category-sidebar-overlay');
  const categoryCloseBtn = document.getElementById('category-close-button');

  // Hentikan eksekusi jika header tidak ada
  if (!header) return;

  const isHomePageAstro = header.getAttribute('data-is-home') === 'true';
  const desktopNavLinks = document.querySelectorAll('#desktop-nav a');

  // FIX KRITIS #1: Selector ikon keranjang untuk scroll
  const iconElements = document.querySelectorAll(
    '#open-search, #cart-icon-container, #mobile-menu-icon',
  );

  const headerLogo = document.getElementById('header-logo');

  // --- TANGKAP TOMBOL PRODUK & ATTACH LISTENER ---
  buyButtons.forEach((button) => {
    button.removeAttribute('onclick');

    button.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-product-id');
      const name = e.currentTarget.getAttribute('data-product-name');
      const price = e.currentTarget.getAttribute('data-product-price');
      const imagesJson = e.currentTarget.getAttribute('data-product-images');

      window.openProductModal(id, name, price, imagesJson);
    });
  });

  // **************************************************
  // >>> LOGIKA SCROLL KONDISIONAL AMAN (Untuk Homepage) <<<
  // **************************************************

  if (isHomePageAstro) {
    const handleScroll = () => {
      const scrollPos = window.scrollY;

      if (scrollPos > 50) {
        // SCROLLED DOWN
        header.classList.remove('bg-transparent', 'shadow-none');
        header.classList.add('bg-white', 'shadow-md');

        desktopNavLinks.forEach((link) => {
          link.classList.remove('text-white');
          link.classList.add('text-gray-900', 'hover:text-lime-600');
        });
        iconElements.forEach((icon) => {
          icon.classList.remove('text-white');
          icon.classList.add('text-gray-900', 'hover:text-lime-600');
        });
        if (headerLogo) headerLogo.src = '/asset/images/logo-web-dark.png';
      } else {
        // SCROLLED TOP
        header.classList.remove('bg-white', 'shadow-md');
        header.classList.add('bg-transparent', 'shadow-none');

        desktopNavLinks.forEach((link) => {
          link.classList.remove('text-gray-900', 'hover:text-lime-600');
          link.classList.add('text-white');
        });
        iconElements.forEach((icon) => {
          icon.classList.remove('text-gray-900', 'hover:text-lime-600');
          icon.classList.add('text-white');
        });
        if (headerLogo) headerLogo.src = '/asset/images/logo-web.png';
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  // --- LOGIKA MODAL, SEARCH, & CART (TIDAK KONDISIONAL) ---

  updateCartCount(localStorage.getItem('cartCount') || 0);

  // --- SEARCH MODAL & SUBMIT LOGIC ---
  if (openSearchBtn && searchOverlay) {
    const closeSearchModal = () => {
      searchOverlay.classList.remove('opacity-100');
      searchOverlay.classList.add('opacity-0');

      setTimeout(() => {
        searchOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden'); // PENGHAPUSAN LANGSUNG
      }, 300);
    };

    openSearchBtn.addEventListener('click', () => {
      if (window.innerWidth >= 768) {
        const state = openSearchBtn.getAttribute('data-search-state');

        if (state === 'closed') {
          openDesktopSearch();
        } else {
          if (desktopInput.value.trim().length > 0) {
            handleSearchSubmit(desktopInput);
          } else {
            closeDesktopSearch();
          }
        }
      } else {
        searchOverlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');

        requestAnimationFrame(() => {
          searchOverlay.classList.remove('opacity-0');
          searchOverlay.classList.add('opacity-100');
        });

        mobileInput.focus();
      }
    });

    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchModal);

    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        closeSearchModal();
      }
    });
  }

  // --- SUBMIT PENCARIAN VIA ENTER KEY ---
  if (desktopInput) {
    desktopInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit(desktopInput);
      }
    });
  }

  if (mobileInput) {
    mobileInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit(mobileInput);

        const closeSearchModalAnimated = () => {
          searchOverlay.classList.remove('opacity-100');
          searchOverlay.classList.add('opacity-0');
          setTimeout(() => {
            searchOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden'); // PENGHAPUSAN LANGSUNG
          }, 300);
        };
        closeSearchModalAnimated();
      }
    });
  }

  // --- KATEGORI SIDEBAR LISTENERS ---
  if (openCategoryBtn) {
    openCategoryBtn.addEventListener('click', window.openCategorySidebar);
  }
  if (categorySidebarOverlay) {
    categorySidebarOverlay.addEventListener('click', window.closeCategorySidebar);
  }
  if (categoryCloseBtn) {
    categoryCloseBtn.addEventListener('click', window.closeCategorySidebar);
  }

  // --- MODAL EVENT LISTENERS ---
  if (addCartBtn) {
    addCartBtn.addEventListener('click', handleAddToCart);
  }
  if (productCloseBtn) productCloseBtn.addEventListener('click', window.closeProductModal);
  if (productBackdrop) productBackdrop.addEventListener('click', window.closeProductModal);

  // FAQ Modal Listeners
  faqLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (faqModal) {
        faqModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    });
  });
  if (faqCloseBtn) faqCloseBtn.addEventListener('click', window.closeFAQModal);
  if (faqBackdrop) faqBackdrop.addEventListener('click', window.closeFAQModal);

  // Escape Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 1. Close Product Modal
      if (productModal && !productModal.classList.contains('hidden')) {
        window.closeProductModal();
        return;
      }

      // 2. Close FAQ Modal
      if (faqModal && !faqModal.classList.contains('hidden')) {
        window.closeFAQModal();
        return;
      }

      // 3. Close Category Sidebar
      const categorySidebar = document.getElementById('category-sidebar');
      if (categorySidebar && !categorySidebar.classList.contains('-translate-x-full')) {
        window.closeCategorySidebar();
        return;
      }

      // 4. Close Mobile Menu
      const mobileMenuSidebar = document.getElementById('mobile-menu-sidebar');
      if (mobileMenuSidebar && !mobileMenuSidebar.classList.contains('translate-x-full')) {
        window.closeMobileMenu();
        return;
      }

      // 5. Close Mobile Search Overlay
      const searchOverlayCheck = document.getElementById('search-overlay');
      if (searchOverlayCheck && !searchOverlayCheck.classList.contains('hidden')) {
        const closeSearchModalAnimated = () => {
          searchOverlayCheck.classList.remove('opacity-100');
          searchOverlayCheck.classList.add('opacity-0');
          setTimeout(() => {
            searchOverlayCheck.classList.add('hidden');
            document.body.classList.remove('overflow-hidden'); // PENGHAPUSAN LANGSUNG
          }, 300);
        };
        closeSearchModalAnimated();
        return;
      }

      // 6. Close Desktop Search Input
      const openSearchBtnState = document
        .getElementById('open-search')
        ?.getAttribute('data-search-state');
      if (openSearchBtnState === 'open') {
        closeDesktopSearch();
      }
    }
  });
});
