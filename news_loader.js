// IMPORTANT: Set to full URL to allow different ports (e.g. Live Server on 5500 accessing Backend on 4000)
const NEWS_API_BASE = '/api';
// const NEWS_API_BASE = 'https://zoopedia.azurewebsites.net/api';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d'; // From app.js

const PLACEHOLDER_IMG = 'imagenes/news.png';

// Helper to get ID
function getNewsId(n) {
    if (!n) return null;
    if (n.id) return n.id;
    if (n._id) {
        if (typeof n._id === 'string') return n._id;
        if (typeof n._id === 'object' && n._id.$oid) return n._id.$oid;
        return String(n._id);
    }
    return null;
}

// Global fetch helper
async function safeFetch(url) {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    return res;
}

async function fetchNews() {
    try {
        const res = await safeFetch(`${NEWS_API_BASE}/news`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Error fetching news:', e);
        return [];
    }
}

function createNewsCard(item) {
    const id = getNewsId(item);
    if (!id) return '';

    const img = item.mainImageUrl || PLACEHOLDER_IMG;
    const title = item.title || 'Sin Título';
    const subtitle = item.subtitle || '';
    const date = item.date ? new Date(item.date).toLocaleDateString() : '';

    // Create excerpt
    let excerpt = item.content || '';
    if (excerpt.length > 150) excerpt = excerpt.substring(0, 150) + '...';

    // We link to noticias.html with ID query param
    return `
    <a href="noticias.html?id=${id}" class="news-card-dynamic">
        <div class="news-card-left">
            <img src="${img}" alt="${title}" onerror="this.src='${PLACEHOLDER_IMG}'">
        </div>
        <div class="news-card-right">
            <h3>${title}</h3>
            ${subtitle ? `<div class="news-subtitle">${subtitle}</div>` : ''}
            <small style="color: #888; display:block; margin-bottom: 8px;">${date}</small>
            <div class="news-excerpt">${excerpt}</div>
        </div>
    </a>
    `;
}

// CAROUSEL CARD GENERATOR
// CAROUSEL CARD GENERATOR
function createCarouselSlide(item) {
    const img = item.mainImageUrl || PLACEHOLDER_IMG;
    const title = item.title || 'Sin Título';
    const date = item.date ? new Date(item.date).toLocaleDateString() : '';
    let excerpt = item.content || '';
    if (excerpt.length > 120) excerpt = excerpt.substring(0, 120) + '...';

    const id = getNewsId(item);

    return `
    <div class="carousel-slide">
        <a href="noticias.html?id=${id}" class="news-card-carousel" style="text-decoration: none; color: inherit;">
            <img src="${img}" alt="${title}" onerror="this.src='${PLACEHOLDER_IMG}'">
            <div class="news-card-carousel-content">
                <h3>${title}</h3>
                <small>${date}</small>
                <p>${excerpt}</p>
            </div>
        </a>
    </div>
    `;
}

// CAROUSEL LOGIC (Arrows)
let carouselCurrentIndex = 0;
function setupCarousel(totalSlides) {
    const track = document.getElementById('carousel-track-dynamic');
    const prevBtn = document.getElementById('carrusel-prev');
    const nextBtn = document.getElementById('carrusel-next');

    if (!track || !prevBtn || !nextBtn) return;

    // Reset
    carouselCurrentIndex = 0;
    track.style.transform = `translateX(0)`;

    function updateSlide() {
        const offset = -(carouselCurrentIndex * 100);
        track.style.transform = `translateX(${offset}%)`;
    }

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop any default link behavior
        if (carouselCurrentIndex < totalSlides - 1) {
            carouselCurrentIndex++;
            updateSlide();
        } else {
            // Loop back to start
            carouselCurrentIndex = 0;
            updateSlide();
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop any default link behavior
        if (carouselCurrentIndex > 0) {
            carouselCurrentIndex--;
            updateSlide();
        } else {
            // Loop to end
            carouselCurrentIndex = totalSlides - 1;
            updateSlide();
        }
    });
}

