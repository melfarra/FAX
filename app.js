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

    let currentFacts = [];
    let currentFactIndex = 0;
    let currentCategory = '';

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
                const response = await fetch(`/api/facts/${currentCategory}`);
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
                const response = await fetch(`/api/facts/${currentCategory}`);
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
}); 