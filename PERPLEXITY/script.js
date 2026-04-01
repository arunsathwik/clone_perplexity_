document.addEventListener('DOMContentLoaded', () => {
    // ---- Search Box Logic ----
    const searchInput = document.querySelector('.search-input');
    const submitBtn = document.querySelector('.submit-btn');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const resultsContainer = document.querySelector('.results-container');
    const userQueryEl = document.querySelector('.user-query');
    const aiResponseEl = document.querySelector('.ai-response');

    // Auto-resize textarea
    searchInput.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset height to evaluate scrollHeight
        // Cap the max height to avoid it growing endlessly, matching typical behavior
        const newHeight = Math.min(this.scrollHeight, 200);
        this.style.height = newHeight + 'px';

        // Check input to toggle submit button state
        const hasText = this.value.trim().length > 0;
        if (hasText) {
            submitBtn.classList.add('ready');
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.classList.remove('ready');
            submitBtn.setAttribute('disabled', 'true');
        }
    });

    async function handleSubmission(query) {
        if (!query) return;

        // UI updates
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input')); // Reset height and button
        
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'flex';
        
        userQueryEl.textContent = query;
        aiResponseEl.innerHTML = '<div class="loader"></div>';

        try {
            const res = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query })
            });

            if (!res.ok) throw new Error('Network response was not ok');
            
            const data = await res.json();
            // Convert simple markdown newlines to breaks
            aiResponseEl.innerHTML = data.response.replace(/\n/g, '<br>');
        } catch (error) {
            console.error('Error fetching response:', error);
            aiResponseEl.innerHTML = `<span style="color: #ff6b6b">Error: Failed to connect to the backend server. Make sure FastAPI is running on port 8000.</span>`;
        }
    }

    // Submit via button
    submitBtn.addEventListener('click', () => {
        if (submitBtn.classList.contains('ready')) {
            handleSubmission(searchInput.value.trim());
        }
    });

    // Enter to submit (Shift+Enter for new line)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmission(searchInput.value.trim());
        }
    });

    // ---- Pro Toggle Logic ----
    const proToggle = document.querySelector('.pro-toggle');
    if (proToggle) {
        proToggle.addEventListener('click', (e) => {
            // Prevent default label click behavior if needed
            proToggle.classList.toggle('active');
        });
    }

    // ---- Suggestions Logic ----
    const suggestions = document.querySelectorAll('.suggestion-btn');
    suggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('title') || btn.textContent.trim();
            searchInput.value = text;
            
            // Trigger input event to resize textarea and enable submit button
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.focus();
        });
    });

    // ---- Auth Logic ----
    const emailInput = document.querySelector('.email-input');
    const emailBtn = document.querySelector('.email-btn');

    if (emailInput && emailBtn) {
        emailInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            // Basic email validation check for enabling the button
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            
            if (isValidEmail) {
                emailBtn.classList.add('ready');
                emailBtn.removeAttribute('disabled');
            } else {
                emailBtn.classList.remove('ready');
                emailBtn.setAttribute('disabled', 'true');
            }
        });
    }

    // Auth panel close logic
    const closeAuthBtn = document.querySelector('.close-btn');
    const authPanel = document.querySelector('.auth-panel');
    if (closeAuthBtn && authPanel) {
        closeAuthBtn.addEventListener('click', () => {
            authPanel.style.display = 'none';
        });
    }
});
