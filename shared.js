// ============================================================
// Configuración de Supabase (clave pública, segura de exponer)
// ============================================================
export const SUPABASE_URL = 'https://cewwbutnpkjocjynapem.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_C3nZa7XNVocbPOXOGXMNUA_ZhAQZobf';

export const CATEGORIAS = ['3ra','4ta','5ta','6ta','7ma'];
export const CATEGORIA_LABEL = { '3ra':'3ª','4ta':'4ª','5ta':'5ª','6ta':'6ª','7ma':'7ª' };

// ============================================================
// Configuración de puntuación (editable aquí)
// ============================================================
export const POINTS_PER_WIN = 0;  // Puntos por ganar un partido

// Configuración de puntos por posición en torneo
export const POINTS_BY_POSITION = {
  '1ro': 100,
  '2do': 70,
  '3ro': 50,
  '4to': 30,
  '5to': 20,
  '6to': 10
};

// ============================================================
// Lateralidad
// ============================================================
export const LATERALIDADES = { 'diestro': 'Diestro', 'zurdo': 'Zurdo' };

// ============================================================
// Utilidades
// ============================================================
export function uid(prefix='id'){
  return prefix + '_' + Math.random().toString(36).slice(2,10);
}

// Una pareja sin campo "estado" se considera aprobada (compatibilidad con datos viejos)
export function isAprobada(p){
  return (p.estado || 'aprobada') === 'aprobada';
}

