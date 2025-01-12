// Initialize the warp background
const warpBackground = new WarpBackground({
    perspective: 100,
    beamsPerSide: 3,
    beamSize: 5,
    beamDelayMax: 3,
    beamDelayMin: 0,
    beamDuration: 3,
    gridColor: 'hsl(var(--border))'
});

// Constants and state
const factsContainer = document.getElementById('facts-container');
const authButton = document.getElementById('auth-button');
const authModal = document.getElementById('auth-modal');
const themeButton = document.getElementById('theme-button');
const themeModal = document.getElementById('theme-modal');
const loadingIndicator = document.getElementById('loading');

let currentTheme = localStorage.getItem('theme') || 'dark';
let isLoading = false;
let lastScrollPosition = 0;
let facts = [];
let currentFactIndex = 0;

// Categories with their respective themes
const categories = [
    'science', 'history', 'nature', 'technology', 'space',
    'art', 'music', 'sports', 'food', 'geography',
    'literature', 'movies', 'animals', 'psychology', 'medicine'
];

// Authentication functions
function setupAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const googleAuthButton = document.getElementById('google-auth');
    const authTabs = document.querySelectorAll('.auth-tab');

    authButton.addEventListener('click', () => {
        authModal.style.display = 'flex';
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const formType = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (formType === 'login') {
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
            }
        });
    });

    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Handle form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    googleAuthButton.addEventListener('click', handleGoogleAuth);
}

// Theme functions
function setupTheme() {
    document.body.setAttribute('data-theme', currentTheme);
    
    themeButton.addEventListener('click', () => {
        themeModal.style.display = 'flex';
    });

    themeModal.addEventListener('click', (e) => {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            currentTheme = theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeModal.style.display = 'none';
        });
    });
}

// Fact generation and display
async function generateFact(category = '') {
    try {
        const response = await fetch('/api/facts/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ category })
        });

        if (!response.ok) throw new Error('Failed to generate fact');
        
        const data = await response.json();
        return {
            text: data.fact,
            category: data.category || category || categories[Math.floor(Math.random() * categories.length)]
        };
    } catch (error) {
        console.error('Error generating fact:', error);
        return {
            text: 'Failed to generate fact. Please try again.',
            category: 'error'
        };
    }
}

function createFactCard(fact) {
    const card = document.createElement('div');
    card.className = 'fact-card';
    card.setAttribute('data-category', fact.category);

    const content = document.createElement('div');
    content.className = 'fact-card-content';
    content.innerHTML = `
        <h3>${fact.category.charAt(0).toUpperCase() + fact.category.slice(1)}</h3>
        <p>${fact.text}</p>
    `;

    card.appendChild(content);
    return card;
}

async function loadMoreFacts() {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.style.display = 'flex';

    try {
        const newFacts = await Promise.all(
            Array(5).fill().map(() => generateFact())
        );
        
        facts.push(...newFacts);
        
        newFacts.forEach(fact => {
            const card = createFactCard(fact);
            factsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading facts:', error);
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}

// Scroll handling
function handleScroll() {
    const scrollPosition = factsContainer.scrollTop;
    const containerHeight = factsContainer.clientHeight;
    const contentHeight = factsContainer.scrollHeight;

    // Load more facts when near the bottom
    if (contentHeight - (scrollPosition + containerHeight) < containerHeight) {
        loadMoreFacts();
    }

    // Update current fact index for potential saving
    currentFactIndex = Math.floor(scrollPosition / containerHeight);
}

// Initialize the application
async function initializeApp() {
    // Mount the warp background
    const warpContainer = document.getElementById('warp-background');
    warpBackground.mount(warpContainer);

    // Setup auth and theme
    setupAuth();
    setupTheme();
    
    // Initial load of facts
    await loadMoreFacts();
    
    // Setup scroll listener
    factsContainer.addEventListener('scroll', handleScroll);

    // Apply initial theme
    document.body.setAttribute('data-theme', currentTheme);
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);

// Auth handlers (implement these based on your backend)
async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            authModal.style.display = 'none';
            authButton.textContent = 'Sign Out';
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            authModal.style.display = 'none';
            authButton.textContent = 'Sign Out';
        }
    } catch (error) {
        console.error('Signup error:', error);
    }
}

function handleGoogleAuth() {
    window.location.href = '/api/auth/google';
} 