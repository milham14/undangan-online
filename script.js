// ============================================================
// KONFIGURASI - URL Google Apps Script
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxro59mjsgdHmk03OrMhI2eghKGKbvq6qU7PtNiyXhFcXanPb1jVMVwh24H-Kq3_IErCw/exec';

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // 0. NAMA TAMU DARI URL PARAMETER
    // ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const namaParam = urlParams.get('tamu');

    const guestNameEl = document.querySelector('.guest-name');
    if (guestNameEl) {
        guestNameEl.textContent = namaParam ? decodeURIComponent(namaParam) : 'Tamu Undangan';
    }

    const nameInput = document.getElementById('name');
    if (nameInput && namaParam) {
        nameInput.value = decodeURIComponent(namaParam);
    }

    // ============================================================
    // 1. COVER PAGE & BACKGROUND MUSIC
    // ============================================================
    const btnOpen     = document.getElementById('btn-open');
    const coverPage   = document.getElementById('cover-page');
    const bgMusic     = document.getElementById('bg-music');
    const floatingNav = document.getElementById('floating-nav');
    const btnMusic    = document.getElementById('btn-music');

    const envelopeFlap   = document.getElementById('envelope-flap');
    const envelopeLetter = document.getElementById('envelope-letter');

    btnOpen.addEventListener('click', () => {
        coverPage.classList.add('hidden');
        document.body.style.overflow = 'auto';
        floatingNav.classList.add('visible');
        
        startParticles(); // Tetap jalankan kunang-kunang

        bgMusic.play().catch(err => {
            console.log("Autoplay ditahan browser:", err);
        });
    });

    // --- Toggle Musik ---
    btnMusic.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
        } else {
            bgMusic.pause();
        }
    });

    bgMusic.addEventListener('play', () => {
        btnMusic.querySelector('.nav-icon').textContent = '⏸️';
        btnMusic.classList.add('playing');
        btnMusic.title = 'Pause Musik';
    });

    bgMusic.addEventListener('pause', () => {
        btnMusic.querySelector('.nav-icon').textContent = '🎵';
        btnMusic.classList.remove('playing');
        btnMusic.title = 'Play Musik';
    });

    // ============================================================
    // 2. GALLERY CAROUSEL + AUTO SLIDE
    // ============================================================
    const track      = document.querySelector('.carousel-track');
    const slides     = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav    = document.querySelector('.carousel-dots');
    const dots       = Array.from(dotsNav.children);

    let currentSlideIndex = 0;
    let autoSlideTimer    = null;
    const AUTO_SLIDE_DELAY = 3000; // Ganti angka (ms) untuk ubah kecepatan, 3000 = 3 detik

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        currentSlideIndex = index;
    };

    const nextSlide = () => {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        updateCarousel(nextIndex);
    };

    // Mulai auto slide
    const startAutoSlide = () => {
        stopAutoSlide(); // Hindari duplikat timer
        autoSlideTimer = setInterval(nextSlide, AUTO_SLIDE_DELAY);
    };

    // Hentikan auto slide
    const stopAutoSlide = () => {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    };

    // Klik next: geser manual, reset timer auto
    nextButton.addEventListener('click', () => {
        nextSlide();
        startAutoSlide(); // Reset timer agar tidak langsung lompat lagi
    });

    // Klik prev: geser manual, reset timer auto
    prevButton.addEventListener('click', () => {
        let prevIndex = currentSlideIndex - 1;
        if (prevIndex < 0) prevIndex = slides.length - 1;
        updateCarousel(prevIndex);
        startAutoSlide();
    });

    // Klik dot: geser manual, reset timer auto
    window.currentSlide = (index) => {
        updateCarousel(index);
        startAutoSlide();
    };

    // Pause auto slide saat user hover/touch carousel
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
    carouselContainer.addEventListener('touchstart', stopAutoSlide, { passive: true });
    carouselContainer.addEventListener('touchend', startAutoSlide, { passive: true });

    // Mulai auto slide saat halaman dibuka
    startAutoSlide();

    // ============================================================
    // 3. COUNTDOWN TIMER
    // ============================================================
    const targetDate = new Date("Mar 06, 2027 08:00:00").getTime();

    const updateCountdown = () => {
        const now      = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<h2>Acara Telah Berlangsung</h2>";
            return;
        }

        const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText    = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText   = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ============================================================
    // 4. FORM RSVP → KIRIM KE GOOGLE SHEETS
    // ============================================================
    const rsvpForm          = document.getElementById('rsvp-form');
    const messagesContainer = document.getElementById('messages-container');
    const messageList       = document.getElementById('message-list');
    const submitBtn         = rsvpForm.querySelector('button[type="submit"]');

    const renderMessages = (messages) => {
        const filtered = (messages || []).filter(msg => msg.pesan && msg.pesan.trim() !== '');
        if (filtered.length === 0) {
            messagesContainer.classList.add('hidden');
            return;
        }

        messagesContainer.classList.remove('hidden');
        messageList.innerHTML = '';

        filtered.slice().reverse().forEach(msg => {
            const statusBadge = msg.kehadiran === 'Hadir'
                ? '<span class="badge hadir">Hadir 🎉</span>'
                : '<span class="badge absen">Tidak Hadir 🙏</span>';

            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-item';
            msgDiv.innerHTML = `
                <h4>${msg.nama}</h4>
                ${statusBadge}
                <p>"${msg.pesan}"</p>
            `;
            messageList.appendChild(msgDiv);
        });
    };

    const loadMessages = async () => {
        try {
            const res  = await fetch(`${APPS_SCRIPT_URL}?action=getMessages`);
            const data = await res.json();
            if (data.status === 'success') renderMessages(data.messages);
        } catch (err) {
            console.error('Gagal memuat pesan:', err);
        }
    };

    loadMessages();

    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nama       = document.getElementById('name').value.trim();
        const attendance = document.getElementById('attendance').value;
        const pesan      = document.getElementById('message').value.trim();
        const kehadiran  = attendance === 'yes' ? 'Hadir' : 'Tidak Hadir';

        if (!nama || !attendance) {
            alert('Mohon isi nama dan konfirmasi kehadiran.');
            return;
        }

        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled    = true;

        try {
            await fetch(APPS_SCRIPT_URL, {
                method : 'POST',
                mode   : 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ nama, kehadiran, pesan })
            });

            alert(`Terima kasih, ${nama}! 🎉\nKonfirmasi kehadiranmu sudah kami terima.`);
            setTimeout(() => loadMessages(), 1500);

        } catch (err) {
            alert('Terjadi kesalahan saat mengirim. Coba lagi ya.');
            console.error(err);
        } finally {
            submitBtn.textContent = 'Kirim Konfirmasi';
            submitBtn.disabled    = false;
        }

        rsvpForm.reset();
        if (nameInput && namaParam) {
            nameInput.value = decodeURIComponent(namaParam);
        }
    });

    // ============================================================
    // 5. INTERSECTION OBSERVER (Animasi Scroll)
    // ============================================================
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    document.querySelectorAll('.section-fade').forEach(section => {
        observer.observe(section);
    });
});

