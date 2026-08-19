/**
 * AMISTAD - Friendship Portal & Calculator
 * Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundCanvas();
    initCalculator();
    initFortuneCookie();
    initStickyWall();
    initNavigation();
});

/* ==========================================================================
   1. Minimal Gentle Background Floating Hearts & Balloons Canvas
   ========================================================================== */
function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle pool (Keep count minimal as requested: max 18 total)
    const particleCount = 18;
    const particles = [];

    // Pinkish and reddish color palettes
    const heartColors = [
        'rgba(244, 114, 182, 0.45)', // soft pink
        'rgba(236, 72, 153, 0.4)',  // magenta
        'rgba(244, 63, 94, 0.38)',   // rose red
        'rgba(192, 132, 252, 0.35)', // lavender
        'rgba(251, 113, 133, 0.4)'   // warm blush
    ];

    class FloatingItem {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 30;
            this.size = Math.random() * 12 + 10; // 10px to 22px
            this.speedY = Math.random() * 0.55 + 0.35; // gentle upward drift
            this.sway = Math.random() * 2 * Math.PI;
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayDistance = Math.random() * 1.2 + 0.5;
            this.type = Math.random() > 0.4 ? 'heart' : 'balloon';
            this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            this.rotation = (Math.random() - 0.5) * 0.3;
            this.alpha = Math.random() * 0.35 + 0.25;
        }

        update() {
            this.y -= this.speedY;
            this.sway += this.swaySpeed;
            this.x += Math.sin(this.sway) * this.swayDistance;

            if (this.y < -40) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation + Math.sin(this.sway) * 0.08);
            ctx.fillStyle = this.color;

            if (this.type === 'heart') {
                this.drawHeart(ctx, this.size);
            } else {
                this.drawBalloon(ctx, this.size);
            }

            ctx.restore();
        }

        drawHeart(ctx, s) {
            const h = s / 2;
            ctx.beginPath();
            ctx.moveTo(0, h * 0.3);
            ctx.bezierCurveTo(-h * 0.9, -h * 0.6, -h * 1.4, h * 0.4, 0, h * 1.5);
            ctx.bezierCurveTo(h * 1.4, h * 0.4, h * 0.9, -h * 0.6, 0, h * 0.3);
            ctx.fill();
        }

        drawBalloon(ctx, s) {
            // Balloon body (oval)
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.6, s * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Balloon knot
            ctx.beginPath();
            ctx.moveTo(-s * 0.15, s * 0.8);
            ctx.lineTo(s * 0.15, s * 0.8);
            ctx.lineTo(0, s * 0.95);
            ctx.closePath();
            ctx.fill();

            // Balloon string
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.moveTo(0, s * 0.95);
            ctx.quadraticCurveTo(s * 0.2, s * 1.4, 0, s * 1.9);
            ctx.stroke();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new FloatingItem());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. Friendship Calculator Logic
   ========================================================================== */
