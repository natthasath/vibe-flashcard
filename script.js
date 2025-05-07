// Vocabulary database
const vocabulary = [
    // Basic Words
    { 
        english: "Hello", 
        pronunciation: "ha-'lō", 
        thai: "สวัสดี", 
        thaiPronunciation: "sà-wàt-dee", 
        category: "basics",
        example: "Hello, how are you?",
        thaiExample: "สวัสดี คุณเป็นอย่างไรบ้าง?",
        mastered: false,
        bookmarked: false
    },
    // ... (rest of the vocabulary array)
];

// App state
let currentCardIndex = 0;
let filteredVocabulary = [...vocabulary];
let practiceStreak = 0;
let lastPracticeDate = new Date().toDateString();

// DOM elements
const flashcard = document.getElementById('flashcard');
const englishWord = document.getElementById('english-word');
const englishPronunciation = document.getElementById('english-pronunciation');
const englishExample = document.getElementById('english-example');
const thaiTranslation = document.getElementById('thai-translation');
const thaiPronunciation = document.getElementById('thai-pronunciation');
const thaiExample = document.getElementById('thai-example');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');
const currentCardDisplay = document.getElementById('current-card');
const totalCardsDisplay = document.getElementById('total-cards');
const categorySelect = document.getElementById('category-select');
const wordlistBody = document.getElementById('wordlist-body');
const wordlistSearch = document.getElementById('wordlist-search');
const bookmarkBtn = document.getElementById('bookmark-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const totalWordsDisplay = document.getElementById('total-words');
const masteredWordsDisplay = document.getElementById('mastered-words');
const practiceStreakDisplay = document.getElementById('practice-streak');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Local Storage functions
function saveToLocalStorage() {
    localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
    localStorage.setItem('practiceStreak', practiceStreak);
    localStorage.setItem('lastPracticeDate', lastPracticeDate);
}

function loadFromLocalStorage() {
    const savedVocabulary = localStorage.getItem('vocabulary');
    if (savedVocabulary) {
        vocabulary.length = 0;
        const parsedVocabulary = JSON.parse(savedVocabulary);
        parsedVocabulary.forEach(word => vocabulary.push(word));
    }
    
    const savedStreak = localStorage.getItem('practiceStreak');
    if (savedStreak) {
        practiceStreak = parseInt(savedStreak);
    }
    
    const savedDate = localStorage.getItem('lastPracticeDate');
    if (savedDate) {
        lastPracticeDate = savedDate;
    }
}

// Filter vocabulary based on selected category
function updateFilteredVocabulary() {
    const selectedCategory = categorySelect.value;
    
    if (selectedCategory === 'all') {
        filteredVocabulary = [...vocabulary];
    } else {
        filteredVocabulary = vocabulary.filter(word => word.category === selectedCategory);
    }
    
    currentCardIndex = 0;
    updateCardDisplay();
    updateNavigationButtons();
}

// Update the displayed card with current vocabulary
function updateCardDisplay() {
    if (filteredVocabulary.length === 0) {
        englishWord.textContent = "No words available";
        englishPronunciation.textContent = "";
        englishExample.textContent = "";
        thaiTranslation.textContent = "";
        thaiPronunciation.textContent = "";
        thaiExample.textContent = "";
        return;
    }
    
    const currentWord = filteredVocabulary[currentCardIndex];
    
    englishWord.textContent = currentWord.english;
    englishPronunciation.textContent = currentWord.pronunciation;
    englishExample.textContent = currentWord.example;
    thaiTranslation.textContent = currentWord.thai;
    thaiPronunciation.textContent = currentWord.thaiPronunciation;
    thaiExample.textContent = currentWord.thaiExample;
    
    // Update bookmark button
    updateBookmarkButton(currentWord.bookmarked);
    
    // Reset card to front
    if (flashcard.classList.contains('flipped')) {
        flashcard.classList.remove('flipped');
    }
    
    // Update progress display
    currentCardDisplay.textContent = currentCardIndex + 1;
    totalCardsDisplay.textContent = filteredVocabulary.length;
}

// Update navigation buttons state
function updateNavigationButtons() {
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === filteredVocabulary.length - 1;
}

// Update word list table
function updateWordList() {
    wordlistBody.innerHTML = '';
    
    vocabulary.forEach((word, index) => {
        const row = document.createElement('tr');
        row.className = word.mastered ? 'bg-green-50' : 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">${word.english}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${word.pronunciation}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${word.thai}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${getCategoryColor(word.category)}">
                    ${word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 view-word-btn" data-index="${index}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="text-green-600 hover:text-green-900 mr-3 mastered-btn" data-index="${index}">
                    <i class="fas ${word.mastered ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="text-yellow-600 hover:text-yellow-900 bookmark-btn" data-index="${index}">
                    <i class="fas ${word.bookmarked ? 'fa-bookmark' : 'fa-bookmark'} ${word.bookmarked ? 'text-yellow-500' : 'text-gray-300'}"></i>
                </button>
            </td>
        `;
        
        wordlistBody.appendChild(row);
    });
    
    // Add event listeners to word list buttons
    document.querySelectorAll('.view-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').getAttribute('data-index'));
            viewWordFromList(index);
        });
    });
    
    document.querySelectorAll('.mastered-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').getAttribute('data-index'));
            toggleMastered(index);
        });
    });
    
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').getAttribute('data-index'));
            toggleBookmarkFromList(index);
        });
    });
}

// Get color for category badge
function getCategoryColor(category) {
    switch(category) {
        case 'basics': return 'bg-blue-100 text-blue-800';
        case 'food': return 'bg-green-100 text-green-800';
        case 'travel': return 'bg-yellow-100 text-yellow-800';
        case 'business': return 'bg-purple-100 text-purple-800';
        case 'academic': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Update stats
function updateStats() {
    totalWordsDisplay.textContent = vocabulary.length;
    masteredWordsDisplay.textContent = vocabulary.filter(word => word.mastered).length;
    practiceStreakDisplay.textContent = `${practiceStreak} ${practiceStreak === 1 ? 'day' : 'days'}`;
}

// Check and update practice streak
function checkPracticeStreak() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if there's a saved streak in localStorage first
    const savedStreak = localStorage.getItem('practiceStreak');
    const savedDate = localStorage.getItem('lastPracticeDate');
    
    if (savedStreak && savedDate) {
        practiceStreak = parseInt(savedStreak);
        lastPracticeDate = savedDate;
        
        // Check if we need to update the streak
        const today = new Date().toDateString();
        if (lastPracticeDate !== today) {
            // Reset streak if more than a day has passed since last practice
            const lastDate = new Date(lastPracticeDate);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                practiceStreak = 1; // Reset streak
            } else if (diffDays === 1) {
                practiceStreak++; // Increase streak by 1
            }
            
            lastPracticeDate = today;
            saveToLocalStorage();
        }
    } else {
        // For demo purposes, we'll just set a random streak if no data exists
        practiceStreak = Math.floor(Math.random() * 10) + 1;
        lastPracticeDate = today.toDateString();
        saveToLocalStorage();
    }
    
    updateStats();
}

// Initialize the app
function init() {
    loadFromLocalStorage();
    updateFilteredVocabulary();
    updateCardDisplay();
    updateWordList();
    updateNavigationButtons();
    updateStats();
    checkPracticeStreak();
    updateAdminWordList();

    // Event listeners
    flashcard.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    prevBtn.addEventListener('click', showPreviousCard);
    nextBtn.addEventListener('click', showNextCard);
    categorySelect.addEventListener('change', handleCategoryChange);
    wordlistSearch.addEventListener('input', handleWordlistSearch);
    bookmarkBtn.addEventListener('click', toggleBookmark);
    shuffleBtn.addEventListener('click', shuffleCards);
    
    // Admin functionality event listeners
    document.getElementById('add-vocab-btn').addEventListener('click', openAddVocabModal);
    document.getElementById('manage-categories-btn').addEventListener('click', openCategoryModal);
    document.getElementById('close-vocab-modal').addEventListener('click', closeVocabModal);
    document.getElementById('cancel-vocab-btn').addEventListener('click', closeVocabModal);
    document.getElementById('vocab-form').addEventListener('submit', saveVocabulary);
    document.getElementById('close-category-modal').addEventListener('click', closeCategoryModal);
    document.getElementById('add-category-btn').addEventListener('click', addNewCategory);
    document.getElementById('close-delete-modal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    
    // Pronunciation buttons
    document.querySelectorAll('.pronunciation-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = e.target.closest('.flex').querySelector('span').textContent;
            speakWord(word);
        });
    });

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.id.replace('-tab-btn', '');
            switchTab(tabId);
        });
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Card interaction functions
function flipCard() {
    flashcard.classList.toggle('flipped');
}

function showPreviousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateCardDisplay();
        updateNavigationButtons();
    }
}

function showNextCard() {
    if (currentCardIndex < filteredVocabulary.length - 1) {
        currentCardIndex++;
        updateCardDisplay();
        updateNavigationButtons();
    }
}

function handleCategoryChange() {
    updateFilteredVocabulary();
}

function handleWordlistSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = wordlistBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const englishWord = row.querySelector('td:first-child').textContent.toLowerCase();
        const thaiWord = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (englishWord.includes(searchTerm) || thaiWord.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleBookmark() {
    const currentWord = filteredVocabulary[currentCardIndex];
    currentWord.bookmarked = !currentWord.bookmarked;
    updateBookmarkButton(currentWord.bookmarked);
    saveToLocalStorage();
    updateWordList();
}

function updateBookmarkButton(bookmarked) {
    const icon = bookmarkBtn.querySelector('i');
    if (bookmarked) {
        icon.classList.remove('far');
        icon.classList.add('fas', 'text-yellow-500');
    } else {
        icon.classList.remove('fas', 'text-yellow-500');
        icon.classList.add('far');
    }
}

function shuffleCards() {
    for (let i = filteredVocabulary.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredVocabulary[i], filteredVocabulary[j]] = [filteredVocabulary[j], filteredVocabulary[i]];
    }
    currentCardIndex = 0;
    updateCardDisplay();
    updateNavigationButtons();
}

// Word list interaction functions
function viewWordFromList(index) {
    const word = vocabulary[index];
    const wordIndex = filteredVocabulary.findIndex(w => w.english === word.english);
    
    if (wordIndex !== -1) {
        currentCardIndex = wordIndex;
        updateCardDisplay();
        updateNavigationButtons();
        switchTab('flashcards');
    }
}

function toggleMastered(index) {
    vocabulary[index].mastered = !vocabulary[index].mastered;
    saveToLocalStorage();
    updateWordList();
    updateStats();
}

function toggleBookmarkFromList(index) {
    vocabulary[index].bookmarked = !vocabulary[index].bookmarked;
    saveToLocalStorage();
    updateWordList();
}

// Tab switching
function switchTab(tabId) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        if (btn.id === `${tabId}-tab-btn`) {
            btn.classList.add('active', 'text-indigo-700', 'border-b-2', 'border-indigo-700', 'bg-indigo-50');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('active', 'text-indigo-700', 'border-b-2', 'border-indigo-700', 'bg-indigo-50');
            btn.classList.add('text-gray-500');
        }
    });
    
    // Update tab content
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Text-to-speech
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
}

// Admin functions
function updateAdminWordList() {
    const adminWordlistBody = document.getElementById('admin-wordlist-body');
    if (!adminWordlistBody) return;
    
    adminWordlistBody.innerHTML = '';
    
    vocabulary.forEach((word, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${word.english}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${word.thai}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(word.category)}">
                    ${word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-word-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 delete-word-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        adminWordlistBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.edit-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').getAttribute('data-index'));
            editWord(index);
        });
    });
    
    document.querySelectorAll('.delete-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').getAttribute('data-index'));
            confirmDeleteWord(index);
        });
    });
}

function openAddVocabModal() {
    document.getElementById('modal-title').textContent = 'Add New Word';
    document.getElementById('word-id').value = '';
    document.getElementById('vocab-form').reset();
    document.getElementById('vocab-modal').classList.remove('hidden');
}

function openCategoryModal() {
    document.getElementById('category-modal').classList.remove('hidden');
    updateCategoryList();
}

function closeVocabModal() {
    document.getElementById('vocab-modal').classList.add('hidden');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.add('hidden');
}

function closeDeleteModal() {
    document.getElementById('delete-confirm-modal').classList.add('hidden');
}

function saveVocabulary(e) {
    e.preventDefault();
    
    const wordId = document.getElementById('word-id').value;
    const newWord = {
        english: document.getElementById('english-input').value,
        pronunciation: document.getElementById('pronunciation-input').value,
        thai: document.getElementById('thai-input').value,
        thaiPronunciation: document.getElementById('thai-pronunciation-input').value,
        category: document.getElementById('category-input').value,
        example: document.getElementById('example-input').value,
        thaiExample: document.getElementById('thai-example-input').value,
        mastered: false,
        bookmarked: false
    };
    
    if (wordId === '') {
        vocabulary.push(newWord);
    } else {
        const index = parseInt(wordId);
        vocabulary[index] = { ...vocabulary[index], ...newWord };
    }
    
    saveToLocalStorage();
    updateFilteredVocabulary();
    updateWordList();
    updateAdminWordList();
    closeVocabModal();
}

function editWord(index) {
    const word = vocabulary[index];
    document.getElementById('modal-title').textContent = 'Edit Word';
    document.getElementById('word-id').value = index;
    document.getElementById('english-input').value = word.english;
    document.getElementById('pronunciation-input').value = word.pronunciation;
    document.getElementById('thai-input').value = word.thai;
    document.getElementById('thai-pronunciation-input').value = word.thaiPronunciation;
    document.getElementById('category-input').value = word.category;
    document.getElementById('example-input').value = word.example;
    document.getElementById('thai-example-input').value = word.thaiExample;
    
    document.getElementById('vocab-modal').classList.remove('hidden');
}

function confirmDeleteWord(index) {
    const word = vocabulary[index];
    document.getElementById('delete-message').textContent = `Are you sure you want to delete "${word.english}"?`;
    document.getElementById('confirm-delete-btn').setAttribute('data-index', index);
    document.getElementById('delete-confirm-modal').classList.remove('hidden');
}

function confirmDelete() {
    const index = parseInt(document.getElementById('confirm-delete-btn').getAttribute('data-index'));
    vocabulary.splice(index, 1);
    saveToLocalStorage();
    updateFilteredVocabulary();
    updateWordList();
    updateAdminWordList();
    closeDeleteModal();
}

function addNewCategory() {
    const input = document.getElementById('new-category-input');
    const category = input.value.trim().toLowerCase();
    
    if (category && !vocabulary.some(word => word.category === category)) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        document.getElementById('category-input').appendChild(option);
        input.value = '';
        updateCategoryList();
    }
}

function updateCategoryList() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;
    
    const categories = [...new Set(vocabulary.map(word => word.category))];
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 hover:bg-gray-50 rounded';
        li.innerHTML = `
            <span class="text-sm font-medium text-gray-900">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <button class="text-red-600 hover:text-red-900 delete-category-btn" data-category="${category}">
                <i class="fas fa-times"></i>
            </button>
        `;
        categoryList.appendChild(li);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.closest('button').getAttribute('data-category');
            deleteCategory(category);
        });
    });
}

function deleteCategory(category) {
    // Remove category from vocabulary
    vocabulary.forEach(word => {
        if (word.category === category) {
            word.category = 'basics'; // Default to basics category
        }
    });
    
    // Remove category from select options
    const select = document.getElementById('category-input');
    const option = Array.from(select.options).find(opt => opt.value === category);
    if (option) {
        select.removeChild(option);
    }
    
    saveToLocalStorage();
    updateFilteredVocabulary();
    updateWordList();
    updateAdminWordList();
    updateCategoryList();
} 