// ============================================================
// SCROLL KE SECTION (Global)
// ============================================================
window.scrollToSection = function(selector) {
    const el = selector === 'header'
        ? document.querySelector('header')
        : document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ============================================================
// COPY TO CLIPBOARD (Global)
// ============================================================
window.copyToClipboard = function(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Teks berhasil disalin! ✅');
    }).catch(err => console.error('Gagal menyalin:', err));
};

// ============================================================
// OPEN GIFT TAB (Global)
// ============================================================
window.openGiftTab = function(tabId) {
    const giftContainer = document.getElementById('gift-card-content');
    const tabCashless   = document.getElementById('tab-cashless');
    const tabPhysical   = document.getElementById('tab-physical');
    const btnCashless   = document.getElementById('tab-btn-cashless');
    const btnPhysical   = document.getElementById('tab-btn-physical');
    
    // Cek apakah tab yang sedang aktif kembali diklik (matikan/toggle)
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    if (activeBtn.classList.contains('active')) {
        activeBtn.classList.remove('active');
        giftContainer.style.display = 'none';
        return; // Hentikan fungsi
    }
    
    // Tampilkan container induk jika sebelumnya tersembunyi
    giftContainer.style.display = 'block';

    // Reset status aktif
    tabCashless.style.display = 'none';
    tabPhysical.style.display = 'none';
    btnCashless.classList.remove('active');
    btnPhysical.classList.remove('active');
    
    // Aktifkan tab yang dipilih
    if (tabId === 'cashless') {
        tabCashless.style.display = 'block';
        btnCashless.classList.add('active');
    } else {
        tabPhysical.style.display = 'block';
        btnPhysical.classList.add('active');
    }
};

// ============================================================
// 6. PARALLAX & PARTICLES LIGHT (Premium Upgrades)
// ============================================================

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    
    // Parallax hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    // Parallax watermark
    document.querySelectorAll('.bg-watermark').forEach(watermark => {
        const speed = watermark.getAttribute('data-speed') || 0.1;
        // Watermark punya base -50% translateX, jadi kita tambahkan Y
        watermark.style.transform = `translateX(-50%) translateY(${scrolled * speed}px)`;
    });
});

// Particle Dust Generator
let particleInterval = null;

function startParticles() {
    if (particleInterval) return;
    
    const container = document.body;
    
    particleInterval = setInterval(() => {
        const particle = document.createElement('span');
        particle.classList.add('particle-dust');
        
        // Ukuran partikel 3px - 8px
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posisi X Start Acak
        const posX = Math.random() * window.innerWidth;
        particle.style.left = `${posX}px`;
        
        // Durasi melayang ke atas
        const duration = Math.random() * 8 + 5;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
        
        // Destroy node on end
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
        
    }, 500); // Tiap setengah detik buat satu titik partikel
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
      clearInterval(particleInterval);
      particleInterval = null;
  } else {
      const coverPage = document.getElementById('cover-page');
      if (coverPage && coverPage.classList.contains('hidden')) {
          startParticles();
      }
  }
});