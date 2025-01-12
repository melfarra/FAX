// Constants and state
const factsContainer = document.getElementById('facts-container');
const authButton = document.getElementById('auth-button');
const authModal = document.getElementById('auth-modal');
const themeButton = document.getElementById('theme-button');
const themeModal = document.getElementById('theme-modal');
const loadingIndicator = document.getElementById('loading');

let currentTheme = localStorage.getItem('theme') || 'dark';
let isLoading = false;
let facts = [];
let currentFactIndex = 0;

// Mock facts for testing (remove this when backend is ready)
const mockFacts = [
    { text: "The human brain can process images in as little as 13 milliseconds.", category: "science" },
    { text: "The Great Wall of China is not visible from space with the naked eye.", category: "history" },
    { text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.", category: "nature" },
    { text: "The first computer programmer was a woman named Ada Lovelace.", category: "technology" },
    { text: "There are more stars in the universe than grains of sand on Earth.", category: "space" }
];

// Categories with their respective themes
const categories = [
    'science', 'history', 'nature', 'technology', 'space',
    'art', 'music', 'sports', 'food', 'geography',
    'literature', 'movies', 'animals', 'psychology', 'medicine'
];

// Authentication functions
function setupAuth() {
    console.log('Setting up auth...');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const googleAuthButton = document.getElementById('google-auth');
    const authTabs = document.querySelectorAll('.auth-tab');

    authButton.addEventListener('click', () => {
        console.log('Auth button clicked');
        authModal.style.display = 'flex';
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const formType = tab.dataset.tab;
            console.log('Auth tab clicked:', formType);
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
    console.log('Setting up theme...');
    document.body.setAttribute('data-theme', currentTheme);
    
    themeButton.addEventListener('click', () => {
        console.log('Theme button clicked');
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
            console.log('Theme selected:', theme);
            currentTheme = theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeModal.style.display = 'none';
        });
    });
}

// Fact generation and display
async function generateFact(category = '') {
    // For testing without backend
    return mockFacts[Math.floor(Math.random() * mockFacts.length)];

    /* Uncomment this when backend is ready
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
    */
}

function createFactCard(fact) {
    console.log('Creating fact card:', fact);
    const card = document.createElement('div');
    card.className = 'fact-card';
    card.setAttribute('data-category', fact.category);

    const content = document.createElement('div');
    content.className = 'fact-card-content';
    
    // Get category icon based on the fact category
    const categoryIcon = getCategoryIcon(fact.category);
    
    content.innerHTML = `
        <h3>${fact.category.charAt(0).toUpperCase() + fact.category.slice(1)}</h3>
        <p>${fact.text}</p>
    `;

    card.appendChild(content);
    return card;
}

// Helper function to get category-specific details
function getCategoryIcon(category) {
    const icons = {
        science: '🧬',
        history: '📜',
        nature: '🌿',
        technology: '💻',
        space: '🌌',
        art: '🎨',
        music: '🎵',
        sports: '⚽',
        food: '🍳',
        geography: '🌍',
        literature: '📚',
        movies: '🎬',
        animals: '🦁',
        psychology: '🧠',
        medicine: '⚕️'
    };
    
    return icons[category] || '❓';
}

async function loadMoreFacts() {
    if (isLoading) return;
    console.log('Loading more facts...');
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
        console.log('Added new facts:', newFacts);
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
        console.log('Near bottom, loading more facts...');
        loadMoreFacts();
    }

    // Update current fact index for potential saving
    currentFactIndex = Math.floor(scrollPosition / containerHeight);
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing app...');
    
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    initializeApp().catch(console.error);
});

// Auth handlers (implement these based on your backend)
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
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
    console.log('Signup form submitted');
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
    console.log('Google auth clicked');
    window.location.href = '/api/auth/google';
} 