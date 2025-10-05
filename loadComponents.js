// This script will find the placeholder, fetch the HTML from `navbar.html`, and insert it.

// loadComponents.js or resume.js

/**
 * Fetches an HTML file and inserts its content into a placeholder element.
 * @param {string} url - The path to the HTML snippet file (e.g., 'navbar.html').
 * @param {string} id - The ID of the element to insert the content into (e.g., 'navbar-placeholder').
 */
function loadComponent(url, id) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const placeholder = document.getElementById(id);
            if (placeholder) {
                placeholder.innerHTML = html;
            }
        })
        .catch(error => console.error('Error loading component:', error));
}

// Ensure the DOM is fully loaded before running the function
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar.html', 'navbar-placeholder');
    // If you had a footer: loadComponent('footer.html', 'footer-placeholder');
});