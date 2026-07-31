// ============================================================
// Configuración de Supabase (clave pública, segura de exponer)
// ============================================================
export const SUPABASE_URL = 'https://cewwbutnpkjocjynapem.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_C3nZa7XNVocbPOXOGXMNUA_ZhAQZobf';

export const CATEGORIAS = ['3ra', '4ta', '5ta', '6ta', '7ma', '8va'];

export const CATEGORIA_LABEL = {
  '3ra': '3ª',
  '4ta': '4ª',
  '5ta': '5ª',
  '6ta': '6ª',
  '7ma': '7ª',
  '8va': '8ª'
};
// ============================================================
// Categorías "Suma" (p.ej. Suma 11, Suma 14): la categoría de la
// pareja surge de sumar la categoría individual de cada jugador.
// El admin puede crear las que quiera (Suma 5 a Suma 16, o la que sea)
// desde el panel — no están hardcodeadas, se guardan en state.config.
// ============================================================
export const DEFAULT_CATEGORIAS_SUMA = [11, 14];

export function isCategoriaSuma(codigo){
  return /^suma\d+$/.test(String(codigo||''));
}

export function sumaCategoriaCode(n){
  return `suma${n}`;
}

export function getCategoriasSumaConfig(state){
  const arr = (state?.config?.categoriasSuma) || [];
  return arr.slice().sort((a,b)=>a-b);
}

// Todas las categorías disponibles para armar un torneo: las fijas + las Suma configuradas
export function getAllCategorias(state){
  const extra = getCategoriasSumaConfig(state).map(sumaCategoriaCode);
  return [...CATEGORIAS, ...extra];
}

// Etiqueta de cualquier categoría (fija o Suma dinámica)
export function getCategoriaLabel(state, codigo){
  if(CATEGORIA_LABEL[codigo]) return CATEGORIA_LABEL[codigo];
  const m = /^suma(\d+)$/.exec(codigo||'');
  if(m) return `Suma ${m[1]}`;
  return codigo || '';
}

// ============================================================
// Configuración de puntuación (editable desde el panel de admin;
// estos son los valores por defecto la primera vez)
// ============================================================
export const DEFAULT_PUNTOS_CONFIG = {
  campeon: 100,
  subcampeon: 60,
  semifinal: 30,
  cuartos: 15,
  octavos: 5,
  dieciseisavos: 2,
};

export const POSICION_LABELS = {
  campeon: 'Campeón',
  subcampeon: 'Subcampeón',
  semifinal: 'Semifinalista',
  cuartos: 'Cuartos de final',
  octavos: 'Octavos de final',
  dieciseisavos: '16vos de final',
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

// Une el nombre escrito en una pareja con un registro real de la tabla de
// jugadores: si ya existe alguien con ese nombre lo reutiliza, si no lo crea.
// Así toda pareja (inscripta desde la web o cargada por el admin) queda
// vinculada a jugadores reales que después aparecen en "Jugadores" y suman
// puntos de ranking.
export function resolverJugadorId(state, nombre, categoria){
  const nombreNorm = (nombre || '').trim();
  if(!nombreNorm) return null;
  state.jugadores = state.jugadores || [];
  let jugador = state.jugadores.find(j => (j.nombre||'').trim().toLowerCase() === nombreNorm.toLowerCase());
  if(!jugador){
    jugador = { id: uid('j'), nombre: nombreNorm, lateralidad:'diestro', categoria, foto:'', historial:[] };
    state.jugadores.push(jugador);
  }
  return jugador.id;
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
    inscripcionAbierta: false,
    categorias: ['7ma','6ta','5ta'],
    parejas: { '7ma': parejas7ma, '6ta': [], '5ta': [] },
    brackets: { '7ma': null, '6ta': null, '5ta': null },
    partidos: [
      {
        id: uid('partido'), categoria: '7ma',
        equipoA: `${parejas7ma[0].j1} / ${parejas7ma[0].j2}`,
        equipoB: `${parejas7ma[1].j1} / ${parejas7ma[1].j2}`,
        fecha: '2026-05-18', hora: '16:00', cancha: 'Cancha 2', jugado: false
      },
      {
        id: uid('partido'), categoria: '7ma',
        equipoA: `${parejas7ma[2].j1} / ${parejas7ma[2].j2}`,
        equipoB: `${parejas7ma[3].j1} / ${parejas7ma[3].j2}`,
        fecha: '2026-05-18', hora: '18:30', cancha: 'Cancha 1', jugado: false
      }
    ]
  };
  torneo.brackets['7ma'] = generateBracket(torneo.parejas['7ma']);

  const otros = [
    { nombre:'Copa Otoño', fecha:'04 de Abril', lugar:'Reja Sur Pádel', categorias:['4ta','6ta'] },
    { nombre:'Torneo Amistad', fecha:'25 de Abril', lugar:'Club Atlético Oeste', categorias:['5ta','7ma'] },
    { nombre:'Nocturno de Mayo', fecha:'16 de Mayo', lugar:'Padel Indoor Centro', categorias:['3ra','5ta'] },
  ].map(t=>({
    id: uid('t'), nombre:t.nombre, fecha:t.fecha, lugar:t.lugar, estado:'abierto',
    inscripcionAbierta: true,
    categorias:t.categorias,
    parejas: Object.fromEntries(t.categorias.map(c=>[c,[]])),
    brackets: Object.fromEntries(t.categorias.map(c=>[c,null])),
    partidos: [],
  }));

  return { torneos: [torneo, ...otros], jugadores, config: { puntos: {...DEFAULT_PUNTOS_CONFIG}, categoriasSuma: [...DEFAULT_CATEGORIAS_SUMA] } };
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
  // En categorías "Suma" el jugador no tiene esa categoría como propia (la suya es
  // 3ra/4ta/etc.), así que en vez de filtrar por j.categoria tomamos a quienes
  // sumaron puntos en esa categoría dentro de su historial.
  const jugadoresCat = isCategoriaSuma(categoria)
    ? jugadores.filter(j => (j.historial||[]).some(h=>h.categoria===categoria))
    : jugadores.filter(j=>j.categoria===categoria);
  const ranking = jugadoresCat.map(j=>{
    const puntos = (j.historial || [])
      .filter(h=>h.categoria===categoria)
      .reduce((sum,h)=>sum+(h.puntos_ganados||0), 0);
    return {...j, puntos};
  }).sort((a,b)=>b.puntos - a.puntos);
  return ranking.map((j,i)=>({...j, puesto: i+1}));
}

