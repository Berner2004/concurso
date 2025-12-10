import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Configuración de Firebase ---
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

const tbody = document.querySelector("#tablaResultados tbody");
const tablaContainer = document.getElementById('tablaContainer');

// --- ESTADO LOCAL ---
let participantesCache = {}; 
let scoresCache = [];       
let totalJueces = 0;
let previousTop3String = "";

// --- FUNCIÓN MAESTRA DE RENDERIZADO ---
function calcularYRenderizar() {
  // 1. Preparar lista combinando datos
  const listaProcesada = Object.values(participantesCache).map(p => ({
    id: p.id,
    nombre: p.nombre,
    carrera: p.carrera, // AQUI AGREGAMOS EL DATO AL PROCESO
    puntajes: [],
    total: 0,
    votos: 0,
    faltan: totalJueces
  }));

  // 2. Distribuir scores
  scoresCache.forEach(scoreData => {
    const pid = scoreData.participantId;
    const participante = listaProcesada.find(p => p.id === pid);
    if (participante) {
      participante.puntajes.push(scoreData.totalFinal);
      participante.votos += 1;
    }
  });

  // 3. Totales
  listaProcesada.forEach(p => {
    p.total = p.puntajes.reduce((a, b) => a + b, 0);
    p.faltan = Math.max(0, totalJueces - p.votos);
  });

  // 4. Ordenar
  listaProcesada.sort((a, b) => b.total - a.total);

  // --- Animación ---
  const currentTop3Ids = listaProcesada.slice(0, 3).map(p => p.id);
  const currentTop3String = JSON.stringify(currentTop3Ids);
  if (previousTop3String !== "" && previousTop3String !== currentTop3String && listaProcesada.length > 0) {
      tablaContainer.classList.add('animate-update');
      setTimeout(() => tablaContainer.classList.remove('animate-update'), 1200);
  }
  previousTop3String = currentTop3String;

  // 5. Renderizar HTML
  tbody.innerHTML = "";
  
  if (listaProcesada.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;">Esperando comparsas...</td></tr>`;
    return;
  }

  listaProcesada.forEach((p, index) => {
    let premio = "-";
    let clase = "";
    let iconoLugar = index + 1;

    if (index === 0) { premio = "🥇 $400"; clase = "gold"; iconoLugar = "⭐ 1"; }
    else if (index === 1) { premio = "🥈 $300"; clase = "silver"; iconoLugar = "🎄 2"; }
    else if (index === 2) { premio = "🥉 $200"; clase = "bronze"; iconoLugar = "⛄ 3"; }

    const tr = document.createElement("tr");
    tr.className = clase;
    
    // AQUI AGREGAMOS LA COLUMNA DE CARRERA
    tr.innerHTML = `
      <td>${iconoLugar}</td>
      <td>${p.nombre}<br><small>${p.votos}/${totalJueces} votos</small></td>
      <td>${p.carrera}</td> 
      <td class="puntaje-destacado">${p.total.toFixed(2)}</td>
      <td class="premio-destacado">${premio}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- LISTENERS ---

onSnapshot(collection(db, `events/${eventId}/judges`), (snap) => {
  totalJueces = snap.size;
  calcularYRenderizar();
});

onSnapshot(collection(db, `events/${eventId}/participants`), (snap) => {
  participantesCache = {}; 
  snap.forEach(doc => {
    const data = doc.data();
    participantesCache[doc.id] = {
      id: doc.id,
      nombre: data.nombre || data.participantNombre || "Sin nombre",
      // CAPTURAMOS EL CAMPO CARRERA
      carrera: data.carrera || "N/A" 
    };
  });
  calcularYRenderizar();
});

onSnapshot(collection(db, `events/${eventId}/scores`), (snap) => {
  scoresCache = []; 
  snap.forEach(doc => {
    scoresCache.push(doc.data());
  });
  calcularYRenderizar();
});

// --- Nieve ---
function createSnowflakes() {
    const snowContainer = document.getElementById('snow-container');
    if (!snowContainer) return;
    const numberOfSnowflakes = 50; 
    for (let i = 0; i < numberOfSnowflakes; i++) {
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