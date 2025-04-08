document.addEventListener('DOMContentLoaded', () => {
    const addWordForm = document.getElementById('add-word-form');
    const vocabTableBody = document.getElementById('vocab-list-body');
    const categoryDatalist = document.getElementById('category-list-options');
    const categoryFilter = document.getElementById('category-filter');

    // --- Input Fields ---
    const englishInput = document.getElementById('english');
    const pronunciationInput = document.getElementById('pronunciation');
    const thaiInput = document.getElementById('thai');
    const thaiPronunciationInput = document.getElementById('thaiPronunciation');
    const categoryInput = document.getElementById('category');
    const exampleInput = document.getElementById('example');
    const thaiExampleInput = document.getElementById('thaiExample');

    let wordList = []; // Holds the vocabulary data

    // --- Load Initial Data ---
    async function loadVocabulary() {
        try {
            const response = await fetch('wordlist.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            wordList = await response.json();
            console.log("Vocabulary loaded:", wordList);
            populateCategories();
            displayVocabulary(); // Initial display
        } catch (error) {
            console.error("Could not load vocabulary:", error);
            vocabTableBody.innerHTML = `<tr><td colspan="4" style="color: red;">Error loading vocabulary. Check console.</td></tr>`;
        }
    }

    // --- Populate Category Datalist and Filter ---
    function populateCategories() {
        const categories = new Set(wordList.map(word => word.category));
        categoryDatalist.innerHTML = ''; // Clear existing options
        categoryFilter.innerHTML = '<option value="all">-- All Categories --</option>'; // Reset filter

        categories.forEach(category => {
            // Add to datalist for the form
            const option = document.createElement('option');
            option.value = category;
            categoryDatalist.appendChild(option);

            // Add to filter dropdown
            const filterOption = document.createElement('option');
            filterOption.value = category;
            filterOption.textContent = category;
            categoryFilter.appendChild(filterOption);
        });
    }

    // --- Display Vocabulary in Table ---
    function displayVocabulary(filterCategory = 'all') {
        vocabTableBody.innerHTML = ''; // Clear existing table rows

        const filteredList = (filterCategory === 'all')
            ? wordList
            : wordList.filter(word => word.category === filterCategory);

        if (filteredList.length === 0 && filterCategory === 'all') {
             vocabTableBody.innerHTML = `<tr><td colspan="4">No vocabulary words found. Add some!</td></tr>`;
             return;
        }
         if (filteredList.length === 0 && filterCategory !== 'all') {
             vocabTableBody.innerHTML = `<tr><td colspan="4">No words found in the category "${filterCategory}".</td></tr>`;
             return;
        }


        filteredList.forEach((word, index) => {
            // Find the original index in the main wordList for correct deletion
            const originalIndex = wordList.findIndex(item => item.english === word.english && item.thai === word.thai);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${word.english}</td>
                <td>${word.thai}</td>
                <td>${word.category}</td>
                <td>
                    <button class="delete-btn" data-index="${originalIndex}">Delete</button>
                </td>
            `;

            // Add event listener for the delete button
            const deleteButton = row.querySelector('.delete-btn');
            deleteButton.addEventListener('click', handleDeleteWord);

            vocabTableBody.appendChild(row);
        });
    }

    // --- Handle Adding a New Word ---
    function handleAddWord(event) {
        event.preventDefault(); // Prevent default form submission

        const newWord = {
            english: englishInput.value.trim(),
            pronunciation: pronunciationInput.value.trim(),
            thai: thaiInput.value.trim(),
            thaiPronunciation: thaiPronunciationInput.value.trim(),
            category: categoryInput.value.trim(),
            example: exampleInput.value.trim(),
            thaiExample: thaiExampleInput.value.trim(),
            mastered: false, // Default value
            bookmarked: false // Default value
        };

        // Basic validation (ensure required fields are not empty)
        if (!newWord.english || !newWord.thai || !newWord.category) {
            alert('Please fill in English, Thai, and Category fields.');
            return;
        }

        // Add to the in-memory list
        wordList.push(newWord);
        console.log("Word added:", newWord);
        console.log("Updated wordList:", wordList);

        // Update UI
        populateCategories(); // Update categories in case a new one was added
        displayVocabulary(categoryFilter.value); // Refresh table with current filter
        addWordForm.reset(); // Clear the form fields

        // **Reminder:** This change is only in memory.
        // To save permanently, you'd need to send `newWord` or the entire `wordList`
        // to a backend API here, or save to localStorage.
        // e.g., saveToLocalStorage(); or sendToServer(wordList);
        alert('Word added temporarily. Changes will be lost on reload.');
    }

    // --- Handle Deleting a Word ---
    function handleDeleteWord(event) {
        const button = event.target;
        const indexToDelete = parseInt(button.dataset.index, 10); // Get index from data attribute

        if (isNaN(indexToDelete) || indexToDelete < 0 || indexToDelete >= wordList.length) {
            console.error("Invalid index for deletion:", button.dataset.index);
            alert("Error: Could not delete word due to invalid index.");
            return;
        }

        const wordToDelete = wordList[indexToDelete];

        if (confirm(`Are you sure you want to delete "${wordToDelete.english} / ${wordToDelete.thai}"?`)) {
            // Remove from the in-memory list
            wordList.splice(indexToDelete, 1);
            console.log("Word deleted. Index:", indexToDelete);
            console.log("Updated wordList:", wordList);


            // Update UI
            populateCategories(); // Update categories in case the last word of a category was removed
            displayVocabulary(categoryFilter.value); // Refresh table with current filter

            // **Reminder:** This change is only in memory.
            // To save permanently, you'd need to send the updated `wordList`
            // to a backend API here, or save to localStorage.
            // e.g., saveToLocalStorage(); or sendToServer(wordList);
             alert('Word deleted temporarily. Changes will be lost on reload.');
        }
    }

    // --- Handle Category Filter Change ---
    function handleFilterChange() {
        displayVocabulary(categoryFilter.value);
    }

    // --- Attach Event Listeners ---
    addWordForm.addEventListener('submit', handleAddWord);
    categoryFilter.addEventListener('change', handleFilterChange);

    // --- Initial Load ---
    loadVocabulary();

});

// Optional: Example functions for localStorage (uncomment and adapt if needed)
/*
function saveToLocalStorage() {
    try {
        localStorage.setItem('flashcardWordList', JSON.stringify(wordList));
        console.log("Word list saved to localStorage.");
    } catch (e) {
        console.error("Error saving to localStorage:", e);
        alert("Could not save changes to local storage. Storage might be full or disabled.");
    }
}

function loadFromLocalStorage() {
    const storedList = localStorage.getItem('flashcardWordList');
    if (storedList) {
        try {
            wordList = JSON.parse(storedList);
            console.log("Word list loaded from localStorage.");
            return true; // Indicate success
        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            localStorage.removeItem('flashcardWordList'); // Remove corrupted data
            return false; // Indicate failure
        }
    }
    return false; // Indicate nothing was loaded
}

// Modify loadVocabulary to try localStorage first:
async function loadVocabulary() {
    if (loadFromLocalStorage()) {
        // Data loaded from localStorage, update UI
        populateCategories();
        displayVocabulary();
    } else {
        // Load from JSON file as fallback or initial load
        try {
            const response = await fetch('wordlist.json');
            // ... rest of the fetch logic ...
        } catch (error) {
            // ... error handling ...
        }
    }
}

// Call saveToLocalStorage() after adding or deleting words in handleAddWord and handleDeleteWord
*/
