// ==========================================
// 1. MOBILE MENU (HAMBURGER)
// ==========================================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));
}

// ==========================================
// 2. DYNAMIC NAVBAR SCROLL EFFECT (iOS Style)
// ==========================================
const navbarObj = document.querySelector(".navbar");

if (navbarObj) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            // Saat di-scroll ke bawah, navbar mengecil sedikit dan makin blur
            navbarObj.style.padding = "0.5rem 2rem";
            navbarObj.style.width = "85%";
            navbarObj.style.background = "rgba(0, 41, 97, 0.75)"; 
        } else {
            // Saat kembali ke atas layar
            navbarObj.style.padding = "0.8rem 2rem";
            navbarObj.style.width = "90%";
            navbarObj.style.background = "rgba(0, 41, 97, 0.55)";
        }
    });
}

// ==========================================
// 3. IMAGE SLIDESHOW DENGAN AUTOPLAY (Jika Ada)
// ==========================================
let slideIndex = 1;
let slideTimer;
const slidesContainer = document.getElementsByClassName("mySlides");

if (slidesContainer.length > 0) {
    showSlides(slideIndex);
    // Jalankan autoplay setiap 5 detik
    slideTimer = setInterval(() => plusSlides(1), 5000); 
}

function plusSlides(n) {
    clearInterval(slideTimer); // Hentikan timer saat user klik manual
    showSlides(slideIndex += n);
    // Mulai lagi timernya
    slideTimer = setInterval(() => plusSlides(1), 5000);
}

function currentSlide(n) {
    clearInterval(slideTimer);
    showSlides(slideIndex = n);
    slideTimer = setInterval(() => plusSlides(1), 5000);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].classList.remove("fade");
    }
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex - 1].style.display = "block";
    
    // Paksa reflow agar animasi fade bisa di-trigger ulang
    void slides[slideIndex - 1].offsetWidth; 
    
    slides[slideIndex - 1].classList.add("fade");
    
    if (dots.length > 0) {
        dots[slideIndex - 1].className += " active";
    }
}

// ==========================================
// 4. SCROLL REVEAL ANIMATIONS
// ==========================================
const revealOptions = {
    threshold: 0.1, // Animasi mulai saat 10% elemen terlihat
    rootMargin: "0px 0px -20px 0px"
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show-element");
            observer.unobserve(entry.target); // Hanya dianimasikan 1x
        }
    });
}, revealOptions);

const revealElements = document.querySelectorAll('.service-item, .portfolio-card, .about-agency-img, .about-agency-text, .hidden-element, .contact-grid');

revealElements.forEach((el) => {
    // scrollObserver observe elements
    scrollObserver.observe(el);
});

// ==========================================
// 🚀 5. COOL TOAST NOTIFICATION & AJAX FORM
// ==========================================
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const toastContainer = document.getElementById("toast-container");
const toast = document.getElementById("toast");
const toastIcon = document.querySelector(".toast-icon");
const toastMessage = document.getElementById("toast-message");

// Fungsi untuk memunculkan Toast
function showCoolToast(message, type = "success") {
    // Atur konten dan warna
    toastMessage.innerText = message;
    
    if (type === "success") {
        toast.className = "toast success";
        toastIcon.innerText = "✓";
    } else {
        toast.className = "toast error";
        toastIcon.innerText = "✕";
    }

    // Munculkan Toast
    toastContainer.classList.add("show");

    // Sembunyikan otomatis setelah 5 detik
    setTimeout(() => {
        toastContainer.classList.remove("show");
    }, 5000);
}

// Menangani pengiriman Form lewat AJAX (tanpa pindah halaman)
if (contactForm) {
    contactForm.addEventListener("submit", async function(event) {
        // Hentikan perilaku default form (pindah halaman)
        event.preventDefault(); 
        
        // Atur status tombol saat mengirim
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "wait";

        // Ambil data form
        const formData = new FormData(contactForm);

        // Kirim data ke Formspree menggunakan fetch (AJAX)
        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // JIKA SUKSES
                contactForm.reset(); // Kosongkan form
                
                // Kembalikan tombol ke normal
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";

                // Pemicu Toast Sukses yang Keren
                showCoolToast("Thank you! Message sent successfully. ✨");
            
            } else {
                // JIKA GAGAL DARI FORMSPREE
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    showCoolToast(data['errors'].map(error => error['message']).join(", "), "error");
                } else {
                    showCoolToast("Oops! There was a problem submitting your form.", "error");
                }
                
                // Kembalikan tombol ke normal
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
            }
        } catch (error) {
            // JIKA GAGAL JARINGAN
            showCoolToast("Oops! Network error. Please check your connection.", "error");
            
            // Kembalikan tombol ke normal
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
        }
    });
}