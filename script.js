/**
 * HabitReflex - Logic
 */

// --- State Management ---
let habits = JSON.parse(localStorage.getItem('habits')) || [];

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// --- Date Handling ---
function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function updateDateDisplay() {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const date = d.getDate();
    const year = d.getFullYear();
    
    const fullDate = `${dayName}, ${monthName} ${date}, ${year}`;
    
    if (document.getElementById('current-full-date')) {
        document.getElementById('current-full-date').textContent = fullDate;
    }
    
    // Fallback for old placeholders
    if (document.getElementById('current-day')) document.getElementById('current-day').textContent = date.toString().padStart(2, '0');
    if (document.getElementById('current-month-year')) document.getElementById('current-month-year').textContent = `${monthName.substring(0,3).toUpperCase()} ${year}`;

    updateStats();
}

function updateStats() {
    const today = getTodayKey();
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => !!h.history[today]).length;
    const rate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    if (document.getElementById('stat-streak')) document.getElementById('stat-streak').textContent = `${maxStreak} Days`;
    if (document.getElementById('stat-rate')) document.getElementById('stat-rate').textContent = `${rate}%`;
    if (document.getElementById('stat-total')) document.getElementById('stat-total').textContent = totalHabits;
}

// --- Core Actions ---
function addHabit(title) {
    if (!title.trim()) return;
    
    const newHabit = {
        id: Date.now().toString(),
        title: title.trim(),
        createdAt: new Date().toISOString(),
        history: {}, // key: date (YYYY-MM-DD), value: boolean
        streak: 0
    };
    
    habits.push(newHabit);
    saveHabits();
    renderHabits();
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = getTodayKey();
    habit.history[today] = !habit.history[today];
    
    // Recalculate streak
    calculateStreak(habit);
    
    saveHabits();
    renderHabits();
}

function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    renderHabits();
}

function calculateStreak(habit) {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        
        if (habit.history[key]) {
            streak++;
        } else {
            if (i > 0) break;
        }
    }
    habit.streak = streak;
}

// --- UI Rendering ---
function renderHabits() {
    const grid = document.getElementById('habits-grid');
    grid.innerHTML = '';
    
    if (habits.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>No habits yet. Start something today.</p>
            </div>
        `;
        updateStats();
        return;
    }
    
    const today = getTodayKey();
    
    habits.forEach(habit => {
        const isCompleted = !!habit.history[today];
        const initial = habit.title.charAt(0).toUpperCase();
        
        const card = document.createElement('div');
        card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
        card.id = `habit-${habit.id}`;
        
        card.innerHTML = `
            <div class="habit-info-group">
                <div class="habit-icon">${initial}</div>
                <div class="habit-text-stack">
                    <span class="habit-title">${habit.title}</span>
                    <span class="streak-count">${habit.streak} DAY STREAK</span>
                </div>
            </div>
            
            <div class="habit-actions">
                <label class="check-action">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleHabit('${habit.id}')">
                    <div class="custom-checkbox"></div>
                </label>
                
                <button class="delete-btn" onclick="deleteHabit('${habit.id}')" title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    updateStats();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateDateDisplay();
    renderHabits();
    
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addHabit(input.value);
        input.value = '';
    });

    // Check for day change every minute
    setInterval(updateDateDisplay, 60000);
});
