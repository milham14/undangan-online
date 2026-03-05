document.addEventListener("DOMContentLoaded", () => {
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
    const targetDate = new Date("Dec 12, 2026 08:00:00").getTime();

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

    // 3. Form RSVP Submit Handling
    const rsvpForm = document.getElementById('rsvp-form');
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        // Tampilkan notifikasi konfirmasi sederhana (Bisa diintegrasikan dengan WhatsApp / Google Form nantinya)
        const statusHadir = attendance === 'yes' ? 'Hadir 🎉' : 'Tidak Hadir 🙏';
        alert(`Terima kasih, ${name} atas konfirmasinya!\n\nStatus: ${statusHadir}\nPesan: ${message}`);
        
        // Reset formulir
        rsvpForm.reset();
    });
});
