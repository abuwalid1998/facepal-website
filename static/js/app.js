/**
 * Main Juthoor Application Controller
 * Handles Bilingual (Arabic/English) i18n, Catalog Rendering, Cart, and Modals.
 */

const I18N = {
    en: {
        announcement: "📚 Geneva Library & Accessories • Fine Writing, Books, Art & Stationery • Powered by FacePal Biometrics",
        tagline: "Library & Accessories • قرطاسية ومستلزمات",
        nav_shop: "Library Collection",
        nav_cart: "Shopping Cart & FacePal",
        nav_heritage: "About Geneva",
        nav_register_face: "Register Face",
        nav_dashboard: "Dashboard",
        hero_eyebrow: "World of Literature, Fine Writing & Luxury Stationery",
        hero_title: "Geneva Library & Accessories, <br><span class=\"gradient-text\">Secured by FacePal</span>",
        hero_desc: "Discover our curated selection of fine gold fountain pens, handcrafted leather journals, academic literature, artist-grade art boxes, and ergonomic backpacks. Pay instantly with seamless FacePal biometric facial recognition directly from your PayPal wallet.",
        hero_btn_shop: "Explore 10 Premium Products",
        hero_btn_cart: "Shopping Cart & FacePal",
        hero_btn_register: "Link Your Face to PayPal",
        btn_upload_face: "Upload Photo",
        trust_spoof: "Silent-Face Anti-Spoofing",
        trust_vector: "Qdrant Vector Database",
        trust_paypal: "Instant PayPal Wallet Deduction",
        catalog_sub: "Curated Stationery & Literature Treasury",
        catalog_title: "Geneva Library & Accessories Collection",
        cat_all: "All Products (10)",
        cat_pens: "Fine Writing & Pens",
        cat_notebooks: "Notebooks & Paper",
        cat_art: "Art & Crafts",
        cat_books: "Books & Literature",
        cat_bags: "Bags & Gear",
        cat_gifts: "Desk Accessories",
        cat_edu: "Educational & STEM",
        add_to_cart: "Add to Cart",
        cart_title: "Your Geneva Library Cart",
        cart_items_heading: "Selected Library & Stationery Items",
        cart_empty_title: "Your cart is empty",
        cart_empty_desc: "Select fine stationery, writing instruments, or books to add to your order.",
        cart_subtotal: "Subtotal:",
        cart_shipping: "Express Delivery:",
        cart_free: "FREE",
        cart_total: "Total Deductible:",
        pay_via_wallet: "Deduct from PayPal Wallet",
        pay_with_facepal: "Pay with FacePal",
        facepal_guarantee: "10-second biometric scan • Liveness verified • Protected by Anti-Spoofing",
        amount_to_deduct: "Deduction Amount:",
        countdown_active: "Liveness Window Active",
        countdown_sub: "Align face inside scanner. Closes in 10s if no face is detected.",
        cancel_payment: "Cancel Payment",
        verify_now: "Verify & Pay Now",
        reg_modal_title: "Register Face & Link PayPal Wallet",
        reg_modal_sub: "Store 128-d biometric embedding in Qdrant Vector DB for FacePal checkouts",
        form_name: "Full Name (الاسم الكامل):",
        form_email: "Personal Email (البريد الإلكتروني):",
        form_paypal: "PayPal Account Email (حساب باي بال المرتبط):",
        form_balance: "Initial Mock PayPal Balance ($):",
        form_face_capture: "Biometric Face Capture (التقاط بصمة الوجه):",
        btn_start_cam: "Start Camera",
        btn_capture_face: "Capture & Verify Face",
        reg_hint: "ℹ️ YuNet will detect your facial landmarks, MiniFASNet will test for liveness (anti-spoofing), and SFace will extract a 128-d biometric embedding into the vector database.",
        btn_complete_reg: "Complete Registration & Link Wallet",
        dash_title: "GENEVA LIBRARY FacePal Operations Dashboard",
        dash_subtitle: "Real-time Sales, Vector Database Index & Recognized Customer Ledger",
        stat_sales: "Total Sales (FacePal)",
        stat_orders: "Completed Orders",
        stat_spoofs: "Spoofs Blocked",
        stat_faces: "Registered Faces",
        tab_tx: "Transactions Ledger",
        tab_users: "Recognized Face Database",
        tab_logs: "Security Audit Logs",
        refresh: "Refresh",
        unreg_title: "Face Not Registered",
        unreg_desc: "This face is not registered in our database. Payments are strictly restricted to registered users.",
        register_now: "Register Your Face Now",
        footer_about: "Geneva Library & Accessories (مكتبة جنيفا ومستلزماتها) provides premium writing instruments, luxury leather journals, fine arts, academic literature, and educational supplies with frictionless FacePal biometric payments.",
        footer_links_title: "Quick Navigation",
        footer_security_title: "Security & Models",
        footer_contact_title: "Geneva Library & Store",
        feat_pens_title: "Master Writing Instruments",
        feat_pens_desc: "German iridium nibs with 24k gold accents, precision piston converters, and royal archival inks for unmatched writing prestige.",
        feat_books_title: "World Literature & References",
        feat_books_desc: "Comprehensive illustrated bilingual dictionaries, classic world literature volumes, and enriching academic resources.",
        feat_leather_title: "Hand-Bound Leather Journals",
        feat_leather_desc: "Full-grain genuine leather binding with deckle-edge recycled cotton archival paper crafted for creative minds.",
        feat_facepal_title: "FacePal Biometric Trust",
        feat_facepal_desc: "State-of-the-art DeepFace YuNet and SFace neural networks verify your face with real-time anti-spoofing defense for instant PayPal checkout."
    },
    ar: {
        announcement: "📚 مكتبة جنيفا ومستلزماتها • أقلام فاخرة، دفاتر جلدية، مراجع علمية، وحقائب مدرسية • مدعومة بتقنية فيس بال الحيوية",
        tagline: "مكتبة جنيفا ومستلزماتها • عالم الإبداع والمعرفة",
        nav_shop: "معروضات المكتبة",
        nav_cart: "سلة التسوق والدفع",
        nav_heritage: "عن مكتبة جنيفا",
        nav_register_face: "تسجيل بصمة الوجه",
        nav_dashboard: "لوحة التحكم",
        hero_eyebrow: "عالم المعرفة، أدوات الكتابة والقرطاسية الفاخرة",
        hero_title: "مكتبة جنيفا ومستلزماتها، <br><span class=\"gradient-text\">مؤمّنة بتقنية FacePal</span>",
        hero_desc: "اكتشف تشكيلتنا المختارة من أقلام الحبر الملكية المطلية بالذهب، ودفاتر اليوميات الجلدية العتيقة، والمراجع العالمية، وحقائب الرسم المتكاملة. ادفع فوراً عبر بصمة الوجه مع الخصم المباشر من محفظة باي بال.",
        hero_btn_shop: "استكشف 10 منتجات فاخرة",
        hero_btn_cart: "سلة التسوق وFacePal",
        hero_btn_register: "اربط وجهك بمحفظة PayPal",
        btn_upload_face: "رفع صورة وجه",
        trust_spoof: "حماية ضد التزييف (Anti-Spoofing)",
        trust_vector: "قاعدة بيانات المتجهات Qdrant",
        trust_paypal: "خصم فوري من محفظة باي بال",
        catalog_sub: "كنوز القرطاسية والأدب الرفيع",
        catalog_title: "مجموعة مكتبة جنيفا ومستلزماتها",
        cat_all: "جميع المنتجات (10)",
        cat_pens: "أقلام وأدوات كتابة",
        cat_notebooks: "دفاتر ومذكرات فاخرة",
        cat_art: "أدوات رسم وفنون",
        cat_books: "كتب وروايات ومراجع",
        cat_bags: "حقائب مدرسية وإكسسوارات",
        cat_gifts: "هدايا وإكسسوارات مكتبية",
        cat_edu: "ألعاب ذكاء وتنمية المهارات",
        add_to_cart: "أضف إلى السلة",
        cart_title: "سلة مشتريات مكتبة جنيفا",
        cart_items_heading: "المستلزمات والكتب المختارة",
        cart_empty_title: "سلتك فارغة حالياً",
        cart_empty_desc: "اختر من القرطاسية الفاخرة والكتب لإضافتها إلى سلة مشترياتك.",
        cart_subtotal: "المجموع الفرعي:",
        cart_shipping: "التوصيل السريع:",
        cart_free: "مجاني",
        cart_total: "المبلغ الإجمالي المقتطع:",
        pay_via_wallet: "خصم مباشر من محفظة باي بال",
        pay_with_facepal: "الدفع عبر بصمة الوجه FacePal",
        facepal_guarantee: "مسح حيوي خلال 10 ثوانٍ • تحقق من الحيوية • كشف التزييف التلقائي",
        amount_to_deduct: "المبلغ المراد خصمه:",
        countdown_active: "نافذة التحقق الحيوي نشطة",
        countdown_sub: "ضع وجهك داخل إطار الماسح. ستغلق النافذة وتحدث الصفحة بعد 10 ثوانٍ.",
        cancel_payment: "إلغاء عملية الدفع",
        verify_now: "تحقق وادفع الآن",
        reg_modal_title: "تسجيل بصمة الوجه وربط محفظة PayPal",
        reg_modal_sub: "حفظ المتجه الحيوي 128-d في قاعدة بيانات Qdrant للشراء السريع عبر FacePal",
        form_name: "الاسم الكامل:",
        form_email: "البريد الإلكتروني الشخصي:",
        form_paypal: "حساب باي بال المرتبط:",
        form_balance: "رصيد المحفظة التجريبي ($):",
        form_face_capture: "التقاط بصمة الوجه الحيوية:",
        btn_start_cam: "تشغيل الكاميرا",
        btn_capture_face: "التقاط وفحص الوجه",
        reg_hint: "ℹ️ يقوم نموذج YuNet باكتشاف ملامح الوجه، ونموذج MiniFASNet بالتحقق من الحيوية، ونموذج SFace باستخراج المتجه الحيوي في قاعدة بيانات المتجهات.",
        btn_complete_reg: "إتمام التسجيل وربط المحفظة",
        dash_title: "لوحة تحكم عمليات FacePal - مكتبة جنيفا",
        dash_subtitle: "المبيعات الفورية، قاعدة بيانات المتجهات الحيوية، وسجل العملاء المؤكدين",
        stat_sales: "إجمالي المبيعات (FacePal)",
        stat_orders: "الطلبات المكتملة",
        stat_spoofs: "عمليات التزييف المحجوبة",
        stat_faces: "الوجوه المسجلة",
        tab_tx: "سجل المعاملات",
        tab_users: "قاعدة بيانات الوجوه المؤكدة",
        tab_logs: "سجل التدقيق الأمني",
        refresh: "تحديث",
        unreg_title: "الوجه غير مسجل في النظام",
        unreg_desc: "هذا الوجه غير مسجل في قاعدة بياناتنا. الدفع مقصور على المستخدمين المسجلين فقط.",
        register_now: "سجّل وجهك الآن",
        footer_about: "مكتبة جنيفا ومستلزماتها تقدم أرقى أدوات الكتابة الفاخرة، الدفاتر الجلدية، المراجع الأدبية والعلمية، ومستلزمات الطلاب والفنانين مع تجربة دفع حيوية سلسة عبر FacePal.",
        footer_links_title: "روابط سريعة",
        footer_security_title: "الأمان والذكاء الاصطناعي",
        footer_contact_title: "مكتبة جنيفا",
        feat_pens_title: "أقلام وأدوات كتابة ملكية",
        feat_pens_desc: "ريش إيريديوم ألمانية مطلية بالذهب ومحابر زجاجية ملكية لتجربة خط فاخرة وأنيقة.",
        feat_books_title: "أمهات الكتب والمراجع العالمية",
        feat_books_desc: "قواميس أكسفورد المصورة الشاملة وروائع الأدب العالمي المترجم بطبعات راقية ومجلدات مقتنين.",
        feat_leather_title: "دفاتر يوميات جلدية يدوية",
        feat_leather_desc: "تجليد جلدي طبيعي فاخر 100% مع أوراق قطنية معتقة تحتفظ بأفكارك وتأملاتك للأبد.",
        feat_facepal_title: "أمان وحماية FacePal الحيوية",
        feat_facepal_desc: "شبكات عصبية متطورة لكشف الوجه والتحقق من الحيوية ضد التزييف مع اقتطاع فوري من محفظة باي بال."
    }
};

