document.addEventListener('DOMContentLoaded', () => {
    // --- Get all the HTML elements we need ---
    const eventForm = document.getElementById('eventForm');
    const eventList = document.getElementById('eventList');
    const formTitle = document.getElementById('form-title');
    const eventIdInput = document.getElementById('eventId');
    const cancelEditBtn = document.getElementById('cancelEdit');
    
    // The address of our backend API
    const apiUrl = 'http://localhost:3000/api/events';

    // --- 1. READ: Fetch and display all events on page load ---
    async function fetchEvents() {
        try {
            const response = await fetch(apiUrl);
            const events = await response.json();

            eventList.innerHTML = ''; // Clear the list before repopulating
            if (events.length === 0) {
                eventList.innerHTML = '<p style="color:#999;">No events found. Add one!</p>';
                return;
            }
            
            events.forEach(event => {
                const eventItem = `
                    <div class="event-item">
                        <div class="event-item-info">
                            <h3>${event.name}</h3>
                            <p>${event.genre} - ${event.description.substring(0, 40)}...</p>
                        </div>
                        <div class="event-item-actions">
                            <button class="edit-btn" data-id="${event._id}">Edit</button>
                            <button class="delete-btn" data-id="${event._id}">Delete</button>
                        </div>
                    </div>
                `;
                eventList.innerHTML += eventItem;
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            eventList.innerHTML = '<p style="color:red;">Could not load events.</p>';
        }
    }

    // --- 2. CREATE / UPDATE: Handle form submission ---
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the form from reloading the page

        // Collect data from the form
        const eventData = {
            name: document.getElementById('name').value,
            genre: document.getElementById('genre').value,
            image: document.getElementById('image').value,
            description: document.getElementById('description').value,
            websiteUrl: document.getElementById('websiteUrl').value,
        };
        
        const eventId = eventIdInput.value;
        let url = apiUrl;
        let method = 'POST'; // Default to CREATE

        if (eventId) {
            // If we have an ID, we are UPDATING (PUT)
            url = `${apiUrl}/${eventId}`;
            method = 'PUT';
        }

        try {
            // Send the data to the API
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            
            resetForm(); // Clear the form
            fetchEvents(); // Refresh the list
            
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Could not save the event. Please check the console.');
        }
    });
    
    // --- 3. EDIT / DELETE: Handle clicks on the event list ---
    eventList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        // --- DELETE ---
        if (target.classList.contains('delete-btn')) {
            if (!confirm('Are you sure you want to delete this event?')) {
                return; // Stop if the user clicks "Cancel"
            }
            try {
                await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
                fetchEvents(); // Refresh list
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Could not delete event.');
            }
        }

        // --- EDIT (Populate form) ---
        if (target.classList.contains('edit-btn')) {
            try {
                // Fetch the single event's data from the API
                const response = await fetch(`${apiUrl}/${id}`);
                const event = await response.json();

                // Populate the form with its data
                formTitle.innerText = 'Edit Event';
                eventIdInput.value = event._id; // Store the ID in the hidden input
                document.getElementById('name').value = event.name;
                document.getElementById('genre').value = event.genre;
                document.getElementById('image').value = event.image;
                document.getElementById('description').value = event.description;
                document.getElementById('websiteUrl').value = event.websiteUrl;
                cancelEditBtn.style.display = 'block'; // Show the "Cancel Edit" button
                
            } catch (error) {
                console.error('Error fetching event for edit:', error);
            }
        }
    });

    // --- 4. Cancel Edit Button ---
    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    // Helper function to reset the form
    function resetForm() {
        formTitle.innerText = 'Add New Event';
        eventForm.reset();
        eventIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    }

    // Initial load: Fetch all events when the page first opens
    fetchEvents();
});