export function getPuntosConfig(state){
  return { ...DEFAULT_PUNTOS_CONFIG, ...(state.config && state.config.puntos ? state.config.puntos : {}) };
}

// Recorre todas las llaves generadas y cuenta partidos realmente jugados
// (no cuenta los "bye") para un jugador, sea cual sea la pareja con la que jugó.
export function getJugadorPartidosStats(state, jugadorId){
  let ganados = 0, perdidos = 0;
  (state.torneos || []).forEach(t=>{
    Object.values(t.brackets || {}).forEach(rounds=>{
      if(!rounds) return;
      rounds.forEach(round=>{
        round.forEach(match=>{
          const { teamA, teamB, winner } = match;
          if(!teamA || !teamB || teamA.bye || teamB.bye) return; // no es un partido real
          const esA = teamA.j1_id === jugadorId || teamA.j2_id === jugadorId;
          const esB = teamB.j1_id === jugadorId || teamB.j2_id === jugadorId;
          if(!esA && !esB) return;
          if(!winner) return; // todavía no se jugó
          const gano = (esA && winner.id === teamA.id) || (esB && winner.id === teamB.id);
          if(gano) ganados++; else perdidos++;
        });
      });
    });
  });
  return { ganados, perdidos };
}

function awardPoints(state, torneoId, categoria, parejaId, puntos, posicion){
  if(!puntos) return;
  const torneo = state.torneos.find(t=>t.id===torneoId);
  if(!torneo) return;
  const pareja = (torneo.parejas[categoria]||[]).find(p=>p.id===parejaId);
  if(!pareja || pareja.bye) return;

  [pareja.j1_id, pareja.j2_id].forEach(jId=>{
    if(!jId) return;
    const jugador = state.jugadores.find(j=>j.id===jId);
    if(jugador){
      jugador.historial = jugador.historial || [];
      jugador.historial.push({
        torneoId, categoria, parejaId, puntos_ganados: puntos, posicion, fecha: new Date().toISOString()
      });
    }
  });
}

// Se llama cada vez que se define el ganador de un cruce en la llave.
// El PERDEDOR de ese cruce queda eliminado ahí, así que recibe los puntos
// de esa posición (semifinalista, cuartos, etc.) según la configuración.
// Si el cruce era la final, además el GANADOR recibe los puntos de campeón.
export function registrarResultadoPartido(state, torneoId, categoria, rounds, roundIdx, winner, loser){
  const puntos = getPuntosConfig(state);
  const totalRounds = rounds.length;
  const esFinal = roundIdx === totalRounds - 1;
  const fromEnd = totalRounds - roundIdx;
  const posicionMap = {1:'subcampeon', 2:'semifinal', 3:'cuartos', 4:'octavos', 5:'dieciseisavos'};

  if(loser && !loser.bye){
    const posicion = esFinal ? 'subcampeon' : posicionMap[fromEnd];
    if(posicion) awardPoints(state, torneoId, categoria, loser.id, puntos[posicion], posicion);
  }
  if(esFinal && winner && !winner.bye){
    awardPoints(state, torneoId, categoria, winner.id, puntos.campeon, 'campeon');
  }
}

export function roundLabel(idx, total){
  const fromEnd = total - idx;
  const map = {1:'FINAL', 2:'SEMIFINALES', 3:'CUARTOS', 4:'OCTAVOS', 5:'16VOS'};
  return map[fromEnd] || `RONDA ${idx+1}`;
}

// ============================================================
// Capa de datos (Supabase) — un único documento JSON en la tabla "torneos"
// ============================================================
export async function loadState(supabase){
  const { data, error } = await supabase.from('torneos').select('data').eq('id','main').maybeSingle();
  if(error) throw error;
  if(data && data.data){
    const state = data.data;
    if(!state.jugadores) state.jugadores = [];
    if(!state.config) state.config = { puntos: {...DEFAULT_PUNTOS_CONFIG} };
    if(!state.config.puntos) state.config.puntos = {...DEFAULT_PUNTOS_CONFIG};
    if(!state.config.categoriasSuma) state.config.categoriasSuma = [...DEFAULT_CATEGORIAS_SUMA];
    // Compatibilidad con torneos guardados antes de que existiera "partidos" / "inscripcionAbierta"
    (state.torneos || []).forEach(t=>{
      if(!t.partidos) t.partidos = [];
      if(t.inscripcionAbierta === undefined) t.inscripcionAbierta = true;
    });
    return state;
  }
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