async function renderDetail(id, allNews) {
    const item = allNews.find(n => getNewsId(n) === id);
    const detailContainer = document.getElementById('news-detail-content');
    const otherContainer = document.getElementById('news-other-content');
    const detailWrapper = document.getElementById('news-detail-wrapper');
    const listWrapper = document.getElementById('news-list-wrapper');

    if (!item) {
        if (detailWrapper) detailWrapper.innerHTML = '<p class="error">Noticia no encontrada.</p>';
        return;
    }

    if (detailWrapper) detailWrapper.style.display = 'block';
    if (listWrapper) listWrapper.style.display = 'none';

    if (detailContainer) {
        const img = item.mainImageUrl || PLACEHOLDER_IMG;
        const date = item.date ? new Date(item.date).toLocaleDateString() : '';

        detailContainer.innerHTML = `
        <div class="news-full-article" style="background:white; padding:30px; border-radius:20px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            <h1 style="color:var(--verde-oscuro); font-size:2.5rem; margin-bottom:10px;">${item.title}</h1>
                ${item.subtitle ? `<h3 style="color:#666; font-weight:normal; margin-bottom:20px;">${item.subtitle}</h3>` : ''}
                <div style="margin-bottom:20px; color:#888;">${date}</div>
                <img src="${img}" style="width:100%; max-height:500px; object-fit:cover; border-radius:15px; margin-bottom:30px;" onerror="this.src='${PLACEHOLDER_IMG}'">
                <div class="news-body" style="font-size:1.1rem; line-height:1.8; color:#333;">
                    ${item.content.replace(/\n/g, '<br><br>')}
                </div>
                <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eee;">
                    <a href="noticias.html" style="color:var(--verde-oscuro); font-weight:bold; text-decoration:none; font-size:1.1rem;">
                        <i class="fa-solid fa-arrow-left"></i> Volver a Noticias
                    </a>
                </div>
            </div>
    `;
    }

    if (otherContainer) {
        const others = allNews.filter(n => getNewsId(n) !== id).slice(0, 3); // Top 3 others
        if (others.length > 0) {
            otherContainer.innerHTML = others.map(createNewsCard).join('');
        } else {
            document.querySelector('.others-section-title').style.display = 'none';
        }
    }
}

async function renderIndex(allNews) {
    const track = document.getElementById('carousel-track-dynamic');

    // If we are NOT on index page (track not found), return or maybe look for a list container if we kept duplicate logic (unlikely here)
    if (!track) {
        // Fallback if user uses this script on a page with 'index-news-container' but without the track
        const staticList = document.getElementById('index-news-container');
        if (staticList) {
            const latest = allNews.slice(0, 4);
            staticList.innerHTML = latest.map(createNewsCard).join('');
        }
        return;
    }

    // Show latest 5 news for the carousel
    const latest = allNews.slice(0, 5);
    if (latest.length === 0) {
        track.innerHTML = '<p style="padding:20px;">No hay noticias recientes.</p>';
        return;
    }

    track.innerHTML = latest.map(createCarouselSlide).join('');

    // Initialize Arrow Logic
    setupCarousel(latest.length);
}

async function renderList(allNews) {
    const container = document.getElementById('news-list-content');
    const detailWrapper = document.getElementById('news-detail-wrapper');
    const listWrapper = document.getElementById('news-list-wrapper');

    if (detailWrapper) detailWrapper.style.display = 'none';
    if (listWrapper) listWrapper.style.display = 'block';

    if (container) {
        if (allNews.length === 0) {
            container.innerHTML = '<p>No hay noticias publicadas.</p>';
            return;
        }
        container.innerHTML = allNews.map(createNewsCard).join('');
    }
}

async function initNews() {
    const news = await fetchNews();
    // Assuming backend returns newest first? If not, reverse
    const reversedNews = [...news].reverse();

    // Index Page (Carousel) check
    if (document.getElementById('carousel-track-dynamic') || document.getElementById('index-news-container')) {
        renderIndex(reversedNews);
    }

    // News Page (List or Detail)
    if (window.location.pathname.includes('noticias.html')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            renderDetail(id, reversedNews);
            const othersSection = document.getElementById('news-others-section');
            if (othersSection) othersSection.style.display = 'block';
        } else {
            renderList(reversedNews);
            const othersSection = document.getElementById('news-others-section');
            if (othersSection) othersSection.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', initNews);