// ============================================================
// Datos de ejemplo (se cargan una sola vez, si la base está vacía)
// ============================================================
export function seedDemoData(){
  // Jugadores individuales
  const jugadores = [
    {id:uid('j'), nombre:'Fabricio Gonzalez', lateralidad:'diestro', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Juan Martinez', lateralidad:'zurdo', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Martín López', lateralidad:'diestro', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Lucas Fernández', lateralidad:'diestro', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Nico Ruiz', lateralidad:'zurdo', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Fede García', lateralidad:'diestro', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Tomi Sánchez', lateralidad:'diestro', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Santi Pérez', lateralidad:'zurdo', categoria:'7ma', foto:'', historial:[]},
  ];

  const parejas7ma = [
    {id:uid('p'), j1_id:jugadores[0].id, j2_id:jugadores[1].id, j1:jugadores[0].nombre, j2:jugadores[1].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[2].id, j2_id:jugadores[3].id, j1:jugadores[2].nombre, j2:jugadores[3].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[4].id, j2_id:jugadores[5].id, j1:jugadores[4].nombre, j2:jugadores[5].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[6].id, j2_id:jugadores[7].id, j1:jugadores[6].nombre, j2:jugadores[7].nombre, telefono:'', estado:'aprobada'},
  ];

  const torneo = {
    id: uid('t'),
    nombre: 'Apertura Marzo',
    fecha: '14 al 22 de Marzo',
    lugar: 'Padel Club Norte',
    estado: 'curso',
    categorias: ['7ma','6ta','5ta'],
    parejas: { '7ma': parejas7ma, '6ta': [], '5ta': [] },
    brackets: { '7ma': null, '6ta': null, '5ta': null },
    puntos_por_posicion: { ...POINTS_BY_POSITION }
  };
  torneo.brackets['7ma'] = generateBracket(torneo.parejas['7ma']);

  const otros = [
    { nombre:'Copa Otoño', fecha:'04 de Abril', lugar:'Reja Sur Pádel', categorias:['4ta','6ta'] },
    { nombre:'Torneo Amistad', fecha:'25 de Abril', lugar:'Club Atlético Oeste', categorias:['5ta','7ma'] },
    { nombre:'Nocturno de Mayo', fecha:'16 de Mayo', lugar:'Padel Indoor Centro', categorias:['3ra','5ta'] },
  ].map(t=>({
    id: uid('t'), nombre:t.nombre, fecha:t.fecha, lugar:t.lugar, estado:'abierto',
    categorias:t.categorias,
    parejas: Object.fromEntries(t.categorias.map(c=>[c,[]])),
    brackets: Object.fromEntries(t.categorias.map(c=>[c,null])),
    puntos_por_posicion: { ...POINTS_BY_POSITION }
  }));

  return { torneos: [torneo, ...otros], jugadores, configuracion: { puntos_por_posicion: { ...POINTS_BY_POSITION } } };
}

// ============================================================
// Generación de llaves (bracket de eliminación directa)
// ============================================================
function nextPow2(n){ let p=1; while(p<n) p*=2; return p; }

function seedOrder(size){
  let seeds=[1];
  while(seeds.length<size){
    const l = seeds.length*2;
    const next=[];
    seeds.forEach(s=>{ next.push(s); next.push(l+1-s); });
    seeds = next;
  }
  return seeds;
}

export function generateBracket(parejas){
  // Filtrar solo parejas aprobadas
  const aprobadas = parejas.filter(isAprobada);
  const n = aprobadas.length;
  if(n < 2) return null;
  const size = nextPow2(n);
  const order = seedOrder(size);
  const slots = order.map(seed => seed<=n ? {...aprobadas[seed-1], seed} : {bye:true, seed});

  const round0 = [];
  for(let i=0;i<slots.length;i+=2){
    const teamA = slots[i], teamB = slots[i+1];
    let winner = null;
    if(teamA.bye && !teamB.bye) winner = teamB;
    else if(teamB.bye && !teamA.bye) winner = teamA;
    round0.push({ teamA, teamB, winner });
  }

  const rounds = [round0];
  let current = round0;
  while(current.length > 1){
    const next = [];
    for(let i=0;i<current.length;i+=2){
      next.push({ teamA: current[i].winner || null, teamB: current[i+1].winner || null, winner:null });
    }
    rounds.push(next);
    current = next;
  }
  return rounds;
}

export function propagateWinner(rounds, roundIdx, matchIdx, winner){
  rounds[roundIdx][matchIdx].winner = winner;
  if(roundIdx+1 < rounds.length){
    const nextMatchIdx = Math.floor(matchIdx/2);
    const slot = matchIdx % 2 === 0 ? 'teamA' : 'teamB';
    rounds[roundIdx+1][nextMatchIdx][slot] = winner;
    // si al asignar se completa un cruce donde el otro lado ya tenía bye, no aplica (los byes solo viven en ronda 0)
  }
}

// ============================================================
// Funciones para ranking y puntuación
// ============================================================
export function calcularRankingPorCategoria(jugadores, categoria){
  // Filtrar jugadores de esa categoría, sumar puntos y ordenar
  const jugadoresCat = jugadores.filter(j=>j.categoria===categoria);
  const ranking = jugadoresCat.map(j=>{
    const puntos = (j.historial || [])
      .filter(h=>h.categoria===categoria)
      .reduce((sum,h)=>sum+(h.puntos_ganados||0), 0);
    return {...j, puntos};
  }).sort((a,b)=>b.puntos - a.puntos);
  return ranking.map((j,i)=>({...j, puesto: i+1}));
}

export function sumarPuntosAlGanador(state, torneoId, categoria, parejaGanadoraId, posicion = null){
  const torneo = state.torneos.find(t=>t.id===torneoId);
  if(!torneo) return;
  const pareja = (torneo.parejas[categoria]||[]).find(p=>p.id===parejaGanadoraId);
  if(!pareja || pareja.bye) return;
  
  // Obtener IDs de los jugadores de la pareja ganadora
  const j1Id = pareja.j1_id;
  const j2Id = pareja.j2_id;
  
  // Determinar puntos según posición o usar POINTS_PER_WIN
  let puntos = POINTS_PER_WIN;
  if(posicion && torneo.puntos_por_posicion && torneo.puntos_por_posicion[posicion]){
    puntos = torneo.puntos_por_posicion[posicion];
  } else if(posicion && state.configuracion?.puntos_por_posicion?.[posicion]){
    puntos = state.configuracion.puntos_por_posicion[posicion];
  }
  
  // Actualizar historial de cada jugador
  [j1Id, j2Id].forEach(jId=>{
    const jugador = state.jugadores.find(j=>j.id===jId);
    if(jugador){
      jugador.historial = jugador.historial || [];
      jugador.historial.push({
        torneoId, categoria, parejaId: parejaGanadoraId,
        puntos_ganados: puntos, posicion: posicion, fecha: new Date().toISOString()
      });
    }
  });
}

// Función para obtener la posición final de una pareja en el torneo
export function getPosicionFinal(rounds, parejaId) {
  // Buscar en qué ronda fue eliminada la pareja
  let posicion = null;
  
  // Recorrer todas las rondas
  for (let ri = 0; ri < rounds.length; ri++) {
    const round = rounds[ri];
    for (let mi = 0; mi < round.length; mi++) {
      const match = round[mi];
      
      // Si la pareja está en este partido
      if ((match.teamA && match.teamA.id === parejaId) || 
          (match.teamB && match.teamB.id === parejaId)) {
        
        // Si es la final (última ronda)
        if (ri === rounds.length - 1) {
          if (match.winner && match.winner.id === parejaId) {
            return '1ro'; // Ganador
          } else if (match.winner) {
            return '2do'; // Subcampeón
          }
        }
        
        // Si perdió en este partido
        if (match.winner && match.winner.id !== parejaId) {
          // Determinar posición según la ronda
          const totalRondas = rounds.length;
          const rondasRestantes = totalRondas - ri - 1;
          
          // Posiciones: 1ro, 2do, 3ro, 4to, 5to, 6to, etc.
          const posicionMap = {
            0: '3ro', // Perdió en semifinal (2 rondas restantes)
            1: '4to', // Perdió en cuartos
            2: '5to', // Perdió en octavos
            3: '6to'  // Perdió en 16vos
          };
          
          return posicionMap[rondasRestantes] || 'participante';
        }
      }
    }
  }
  
  return null;
}

// Función para asignar puntos a todas las parejas según su posición final
export function asignarPuntosPorPosicion(state, torneoId, categoria) {
  const torneo = state.torneos.find(t=>t.id===torneoId);
  if(!torneo || !torneo.brackets[categoria]) return;
  
  const bracket = torneo.brackets[categoria];
  const parejas = torneo.parejas[categoria] || [];
  
  // Obtener todos los IDs de parejas que participaron
  const parejasIds = parejas.filter(isAprobada).map(p => p.id);
  
  // Asignar puntos según posición
  parejasIds.forEach(parejaId => {
    const posicion = getPosicionFinal(bracket, parejaId);
    if (posicion) {
      sumarPuntosAlGanador(state, torneoId, categoria, parejaId, posicion);
    }
  });
}

// Función para crear o actualizar jugadores desde una pareja
export function crearOActualizarJugadoresDesdePareja(state, pareja) {
  if (!state.jugadores) state.jugadores = [];
  
  // Crear o actualizar jugador 1
  if (pareja.j1 && !pareja.j1_id) {
    const nuevoId = uid('j');
    pareja.j1_id = nuevoId;
    state.jugadores.push({
      id: nuevoId,
      nombre: pareja.j1,
      lateralidad: 'diestro',
      categoria: '7ma',
      foto: '',
      historial: []
    });
  } else if (pareja.j1 && pareja.j1_id) {
    // Actualizar nombre si ya existe
    const jugador = state.jugadores.find(j => j.id === pareja.j1_id);
    if (jugador && jugador.nombre !== pareja.j1) {
      jugador.nombre = pareja.j1;
    }
  }
  
  // Crear o actualizar jugador 2
  if (pareja.j2 && !pareja.j2_id) {
    const nuevoId = uid('j');
    pareja.j2_id = nuevoId;
    state.jugadores.push({
      id: nuevoId,
      nombre: pareja.j2,
      lateralidad: 'diestro',
      categoria: '7ma',
      foto: '',
      historial: []
    });
  } else if (pareja.j2 && pareja.j2_id) {
    // Actualizar nombre si ya existe
    const jugador = state.jugadores.find(j => j.id === pareja.j2_id);
    if (jugador && jugador.nombre !== pareja.j2) {
      jugador.nombre = pareja.j2;
    }
  }
}

// ============================================================
// Capa de datos (Supabase) — un único documento JSON en la tabla "torneos"
// ============================================================
export async function loadState(supabase){
  const { data, error } = await supabase.from('torneos').select('data').eq('id','main').maybeSingle();
  if(error) throw error;
  if(data && data.data) return data.data;
  const seeded = seedDemoData();
  await saveState(supabase, seeded);
  return seeded;
}

export async function saveState(supabase, state){
  const { error } = await supabase.from('torneos').upsert({
    id: 'main', data: state, updated_at: new Date().toISOString()
  });
  if(error) throw error;
}

export function roundLabel(idx, total){
  const fromEnd = total - idx;
  const map = {1:'FINAL', 2:'SEMIFINALES', 3:'CUARTOS', 4:'OCTAVOS', 5:'16VOS'};
  return map[fromEnd] || `RONDA ${idx+1}`;
}
