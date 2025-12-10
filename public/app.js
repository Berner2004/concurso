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

// Referencias al DOM
const tbody = document.querySelector("#tablaResultados tbody");
const tablaContainer = document.getElementById('tablaContainer');

// --- ESTADO LOCAL ---
// Almacenamos los datos aquí para cruzarlos cada vez que algo cambie
let participantesCache = {}; // Mapa { id: { datos } }
let scoresCache = [];        // Array de todos los votos
let totalJueces = 0;
let previousTop3String = ""; // Para detectar cambios en el podio

// --- FUNCIÓN MAESTRA DE RENDERIZADO ---
// Esta función se ejecuta cada vez que cambia CUALQUIER dato (Jueces, Participantes o Scores)
function calcularYRenderizar() {
  // 1. Preparar lista base combinando datos
  // Creamos un array limpio basado en los participantes actuales
  const listaProcesada = Object.values(participantesCache).map(p => ({
    id: p.id,
    nombre: p.nombre,
    puntajes: [],
    total: 0,
    votos: 0,
    faltan: totalJueces // Inicialmente faltan todos hasta contar
  }));

  // 2. Distribuir los puntajes (Scores) a cada participante
  scoresCache.forEach(scoreData => {
    const pid = scoreData.participantId;
    // Buscamos al participante en nuestra lista procesada
    const participante = listaProcesada.find(p => p.id === pid);
    
    // Solo procesamos el voto si el participante existe en la base de datos
    if (participante) {
      participante.puntajes.push(scoreData.totalFinal);
      participante.votos += 1;
    }
  });

  // 3. Calcular totales finales
  listaProcesada.forEach(p => {
    p.total = p.puntajes.reduce((acumulado, actual) => acumulado + actual, 0);
    p.faltan = Math.max(0, totalJueces - p.votos); // Evitar negativos
  });

  // 4. Ordenar de Mayor a Menor Puntaje
  listaProcesada.sort((a, b) => b.total - a.total);

  // --- LÓGICA DE ANIMACIÓN (Flash) ---
  const currentTop3Ids = listaProcesada.slice(0, 3).map(p => p.id);
  const currentTop3String = JSON.stringify(currentTop3Ids);

  // Si hay datos y el podio cambió respecto a la última vez
  if (previousTop3String !== "" && previousTop3String !== currentTop3String && listaProcesada.length > 0) {
      tablaContainer.classList.add('animate-update');
      setTimeout(() => tablaContainer.classList.remove('animate-update'), 1200);
  }
  previousTop3String = currentTop3String;

  // 5. Generar HTML
  tbody.innerHTML = "";
  
  if (listaProcesada.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:20px;">Esperando comparsas...</td></tr>`;
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
    
    tr.innerHTML = `
      <td>${iconoLugar}</td>
      <td>${p.nombre}<br><small>${p.votos}/${totalJueces} votos</small></td>
      <td class="puntaje-destacado">${p.total.toFixed(2)}</td>
      <td class="premio-destacado">${premio}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- LISTENERS EN TIEMPO REAL (EVENTOS) ---

// 1. Escuchar cambios en JUECES (Si se agregan jueces, se recalcula "faltan")
onSnapshot(collection(db, `events/${eventId}/judges`), (snap) => {
  totalJueces = snap.size;
  calcularYRenderizar();
});

// 2. Escuchar cambios en PARTICIPANTES (Agregar/Eliminar Comparsas)
// AQUÍ está la clave de tu petición: al usar onSnapshot, detecta altas y bajas.
onSnapshot(collection(db, `events/${eventId}/participants`), (snap) => {
  participantesCache = {}; // Reiniciamos el caché para evitar duplicados/fantasmas
  snap.forEach(doc => {
    const data = doc.data();
    participantesCache[doc.id] = {
      id: doc.id,
      nombre: data.nombre || data.participantNombre || "Sin nombre"
    };
  });
  calcularYRenderizar();
});

// 3. Escuchar cambios en PUNTAJES (Votos nuevos)
onSnapshot(collection(db, `events/${eventId}/scores`), (snap) => {
  scoresCache = []; // Reiniciamos caché de scores
  snap.forEach(doc => {
    scoresCache.push(doc.data());
  });
  calcularYRenderizar();
});

// --- Generador de Nieve ---
function createSnowflakes() {
    const snowContainer = document.getElementById('snow-container');
    // Si no existe el contenedor (por si acaso), no hacemos nada
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

// Iniciar Nieve
createSnowflakes();