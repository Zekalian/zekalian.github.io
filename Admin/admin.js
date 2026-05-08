// --- UBAH PASSWORD DI SINI ---
const ACCESS_CODE = "zekalianberdua"; 

let inactivityTimer; 
const IDLE_TIME = 10000; // 10 detik

// Langsung inisialisasi saat file terbaca
initPortal();

function initPortal() {
    // Cek status login
    const isLoggedIn = localStorage.getItem("zekalian_auth");
    
    if (isLoggedIn === "true") {
        showDashboard();
        startInactivityTimer(); 
    } else {
        showLogin();
    }

    // Pasang pemantau aktivitas
    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("mousedown", resetTimer);
    document.addEventListener("keypress", resetTimer);
    document.addEventListener("scroll", resetTimer);
    document.addEventListener("touchstart", resetTimer);
}

function checkLogin() {
    const inputField = document.getElementById("pass-input");
    const errorMsg = document.getElementById("error-msg");
    const inputValue = inputField.value;

    if (inputValue === ACCESS_CODE) {
        localStorage.setItem("zekalian_auth", "true");
        errorMsg.style.display = "none";
        inputField.value = "";
        showDashboard();
        startInactivityTimer(); 
    } else {
        errorMsg.style.display = "block";
        inputField.value = "";
        inputField.focus();
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        checkLogin();
    }
}

function logout() {
    localStorage.removeItem("zekalian_auth");
    clearTimeout(inactivityTimer); 
    showLogin();
}

// --- FUNGSI AUTO-LOCK / IDLE TIMEOUT ---
function startInactivityTimer() {
    inactivityTimer = setTimeout(logout, IDLE_TIME);
}

function resetTimer() {
    if (localStorage.getItem("zekalian_auth") === "true") {
        clearTimeout(inactivityTimer); 
        startInactivityTimer();        
    }
}

// --- FUNGSI BANTU TAMPILAN ---
function showDashboard() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard-section").style.display = "block";
}

function showLogin() {
    document.getElementById("dashboard-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}