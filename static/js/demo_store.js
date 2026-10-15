/**
 * FacePal Standalone Store & Simulator
 * Powers the interactive GitHub Pages live demo with persistent localStorage state,
 * client-side biometric authorization simulation, and offline operational dashboard.
 */

(function () {
    const DEFAULT_PRODUCTS = [
        {
            id: "prod_1",
            name_en: "Geneva Master Gold Fountain Pen & Ink Set",
            name_ar: "طقم قلم حبر سائل فاخر جنيفا ماستر مع محبرة ملكية",
            category_en: "Fine Writing & Pens",
            category_ar: "أقلام وأدوات كتابة",
            price: 45.00,
            origin_en: "Geneva Executive Collection",
            origin_ar: "مجموعة جنيفا الملكية",
            image: "./images/products/fountain_pen.jpg",
            badge_en: "24k Gold Plated Nib",
            badge_ar: "ريشة مطلية بالذهب",
            description_en: "Handcrafted German iridium medium nib with 24k gold accents, precision piston-fill converter, and 50ml bottle of royal archival midnight blue ink in a velvet presentation box.",
            description_ar: "قلم حبر سائل فاخر بريشة إيريديوم ألمانية مطلية بالذهب عيار 24، مع آلية تعبئة مكبسية دقيقة ومحبرة زجاجية زرقاء ملكية 50 مل داخل علبة مخملية أنيقة."
        },
        {
            id: "prod_2",
            name_en: "Vintage Embossed Leather Journal & Daily Planner",
            name_ar: "دفتر يوميات ومخطط جلدي عتيق مصنوع يدوياً",
            category_en: "Notebooks & Paper",
            category_ar: "دفاتر ومذكرات فاخرة",
            price: 28.00,
            origin_en: "Artisan Bookbinding Studio",
            origin_ar: "ورشة تجليد الكتب الحرفية",
            image: "./images/products/leather_journal.jpg",
            badge_en: "Full-Grain Leather",
            badge_ar: "جلد طبيعي 100%",
            description_en: "240 pages of fountain-pen-friendly unlined recycled cotton deckle-edge paper, bound in genuine supple brown leather with antique bronze wrap-around buckle clasp.",
            description_ar: "240 صفحة من الورق القطني الطبيعي الفاخر المناسب لأقلام الحبر، مجلد بجلد طبيعي مدبوغ يدوياً مع قفل برونزي عتيق لحفظ الملاحظات والأفكار الملهمة."
        },
        {
            id: "prod_3",
            name_en: "Studio Acrylic & Sketching Artist Art Box (72 Pcs)",
            name_ar: "حقيبة ألوان وأدوات رسم وتخطيط احترافية (72 قطعة)",
            category_en: "Art & Creative Crafts",
            category_ar: "أدوات رسم وأشغال فنية",
            price: 64.00,
            origin_en: "Fine Art Atelier",
            origin_ar: "استوديو الفنون التشكيلية",
            image: "./images/products/art_sketch_set.jpg",
            badge_en: "Professional Grade",
            badge_ar: "للمحترفين والهواة",
            description_en: "Comprehensive wooden studio carrying chest containing 24 vibrant acrylic tubes, 12 graded graphite sketch pencils, 18 watercolor cakes, palette knives, sponges, and fine camel-hair brushes.",
            description_ar: "حقيبة خشبية متكاملة تضم 24 لون أكريليك عالي الصباغ، 12 قلم رصاص تظليل درجات متعددة، 18 لون مائي، سكاكين مزج، إسفنج، وفرش رسم ناعمة من شعر الجمل."
        },
        {
            id: "prod_4",
            name_en: "Oxford English-Arabic Illustrated Comprehensive Dictionary",
            name_ar: "قاموس أكسفورد المصور الشامل (إنجليزي - عربي) مجلد فاخر",
            category_en: "Books & Literature",
            category_ar: "كتب وروايات ومراجع",
            price: 42.00,
            origin_en: "Oxford Reference Press",
            origin_ar: "دار أكسفورد للمراجع العالمية",
            image: "./images/products/oxford_dictionary.jpg",
            badge_en: "Essential Reference",
            badge_ar: "مرجع لغوي معتمد",
            description_en: "Deluxe hardbound volume with full-color visual vocabulary diagrams, over 120,000 contemporary words and expressions, grammar guide, and thumb index tabs for rapid reference.",
            description_ar: "طبعة فاخرة بغلاف مقوى تضم رسوماً توضيحية ملونة، وأكثر من 120,000 كلمة وتعبير لغوي معاصر، مع دليل القواعد وفهارس جانبية لسهولة البحث."
        },
        {
            id: "prod_5",
            name_en: "World Masterpieces Hardcover Classics Collection (3 Vols)",
            name_ar: "موسوعة روائع الأدب العالمي الكلاسيكي (ثلاثية مجلدة)",
            category_en: "Books & Literature",
            category_ar: "كتب وروايات ومراجع",
            price: 55.00,
            origin_en: "Geneva Literary Press",
            origin_ar: "منشورات جنيفا الأدبية",
            image: "./images/products/classic_novels.jpg",
            badge_en: "Collector's Edition",
            badge_ar: "طبعة مقتنين فاخرة",
            description_en: "Elegant gold-gilded page edges with silk ribbon bookmarks, featuring timeless masterpieces: 'One Hundred Years of Solitude', 'War and Peace', and 'The Prophet' in premium Arabic translations.",
            description_ar: "طبعة أنيقة بحواف ذهبية وشريط حريري للفواصل، تضم روائع الفكر العالمي: مائة عام من العزلة، الحرب والسلام، وكتاب النبي بترجمات عربية رصينة."
        },
        {
            id: "prod_6",
            name_en: "Geneva Ergonomic Multi-Pocket School & Laptop Backpack",
            name_ar: "حقيبة جنيفا المدرسية والجامعية المريحة المقاومة للماء",
            category_en: "Bags & Backpacks",
            category_ar: "حقائب مدرسية وإكسسوارات",
            price: 58.00,
            origin_en: "Geneva Gear & Ergonomics",
            origin_ar: "قسم التجهيزات المدرسية",
            image: "./images/products/geneva_backpack.jpg",
            badge_en: "Orthopedic Back Support",
            badge_ar: "دعم طبي للظهر",
            description_en: "Heavy-duty water-repellent ballistic nylon backpack with padded 15.6\" laptop compartment, air-mesh orthopedic back panel, USB charging pass-through, and reflective safety bands.",
            description_ar: "حقيبة ظهر متينة مقاومة للماء والتمزق مع جيب مبطن للكمبيوتر المحمول 15.6 بوصة، ووسادة ظهر طبية مريحة لتوزيع الوزن، ومنفذ شحن USB وأشرطة عاكسة."
        },
        {
            id: "prod_7",
            name_en: "Solid Walnut Executive Desktop Stationery Organizer",
            name_ar: "منظم مكاتب تنفيذي فاخر من خشب الجوز الطبيعي",
            category_en: "Luxury Gifts & Desk Accessories",
            category_ar: "هدايا وإكسسوارات مكتبية",
            price: 38.00,
            origin_en: "Geneva Handcrafted Woodwork",
            origin_ar: "صناعة خشبية يدوية",
            image: "./images/products/desk_organizer.jpg",
            badge_en: "Natural Walnut",
            badge_ar: "خشب جوز طبيعي",
            description_en: "Precision CNC-milled and hand-waxed natural walnut wood desktop console with compartments for pens, sticky notes, smartphone dock, business cards, and paperclips.",
            description_ar: "منصة مكتبية مصقولة يدوياً من خشب الجوز الطبيعي مع تجاويف مخصصة للأقلام وبطاقات العمل وحامل للهاتف الذكي ومكان للمذكرات والدبابيس."
        },
        {
            id: "prod_8",
            name_en: "STEM Smart Interactive Robotics & Coding Kit for Youth",
            name_ar: "حقيبة الروبوت والبرمجة التفاعلية للأطفال والناشئة (STEM)",
            category_en: "Educational & Games",
            category_ar: "ألعاب ذكاء وتنمية المهارات",
            price: 68.00,
            origin_en: "Geneva STEM Academy",
            origin_ar: "أكاديمية جنيفا للعلوم",
            image: "./images/products/stem_robot_kit.jpg",
            badge_en: "Scratch & Python Compatible",
            badge_ar: "برمجة مرئية وبايثون",
            description_en: "14-in-1 modular programmable robot kit with ultrasonic obstacle sensors, motor controllers, Bluetooth connectivity, and Arabic step-by-step experiment curriculum.",
            description_ar: "مجموعة روبوت تعليمية 14 في 1 مزودة بحساسات مسافة بالموجات فوق الصوتية ومحركات ذكية مع ربط بلوتوث ودليل تجارب مشروح خطوة بخطوة باللغة العربية."
        },
        {
            id: "prod_9",
            name_en: "Precision Pastel & Metallic Fineliner Pens (Set of 36)",
            name_ar: "طقم أقلام تخطيط دقيقة باستيل وميتاليك (36 لوناً)",
            category_en: "Fine Writing & Pens",
            category_ar: "أقلام وأدوات كتابة",
            price: 24.00,
            origin_en: "Swiss Precision Inks",
            origin_ar: "أحبار سويسرية دقيقة",
            image: "./images/products/fineliner_pens.jpg",
            badge_en: "0.4mm Metal Clad Tip",
            badge_ar: "رأس معدني دقيق 0.4 مم",
            description_en: "Non-bleed archival water-based pigment inks with durable 0.4mm metal-clad tips, ideal for bullet journaling, mind-mapping, engineering drafting, and adult coloring.",
            description_ar: "أقلام تحديد وتخطيط بأحبار صبغية مائية ثابتة لا تنفذ عبر الورق، برؤوس دقيقة 0.4 مم محاطة بالمعدن مثالية للتخطيط اليومي والتدوين الهندسي والتلوين الفني."
        },
        {
            id: "prod_10",
            name_en: "Geneva Royal Wax Seal, Brass Stamp & Quill Gift Box",
            name_ar: "صندوق هدايا جنيفا الملكي: ختم الشمع والنحاس وريشة الكتابة",
            category_en: "Luxury Gifts & Desk Accessories",
            category_ar: "هدايا وإكسسوارات مكتبية",
            price: 49.00,
            origin_en: "Geneva Heritage Collection",
            origin_ar: "مجموعة جنيفا الكلاسيكية",
            image: "./images/products/luxury_gift_set.jpg",
            badge_en: "Premium Gift Edition",
            badge_ar: "إصدار الهدايا التذكارية",
            description_en: "Vintage gift collection including an engraved solid brass seal stamp with Geneva tree crest, 3 colored sealing wax sticks, brass melting spoon, tealight candle, and calligraphic quill pen.",
            description_ar: "طقم هدايا أثري فخم يتضمن ختماً نحاسياً منقوشاً بشعار شجرة جنيفا، مع 3 أصابع شمع أختام ملون، وملعقة إذابة نحاسية، وشمعة، وريشة كتابة كلاسيكية."
        }
    ];

    const DEFAULT_USERS = [
        {
            id: 1,
            full_name: "Amjad Khaliliah",
            email: "amjadkhaliliah1998@gmail.com",
            paypal_email: "test@paypal.com",
            paypal_balance: 242.0,
            face_image_path: "./images/faces/user_1.jpg",
            created_at: "2026-10-15 13:20:00"
        }
    ];

    const DEFAULT_TRANSACTIONS = [
        {
            id: "FP-TXN-9D71D2462B",
            user_id: 1,
            full_name: "Amjad Khaliliah",
            paypal_email: "test@paypal.com",
            face_image_path: "./images/faces/user_1.jpg",
            amount: 193.00,
            status: "COMPLETED",
            biometric_confidence: 0.840,
            items: [
                { name_en: "Geneva Master Gold Fountain Pen & Ink Set", price: 45.0 },
                { name_en: "Oxford English-Arabic Illustrated Comprehensive Dictionary", price: 42.0 },
                { name_en: "Studio Acrylic & Sketching Artist Art Box (72 Pcs)", price: 64.0 },
                { name_en: "Precision Pastel & Metallic Fineliner Pens (Set of 36)", price: 24.0 },
                { name_en: "Vintage Embossed Leather Journal", price: 28.0 }
            ],
            created_at: "2026-10-15 13:45:10"
        },
        {
            id: "FP-TXN-26E8EA2A2F",
            user_id: 1,
            full_name: "Amjad Khaliliah",
            paypal_email: "test@paypal.com",
            face_image_path: "./images/faces/user_1.jpg",
            amount: 16.00,
            status: "COMPLETED",
            biometric_confidence: 0.837,
            items: [
                { name_en: "Stationery Bookmarks & Cards", price: 16.0 }
            ],
            created_at: "2026-10-15 14:02:18"
        },
        {
            id: "FP-TXN-3602855A08",
            user_id: 1,
            full_name: "Amjad Khaliliah",
            paypal_email: "test@paypal.com",
            face_image_path: "./images/faces/user_1.jpg",
            amount: 49.00,
            status: "COMPLETED",
            biometric_confidence: 0.802,
            items: [
                { name_en: "Geneva Royal Wax Seal, Brass Stamp & Quill Gift Box", price: 49.0 }
            ],
            created_at: "2026-10-15 14:15:33"
        }
    ];

    const DEFAULT_LOGS = [
        {
            id: 1,
            activity_type: "BIOMETRIC_CHECKOUT",
            status: "SUCCESS",
            details: "FacePal biometric verification match 84.0% - deducted $193.00 via PayPal",
            timestamp: "2026-10-15 13:45:10"
        },
        {
            id: 2,
            activity_type: "ANTI_SPOOF_CHECK",
            status: "BLOCKED",
            details: "MiniFASNet presentation attack detected (Printed Photo attack blocked with 'X' alert)",
            timestamp: "2026-10-15 13:58:22"
        },
        {
            id: 3,
            activity_type: "BIOMETRIC_REGISTRATION",
            status: "SUCCESS",
            details: "128-d vector embedding stored in Qdrant Vector DB for Amjad Khaliliah",
            timestamp: "2026-10-15 13:20:00"
        }
    ];

    window.FacePalStore = {
        isGitHubPages() {
            return (
                window.location.hostname.includes("github.io") ||
                window.location.protocol === "file:" ||
                window.location.port !== "7777"
            );
        },

        init() {
            if (!localStorage.getItem("facepal_demo_users")) {
                localStorage.setItem("facepal_demo_users", JSON.stringify(DEFAULT_USERS));
            }
            if (!localStorage.getItem("facepal_demo_txs")) {
                localStorage.setItem("facepal_demo_txs", JSON.stringify(DEFAULT_TRANSACTIONS));
            }
            if (!localStorage.getItem("facepal_demo_logs")) {
                localStorage.setItem("facepal_demo_logs", JSON.stringify(DEFAULT_LOGS));
            }
            if (!localStorage.getItem("facepal_spoof_count")) {
                localStorage.setItem("facepal_spoof_count", "1");
            }
        },

        getProducts() {
            return DEFAULT_PRODUCTS;
        },

        getUsers() {
            this.init();
            return JSON.parse(localStorage.getItem("facepal_demo_users") || "[]");
        },

        registerUser(data) {
            this.init();
            const users = this.getUsers();
            const newUser = {
                id: users.length + 1,
                full_name: data.full_name || "Geneva Patron",
                email: data.email || "patron@genevalibrary.com",
                paypal_email: data.paypal_email || "patron@paypal.com",
                paypal_balance: parseFloat(data.paypal_balance || 500.0),
                face_image_path: data.image_data || "./images/faces/user_1.jpg",
                created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            users.unshift(newUser);
            localStorage.setItem("facepal_demo_users", JSON.stringify(users));

            // Log activity
            this.logActivity("FACE_REGISTRATION", "SUCCESS", `Biometric face registered for ${newUser.full_name} with $${newUser.paypal_balance.toFixed(2)} PayPal balance`);
            return newUser;
        },

        getTransactions() {
            this.init();
            return JSON.parse(localStorage.getItem("facepal_demo_txs") || "[]");
        },

        getLogs() {
            this.init();
            return JSON.parse(localStorage.getItem("facepal_demo_logs") || "[]");
        },

        logActivity(type, status, details) {
            const logs = this.getLogs();
            logs.unshift({
                id: logs.length + 1,
                activity_type: type,
                status: status,
                details: details,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
            });
            localStorage.setItem("facepal_demo_logs", JSON.stringify(logs.slice(0, 50)));
        },

        verifyBiometricPayment(amount, items, forceSpoof = false) {
            this.init();
            const users = this.getUsers();

            if (forceSpoof) {
                const count = parseInt(localStorage.getItem("facepal_spoof_count") || "1") + 1;
                localStorage.setItem("facepal_spoof_count", count.toString());
                this.logActivity("ANTI_SPOOFING", "BLOCKED", "Simulated presentation attack blocked with 'X' security alert");
                return {
                    status: "SPOOF_DETECTED",
                    success: false,
                    message: "SECURITY ALERT: Spoofing detected! Presentation attack blocked. Payment aborted."
                };
            }

            if (!users || users.length === 0) {
                return {
                    status: "NOT_REGISTERED",
                    success: false,
                    message: "No registered face found in database."
                };
            }

            // Pick the active/primary user (latest registered or default)
            const user = users[0];
            const numAmount = parseFloat(amount || 0);

            if (user.paypal_balance < numAmount) {
                return {
                    status: "INSUFFICIENT_FUNDS",
                    success: false,
                    message: `Insufficient funds in linked PayPal wallet. Balance: $${user.paypal_balance.toFixed(2)}, Required: $${numAmount.toFixed(2)}`
                };
            }

            // Deduct balance
            user.paypal_balance = parseFloat((user.paypal_balance - numAmount).toFixed(2));
            localStorage.setItem("facepal_demo_users", JSON.stringify(users));

            // Record transaction
            const txId = "FP-TXN-" + Math.random().toString(16).substring(2, 12).toUpperCase();
            const txList = this.getTransactions();
            const newTx = {
                id: txId,
                user_id: user.id,
                full_name: user.full_name,
                paypal_email: user.paypal_email,
                face_image_path: user.face_image_path,
                amount: numAmount,
                status: "COMPLETED",
                biometric_confidence: 0.85 + Math.random() * 0.12,
                items: items || [],
                created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            txList.unshift(newTx);
            localStorage.setItem("facepal_demo_txs", JSON.stringify(txList));

            this.logActivity("FACEPAL_CHECKOUT", "SUCCESS", `Biometric deduction of $${numAmount.toFixed(2)} authorized for ${user.full_name}`);

            return {
                status: "RECOGNIZED",
                success: true,
                customer_name: user.full_name,
                payment_details: {
                    amount_deducted: numAmount,
                    new_balance: user.paypal_balance,
                    paypal_account: user.paypal_email,
                    transaction_id: txId
                }
            };
        },

        topUp(email, amount) {
            this.init();
            const users = this.getUsers();
            const target = users.find(u => u.paypal_email.toLowerCase() === email.toLowerCase());
            if (!target) return null;
            target.paypal_balance = parseFloat((target.paypal_balance + amount).toFixed(2));
            localStorage.setItem("facepal_demo_users", JSON.stringify(users));
            this.logActivity("PAYPAL_TOPUP", "SUCCESS", `Added $${amount.toFixed(2)} to ${target.full_name}'s PayPal wallet`);
            return target;
        },

        getStats() {
            this.init();
            const txs = this.getTransactions();
            const users = this.getUsers();
            const spoofCount = parseInt(localStorage.getItem("facepal_spoof_count") || "1");

            const completedTxs = txs.filter(t => t.status === "COMPLETED");
            const totalSales = completedTxs.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

            return {
                total_sales: totalSales,
                completed_count: completedTxs.length,
                spoof_count: spoofCount,
                registered_users: users.length
            };
        }
    };

    // Auto-initialize demo data on script load
    window.FacePalStore.init();
})();
