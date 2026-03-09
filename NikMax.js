const audio = document.getElementById("bgmusic");
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");
const enterScreen = document.getElementById("enter-screen");
const typingElement = document.getElementById("typing-text");

// 1. აკრეფის ანიმაცია
const text = "NikMax";
let index = 0;
let isDeleting = false;
let speed = 200;

function typeEffect() {
    const currentText = isDeleting ? text.substring(0, index - 1) : text.substring(0, index + 1);
    if (typingElement) typingElement.textContent = currentText;

    if (!isDeleting && currentText === text) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentText === "") {
        isDeleting = false;
        speed = 500;
        index = 0;
    } else {
        speed = isDeleting ? 100 : 200;
        index = isDeleting ? index - 1 : index + 1;
    }
    setTimeout(typeEffect, speed);
}
document.addEventListener("DOMContentLoaded", typeEffect);

// 2. მუსიკის და სლაიდერის ლოგიკა
let lastVolume = 50;
let fadeInterval;

function startExperience() {
    if (!enterScreen || enterScreen.style.display === "none") return;
    audio.volume = 0.5;
    volumeSlider.value = 50;
    audio.play();
    enterScreen.style.opacity = "0";
    setTimeout(() => { enterScreen.style.display = "none"; }, 800);
    // სქროლის ჩართვა ღილაკზე დაჭერის შემდეგ
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";

    const scrollIndicator = document.querySelector(".scroll-indicator");
    if (scrollIndicator) scrollIndicator.classList.add("show");
}

enterScreen.addEventListener("click", startExperience);

volumeSlider.addEventListener("input", function () {
    audio.volume = this.value / 100;
    updateIcon(audio.volume);
});

function smoothVolumeChange(target) {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
        let current = parseFloat(volumeSlider.value);
        let step = 3;
        if (Math.abs(current - target) <= step) {
            volumeSlider.value = target;
            audio.volume = target / 100;
            updateIcon(audio.volume);
            clearInterval(fadeInterval);
        } else {
            current < target ? current += step : current -= step;
            volumeSlider.value = current;
            audio.volume = current / 100;
            updateIcon(audio.volume);
        }
    }, 10);
}

volumeIcon.addEventListener("click", () => {
    audio.volume > 0 ? (lastVolume = audio.volume * 100, smoothVolumeChange(0)) : smoothVolumeChange(lastVolume || 50);
});

function updateIcon(v) {
    if (v === 0) volumeIcon.className = "fas fa-volume-mute";
    else if (v < 0.5) volumeIcon.className = "fas fa-volume-down";
    else volumeIcon.className = "fas fa-volume-up";
}

// 3. Hover ეფექტი
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', (e) => {
        const rect = link.getBoundingClientRect();
        link.style.transformOrigin = `${e.clientX - rect.left}px ${e.clientY - rect.top}px`;
    });
});

// 4. Yellow Snow Particles Effect
const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

let w, h;
let particles = [];
let mouseX = 0;

function initCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", initCanvas);
initCanvas();

document.addEventListener("mousemove", (e) => {
    // Convert mouse X to a -1 to 1 ratio from screen center
    mouseX = (e.clientX / w) * 2 - 1;
});

class Particle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.3;
        // ინდივიდუალური ნათების ზომა (5-დან 30-მდე)
        this.glow = Math.random() * 25 + 5;
    }

    update() {
        this.y += this.speedY;
        // Move towards the mouse direction laterally
        this.x += this.speedX + (mouseX * 1.5);

        // Reset if offscreen
        if (this.y > h) {
            this.y = -10;
            this.x = Math.random() * w;
        }

        if (this.x > w + 10) this.x = -10;
        else if (this.x < -10) this.x = w + 10;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; // Yellowish
        ctx.shadowBlur = this.glow; // ინდივიდუალური ნათება
        ctx.shadowColor = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Generate particles
for (let i = 0; i < 250; i++) {
    particles.push(new Particle());
}

function animateSnow() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateSnow);
}

animateSnow();

// 5. YouTube API - Latest Videos
const API_KEY = "YOUR_YOUTUBE_API_KEY"; // აქ უნდა ჩასვა შენი YouTube API Key
const CHANNEL_ID = "YOUR_CHANNEL_ID"; // მაგ: UC... შენი არხის ID
const videosContainer = document.getElementById("videos-container");

// განახლების ინტერვალი (მაგ: 10 წუთში ერთხელ)
const UPDATE_INTERVAL = 10 * 60 * 1000; 
let updateTimer;

