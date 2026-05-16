// Configuração do Firebase (Será preenchida dinamicamente no carregamento)
let db, auth;

async function initFirebase() {
    try {
        const response = await fetch('firebase-applet-config.json');
        const config = await response.json();
        
        firebase.initializeApp(config);
        db = firebase.firestore();
        auth = firebase.auth();

        auth.onAuthStateChanged(user => {
            if (user) {
                document.getElementById('view-login').classList.add('hidden');
                document.getElementById('main-ui').classList.remove('hidden');
                document.getElementById('user-photo').src = user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName;
                showTab('feed');
                loadFeed();
                loadRanking();
            } else {
                document.getElementById('view-login').classList.remove('hidden');
                document.getElementById('main-ui').classList.add('hidden');
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
}

// Login
document.getElementById('btn-login').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

// Mock Feed
function loadFeed() {
    const list = document.getElementById('pedals-list');
    const mockPedals = [
        { name: 'Pedal de Sexta', creator: 'João Silva', dist: '30km', time: '19:00' },
        { name: 'Treino da Madrugada', creator: 'Maria Costa', dist: '50km', time: '05:30' }
    ];
    
    list.innerHTML = mockPedals.map(p => `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
                <h3 class="font-bold">${p.name}</h3>
                <p class="text-sm text-slate-500">${p.creator} • ${p.dist}</p>
            </div>
            <span class="text-blue-600 font-semibold">${p.time}</span>
        </div>
    `).join('');
}

// Tracking Logic
let isTracking = false;
let startTime, timerInterval;

function startTracking() {
    isTracking = true;
    startTime = Date.now();
    document.getElementById('btn-toggle-tracking').innerText = "Encerrar Pedal";
    document.getElementById('btn-toggle-tracking').classList.replace('bg-blue-600', 'bg-red-500');
    
    timerInterval = setInterval(() => {
        const diff = Date.now() - startTime;
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        document.getElementById('timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTracking() {
    isTracking = false;
    clearInterval(timerInterval);
    document.getElementById('btn-toggle-tracking').innerText = "Iniciar Pedal";
    document.getElementById('btn-toggle-tracking').classList.replace('bg-red-500', 'bg-blue-600');
    alert("Pedal concluído com sucesso!");
}

document.getElementById('btn-toggle-tracking').addEventListener('click', () => {
    if (isTracking) stopTracking();
    else startTracking();
});

// Ranking
function loadRanking() {
    const list = document.getElementById('ranking-list');
    const mockRanking = [
        { name: 'Carlos Lima', dist: 450, change: 'up' },
        { name: 'Ana Souza', dist: 410, change: 'none' },
        { name: 'Paulo Silva', dist: 390, change: 'down' }
    ];

    list.innerHTML = mockRanking.map((u, i) => `
        <div class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <span class="font-bold text-slate-300 w-4">${i + 1}</span>
            <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div class="flex-1">
                <div class="font-semibold">${u.name}</div>
                <div class="text-xs text-slate-500">${u.dist} km rodados</div>
            </div>
            <i data-lucide="trending-${u.change === 'up' ? 'up' : (u.change === 'down' ? 'down' : 'flat')}" class="w-4 h-4 ${u.change === 'up' ? 'text-green-500' : 'text-slate-300'}"></i>
        </div>
    `).join('');
    lucide.createIcons();
}

// Iniciar
initFirebase();
