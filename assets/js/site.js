/* شركة إبداع الوفاء للصناعات المعدنية — site behaviour */
(function () {
  "use strict";

  /* ------------------------------------------------ sticky header state */
  var headerBar = document.querySelector(".header-bar");
  if (headerBar) {
    var onScroll = function () {
      headerBar.classList.toggle("is-scrolled", window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------- mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      });
    });
  }

  /* ---------------------------------------------- scroll reveal (IO) -- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.setAttribute("data-visible", "true");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.setAttribute("data-visible", "true");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---------------------------------------------------- hero carousel */
  var stage = document.querySelector(".carousel-stage");
  if (stage) {
    var slides = stage.querySelectorAll("img");
    var dots = document.querySelectorAll(".carousel-dots button");
    var current = 0;
    var timer = null;

    var prevBtn = document.querySelector(".carousel-prev");
    var nextBtn = document.querySelector(".carousel-next");
    var captions = document.querySelectorAll(".carousel-caption");

    var show = function (idx) {
      current = (idx + slides.length) % slides.length;
      slides.forEach(function (img, i) {
        img.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-selected", String(i === current));
      });
      captions.forEach(function (cap, i) {
        cap.classList.toggle("is-active", i === current);
      });
    };

    var start = function () {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    };
    var stop = function () {
      if (timer) clearInterval(timer);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    /* swipe support for touch devices */
    var touchX = null;
    var touchY = null;
    stage.addEventListener(
      "touchstart",
      function (e) {
        touchX = e.changedTouches[0].clientX;
        touchY = e.changedTouches[0].clientY;
        stop();
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        var dy = e.changedTouches[0].clientY - touchY;
        /* horizontal intent only, so vertical scrolling still works */
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          /* the page is RTL: swiping right moves to the next slide */
          show(current + (dx > 0 ? 1 : -1));
        }
        touchX = null;
        touchY = null;
        start();
      },
      { passive: true }
    );

    show(0);
    start();
  }

  /* ------------------------------------------- gallery filter + lightbox */
  var filterBar = document.querySelector(".filter-bar, .gallery-filter-pills");
  var galleryGrid = document.querySelector(".gallery-grid, .gallery-grid-clean");
  if (filterBar && galleryGrid) {
    var filterButtons = filterBar.querySelectorAll("button, .gallery-pill");
    var galleryItems = galleryGrid.querySelectorAll(":scope > div");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.dataset.filter || btn.dataset.cat || "all";
        filterButtons.forEach(function (b) {
          b.classList.toggle("active", b === btn);
          b.classList.toggle("is-active", b === btn);
        });
        galleryItems.forEach(function (cell) {
          var itemCat = cell.dataset.category || cell.dataset.cat || "all";
          var match = (cat === "all" || cat === "الكل" || itemCat === cat);
          cell.style.display = match ? "" : "none";
          if (match) {
            cell.setAttribute("data-visible", "true");
            cell.style.animation = "none";
            /* trigger reflow to restart animation */
            void cell.offsetWidth;
            cell.style.animation = "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both";
          }
        });
      });
    });
  }

  /* drag-to-scroll support for filter pills */
  var pillsTrack = document.querySelector(".gallery-filter-pills");
  if (pillsTrack) {
    var isDown = false;
    var startX, scrollLeft;
    pillsTrack.addEventListener("mousedown", function (e) {
      isDown = true;
      startX = e.pageX - pillsTrack.offsetLeft;
      scrollLeft = pillsTrack.scrollLeft;
    });
    pillsTrack.addEventListener("mouseleave", function () { isDown = false; });
    pillsTrack.addEventListener("mouseup", function () { isDown = false; });
    pillsTrack.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      var x = e.pageX - pillsTrack.offsetLeft;
      var walk = (x - startX) * 1.5;
      pillsTrack.scrollLeft = scrollLeft - walk;
    });
  }

  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightboxImg.removeAttribute("src");
      document.body.style.overflow = "";
    };

    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () {
        lightboxImg.src = item.dataset.full;
        lightboxImg.alt = item.dataset.title || "صورة من معرض الأعمال";
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });

    lightbox.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ------------------------------------------------ contact → WhatsApp */
  var waForm = document.getElementById("wa-form");
  if (waForm) {
    var intl = waForm.dataset.intl;
    waForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var service = document.getElementById("service").value;
      var note = document.getElementById("note").value.trim();
      var msg =
        "السلام عليكم\n" +
        "الاسم: " + name + "\n" +
        "الجوال: " + phone + "\n" +
        "الخدمة المطلوبة: " + service + "\n" +
        "تفاصيل: " + note;
      window.open(
        "https://wa.me/" + intl + "?text=" + encodeURIComponent(msg),
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  /* ------------------------------------------------------- footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------ Language Toggle (AR / EN) */
  var langBtn = document.getElementById("lang-toggle");
  if (langBtn) {
    var translations = {
      en: {
        "الرئيسية": "Home",
        "من نحن": "About Us",
        "خدماتنا": "Services",
        "المشاريع": "Projects",
        "الشهادات": "Certificates",
        "تواصل معنا": "Contact Us",
        "طلب عرض سعر": "Get Quote",
        "واتساب 0581892365": "WhatsApp 0581892365",
        "شركة إبداع الوفاء": "Ebdaa Al-Wafa Company",
        "للصناعات المعدنية": "For Metal Industries",
        "الرياض - حي السلي - شارع اسطنبول": "Riyadh - Al-Sulay - Istanbul St.",
        "أسعار تنافسية": "Competitive Prices",
        "التزام بالمواعيد": "Punctual Delivery",
        "جودة عالية": "High Quality",
        "فريق متخصص": "Specialized Team",
        "تصميم وتصنيع وتنفيذ": "Design, Fabrication & Execution",
        "مصنع متكامل في الرياض": "Integrated Factory in Riyadh",
        "تصميم": "Design",
        "مكتب فني بـ 5 مصممين ورفع مقاسات دقيق بالموقع لضمان ملاءمة الهندسة.": "Technical office with 5 designers & accurate site dimensioning.",
        "تصنيع": "Fabrication",
        "مصنع 1200 م² في حي السلي بخطوط تشغيل حديثة لأعلى معايير المتانة.": "1200 m² factory in Al-Sulay with modern production lines.",
        "تنفيذ": "Execution",
        "فرق تركيب متخصصة ومشرفو مواقع ميدانيون لضمان الإتقان والتسليم.": "Specialized installation teams & site supervisors ensuring delivery.",
        "شريكك الهندسي الموثوق في الصناعات المعدنية": "Your Trusted Engineering Partner in Metal Industries",
        "نحن شركة إبداع الوفاء للصناعات المعدنية، أحد الكيانات الجديدة لمؤسسة أبراج البريق للمقاولات الرائدة في أعمال الألمنيوم وأبواب WPC والزجاج والحديد والاستانلس ستيل، والتي امتلكت العديد من الاعتمادات والمشاريع العملاقة والحكومية. أنشئت الشركة كفرع رئيسي متخصص في أعمال الألمنيوم وأبواب WPC حرصًا على راحة عملائنا وتقديم خدمة أفضل من خلال عمالة متخصصة وماهرة.": "We are Ebdaa Al-Wafa Metal Industries, a subsidiary of Abraj Al-Bariq Contracting, leading in aluminum, WPC doors, glass, steel, and stainless steel with numerous approvals and mega government projects.",
        "تعرف علينا أكثر": "Learn More About Us",
        "خدماتنا المميزة": "Our Featured Services",
        "صناعات معدنية متكاملة تحت سقف واحد": "Integrated Metal Industries Under One Roof",
        "نقدم باقة شاملة من الخدمات الهندسية والصناعية للمشاريع السكنية والتجارية بأعلى مواصفات الجودة": "We offer a comprehensive range of engineering & industrial services for residential & commercial projects.",
        "الألمنيوم": "Aluminum",
        "أعمال الألمنيوم": "Aluminum Works",
        "نوافذ وأبواب ألمنيوم بأنظمة سحب ومفصلي وقلاب، بمقاطع معزولة حراريًا وصوتيًا وبأعلى معايير التشطيب.": "Aluminum windows and doors with sliding, hinged, and tilt systems, thermally and acoustically insulated.",
        "أبواب WPC": "WPC Doors",
        "أعمال أبواب WPC": "WPC Door Works",
        "أبواب WPC داخلية مقاومة للماء والرطوبة بتشطيبات خشبية متعددة وتصاميم عصرية جاهزة للتركيب.": "Interior WPC doors resistant to water and moisture with multiple wood finishes and modern designs.",
        "الواجهات": "Facades",
        "أعمال الزجاج والواجهات": "Glass & Facade Works",
        "واجهات زجاجية للمباني، كيرتن وول، استركشر واسكاي لايت بزجاج مزدوج وسيكوريت عالي الأمان.": "Building glass facades, curtain walls, structural glazing, and skylights with double-glazed safety glass.",
        "استانلس ستيل": "Stainless Steel",
        "أعمال الاستانلس ستيل": "Stainless Steel Works",
        "درابزين ودرج ومظلات وتشكيلات استانلس ستيل بلحام نظيف ولمسات نهائية مصقولة تدوم لسنوات.": "Handrails, stairs, canopies, and stainless steel fabrications with clean welds and polished finishes.",
        "الحديد والمعادن": "Steel & Metals",
        "أعمال الحديد": "Steel Works",
        "أبواب وبوابات وشبابيك حديد وهناجر ومشغولات فنية بتصاميم كلاسيكية وحديثة بدهان إلكتروستاتيك.": "Steel doors, gates, windows, hangers, and artistic fabrications with electrostatic powder coating.",
        "المطابخ": "Kitchens",
        "مطابخ وخزائن ألمنيوم": "Aluminum Kitchens & Cabinets",
        "مطابخ وخزائن ألمنيوم وخشب مقاومة للماء والحرارة بتصميم يناسب مساحتك مع تنفيذ وتركيب كامل.": "Water and heat resistant aluminum and wood kitchens and cabinets custom fitted with full installation.",
        "استكشف الخدمة ←": "Explore Service ←",
        "استكشف جميع الخدمات بالتفصيل": "Explore All Services in Detail",
        "✨ الكادر الفني والهندسي المعتمد": "✨ Certified Engineering Team",
        "الكادر الفني والهندسي المعتمد": "Certified Engineering Team",
        "إمكانيات بشرية وهندسية متكاملة تضمن الدقة والجودة": "Comprehensive Human & Engineering Capabilities Guaranteeing Quality",
        "مهندس إنتاج": "Production Engineer",
        "إدارة هندسية ومتابعة جودة": "Engineering Management & Quality Control",
        "5 مصممين": "5 Designers",
        "مكتب فني ورسم هندسي": "Technical Office & CAD Design",
        "2 مساحون": "2 Surveyors",
        "رفع مقاسات دقيق بالموقع": "Accurate On-Site Dimensioning",
        "3 مشرفو إنتاج": "3 Production Supervisors",
        "إشراف ميداني وتصنيع": "Field Supervision & Manufacturing",
        "من مشاريعنا": "Our Projects",
        "بصمتنا في كبرى المشاريع العمرانية بالمملكة": "Our Stamp in Major KSA Urban Projects",
        "اعتمادات حكومية وتنفيذ أحدث الواجهات المعمارية لكبرى الوجهات السكنية والتجارية": "Government approvals and modern architectural facade execution for major projects",
        "🏆 مشروع سكني عملاق": "🏆 Major Residential Project",
        "المشرقية (NHC)": "Al-Mashraqia (NHC)",
        "أعمال ألمنيوم وواجهات معمارية لمشروع سكني ضخم بتشطيبات راقية.": "Aluminum works and architectural facades for a massive residential project.",
        "🏢 مجمع معماري راقي": "🏢 Luxury Architectural Complex",
        "سرايا البدر": "Saraya Al-Badr",
        "توريد وتنفيذ أبواب ونوافذ ألمنيوم عالية العزل وأعمال زجاج متكاملة.": "Supply and installation of high-insulation aluminum doors, windows, and glass works.",
        "✨ تطوير عقاري معتمد": "✨ Certified Real Estate Development",
        "سدرا 2": "Sedra 2",
        "أنظمة ألمنيوم حديثة وأبواب WPC مقاومة للرطوبة والماء بأعلى الممارسات.": "Modern aluminum systems and moisture-resistant WPC doors.",
        "معرض الأعمال التنفيذية": "Portfolio Showcase",
        "نماذج حية من جودة التصنيع والتركيب الميداني بمشاريعنا": "Live Showcase of Our Quality Manufacturing & Field Installation",
        "معرض صور واقعي من مواقع العمل والمصنع يستعرض إتقان اللمسات النهائية وتنوع المنتجات": "Real-world portfolio showcasing precision craftsmanship and product variety",
        "✨ جميع الأعمال": "✨ All Works",
        "🚪 أبواب WPC ومصفحة": "🚪 WPC & Armor Doors",
        "🍳 مطابخ وخزائن": "🍳 Kitchens & Cabinets",
        "⚙️ حديد وألمنيوم": "⚙️ Metal & Aluminum",
        "WPC": "WPC",
        "حديد": "Steel",
        "ألمنيوم": "Aluminum",
        "مطابخ": "Kitchens",
        "مصفح": "Armored",
        "أمان": "Security",
        "ميداني": "Field",
        "أبواب WPC خشبية عصرية": "Modern WPC Wooden Doors",
        "تشطيب خشبي مقاوم للرطوبة والماء": "Water & Moisture Resistant Wood Finish",
        "مشغولات حديد ليزر": "Precision Laser Cut Steelwork",
        "أبواب ليزر بتصاميم حديثة وبدهان حراري": "Modern Laser Doors with Powder Coating",
        "خزائن وتشطيبات ألمنيوم": "Aluminum Cabinets & Finishes",
        "حلول تخزين عصرية مقاومة للماء والحرارة": "Modern Water & Heat Resistant Storage",
        "أبواب داخلية راقية": "Luxury Interior Doors",
        "أبواب WPC جاهزة للتركيب بأعلى متانة": "High-Durability Ready WPC Doors",
        "مطابخ ألمنيوم حديثة": "Modern Aluminum Kitchens",
        "تصاميم مطابخ متكاملة بإكسسوارات إيطالية": "Integrated Kitchens with Italian Hardware",
        "أبواب مصفحة عالية الأمان": "High-Security Armored Doors",
        "أبواب أمان مصفحة بتصاميم تركية راقية": "Armored Safety Doors with Turkish Designs",
        "أبواب أمان معدنية معتمدة": "Certified Metal Safety Doors",
        "أنظمة إغلاق متعددة النقاط لحماية الفلل": "Multi-Point Locking Systems for Villas",
        "تركيبات وحلول ميدانية": "Field Installation & Solutions",
        "إشراف فني وفرق تركيب بالموقع لضمان الإتقان": "Technical Supervision & Field Installation Teams",
        "جودة تدوم .. وإتقان يصنع التميز": "Lasting Quality .. Craftsmanship Creating Excellence",
        "أرسل مقاسات مشروعك أو صورة التصميم على واتساب وسيصلك عرض سعر مفصّل من فريقنا الهندسي.": "Send your project measurements or design photo via WhatsApp to receive a detailed quote.",
        "تواصل معنا الآن — 0581892365": "Contact Us Now — 0581892365",
        "مصنع متكامل في الرياض متخصص في أعمال الألمنيوم وأبواب WPC والزجاج والحديد والاستانلس ستيل، أحد كيانات مؤسسة أبراج البريق للمقاولات.": "An integrated factory in Riyadh specializing in aluminum, WPC doors, glass, steel, and stainless steel, a subsidiary of Abraj Al-Bariq Contracting.",
        "شركة إبداع الوفاء للصناعات المعدنية — مصنع متكامل في الرياض لتصنيع وتوريد أبواب WPC، أنظمة الألمنيوم والزجاج، والمشغولات الحديدية بمواصفات هندسية عالية.": "Ebdaa Al-Wafa Metal Industries — Integrated factory in Riyadh for WPC doors, aluminum, glass, and steel fabrication.",
        "روابط سريعة": "Quick Links",
        "خدماتنا الرئيسية": "Main Services",
        "بيانات التواصل": "Contact Information",
        "أبواب WPC خشبية": "WPC Wooden Doors",
        "أنظمة ألمنيوم وزجاج": "Aluminum & Glass Systems",
        "أبواب مصفحة وأمان": "Armored & Security Doors",
        "مشغولات حديد ليزر": "Laser Steelwork",
        "العنوان: الرياض - حي السلي - شارع اسطنبول": "Address: Riyadh - Al-Sulay - Istanbul St.",
        "المبيعات: 0592923242 / 0569863397": "Sales: 0592923242 / 0569863397",
        "✨ الكيانات المعتمدة لمؤسسة أبراج البريق": "✨ Certified Entities of Abraj Al-Bariq",
        "نبذة عن شركة إبداع الوفاء للصناعات المعدنية": "About Ebdaa Al-Wafa Metal Industries",
        "صرح صناعي متكامل بالرياض يمتلك خطوط تصنيع متطورة وكوادر هندسية معتمدة لكبرى المشاريع العمرانية بالمملكة.": "An integrated industrial facility in Riyadh with advanced production lines & certified engineers.",
        "عن إبداع الوفاء": "About Ebdaa Al-Wafa",
        "قصتنا وتأسيس المصنع بالرياض": "Our Story & Factory Establishment in Riyadh",
        "قصتنا": "Our Story",
        "نحن (شركة إبداع الوفاء للصناعات المعدنية) أحد الكيانات الجديدة لمؤسسة أبراج البريق للمقاولات الرائدة في أعمال الألمنيوم وأبواب WPC والزجاج والحديد والاستانلس ستيل، والتي امتلكت العديد من الاعتمادات والمشاريع العملاقة والحكومية.": "We are Ebdaa Al-Wafa Metal Industries, a subsidiary of Abraj Al-Bariq Contracting, leading in aluminum, WPC doors, glass, steel, and stainless steel.",
        "وقد تم إنشاء شركة إبداع الوفاء للصناعات المعدنية كفرع رئيسي ومتخصص في القيام بأعمال الألمنيوم وأبواب WPC بشكل أساسي، حرصًا منا على راحة عملائنا وتقديم خدمة أفضل لهم من خلال توفير عمالة متخصصة وماهرة.": "Ebdaa Al-Wafa was established as a main specialized branch for aluminum and WPC doors, ensuring customer comfort and superior service with skilled manpower.",
        "رؤيتنا": "Our Vision",
        "أن نصبح الشركة الرائدة في مجال الصناعات المعدنية في المملكة العربية السعودية ومنطقة الخليج، المعترف بها لخبرتنا وابتكارنا وخدمة العملاء الاستثنائية، ونسعى جاهدين لتحسين وتوسيع قدراتنا باستمرار لتلبية الاحتياجات المتطورة لعملائنا والبقاء في صدارة المنافسة.": "To become the leading metal industries company in Saudi Arabia & GCC, recognized for expertise, innovation, and exceptional service.",
        "رسالتنا": "Our Mission",
        "تقديم الخدمات التي ترقى فوق توقع العملاء، بما يوفر الأساس المتين لبناء علاقة طويلة الأمد معهم. نحن ملتزمون بنجاح عملائنا وشركائنا وموظفينا، ونؤمن باستخدام سنوات خبرتنا في إنتاج المشاريع من خلال التفاني في الجودة والالتزام بالنزاهة.": "Providing services exceeding customer expectations, establishing a strong foundation for long-term relationships through dedication to quality.",
        "مهمتنا": "Our Purpose",
        "تزويد عملائنا بأعلى قيمة للجودة والخدمة بسعر السوق التنافسي، وأن نكون واحدة من أكثر المؤسسات ثقةً في مجال الصناعات المعدنية بالمملكة، ومساعدة عملائنا في جعل أحلامهم حقيقة، وتلبية احتياجاتهم المتنوعة عبر شراكة في جميع مراحل العمل.": "Providing highest quality value & competitive prices, being one of KSA's most trusted metal industry institutions.",
        "قيمنا": "Our Values",
        "القيم الأساسية التي تشكل ممارساتنا": "Core Values Shaping Our Practices",
        "الجودة": "Quality",
        "نلتزم بتقديم خدمات عالية الجودة تلبي وتتجاوز توقعات عملائنا، وتركيزنا على الجودة يميزنا ويقود نجاحنا.": "We deliver high-quality services meeting and exceeding expectations, driving our success.",
        "النزاهة": "Integrity",
        "نمارس أعمالنا بأعلى مستوى من الأخلاق والصدق، ويثق عملاؤنا بأننا نعمل بنزاهة في جميع تعاملاتنا.": "We conduct business with highest ethics and honesty, building trust in all dealings.",
        "الابتكار": "Innovation",
        "نبحث دائمًا عن طرق جديدة وأفضل لخدمة عملائنا عبر تبني التقنيات الحديثة والحلول المتطورة.": "We continuously embrace modern technologies and advanced solutions to serve clients.",
        "✨ طاقات وخبرات موثوقة": "✨ Trusted Expertise & Workforce",
        "الموارد البشرية والعمالة الفنية بالمصنع": "Human Resources & Skilled Factory Workforce",
        "تم تجهيز المصنع بكل الطاقات البشرية المتميزة لتنفيذ أعمالكم حسب المهام والتخصصات الفنية وإنجازها حسب المواصفات والتوقيت المتفق عليه دائمًا.": "Our factory is equipped with top talent to execute projects per specifications and agreed timelines.",
        "5 مشرفو مواقع": "5 Site Supervisors",
        "متابعة وتسليم ميداني": "Field Follow-up & Delivery",
        "43 فنيون": "43 Technicians",
        "عمالة ماهرة وتصنيع": "Skilled Labor & Fabrication",
        "7 سائقون": "7 Drivers",
        "نقل وتوريد للمواقع": "Site Transport & Supply",
        "مساحة المصنع بالسلي": "Factory Area in Al-Sulay",
        "✨ حلول هندسية وصناعات معدنية متكاملة": "✨ Integrated Engineering & Metal Solutions",
        "خدماتنا التخصصية": "Our Specialized Services",
        "من التصميم وحتى التركيب الميداني بحرفية عالية — أنظمة الألمنيوم والواجهات، أبواب WPC، الزجاج، الحديد، والاستانلس ستيل.": "From design to field installation with high craftsmanship — Aluminum, WPC doors, glass, steel, and stainless steel.",
        "خدمة تخصصية": "Specialized Service",
        "نوافذ ألمنيوم": "Aluminum Windows",
        "أبواب ألمنيوم": "Aluminum Doors",
        "أنظمة سحب ومفصلي": "Sliding & Hinged Systems",
        "مقاطع معزولة حراريًا": "Thermally Insulated Profiles",
        "اطلب عرض سعر": "Request Quote",
        "أبواب داخلية راقية": "Luxury Interior Doors",
        "مقاومة كاملة للرطوبة والماء": "Complete Water & Moisture Resistance",
        "تشطيبات خشبية متعددة": "Multiple Wood Finishes",
        "تصاميم مخصصة للمشاريع": "Custom Project Designs",
        "واجهات كيرتن وول": "Curtain Wall Facades",
        "استركشر زجاجي": "Structural Glazing",
        "قواطع واسكاي لايت": "Partitions & Skylights",
        "زجاج مزدوج وسيكوريت": "Double Glazed & Tempered Glass",
        "درابزين ودرج استانلس": "Stainless Handrails & Stairs",
        "مظلات معمارية": "Architectural Canopies",
        "أعمال ديكور واستانلس": "Stainless & Decor Works",
        "تشكيلات خاصة ولحام نظيف": "Custom Fabrications & Clean Welds",
        "بوابات وأبواب ليزر": "Laser Gates & Doors",
        "مشغولات حديد فنية": "Artistic Steelwork",
        "هناجر ومظلات": "Hangers & Canopies",
        "دهان إلكتروستاتيك حراري": "Thermal Electrostatic Coating",
        "خزائن ملابس مخصصة": "Custom Clothing Cabinets",
        "قياسات ورفع ميداني": "On-site Measurements",
        "تنفيذ وتركيب متكامل": "Integrated Execution & Installation",
        "تميزنا المعماري": "Architectural Excellence",
        "✨ تميزنا المعماري والهندسي": "✨ Our Architectural & Engineering Excellence",
        "لماذا إبداع الوفاء في تنفيذ خدماتك؟": "Why Choose Ebdaa Al-Wafa for Your Services?",
        "رفع مقاسات ميداني مجاني داخل الرياض": "Free on-site measurements in Riyadh",
        "مقاطع ألمنيوم أصلية بعزل حراري وصوتي": "Original aluminum profiles with thermal & acoustic insulation",
        "زجاج مزدوج وسيكوريت بمعايير أمان عالية": "Double-glazed & tempered safety glass",
        "دهان إلكتروستاتيك بتشطيبات وألوان متعددة": "Electrostatic powder coating in various colors & finishes",
        "توريد وتركيب للمشاريع السكنية والتجارية والحكومية": "Supply & installation for residential, commercial & government projects",
        "ضمان على التصنيع والتركيب وخدمة ما بعد البيع": "Warranty on manufacturing, installation & after-sales service",
        "✨ سِجلّ الإنجازات والوجهات المعمارية": "✨ Record of Architectural Achievements",
        "معرض مشاريعنا التنفيذية": "Our Executive Projects Gallery",
        "بصمتنا في كبرى المشاريع العمرانية بالمملكة — تنفيذ أنظمة الألمنيوم والواجهات وأبواب WPC لكبرى الوجهات الحكومية والسكنية والتجارية.": "Our stamp in major KSA urban projects — executing aluminum, facades, and WPC doors.",
        "نفّذ مشروعك معنا — تواصل واتساب": "Execute Your Project With Us — WhatsApp",
        "✨ التوثيق والاعتمادات الرسمية بالمملكة": "✨ Official Documentation & KSA Accreditation",
        "الشهادات والاعتمادات الحكومية": "Certificates & Government Accreditations",
        "منشأة صناعية نظامية معتمدة وموثقة لدى كافة الجهات والهيئات الحكومية في المملكة العربية السعودية.": "A registered industrial facility certified and documented with all KSA government authorities.",
        "منشأة معتمدة وموثقة": "Certified & Documented Facility",
        "السجلات والتراخيص الرسمية للشركة": "Official Records & Licenses of Company",
        "اعتمادات حكومية وسجلات سارية تضمن الموثوقية والالتزام الكامل في التنفيذ": "Government approvals and valid records ensuring reliability and commitment.",
        "السجل التجاري": "Commercial Registration",
        "وزارة التجارة": "Ministry of Commerce",
        "الرقم الموحد": "Unified ID Number",
        "الرقم الضريبي (TIN)": "Tax Identification Number (TIN)",
        "هيئة الزكاة والضريبة والجمارك": "ZATCA",
        "عضوية الغرفة التجارية": "Commercial Chamber Membership",
        "غرفة الرياض": "Riyadh Chamber",
        "شهادة التأمينات الاجتماعية": "Social Insurance Certificate",
        "سارية": "Active & Valid",
        "GOSI - المؤسسة العامة للتأمينات": "GOSI",
        "شهادة التوطين - قوى": "Saudization Certificate - Qiwa",
        "قوى - وزارة الموارد البشرية": "Qiwa - Ministry of Human Resources",
        "توثيق البيانات الرسمية": "Official Data Documentation",
        "بيانات المنشأة وتأكيد الهوية الرسمية": "Facility Data & Official Identity",
        "العنوان": "Address",
        "مساحة المصنع": "Factory Area",
        "1200 متر مربع": "1200 m²",
        "الهواتف": "Phone Numbers",
        "البريد الإلكتروني": "Email",
        "✨ معتمد وموثق": "✨ Certified & Documented",
        "✨ ساري ومسجل": "✨ Active & Registered",
        "✨ معتمد ضريبيًا": "✨ Tax Certified",
        "✨ عضوية نشطة": "✨ Active Membership",
        "✨ شهادة سارية": "✨ Valid Certificate",
        "✨ نطاق مرتفع": "✨ High Platinum Tier",
        "✨ التواصل المباشر وخدمة العملاء": "✨ Direct Contact & Customer Service",
        "تواصل معنا واستلم عرض السعر": "Contact Us & Get Your Quote",
        "فريقنا الهندسي المتخصص جاهز للرد على استفساراتك وتقديم عرض سعر مفصل لمشروعك خلال وقت قياسي.": "Our engineering team is ready to respond to your inquiries and provide a detailed quote in record time.",
        "استفسار مخصص": "Custom Inquiry",
        "أرسل طلبك عبر الواتساب المباشر": "Send Your Request via Direct WhatsApp",
        "املأ البيانات وسيتم تحويلك إلى محادثة واتساب فورية مع الرسالة المنسقة جاهزة للإرسال.": "Fill in the details to launch a WhatsApp chat with formatted request text.",
        "الاسم الكريم": "Full Name",
        "رقم الجوال": "Mobile Number",
        "أدخل اسمك الكريم": "Enter your full name",
        "الخدمة المطلوبة": "Requested Service",
        "أعمال الألمنيوم": "Aluminum Works",
        "أبواب WPC": "WPC Doors",
        "الزجاج والواجهات": "Glass & Facades",
        "الاستانلس ستيل": "Stainless Steel",
        "أعمال الحديد": "Steel Works",
        "مطابخ وخزائن": "Kitchens & Cabinets",
        "تفاصيل المشروع": "Project Details",
        "المقاسات، الموقع، التفاصيل الفنية المطلوب تنفيذها...": "Dimensions, location, technical specs...",
        "إرسال عبر واتساب 0581892365": "Send via WhatsApp 0581892365",
        "وسائل التواصل الرسمية": "Official Contact Channels",
        "بيانات الاتصال والموقع": "Contact Info & Location",
        "واتساب المباشر": "Direct WhatsApp",
        "هواتف الإدارة والمبيعات": "Management & Sales Phones",
        "البريد الإلكتروني الرسمي": "Official Email",
        "موقع المصنع والإدارة": "Factory & Management Location",
        "جميع الحقوق محفوظة": "All Rights Reserved",
        "شركة إبداع الوفاء للصناعات المعدنية": "Ebdaa Al-Wafa Metal Industries",
        "0581892365 — تواصل واتساب": "0581892365 — WhatsApp Contact"
      }
    };

    /* Build reverse map for Arabic */
    translations.ar = {};
    for (var arKey in translations.en) {
      var enVal = translations.en[arKey];
      translations.ar[enVal] = arKey;
    }

    /* Arabic is strictly default language unless saved otherwise in localStorage */
    var currentLang = localStorage.getItem("site_lang") || "ar";

    var normalizeText = function (str) {
      return str ? str.replace(/\s+/g, " ").trim() : "";
    };

    var setLanguage = function (lang) {
      currentLang = lang;
      localStorage.setItem("site_lang", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "en" ? "ltr" : "rtl";

      var langText = langBtn.querySelector(".lang-text");
      if (langText) {
        langText.textContent = lang === "en" ? "AR" : "EN";
      }

      /* Translate all text elements in DOM */
      var targetElements = document.querySelectorAll(
        "a, p, h1, h2, h3, h4, h5, h6, span, button, li, label, option, input, textarea, .prose-sm, .section-title, .section-desc, .footer-about, .footer-slogan, .stat-value, .stat-label, .stats-badge, .stats-title, .gallery-card-info h4, .gallery-card-info p, .cta h2, .cta p, .footer-col h3, .footer-col p, .footer-col a, .footer-links a, .footer-contact span, .footer-bottom, .wa-fab .label, .marquee-track span, .pillar h2, .pillar p, .project-tag, .gallery-tag, .service-tag, .service-card h3, .service-card p"
      );

      targetElements.forEach(function (el) {
        if (el.classList.contains("lang-text") || el.closest("#lang-toggle")) return;

        /* Translate placeholders for inputs & textareas */
        if (el.placeholder) {
          var cleanPlaceholder = normalizeText(el.placeholder);
          if (translations[lang] && translations[lang][cleanPlaceholder]) {
            el.placeholder = translations[lang][cleanPlaceholder];
          }
        }

        var text = "";
        for (var i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].nodeType === 3) {
            text += el.childNodes[i].textContent;
          }
        }
        var cleanText = normalizeText(text);
        if (!cleanText) cleanText = normalizeText(el.textContent);

        if (translations[lang] && translations[lang][cleanText]) {
          var replaced = false;
          for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3 && normalizeText(el.childNodes[j].textContent) === cleanText) {
              el.childNodes[j].textContent = translations[lang][cleanText];
              replaced = true;
              break;
            }
          }
          if (!replaced && el.children.length === 0) {
            el.textContent = translations[lang][cleanText];
          }
        }
      });
    };

    /* Inject luxury page loader if not present */
    var pageLoader = document.getElementById("page-loader");
    if (!pageLoader) {
      pageLoader = document.createElement("div");
      pageLoader.id = "page-loader";
      pageLoader.className = "page-loader";
      pageLoader.innerHTML = '<div class="loader-spinner-box"><div class="loader-spinner"></div><span class="loader-logo-text">إبداع الوفاء للصناعات المعدنية</span></div>';
      document.body.appendChild(pageLoader);
    }

    var triggerLoader = function (callback) {
      if (!pageLoader) return callback && callback();
      pageLoader.classList.add("is-active");
      setTimeout(function () {
        if (callback) callback();
        setTimeout(function () {
          pageLoader.classList.remove("is-active");
        }, 200);
      }, 300);
    };

    /* apply saved lang on page load if en */
    if (currentLang === "en") {
      setLanguage("en");
    } else {
      setLanguage("ar");
    }

    langBtn.addEventListener("click", function () {
      var nextLang = currentLang === "ar" ? "en" : "ar";
      triggerLoader(function () {
        setLanguage(nextLang);
      });
    });
  }

  /* WhatsApp Contact Form Submission Handler */
  var waForm = document.getElementById("wa-form");
  if (waForm) {
    waForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
      var phoneVal = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
      var serviceVal = document.getElementById("service") ? document.getElementById("service").value.trim() : "";
      var noteVal = document.getElementById("note") ? document.getElementById("note").value.trim() : "";

      var targetNumber = waForm.getAttribute("data-intl") || "966581892365";

      var message = "السلام عليكم ورحمة الله وبركاته،\n" +
        "أود طلب عرض سعر من شركة إبداع الوفاء للصناعات المعدنية:\n\n" +
        "👤 *الاسم:* " + (nameVal || "غير محدد") + "\n" +
        "📱 *رقم الجوال:* " + (phoneVal || "غير محدد") + "\n" +
        "🛠️ *الخدمة المطلوبة:* " + (serviceVal || "غير محدد") + "\n";

      if (noteVal) {
        message += "📝 *تفاصيل المشروع:* " + noteVal + "\n";
      }

      message += "\nشاكر ومقدر لكم المتابعة.";

      var encodedMsg = encodeURIComponent(message);
      var waUrl = "https://wa.me/" + targetNumber + "?text=" + encodedMsg;
      window.open(waUrl, "_blank");
    });
  }
})();