async function fetchLatestVideos() {
    if (!videosContainer) return;

    // თუ API Key არ არის მითითებული, ვანახებთ დროებით (Mock) მონაცემებს
    if (API_KEY === "YOUR_YOUTUBE_API_KEY") {
        renderMockVideos();
        return;
    }

    try {
        // 1. ვიღებთ ბოლო 3 ვიდეოს ID-ებს
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3&type=video`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) return;

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // 2. ვიღებთ ამ ვიდეოების დეტალებს
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (statsData.items) {
            renderVideos(statsData.items);
        }
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        videosContainer.innerHTML = `<p style="color:red;">ვიდეოების ჩატვირთვა ვერ მოხერხდა.</p>`;
    }
}

function renderVideos(videos) {
    videosContainer.innerHTML = "";
    videos.forEach(video => {
        const title = video.snippet.title;
        const thumb = video.snippet.thumbnails.medium.url;
        const videoId = video.id;

        const videoHTML = `
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="video-card">
                <div class="video-thumb-wrapper">
                    <img src="${thumb}" alt="Thumbnail" class="video-thumb">
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${title}</h3>
                </div>
            </a>
        `;
        videosContainer.innerHTML += videoHTML;
    });
}

function renderMockVideos() {
    // დროებითი მონაცემები შენი ბოლო 3 ვიდეოთი სანამ API Key-ს ჩასვამ (ესენი გამოჩნდება ახლა)
    const mockData = [
        {
            id: "S1JEZJX7GTY",
            title: "ვიპოვე საიდუმლო განძი! GeoTown SMP-ზე",
            thumb: "https://img.youtube.com/vi/S1JEZJX7GTY/maxresdefault.jpg"
        },
        {
            id: "MfqqnEneK6A",
            title: "ჩემი სრული თავგადასავალი GeoTown SMP-ზე",
            thumb: "https://img.youtube.com/vi/MfqqnEneK6A/maxresdefault.jpg"
        },
        {
            id: "-5a7A8Qj5kA",
            title: "🔴მეორე სეზონი დაიწყო!!! GeoTown SMP 🔴",
            thumb: "https://img.youtube.com/vi/-5a7A8Qj5kA/maxresdefault.jpg"
        }
    ];

    videosContainer.innerHTML = "";
    mockData.forEach(video => {
        // ვაკეთებთ ლინკს, თუ live არის ცოტა სხვანაირი ლინკი სჭირდება მაგრამ watch?v მუშაობს მაინც

        const videoHTML = `
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" class="video-card">
                <div class="video-thumb-wrapper">
                    <img src="${video.thumb}" alt="Thumbnail" class="video-thumb">
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                </div>
            </a>
        `;
        videosContainer.innerHTML += videoHTML;
    });
}

function setupScrollIndicator() {
    const heroWrapper = document.querySelector(".hero-wrapper");
    if (!heroWrapper) return;

    let indicator = document.querySelector(".scroll-indicator");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.className = "scroll-indicator";
        heroWrapper.appendChild(indicator);
    }

    indicator.innerHTML = `
        <div class="arrows">
            <i class="fas fa-chevron-down arrow1"></i>
            <i class="fas fa-chevron-down arrow2"></i>
            <i class="fas fa-chevron-down arrow3"></i>
        </div>
        <img src="Spyglass_(item)_JE3_BE1.png" class="spyglass-icon" alt="Scroll Down">
    `;

    indicator.addEventListener("click", () => {
        const targetPosition = document.documentElement.scrollHeight;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1500; // დრო მილიწამებში (1.5 წამი) - ოდნავ შეანელებს
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            // Ease-in-out ანიმაციის ფუნქცია (რბილი დაწყება და დასასრული)
            const ease = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            const currentProgress = Math.min(progress / duration, 1);
            window.scrollTo(0, startPosition + distance * ease(currentProgress));

            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    });
}

function setupBackToTop() {
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.innerHTML = `
        <div class="back-to-top-arrows">
            <i class="fas fa-chevron-up btt-arrow btt-arrow1"></i>
            <i class="fas fa-chevron-up btt-arrow btt-arrow2"></i>
            <i class="fas fa-chevron-up btt-arrow btt-arrow3"></i>
        </div>
        <img src="Spyglass_(item)_JE3_BE1.png" alt="Back to Top" class="back-to-top-spyglass">
    `;
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
        const scrollIndicator = document.querySelector(".scroll-indicator");

        if (window.scrollY > 300) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }

        if (scrollIndicator) {
            if (window.scrollY > 50) {
                scrollIndicator.classList.remove("show");
            } else if (document.body.style.overflowY === "auto") {
                scrollIndicator.classList.add("show");
            }
        }
    });
}

function setupScrollColorChange() {
    window.addEventListener("scroll", () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(window.scrollY / totalHeight, 1);

        // იცვლება ყვითლიდან (Hue 60) ნარინჯისფრისკენ (Hue 30)
        const hue = 60 - (30 * progress);
        document.documentElement.style.setProperty('--scroll-thumb-color', `hsl(${hue}, 100%, 50%)`);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchLatestVideos();
    setupScrollIndicator();
    setupBackToTop();
    setupScrollColorChange();
    // ავტომატური განახლება
    updateTimer = setInterval(fetchLatestVideos, UPDATE_INTERVAL);
});