class JuthoorApp {
    constructor() {
        this.currentLang = localStorage.getItem("geneva_lang") || localStorage.getItem("juthoor_lang") || "en";
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem("geneva_cart") || localStorage.getItem("juthoor_cart") || "[]");
        this.currentCategory = "all";

        this.init();
    }

    async init() {
        this.applyLanguage(this.currentLang);
        this.bindEvents();
        this.updateModeIndicator();
        await this.loadProducts();
        this.updateCartUI();
        if (window.lucide) window.lucide.createIcons();
    }

    updateModeIndicator() {
        const pillText = document.getElementById("modePillText");
        const demoPill = document.getElementById("demoModePill");
        const testControls = document.getElementById("demoTestControls");
        const isGH = window.FacePalStore ? window.FacePalStore.isGitHubPages() : true;

        if (pillText && demoPill) {
            if (isGH) {
                pillText.innerText = "GitHub Pages Live Demo";
                demoPill.title = "Client-side interactive biometric demo mode. Full Python FastAPI + PyTorch backend available in repo.";
                if (testControls) testControls.style.display = "flex";
            } else {
                pillText.innerText = "FacePal Local AI Server";
                demoPill.title = "Connected to local FastAPI + YuNet + MiniFASNet server.";
            }
        }
    }

    applyLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem("geneva_lang", lang);
        localStorage.setItem("juthoor_lang", lang);
        const html = document.documentElement;
        html.lang = lang;
        html.dir = (lang === "ar") ? "rtl" : "ltr";

        // Update button text
        const label = document.getElementById("langLabel");
        if (label) label.innerText = (lang === "ar") ? "English" : "العربية";

        // Translate all data-i18n elements
        const dict = I18N[lang] || I18N.en;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        // Re-render products in current language
        if (this.products.length > 0) {
            this.renderProducts();
        }
    }

    bindEvents() {
        // Language Toggle
        const langBtn = document.getElementById("langToggleBtn");
        if (langBtn) {
            langBtn.addEventListener("click", () => {
                const next = (this.currentLang === "en") ? "ar" : "en";
                this.applyLanguage(next);
            });
        }

        // Cart Drawer
        const cartToggleBtn = document.getElementById("cartToggleBtn");
        const closeCartBtn = document.getElementById("closeCartBtn");
        const cartBackdrop = document.getElementById("cartBackdrop");

        if (cartToggleBtn) cartToggleBtn.addEventListener("click", () => this.openCart());
        if (closeCartBtn) closeCartBtn.addEventListener("click", () => this.closeCart());
        if (cartBackdrop) cartBackdrop.addEventListener("click", () => this.closeCart());

        // Category Filter Pills
        const filterBtns = document.querySelectorAll(".filter-btn");
        filterBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentCategory = btn.getAttribute("data-category");
                this.renderProducts();
            });
        });

        // Checkout Buttons -> "Pay with FacePal"
        const payBtn = document.getElementById("payWithFacePalBtn");
        const pagePayBtn = document.getElementById("pagePayWithFacePalBtn");

        if (payBtn) {
            payBtn.addEventListener("click", () => {
                this.triggerFacePalCheckout();
            });
        }
        if (pagePayBtn) {
            pagePayBtn.addEventListener("click", () => {
                this.triggerFacePalCheckout();
            });
        }

        // Close Payment Modal
        const closePaymentBtn = document.getElementById("closePaymentModalBtn");
        const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
        if (closePaymentBtn) closePaymentBtn.addEventListener("click", () => this.closePaymentModal());
        if (cancelPaymentBtn) cancelPaymentBtn.addEventListener("click", () => this.closePaymentModal());

        // Manual Verify & Pay Trigger
        const manualScanBtn = document.getElementById("manualScanTriggerBtn");
        if (manualScanBtn) {
            manualScanBtn.addEventListener("click", () => {
                if (window.faceReader) {
                    window.faceReader.captureAndVerify();
                }
            });
        }

        // Registration Modal triggers
        const openRegNavBtn = document.getElementById("openRegisterNavBtn");
        const heroRegisterBtn = document.getElementById("heroRegisterBtn");
        const footerRegisterBtn = document.getElementById("footerRegisterBtn");
        const closeRegBtn = document.getElementById("closeRegisterModalBtn");
        const unregGoRegBtn = document.getElementById("unregisteredGoRegisterBtn");

        if (openRegNavBtn) openRegNavBtn.addEventListener("click", () => this.openRegisterModal());
        if (heroRegisterBtn) heroRegisterBtn.addEventListener("click", () => this.openRegisterModal());
        if (footerRegisterBtn) footerRegisterBtn.addEventListener("click", () => this.openRegisterModal());
        if (closeRegBtn) closeRegBtn.addEventListener("click", () => this.closeRegisterModal());
        if (unregGoRegBtn) {
            unregGoRegBtn.addEventListener("click", () => {
                this.closePaymentModal();
                this.openRegisterModal();
            });
        }

        // Dashboard Modal triggers
        const openDashNavBtn = document.getElementById("openDashboardNavBtn");
        const footerDashboardBtn = document.getElementById("footerDashboardBtn");
        const closeDashBtn = document.getElementById("closeDashboardModalBtn");

        if (openDashNavBtn) openDashNavBtn.addEventListener("click", () => this.openDashboardModal());
        if (footerDashboardBtn) footerDashboardBtn.addEventListener("click", () => this.openDashboardModal());
        if (closeDashBtn) closeDashBtn.addEventListener("click", () => this.closeDashboardModal());

        // Face Registration Camera controls
        this.bindRegistrationControls();
    }

    async loadProducts() {
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("API unavailable");
            const data = await res.json();
            this.products = (data.products || []).map(p => ({
                ...p,
                image: (p.image || "").replace(/^\/static\//, "./")
            }));
        } catch (e) {
            console.log("[FacePal] Using standalone catalog (GitHub Pages Demo Mode)");
            if (window.FacePalStore) {
                this.products = window.FacePalStore.getProducts();
            }
        }
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById("productsGrid");
        if (!grid) return;
        grid.innerHTML = "";

        const isAr = (this.currentLang === "ar");
        const filtered = (this.currentCategory === "all") 
            ? this.products 
            : this.products.filter(p => p.category_en.toLowerCase() === this.currentCategory.toLowerCase() || p.category_ar === this.currentCategory);

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";

            const title = isAr ? p.name_ar : p.name_en;
            const category = isAr ? p.category_ar : p.category_en;
            const origin = isAr ? p.origin_ar : p.origin_en;
            const badge = isAr ? p.badge_ar : p.badge_en;
            const desc = isAr ? p.description_ar : p.description_en;
            const addBtnText = isAr ? "أضف إلى السلة" : "Add to Cart";

            card.innerHTML = `
                <div class="product-img-wrap">
                    <img src="${p.image}" alt="${title}" class="product-img" loading="lazy">
                    <span class="product-badge">${badge}</span>
                    <span class="product-origin-pill">
                        <i data-lucide="map-pin" style="width:12px;height:12px;"></i>
                        <span>${origin}</span>
                    </span>
                </div>
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-title">${title}</h3>
                    <p class="product-desc">${desc}</p>
                    <div class="product-bottom-row">
                        <span class="product-price">$${parseFloat(p.price).toFixed(2)}</span>
                        <button class="btn-add-cart" onclick="window.juthoorApp.addToCart('${p.id}')">
                            <i data-lucide="plus" style="width:16px;height:16px;"></i>
                            <span>${addBtnText}</span>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name_en: product.name_en,
                name_ar: product.name_ar,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();

        // Smooth scroll to the on-page cart section
        const cartSec = document.getElementById("cartSection");
        if (cartSec) {
            cartSec.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            this.openCart();
        }

        if (window.faceReader) {
            window.faceReader.playTone(600, "sine", 0.08);
        }
    }

    updateQuantity(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== productId);
        }
        this.saveCart();
        this.updateCartUI();
    }

    saveCart() {
        localStorage.setItem("geneva_cart", JSON.stringify(this.cart));
        localStorage.setItem("juthoor_cart", JSON.stringify(this.cart));
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        const isAr = (this.currentLang === "ar");
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const formattedTotal = `$${subtotal.toFixed(2)}`;

        // 1. Update Drawer Cart
        const countBadge = document.getElementById("cartCount");
        const itemsBadge = document.getElementById("cartItemsBadge");
        const drawerList = document.getElementById("cartItemsList");
        const drawerEmpty = document.getElementById("cartEmptyState");
        const drawerSubtotal = document.getElementById("cartSubtotal");
        const drawerTotal = document.getElementById("cartTotal");

        if (countBadge) countBadge.innerText = totalItems;
        if (itemsBadge) itemsBadge.innerText = totalItems;
        if (drawerSubtotal) drawerSubtotal.innerText = formattedTotal;
        if (drawerTotal) drawerTotal.innerText = formattedTotal;

        if (drawerList && drawerEmpty) {
            if (this.cart.length === 0) {
                drawerEmpty.style.display = "flex";
                drawerList.innerHTML = "";
            } else {
                drawerEmpty.style.display = "none";
                drawerList.innerHTML = "";
                this.cart.forEach(item => {
                    const row = document.createElement("div");
                    row.className = "cart-item-row";
                    const title = isAr ? item.name_ar : item.name_en;
                    row.innerHTML = `
                        <img src="${item.image}" alt="${title}" class="cart-item-thumb">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${title}</h4>
                            <span class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</span>
                            <div class="cart-item-qty">
                                <button class="btn-qty" onclick="window.juthoorApp.updateQuantity('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="btn-qty" onclick="window.juthoorApp.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    `;
                    drawerList.appendChild(row);
                });
            }
        }

        // 2. Update On-Page Cart Section
        const pageCountBadge = document.getElementById("pageCartCountBadge");
        const pageList = document.getElementById("pageCartItemsList");
        const pageEmpty = document.getElementById("pageCartEmptyState");
        const pageSubtotal = document.getElementById("pageCartSubtotal");
        const pageTotal = document.getElementById("pageCartTotal");

        if (pageCountBadge) pageCountBadge.innerText = `${totalItems} ${isAr ? 'عناصر' : 'items'}`;
        if (pageSubtotal) pageSubtotal.innerText = formattedTotal;
        if (pageTotal) pageTotal.innerText = formattedTotal;

        if (pageList && pageEmpty) {
            if (this.cart.length === 0) {
                pageEmpty.style.display = "flex";
                pageList.style.display = "none";
                pageList.innerHTML = "";
            } else {
                pageEmpty.style.display = "none";
                pageList.style.display = "flex";
                pageList.innerHTML = "";
                this.cart.forEach(item => {
                    const row = document.createElement("div");
                    row.className = "cart-page-item-row";
                    const title = isAr ? item.name_ar : item.name_en;
                    row.innerHTML = `
                        <img src="${item.image}" alt="${title}" class="cart-page-thumb">
                        <div class="cart-page-info">
                            <h4 class="cart-page-title">${title}</h4>
                            <span class="cart-page-price">$${parseFloat(item.price).toFixed(2)} each</span>
                        </div>
                        <div class="cart-page-actions">
                            <div class="cart-page-qty-box">
                                <button class="cart-page-qty-btn" onclick="window.juthoorApp.updateQuantity('${item.id}', -1)">-</button>
                                <span class="cart-page-qty-val">${item.quantity}</span>
                                <button class="cart-page-qty-btn" onclick="window.juthoorApp.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button class="btn-remove-item" onclick="window.juthoorApp.updateQuantity('${item.id}', -${item.quantity})" title="Remove">
                                <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                            </button>
                        </div>
                    `;
                    pageList.appendChild(row);
                });
            }
        }

        if (window.lucide) window.lucide.createIcons();
    }

    openCart() {
        const cartSec = document.getElementById("cartSection");
        if (cartSec) {
            cartSec.scrollIntoView({ behavior: "smooth", block: "start" });
            cartSec.classList.add("highlight-cart");
            setTimeout(() => cartSec.classList.remove("highlight-cart"), 1800);
        }
        if (window.innerWidth < 992) {
            document.getElementById("cartDrawer").classList.add("open");
            document.getElementById("cartBackdrop").classList.add("open");
        }
    }

    closeCart() {
        document.getElementById("cartDrawer").classList.remove("open");
        document.getElementById("cartBackdrop").classList.remove("open");
    }

    triggerFacePalCheckout() {
        if (this.cart.length === 0) {
            alert(this.currentLang === "ar" ? "سلة التسوق فارغة! الرجاء إضافة منتج أولاً." : "Your shopping cart is empty! Please add a product first.");
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.closeCart();

        // Open Payment Modal
        const modalBackdrop = document.getElementById("paymentModalBackdrop");
        document.getElementById("modalCheckoutAmount").innerText = `$${total.toFixed(2)}`;
        modalBackdrop.classList.add("open");

        // Start 10-second biometric camera scanner!
        if (window.faceReader) {
            window.faceReader.startCheckoutScanner(total, this.cart);
        }
    }

    closePaymentModal() {
        if (window.faceReader) {
            window.faceReader.stopScanner();
        }
        const modalBackdrop = document.getElementById("paymentModalBackdrop");
        if (modalBackdrop) modalBackdrop.classList.remove("open");
    }

    openRegisterModal() {
        document.getElementById("registerModalBackdrop").classList.add("open");
        setTimeout(() => {
            const startCamBtn = document.getElementById("startRegCameraBtn");
            if (startCamBtn && !this.regStream) {
                startCamBtn.click();
            }
        }, 150);
    }

    closeRegisterModal() {
        if (this.regStream) {
            this.regStream.getTracks().forEach(track => track.stop());
            this.regStream = null;
        }
        document.getElementById("registerModalBackdrop").classList.remove("open");
    }

    openDashboardModal() {
        document.getElementById("dashboardModalBackdrop").classList.add("open");
        if (window.dashboardController) {
            window.dashboardController.loadAll();
        }
    }

    closeDashboardModal() {
        document.getElementById("dashboardModalBackdrop").classList.remove("open");
    }

    // =========================================================================
    // REGISTRATION CAMERA & FORM
    // =========================================================================
    bindRegistrationControls() {
        const startCamBtn = document.getElementById("startRegCameraBtn");
        const captureBtn = document.getElementById("captureRegFaceBtn");
        const uploadBtn = document.getElementById("regUploadPhotoBtn");
        const fileInput = document.getElementById("regFaceFileInput");
        const form = document.getElementById("faceRegistrationForm");
        const video = document.getElementById("regCameraVideo");
        const preview = document.getElementById("regCapturedPreview");
        const submitBtn = document.getElementById("submitRegistrationBtn");
        const feedback = document.getElementById("regFormFeedback");

        let capturedDataUrl = null;

        if (startCamBtn) {
            startCamBtn.addEventListener("click", async () => {
                try {
                    this.regStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 480, height: 480, facingMode: "user" },
                        audio: false
                    });
                    video.srcObject = this.regStream;
                    await video.play();
                    video.style.display = "block";
                    preview.style.display = "none";
                    captureBtn.disabled = false;
                } catch (e) {
                    console.warn("Unable to open camera for registration:", e);
                    // Friendly message if camera is blocked or unavailable
                    if (feedback) {
                        feedback.style.display = "block";
                        feedback.className = "form-feedback";
                        feedback.innerHTML = "Camera permission unavailable. You can use <strong>Upload Photo</strong> button below to register your face.";
                    }
                }
            });
        }

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener("click", () => fileInput.click());
            fileInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    capturedDataUrl = evt.target.result;
                    preview.src = capturedDataUrl;
                    preview.style.display = "block";
                    video.style.display = "none";
                    submitBtn.disabled = false;
                    captureBtn.disabled = true;
                    if (window.faceReader) window.faceReader.playTone(750, "sine", 0.1);
                };
                reader.readAsDataURL(file);
            });
        }

        if (captureBtn) {
            captureBtn.addEventListener("click", () => {
                const canvas = document.getElementById("regCanvas");
                canvas.width = video.videoWidth || 480;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                capturedDataUrl = canvas.toDataURL("image/jpeg", 0.9);

                preview.src = capturedDataUrl;
                preview.style.display = "block";
                video.style.display = "none";
                submitBtn.disabled = false;

                if (window.faceReader) window.faceReader.playTone(750, "sine", 0.1);
            });
        }

        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!capturedDataUrl) {
                    alert("Please capture your face photo first.");
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerText = "Registering Biometrics in Vector DB...";

                feedback.style.display = "block";
                feedback.className = "form-feedback";
                feedback.innerText = "Verifying liveness and computing SFace 128-d vector embedding...";

                try {
                    const payload = {
                        full_name: document.getElementById("regFullName").value.trim(),
                        email: document.getElementById("regEmail").value.trim(),
                        paypal_email: document.getElementById("regPayPalEmail").value.trim(),
                        paypal_balance: parseFloat(document.getElementById("regInitialBalance").value || 500.0),
                        image_data: capturedDataUrl
                    };

                    let success = false;
                    let message = "";
                    let finalBalance = payload.paypal_balance;

                    try {
                        const res = await fetch("/api/faces/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.success) {
                                success = true;
                                message = data.message;
                                finalBalance = data.paypal_balance;
                            }
                        }
                    } catch (e) {
                        // Backend not reachable, fall back to FacePalStore
                    }

                    if (!success && window.FacePalStore) {
                        const user = window.FacePalStore.registerUser(payload);
                        success = true;
                        message = "Face vector & biometric profile registered in FacePal demo store!";
                        finalBalance = user.paypal_balance;
                    }

                    if (success) {
                        feedback.className = "form-feedback success";
                        feedback.innerHTML = `<strong>✅ Success!</strong> ${message} <br> Linked PayPal Balance: <strong>$${finalBalance.toFixed(2)}</strong>`;
                        submitBtn.innerText = "Registration Complete!";

                        if (window.faceReader) window.faceReader.playSuccessChime();

                        // Refresh dashboard if active
                        if (window.dashboardController) window.dashboardController.loadAll();

                        setTimeout(() => {
                            this.closeRegisterModal();
                            form.reset();
                            capturedDataUrl = null;
                            preview.style.display = "none";
                            video.style.display = "block";
                            submitBtn.disabled = true;
                            submitBtn.innerText = "Complete Registration & Link Wallet";
                            feedback.style.display = "none";
                        }, 2500);
                    } else {
                        feedback.className = "form-feedback error";
                        feedback.innerHTML = `<strong>❌ Registration Failed:</strong> Biometric verification failed.`;
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Try Again";
                        if (window.faceReader) window.faceReader.playSpoofAlertTone();
                    }
                } catch (err) {
                    feedback.className = "form-feedback error";
                    feedback.innerText = "Network / API error: " + err;
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Try Again";
                }
            });
        }
    }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    window.genevaApp = window.juthoorApp = new JuthoorApp();
});
