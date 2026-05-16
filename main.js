// Configuração do Firebase e Google Maps
let db, auth, map;

async function initFirebase() {
    try {
        const response = await fetch('firebase-applet-config.json');
        const config = await response.json();
        
        // Inicializar Firebase
        firebase.initializeApp(config);
        db = firebase.firestore();
        auth = firebase.auth();

        // Carregar Google Maps se a chave estiver presente
        const mapsKey = config.googleMapsKey || "";
        if (mapsKey) {
            loadGoogleMaps(mapsKey);
        }

        auth.onAuthStateChanged(async user => {
            if (user) {
                if (user.isAnonymous) {
                    console.log("Logado anonimamente");
                } else {
                    document.getElementById('btn-login-header').innerHTML = `<img src="${user.photoURL}" class="w-full h-full rounded-full object-cover">`;
                }
                loadRanking();
            } else {
                // Login automático anônimo para iniciar o site imediatamente
                try {
                    await auth.signInAnonymously();
                } catch (error) {
                    console.error("Erro no login anônimo:", error);
                }
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
}

function loadGoogleMaps(key) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -23.5505, lng: -46.6333 },
            zoom: 15,
            disableDefaultUI: true
        });
    };
    document.head.appendChild(script);
}

// Login via header (opcional para quem quer salvar os dados permanentemente)
document.getElementById('btn-login-header').addEventListener('click', () => {
    if (auth.currentUser && !auth.currentUser.isAnonymous) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

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