function initCalculator() {
    const form = document.getElementById('friendship-form');
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const vibeChips = document.querySelectorAll('.vibe-chip');
    const calcLoading = document.getElementById('calc-loading');
    const calcResult = document.getElementById('calc-result');
    const progressFill = document.getElementById('progress-fill');
    const loadingMsg = document.getElementById('loading-msg');
    
    // Result elements
    const resScore = document.getElementById('result-score');
    const resBadge = document.getElementById('result-badge');
    const resName1 = document.getElementById('res-name1');
    const resName2 = document.getElementById('res-name2');
    const resArchetype = document.getElementById('res-archetype');
    const resSummary = document.getElementById('res-summary');
    const scoreCircleBar = document.getElementById('score-circle-bar');

    // Metrics
    const mTrust = document.getElementById('m-trust');
    const barTrust = document.getElementById('bar-trust');
    const mLaugh = document.getElementById('m-laugh');
    const barLaugh = document.getElementById('bar-laugh');
    const mTelepathy = document.getElementById('m-telepathy');
    const barTelepathy = document.getElementById('bar-telepathy');
    const mAdventure = document.getElementById('m-adventure');
    const barAdventure = document.getElementById('bar-adventure');

    const btnRecalculate = document.getElementById('btn-recalculate');
    const btnCopyResult = document.getElementById('btn-copy-result');

    let selectedVibe = 'crime';

    // Vibe chip selection
    vibeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            vibeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedVibe = chip.dataset.vibe;
        });
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const n1 = name1Input.value.trim();
        const n2 = name2Input.value.trim();

        if (!n1 || !n2) return;

        // Start Calculation UX Animation
        form.classList.add('hidden');
        calcResult.classList.add('hidden');
        calcLoading.classList.remove('hidden');

        let progress = 0;
        const messages = [
            'Analyzing cosmic wavelength...',
            'Calculating shared laughter quotient...',
            'Measuring telepathic wavelength...',
            'Summoning friendship stars... ✨'
        ];

        let msgIndex = 0;
        const interval = setInterval(() => {
            progress += 25;
            progressFill.style.width = `${progress}%`;
            if (msgIndex < messages.length) {
                loadingMsg.textContent = messages[msgIndex];
                msgIndex++;
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    calcLoading.classList.add('hidden');
                    displayResults(n1, n2, selectedVibe);
                }, 300);
            }
        }, 320);
    });

    function displayResults(n1, n2, vibe) {
        // Deterministic hash calculation for consistent heartwarming results (88% - 100%)
        const combined = `${n1.toLowerCase().trim()}_${n2.toLowerCase().trim()}`;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
        }
        const positiveHash = Math.abs(hash);

        // Core score between 91% and 100%
        const score = 90 + (positiveHash % 11); // 90 to 100
        const trust = 93 + (positiveHash % 8);
        const laugh = 92 + ((positiveHash >> 2) % 9);
        const telepathy = 89 + ((positiveHash >> 3) % 12);
        const adventure = 91 + ((positiveHash >> 4) % 10);

        const archetypes = {
            crime: {
                title: 'Partners in Cosmic Mischief 🕶️',
                badge: '🌟 Unstoppable Dynamic Duo! 🌟',
                summary: `When ${n1} and ${n2} combine forces, ordinary days turn into legendary adventures. You finish each other's sentences and always have each other's back!`
            },
            soul: {
                title: 'Soul Siblings & Safe Haven 🔮',
                badge: '✨ Rare Once-In-A-Lifetime Connection! ✨',
                summary: `${n1} and ${n2} share a quiet, profound understanding. No distance or time can fade the unspoken telepathy between your hearts.`
            },
            laughs: {
                title: '3 AM Laughter Legends 😂',
                badge: '💖 Certified Joy Amplifiers! 💖',
                summary: `Just one look between ${n1} and ${n2} is enough to trigger unstoppable giggles. Your friendship is pure sunshine and natural therapy.`
            },
            hype: {
                title: 'Ultimate Mutual Hype Squad 👑',
                badge: '🔥 Royalty-Tier Support System! 🔥',
                summary: `${n1} and ${n2} celebrate each other’s victories with unmatched energy. You are each other’s biggest fans, protector, and dream-builders.`
            }
        };

        const details = archetypes[vibe] || archetypes.crime;

        // Fill texts
        resName1.textContent = n1;
        resName2.textContent = n2;
        resBadge.textContent = details.badge;
        resArchetype.innerHTML = `<i class="fa-solid fa-crown"></i> <span>${details.title}</span>`;
        resSummary.textContent = details.summary;

        // Metric numbers
        mTrust.textContent = `${trust}%`;
        barTrust.style.width = `${trust}%`;

        mLaugh.textContent = `${laugh}%`;
        barLaugh.style.width = `${laugh}%`;

        mTelepathy.textContent = `${telepathy}%`;
        barTelepathy.style.width = `${telepathy}%`;

        mAdventure.textContent = `${adventure}%`;
        barAdventure.style.width = `${adventure}%`;

        // Animate counter
        animateCounter(resScore, score);

        // Animate SVG circle (circumference = 2 * PI * 70 ≈ 440)
        const circumference = 440;
        const offset = circumference - (score / 100) * circumference;
        scoreCircleBar.style.strokeDashoffset = offset;

        calcResult.classList.remove('hidden');

        // Confetti burst
        triggerConfetti();
    }

    function animateCounter(element, target) {
        let current = 0;
        const step = Math.ceil(target / 30);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, 25);
    }

    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ec4899', '#f472b6', '#a855f7', '#f43f5e', '#fbbf24', '#fbcfe8']
            });
        }
    }

    // Recalculate
    btnRecalculate.addEventListener('click', () => {
        calcResult.classList.add('hidden');
        form.classList.remove('hidden');
        name1Input.value = '';
        name2Input.value = '';
        name1Input.focus();
    });

    // Copy Certificate Badge
    btnCopyResult.addEventListener('click', () => {
        const n1 = resName1.textContent;
        const n2 = resName2.textContent;
        const score = resScore.textContent;
        const archetype = resArchetype.textContent.trim();

        const certificateText = `✨ AMISTAD OFFICIAL FRIENDSHIP CERTIFICATE ✨\n` +
            `🏆 Friends: ${n1} & ${n2}\n` +
            `💖 Cosmic Bond Score: ${score}%\n` +
            `👑 Archetype: ${archetype}\n` +
            `🌟 "Real friendship multiplies joy and divides sorrow!"\n` +
            `Tested on Amistad Friendship Portal 💖`;

        navigator.clipboard.writeText(certificateText).then(() => {
            showToast('Friendship Certificate copied to clipboard! 💖');
        }).catch(() => {
            showToast('Certificate copied! ✨');
        });
    });
}

