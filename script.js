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

    btnOpen.addEventListener('click', () => {
        coverPage.classList.add('hidden');
        document.body.style.overflow = 'auto';

        // Tampilkan floating nav
        floatingNav.classList.add('visible');

        // Mainkan musik
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

    // Sinkronisasi ikon dengan state musik
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
    // 2. GALLERY CAROUSEL
    // ============================================================
    const track     = document.querySelector('.carousel-track');
    const slides    = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav   = document.querySelector('.carousel-dots');
    const dots      = Array.from(dotsNav.children);

    let currentSlideIndex = 0;

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        currentSlideIndex = index;
    };

    nextButton.addEventListener('click', () => {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        updateCarousel(nextIndex);
    });

    prevButton.addEventListener('click', () => {
        let prevIndex = currentSlideIndex - 1;
        if (prevIndex < 0) prevIndex = slides.length - 1;
        updateCarousel(prevIndex);
    });

    window.currentSlide = (index) => updateCarousel(index);

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

        const nama      = document.getElementById('name').value.trim();
        const attendance = document.getElementById('attendance').value;
        const pesan     = document.getElementById('message').value.trim();
        const kehadiran = attendance === 'yes' ? 'Hadir' : 'Tidak Hadir';

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
        alert('Nomor rekening berhasil disalin! ✅');
    }).catch(err => console.error('Gagal menyalin:', err));
};