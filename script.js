document.addEventListener("DOMContentLoaded", () => {
    // 0. Cover Page & Background Music Logic
    const btnOpen = document.getElementById('btn-open');
    const coverPage = document.getElementById('cover-page');
    const bgMusic = document.getElementById('bg-music');

    /* --- Notifikasi Salin --- */
    const toast = document.getElementById('toast');
    function showToast(message) {
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    // Make global for inline onclick
    window.showToast = showToast;

    /* --- Gallery Carousel --- */
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-dots');
    const dots = Array.from(dotsNav.children);

    let currentSlideIndex = 0;

    const updateCarousel = (index) => {
        // Geser track ke slide yang sesuai
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update class active pada dot indicator
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');

        // Update variable current index
        currentSlideIndex = index;
    };

    // Klik tombol Next
    nextButton.addEventListener('click', () => {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) {
            nextIndex = 0; // Balik ke awal kalau sudah mentok
        }
        updateCarousel(nextIndex);
    });

    // Klik tombol Prev
    prevButton.addEventListener('click', () => {
        let prevIndex = currentSlideIndex - 1;
        if (prevIndex < 0) {
            prevIndex = slides.length - 1; // Ke gambar terakhir kalau di awal
        }
        updateCarousel(prevIndex);
    });

    // Fungsi untuk dipakai di attribut `onclick` di HTML
    window.currentSlide = (index) => {
        updateCarousel(index);
    };

    btnOpen.addEventListener('click', () => {
        // Hilangkan cover page
        coverPage.classList.add('hidden');

        // Kembalikan fungsi scroll pada halaman
        document.body.style.overflow = 'auto';

        // Mainkan background music (lagu)
        bgMusic.play().catch(error => {
            console.log("Autoplay background music ditahan oleh browser. Pengguna harus berinteraksi dengan dokumen terlebih dahulu.", error);
        });
    });

    // 1. Intersection Observer untuk Animasi Scroll (Fade In)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animasi berjalan sekali saja
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-fade').forEach(section => {
        observer.observe(section);
    });

    // 2. Countdown Timer (Hitung Mundur)
    // Atur tanggal pernikahan di sini!
    const targetDate = new Date("Mar 06, 2027 08:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<h2>Acara Telah Berlangsung</h2>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    };

    // Update pertama kali, kemudian set setiap 1 detik
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 3. Form RSVP & Menampilkan Pesan
    const rsvpForm = document.getElementById('rsvp-form');
    const messagesContainer = document.getElementById('messages-container');
    const messageList = document.getElementById('message-list');

    // Simpanan data sementara
    let messages = [];

    // Fungsi Render Pesan 
    const renderMessages = () => {
        if (messages.length === 0) {
            messagesContainer.classList.add('hidden');
            return;
        }
        messagesContainer.classList.remove('hidden');
        messageList.innerHTML = '';

        messages.slice().reverse().forEach(msg => {
            const statusBadge = msg.attendance === 'yes'
                ? '<span class="badge hadir">Hadir</span>'
                : '<span class="badge absen">Tidak Hadir</span>';

            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-item';
            msgDiv.innerHTML = `
                <h4>${msg.name}</h4>
                ${statusBadge}
                <p>"${msg.message}"</p>
            `;
            messageList.appendChild(msgDiv);
        });
    };

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        // Tampilkan notifikasi konfirmasi sederhana
        const statusHadir = attendance === 'yes' ? 'Hadir 🎉' : 'Tidak Hadir 🙏';
        alert(`Terima kasih, ${name} atas konfirmasinya!\n\nStatus: ${statusHadir}`);

        if (message.trim() !== '') {
            // Tambahkan ke Array
            messages.push({
                name, attendance, message
            });
            renderMessages();
        }

        // Reset formulir
        rsvpForm.reset();
    });

    // Panggil render awal
    renderMessages();
});

// Copy to Clipboard (Global Scope)
window.copyToClipboard = function (elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Nomor rekening berhasil disalin!');
    }).catch(err => {
        console.error('Gagal menyalin text: ', err);
    });
};
