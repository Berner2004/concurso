import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCv4s9MY2LusJsNHFMZeTGrbEnYxLcMlNQ",
  authDomain: "votacionesevento.firebaseapp.com",
  projectId: "votacionesevento",
  storageBucket: "votacionesevento.firebasestorage.app",
  messagingSenderId: "811437774346",
  appId: "1:811437774346:web:201f29d00468e12e4971f3",
  measurementId: "G-CCGHNMLGV7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventId = "2025";

const cardsContainer = document.getElementById('cards-container');

// --- ESTADO LOCAL ---
let participantesCache = {}; 
let scoresCache = [];
let judgesNames = {}; 
let previousTop3String = "";

// --- RENDERIZADO ---
function calcularYRenderizar() {
  const listaProcesada = Object.values(participantesCache).map(p => ({
    id: p.id,
    nombre: p.nombre,
    puntajesDetallados: [],
    total: 0
  }));

  scoresCache.forEach(scoreData => {
    const pid = scoreData.participantId;
    const jid = scoreData.judgeId;
    const participante = listaProcesada.find(p => p.id === pid);
    
    if (participante) {
      // Usar nombre del mapa
      const nombreJuez = judgesNames[jid] || "Juez";
      
      participante.puntajesDetallados.push({
        valor: scoreData.totalFinal,
        juez: nombreJuez
      });
    }
  });

  listaProcesada.forEach(p => {
    p.total = p.puntajesDetallados.reduce((a, b) => a + b.valor, 0);
  });

  listaProcesada.sort((a, b) => b.total - a.total);

  // Animación Flash
  const currentTop3Ids = listaProcesada.slice(0, 3).map(p => p.id);
  const currentTop3String = JSON.stringify(currentTop3Ids);
  if (previousTop3String !== "" && previousTop3String !== currentTop3String && listaProcesada.length > 0) {
      cardsContainer.classList.add('animate-update');
      setTimeout(() => cardsContainer.classList.remove('animate-update'), 1200);
  }
  previousTop3String = currentTop3String;

  // Render HTML
  cardsContainer.innerHTML = "";
  
  if (listaProcesada.length === 0) {
    cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Esperando comparsas...</div>`;
    return;
  }

  listaProcesada.forEach((p, index) => {
    let rankClass = "";
    if (index === 0) rankClass = "rank-1";
    else if (index === 1) rankClass = "rank-2";
    else if (index === 2) rankClass = "rank-3";

    let burbujasHtml = "";
    if (p.puntajesDetallados.length > 0) {
      burbujasHtml = p.puntajesDetallados.map(pt => `
        <div class="score-wrapper">
          <div class="judge-score">${pt.valor}</div>
          <div class="judge-name-label" title="${pt.juez}">${pt.juez}</div>
        </div>
      `).join('');
    } else {
      burbujasHtml = `<span style="font-size: 0.8em; color: #999;">Sin votos</span>`;
    }

    const card = document.createElement("div");
    card.className = `card ${rankClass}`;
    
    card.innerHTML = `
      <div class="card-title">${p.nombre}</div>
      <div class="judges-section">${burbujasHtml}</div>
      <div class="total-label">Puntaje Total</div>
      <div class="total-number">${p.total.toFixed(2)}</div>
    `;
    
    cardsContainer.appendChild(card);
  });
}

// --- LISTENERS ---

// 1. JUECES (Captura robusta de nombres)
onSnapshot(collection(db, `events/${eventId}/judges`), (snap) => {
  judgesNames = {};
  snap.forEach(doc => {
    const d = doc.data();
    // Busca el nombre en cualquier campo posible
    const nombreReal = d.nombre || d.name || d.displayName || d.usuario || d.alias || "Juez";
    judgesNames[doc.id] = nombreReal;
  });
  calcularYRenderizar();
});

onSnapshot(collection(db, `events/${eventId}/participants`), (snap) => {
  participantesCache = {}; 
  snap.forEach(doc => {
    const data = doc.data();
    participantesCache[doc.id] = { id: doc.id, nombre: data.nombre || data.participantNombre || "Sin nombre" };
  });
  calcularYRenderizar();
});

onSnapshot(collection(db, `events/${eventId}/scores`), (snap) => {
  scoresCache = []; 
  snap.forEach(doc => { scoresCache.push(doc.data()); });
  calcularYRenderizar();
});

// Nieve
function createSnowflakes() {
    const snowContainer = document.getElementById('snow-container');
    if (!snowContainer) return;
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; 
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowContainer.appendChild(snowflake);
    }
}
createSnowflakes();