document.addEventListener('DOMContentLoaded', () => {
    const categoriesGrid = document.querySelector('.categories-grid');
    const factContainer = document.getElementById('fact-container');
    const factText = document.getElementById('fact-text');
    const categoryTitle = document.getElementById('category-title');
    const backButton = document.getElementById('back-button');
    const prevButton = document.getElementById('prev-fact');
    const nextButton = document.getElementById('next-fact');
    const openThemesButton = document.getElementById('open-themes');
    const closeThemesButton = document.getElementById('close-themes');
    const themeModal = document.getElementById('theme-modal');
    const authButton = document.getElementById('auth-button');
    const authModal = document.getElementById('auth-modal');
    const closeAuthButton = document.getElementById('close-auth');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    const googleAuthButton = document.getElementById('google-auth');
    const savedFactsContainer = document.getElementById('saved-facts-container');
    const savedFactsGrid = document.querySelector('.saved-facts-grid');
    const savedFactsFilters = document.querySelector('.saved-facts-filters');

    let currentFacts = [];
    let currentFactIndex = 0;
    let currentCategory = '';
    let currentUser = null;

    // Theme handling
    openThemesButton.addEventListener('click', () => {
        themeModal.style.display = 'flex';
    });

    closeThemesButton.addEventListener('click', () => {
        themeModal.style.display = 'none';
    });

    document.querySelectorAll('.theme-option').forEach(option => {
        const theme = option.dataset.theme;
        const preview = option.querySelector('.theme-preview');
        
        // Apply theme styles to preview
        preview.style.background = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${theme}-bg`);
        
        option.addEventListener('click', () => {
            document.body.className = `${theme}-theme`;
            themeModal.style.display = 'none';
            localStorage.setItem('preferred-theme', theme);
        });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        document.body.className = `${savedTheme}-theme`;
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                currentUser = data.user;
                updateAuthButton();
            }
        })
        .catch(console.error);
    }

    // Auth Modal Controls
    authButton.addEventListener('click', () => {
        if (currentUser) {
            // Handle logout
            localStorage.removeItem('token');
            currentUser = null;
            updateAuthButton();
        } else {
            authModal.style.display = 'flex';
        }
    });

    closeAuthButton.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Auth Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.dataset.tab === 'login' ? loginForm : signupForm;
            const otherForm = tab.dataset.tab === 'login' ? signupForm : loginForm;
            
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            targetForm.style.display = 'flex';
            otherForm.style.display = 'none';
        });
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

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
                currentUser = data.data.user;
                updateAuthButton();
                authModal.style.display = 'none';
                loginForm.reset();
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });

    // Signup Form Handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;

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
                currentUser = data.data.user;
                updateAuthButton();
                authModal.style.display = 'none';
                signupForm.reset();
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        }
    });

    // Google Auth Handler
    googleAuthButton.addEventListener('click', () => {
        // Implement Google OAuth flow
        window.location.href = '/api/auth/google';
    });

    function updateAuthButton() {
        if (currentUser) {
            authButton.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
        } else {
            authButton.innerHTML = `<i class="fas fa-user"></i> Sign In`;
        }
    }

    // Add Authorization header to fact requests
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }
        return fetch(url, options);
    }

    // Add click handlers to all category boxes
    document.querySelectorAll('.category-box').forEach(box => {
        box.addEventListener('click', async () => {
            currentCategory = box.dataset.category;
            
            // Show loading state
            factText.textContent = 'Loading...';
            categoryTitle.textContent = currentCategory === 'random' ? 'Random Facts' : `${currentCategory} Facts`;
            
            // Hide categories and show fact container
            categoriesGrid.style.display = 'none';
            factContainer.style.display = 'block';
            
            try {
                const response = await fetchWithAuth(`/api/facts/${currentCategory}`);
                if (!response.ok) throw new Error('Failed to fetch facts');
                
                const data = await response.json();
                if (!data.facts || !data.facts.length) {
                    throw new Error('No facts received');
                }
                
                currentFacts = data.facts;
                currentFactIndex = 0;
                displayCurrentFact('slide-in-right');
            } catch (error) {
                console.error('Error:', error);
                factText.textContent = 'Failed to load facts. Please try again.';
            }
        });
    });

    function displayCurrentFact(animation = '') {
        if (!currentFacts.length) return;
        
        const card = document.querySelector('.fact-card');
        factText.textContent = currentFacts[currentFactIndex];
        
        // Reset animation
        card.className = 'fact-card';
        void card.offsetWidth; // Trigger reflow
        if (animation) {
            card.classList.add(animation);
        }

        // Add save button
        addSaveButton();
    }

    // Return to categories view
    backButton.addEventListener('click', () => {
        const card = document.querySelector('.fact-card');
        card.classList.add('fade-out');
        
        setTimeout(() => {
            factContainer.style.display = 'none';
            categoriesGrid.style.display = 'grid';
            card.className = 'fact-card';
            
            // Reset state
            currentFacts = [];
            currentFactIndex = 0;
        }, 300);
    });

    // Navigate to previous fact
    prevButton.addEventListener('click', () => {
        if (currentFactIndex > 0) {
            const card = document.querySelector('.fact-card');
            card.classList.add('slide-out-right');
            
            setTimeout(() => {
                currentFactIndex--;
                displayCurrentFact('slide-in-left');
            }, 300);
        }
    });

    // Navigate to next fact
    nextButton.addEventListener('click', async () => {
        const card = document.querySelector('.fact-card');
        card.classList.add('slide-out-left');
        
        setTimeout(async () => {
            try {
                // Always fetch new facts when clicking next
                const response = await fetchWithAuth(`/api/facts/${currentCategory}`);
                if (!response.ok) throw new Error('Failed to fetch facts');
                
                const data = await response.json();
                if (!data.facts || !data.facts.length) {
                    throw new Error('No facts received');
                }
                
                currentFacts = data.facts;
                currentFactIndex = 0;
                displayCurrentFact('slide-in-right');
            } catch (error) {
                console.error('Error:', error);
                factText.textContent = 'Failed to load more facts. Please try again.';
            }
        }, 300);
    });

    // Close theme modal when clicking outside
    themeModal.addEventListener('click', (e) => {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Save fact functionality
    function saveFact(fact) {
        const token = localStorage.getItem('token');
        return fetch('/api/facts/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fact })
        });
    }

    // Add save button to fact cards
    function addSaveButton() {
        const existingButton = document.querySelector('.save-button');
        if (existingButton) existingButton.remove();

        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i>';
        
        // Check if fact is already saved
        if (currentFacts[currentFactIndex]) {
            updateSaveButtonState(currentFacts[currentFactIndex]);
        }
        
        saveButton.addEventListener('click', async () => {
            if (!currentUser) {
                authModal.style.display = 'flex';
                return;
            }

            try {
                const response = await fetchWithAuth('/api/facts/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fact: currentFacts[currentFactIndex],
                        category: currentCategory
                    })
                });

                if (!response.ok) throw new Error('Failed to save fact');
                
                saveButton.classList.add('saved');
            } catch (error) {
                console.error('Error saving fact:', error);
            }
        });

        document.querySelector('.fact-card').appendChild(saveButton);
    }

    // Add "My Facts" button to header
    const headerButtons = document.querySelector('.header-buttons');
    const myFactsButton = document.createElement('button');
    myFactsButton.className = 'auth-button';
    myFactsButton.innerHTML = '<i class="fas fa-bookmark"></i> My Facts';
    headerButtons.insertBefore(myFactsButton, headerButtons.lastElementChild);

    // My Facts button handler
    myFactsButton.addEventListener('click', async () => {
        if (!currentUser) {
            authModal.style.display = 'flex';
            return;
        }
        await loadSavedFacts();
        categoriesGrid.style.display = 'none';
        factContainer.style.display = 'none';
        savedFactsContainer.style.display = 'block';
    });

    // Load saved facts
    async function loadSavedFacts() {
        try {
            const response = await fetchWithAuth('/api/facts/saved');
            if (!response.ok) throw new Error('Failed to fetch saved facts');
            
            const data = await response.json();
            displaySavedFacts(data.facts);
            updateSavedFactsFilters(data.facts);
        } catch (error) {
            console.error('Error loading saved facts:', error);
        }
    }

    // Display saved facts
    function displaySavedFacts(facts) {
        savedFactsGrid.innerHTML = '';
        if (!facts || facts.length === 0) {
            savedFactsGrid.innerHTML = '<div class="no-facts">No saved facts yet</div>';
            return;
        }

        facts.forEach(fact => {
            const card = document.createElement('div');
            card.className = 'saved-fact-card';
            card.innerHTML = `
                <p class="fact-content">${fact.fact}</p>
                <div class="saved-fact-meta">
                    <span class="category-tag">${fact.category}</span>
                    <span class="saved-date">${new Date(fact.savedAt).toLocaleDateString()}</span>
                </div>
                <button class="delete-saved" data-fact-id="${fact._id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // Add delete handler
            const deleteButton = card.querySelector('.delete-saved');
            deleteButton.addEventListener('click', async () => {
                try {
                    const response = await fetchWithAuth(`/api/facts/saved/${fact._id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        card.remove();
                        // Reload filters if this was the last fact of a category
                        loadSavedFacts();
                    }
                } catch (error) {
                    console.error('Error deleting fact:', error);
                }
            });

            savedFactsGrid.appendChild(card);
        });
    }

    // Update saved facts filters
    function updateSavedFactsFilters(facts) {
        const categories = [...new Set(facts.map(f => f.category))];
        savedFactsFilters.innerHTML = `
            <button class="category-filter active" data-category="all">All</button>
            ${categories.map(cat => `
                <button class="category-filter" data-category="${cat}">${cat}</button>
            `).join('')}
        `;
    }

    // Filter saved facts
    savedFactsFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('category-filter')) return;

        const category = e.target.dataset.category;
        const cards = savedFactsGrid.querySelectorAll('.saved-fact-card');

        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        cards.forEach(card => {
            const cardCategory = card.querySelector('.category-tag').textContent;
            if (category === 'all' || category === cardCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Add back button to saved facts container
    const savedFactsHeader = document.querySelector('.saved-facts-header');
    const backToHomeButton = document.createElement('button');
    backToHomeButton.className = 'back-button';
    backToHomeButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Facts';
    savedFactsHeader.insertBefore(backToHomeButton, savedFactsHeader.firstChild);

    // Back to home handler
    backToHomeButton.addEventListener('click', () => {
        savedFactsContainer.style.display = 'none';
        categoriesGrid.style.display = 'grid';
    });

    // Update save button state based on whether fact is saved
    async function updateSaveButtonState(fact) {
        if (!currentUser) return;
        
        try {
            const response = await fetchWithAuth('/api/facts/saved');
            if (!response.ok) return;
            
            const data = await response.json();
            const isSaved = data.facts.some(savedFact => savedFact.fact === fact);
            
            const saveButton = document.querySelector('.save-button');
            if (saveButton) {
                if (isSaved) {
                    saveButton.classList.add('saved');
                } else {
                    saveButton.classList.remove('saved');
                }
            }
        } catch (error) {
            console.error('Error checking saved state:', error);
        }
    }
}); 