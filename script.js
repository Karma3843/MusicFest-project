document.addEventListener('DOMContentLoaded', () => {

    const bandListContainer = document.getElementById('band-list');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let allBands = []; // This will store the bands from the database

    // --- NEW: Function to fetch bands from our database ---
    async function getBands() {
        try {
            // This is the SAME URL the dashboard uses!
            const response = await fetch('http://localhost:3000/api/events');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allBands = await response.json(); // Store the bands from the DB
            displayBands(allBands); // Display them on the page
        } catch (error) {
            console.error('Error fetching bands:', error);
            bandListContainer.innerHTML = '<p style="color:red;">Could not load bands from the server.</p>';
        }
    }

    // --- Function to display bands (This is the same as before) ---
    function displayBands(bandsToDisplay) {
        bandListContainer.innerHTML = ''; // Clear existing list

        if (bandsToDisplay.length === 0) {
            bandListContainer.innerHTML = '<p style="color: #999;">No bands found.</p>';
            return;
        }

        bandsToDisplay.forEach(band => {
            // We use the data from the database (band.name, band.genre, etc.)
            const bandCard = `
                <div class="band-card">
                    <img src="${band.image || 'https://via.placeholder.com/400x200.png?text=No+Image'}" alt="${band.name}">
                    <div class="band-info">
                        <h2>${band.name}</h2>
                        <span class="genre">${band.genre}</span>
                        <p>${band.description}</p>
                        <a href="${band.websiteUrl || '#'}" target="_blank">Details & Tickets</a>
                    </div>
                </div>
            `;
            bandListContainer.innerHTML += bandCard;
        });
    }

    // --- Search and Filter Logic (This is the same as before) ---
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeGenre = document.querySelector('.filter-btn.active').dataset.genre;

        let filteredBands = allBands; // Use the data from the database

        // Apply genre filter
        if (activeGenre !== 'all') {
            filteredBands = filteredBands.filter(band => band.genre === activeGenre);
        }

        // Apply search filter
        if (searchTerm) {
            filteredBands = filteredBands.filter(band => band.name.toLowerCase().includes(searchTerm));
        }

        displayBands(filteredBands);
    }

    // Event listeners (Same as before)
    searchInput.addEventListener('input', filterAndSearch);
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterAndSearch();
        });
    });

    // --- Initial call to fetch data from the DATABASE ---
    getBands();
});