/* ==========================================================================
   3. Fortune Cookie Randomizer
   ========================================================================== */
function initFortuneCookie() {
    const cookieBtn = document.getElementById('cookie-btn');
    const fortunePaper = document.getElementById('fortune-paper');
    const fortuneText = document.getElementById('fortune-text');
    const btnNext = document.getElementById('btn-next-fortune');
    const btnCopyFortune = document.getElementById('btn-copy-fortune');

    const affirmations = [
        "A true friend is someone who knows the song in your heart and can sing it back to you when you have forgotten the words.",
        "Your best friend considers you one of the brightest blessings in their life today.",
        "Good friends are like stars: you don't always see them, but you always know they're there.",
        "Send a random meme or voice note to your bestie today—it will bring an instant smile to their face!",
        "Life is better when you're laughing with someone who gets your weirdest sense of humor.",
        "A single conversation with your best friend can reset your entire week with peace and joy.",
        "True friends don't judge your awkward phases; they took photos and cherish you through them all.",
        "Your loyalty and warm heart make you the kind of friend anyone would be lucky to have forever."
    ];

    function crackCookie() {
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        fortuneText.textContent = `"${randomAffirmation}"`;
        cookieBtn.classList.add('hidden');
        fortunePaper.classList.remove('hidden');

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#f472b6', '#ec4899', '#fbcfe8']
            });
        }
    }

    cookieBtn.addEventListener('click', crackCookie);
    btnNext.addEventListener('click', () => {
        crackCookie();
    });

    btnCopyFortune.addEventListener('click', () => {
        navigator.clipboard.writeText(fortuneText.textContent).then(() => {
            showToast('Sweet note copied! Send it to your bestie 💌');
        });
    });
}

/* ==========================================================================
   4. Virtual Friendship Sticky Wall
   ========================================================================== */
function initStickyWall() {
    const form = document.getElementById('note-form');
    const noteAuthor = document.getElementById('note-author');
    const noteFrom = document.getElementById('note-from');
    const noteMessage = document.getElementById('note-message');
    const board = document.getElementById('sticky-board');

    const colors = ['color-pink', 'color-purple', 'color-yellow'];

    // Load saved notes from LocalStorage
    const savedNotes = JSON.parse(localStorage.getItem('amistad_notes') || '[]');
    savedNotes.forEach(note => {
        renderNoteElement(note.to, note.from, note.message, note.color, false);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const to = noteAuthor.value.trim();
        const from = noteFrom.value.trim();
        const msg = noteMessage.value.trim();

        if (!to || !from || !msg) return;

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        renderNoteElement(to, from, msg, randomColor, true);

        // Save to storage
        savedNotes.unshift({ to, from, message: msg, color: randomColor });
        if (savedNotes.length > 20) savedNotes.pop(); // keep last 20
        localStorage.setItem('amistad_notes', JSON.stringify(savedNotes));

        form.reset();
        showToast('Your note has been pinned to the Friendship Wall! 📌');
    });

    function renderNoteElement(to, from, message, colorClass, prepend = true) {
        const note = document.createElement('div');
        note.className = `sticky-note ${colorClass}`;
        note.innerHTML = `
            <div class="pin">📌</div>
            <div class="note-to">To: <strong>${escapeHtml(to)}</strong></div>
            <p class="note-body">"${escapeHtml(message)}"</p>
            <div class="note-by">— ${escapeHtml(from)} ✨</div>
        `;

        if (prepend && board.firstChild) {
            board.insertBefore(note, board.firstChild);
        } else {
            board.appendChild(note);
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

/* ==========================================================================
   5. Navigation & Toast Helpers
   ========================================================================== */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const isFlex = navLinks.style.display === 'flex';
            if (isFlex) {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(22, 5, 36, 0.95)';
                navLinks.style.padding = '1.5rem';
                navLinks.style.backdropFilter = 'blur(16px)';
            }
        });
    }

    // Scroll spy for navigation
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}
