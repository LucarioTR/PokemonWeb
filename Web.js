// Configuración y variables de estado globales
const POKEMON_LIMIT = 1025; // Número total de Pokémon disponibles en PokéAPI
let allPokemonList = [];
let loadedPokemonMap = new Map();
let currentFilterList = [];
let isShiny = false;
let currentAudio = null;

// Mapa de traducciones para tipos de Pokémon en Español
const typeTranslations = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada'
};

// Elementos DOM
const pokemonGrid = document.getElementById('pokemon-grid');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const genFilter = document.getElementById('gen-filter');
const sortOrder = document.getElementById('sort-order');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const totalCountEl = document.getElementById('total-count');
const loadedCountEl = document.getElementById('loaded-count');

// Elementos del Modal
const modal = document.getElementById('pokemon-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalName = document.getElementById('modal-name');
const modalId = document.getElementById('modal-id');
const modalImage = document.getElementById('modal-image');
const modalTypes = document.getElementById('modal-types');
const modalDescription = document.getElementById('modal-description');
const modalHeight = document.getElementById('modal-height');
const modalWeight = document.getElementById('modal-weight');
const modalHabitat = document.getElementById('modal-habitat');
const modalGen = document.getElementById('modal-gen');
const modalCapture = document.getElementById('modal-capture');
const modalHappiness = document.getElementById('modal-happiness');
const modalAbilities = document.getElementById('modal-abilities');
const modalStats = document.getElementById('modal-stats');
const modalTrivia = document.getElementById('modal-trivia');
const shinyToggle = document.getElementById('shiny-toggle');
const playCryBtn = document.getElementById('play-cry');

let activePokemonData = null;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  initTypeOptions();
  fetchInitialPokemonList();
  setupEventListeners();
});

// Poblar los tipos en el select
function initTypeOptions() {
  Object.keys(typeTranslations).forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = typeTranslations[type];
    typeFilter.appendChild(opt);
  });
}

// Escuchadores de eventos
function setupEventListeners() {
  searchInput.addEventListener('input', applyFilters);
  typeFilter.addEventListener('change', applyFilters);
  genFilter.addEventListener('change', applyFilters);
  sortOrder.addEventListener('change', applyFilters);

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  shinyToggle.addEventListener('click', () => {
    isShiny = !isShiny;
    shinyToggle.classList.toggle('bg-yellow-500', isShiny);
    shinyToggle.classList.toggle('text-slate-900', isShiny);
    if (activePokemonData) updateModalImages(activePokemonData);
  });

  playCryBtn.addEventListener('click', () => {
    if (activePokemonData && activePokemonData.cries?.latest) {
      if (currentAudio) currentAudio.pause();
      currentAudio = new Audio(activePokemonData.cries.latest);
      currentAudio.play().catch(() => console.log('Audio no disponible'));
    }
  });
}

// Carga inicial de la lista completa de Pokémon desde PokéAPI
async function fetchInitialPokemonList() {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_LIMIT}&offset=0`);
    const data = await response.json();
    
    allPokemonList = data.results.map((item, index) => ({
      name: item.name,
      id: index + 1,
      url: item.url
    }));

    totalCountEl.textContent = allPokemonList.length;
    currentFilterList = [...allPokemonList];
    
    // Cargar los primeros Pokémon en la vista
    renderPokemonGrid();
  } catch (err) {
    console.error('Error cargando la lista inicial:', err);
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}

// Renderizar las tarjetas
async function renderPokemonGrid() {
  pokemonGrid.innerHTML = '';
  loadingSpinner.classList.remove('hidden');

  const listToRender = currentFilterList.slice(0, 60); // Mostrar en lotes para rendimiento
  
  if (listToRender.length === 0) {
    noResults.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
    return;
  }
  noResults.classList.add('hidden');

  for (const item of listToRender) {
    const details = await fetchPokemonDetail(item.id);
    if (details) {
      const card = createPokemonCard(details);
      pokemonGrid.appendChild(card);
    }
  }

  loadedCountEl.textContent = loadedPokemonMap.size;
  loadingSpinner.classList.add('hidden');
}

// Obtener o recuperar del caché los detalles del Pokémon
async function fetchPokemonDetail(idOrName) {
  if (loadedPokemonMap.has(idOrName)) {
    return loadedPokemonMap.get(idOrName);
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    loadedPokemonMap.set(data.id, data);
    loadedPokemonMap.set(data.name, data);
    return data;
  } catch (err) {
    console.error(`Error al cargar datos del Pokémon ${idOrName}:`, err);
    return null;
  }
}

// Crear la estructura HTML de la tarjeta
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card bg-slate-800 rounded-2xl p-4 border border-slate-700/60 cursor-pointer flex flex-col items-center relative overflow-hidden group';
  
  const sprite = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  const typesHtml = pokemon.types.map(t => 
    `<span class="type-badge type-${t.type.name}">${typeTranslations[t.type.name] || t.type.name}</span>`
  ).join(' ');

  card.innerHTML = `
    <span class="absolute top-3 right-3 text-xs font-bold text-slate-500">#${String(pokemon.id).padStart(3, '0')}</span>
    <div class="w-24 h-24 my-2 relative flex items-center justify-center">
      <img src="${sprite}" alt="${pokemon.name}" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy">
    </div>
    <h3 class="text-base font-bold capitalize text-white mb-2">${pokemon.name}</h3>
    <div class="flex gap-1 flex-wrap justify-center">${typesHtml}</div>
  `;

  card.addEventListener('click', () => openPokemonModal(pokemon.id));
  return card;
}

// Aplicar Filtros (Búsqueda, Tipo, Gen, Orden)
async function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedType = typeFilter.value;
  const selectedGen = genFilter.value;
  const selectedSort = sortOrder.value;

  let filtered = [...allPokemonList];

  // Filtro por Búsqueda (Texto o ID)
  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || p.id.toString() === query.replace('#', '')
    );
  }

  // Filtro por Generaciones
  if (selectedGen !== 'all') {
    const genRanges = {
      gen1: [1, 151], gen2: [152, 251], gen3: [252, 386],
      gen4: [387, 493], gen5: [494, 649], gen6: [650, 721],
      gen7: [722, 809], gen8: [810, 905], gen9: [906, 1025]
    };
    const [min, max] = genRanges[selectedGen];
    filtered = filtered.filter(p => p.id >= min && p.id <= max);
  }

  // Ordenación
  filtered.sort((a, b) => {
    if (selectedSort === 'id-asc') return a.id - b.id;
    if (selectedSort === 'id-desc') return b.id - a.id;
    if (selectedSort === 'name-asc') return a.name.localeCompare(b.name);
    if (selectedSort === 'name-desc') return b.name.localeCompare(a.name);
  });

  // Filtro por Tipo requiere consultar la API si está seleccionado
  if (selectedType !== 'all') {
    loadingSpinner.classList.remove('hidden');
    pokemonGrid.innerHTML = '';
    
    try {
      const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
      const typeData = await typeRes.json();
      const typePokemonNames = new Set(typeData.pokemon.map(p => p.pokemon.name));
      
      filtered = filtered.filter(p => typePokemonNames.has(p.name));
    } catch (e) {
      console.error('Error al filtrar por tipo:', e);
    }
  }

  currentFilterList = filtered;
  renderPokemonGrid();
}

// Abrir Modal de Información y Curiosidades
async function openPokemonModal(id) {
  const pokemon = await fetchPokemonDetail(id);
  if (!pokemon) return;

  activePokemonData = pokemon;
  isShiny = false;
  shinyToggle.classList.remove('bg-yellow-500', 'text-slate-900');

  // Datos Básicos
  modalName.textContent = pokemon.name;
  modalId.textContent = `#${String(pokemon.id).padStart(3, '0')}`;
  modalHeight.textContent = `${pokemon.height / 10} m`;
  modalWeight.textContent = `${pokemon.weight / 10} kg`;

  updateModalImages(pokemon);

  // Tipos
  modalTypes.innerHTML = pokemon.types.map(t => 
    `<span class="type-badge type-${t.type.name}">${typeTranslations[t.type.name] || t.type.name}</span>`
  ).join(' ');

  // Habilidades
  modalAbilities.innerHTML = pokemon.abilities.map(a => 
    `<span class="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg font-semibold capitalize">${a.ability.name.replace('-', ' ')} ${a.is_hidden ? '<span class="text-yellow-400">(Oculta)</span>' : ''}</span>`
  ).join(' ');

  // Stats Base Animados
  const statNamesMap = {
    hp: 'PS', attack: 'Ataque', defense: 'Defensa',
    'special-attack': 'Atq. Esp', 'special-defense': 'Def. Esp', speed: 'Velocidad'
  };

  modalStats.innerHTML = pokemon.stats.map(s => {
    const name = statNamesMap[s.stat.name] || s.stat.name;
    const value = s.base_stat;
    const percentage = Math.min(100, (value / 180) * 100);
    return `
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="font-bold text-slate-400">${name}</span>
          <span class="font-extrabold text-white">${value}</span>
        </div>
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div class="bg-red-500 h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Cargar Especie para Descripciones y Curiosidades
  try {
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    // Texto de descripción en español
    const flavorEntry = speciesData.flavor_text_entries.find(f => f.language.name === 'es') || 
                        speciesData.flavor_text_entries.find(f => f.language.name === 'en');
    modalDescription.textContent = flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'Sin descripción disponible.';

    modalHabitat.textContent = speciesData.habitat ? speciesData.habitat.name : 'Desconocido';
    modalGen.textContent = speciesData.generation ? speciesData.generation.name.replace('generation-', 'Gen ') : 'N/A';
    modalCapture.textContent = `${speciesData.capture_rate} / 255`;
    modalHappiness.textContent = speciesData.base_happiness ?? 'N/A';

    // Curiosidades / Trivia Generadas
    buildTriviaList(pokemon, speciesData);

  } catch (err) {
    modalDescription.textContent = 'No se pudieron cargar los detalles adicionales del Pokémon.';
  }

  modal.classList.remove('hidden');
}

// Cambiar entre imagen Normal y Shiny
function updateModalImages(pokemon) {
  const officialArt = isShiny ? 
    pokemon.sprites.other['official-artwork'].front_shiny : 
    pokemon.sprites.other['official-artwork'].front_default;
    
  modalImage.src = officialArt || pokemon.sprites.front_default;
}

// Generador de Curiosidades y Trivia Dinámica
function buildTriviaList(pokemon, species) {
  modalTrivia.innerHTML = '';
  const trivia = [];

  if (species.is_legendary) trivia.push('¡Es un **Pokémon Legendario** singular y poderoso!');
  if (species.is_mythical) trivia.push('¡Es un **Pokémon Mítico/Misterioso** extremadamente raro!');
  if (species.gender_rate === -1) trivia.push('Este Pokémon no tiene género (es asexual).');
  if (pokemon.base_experience > 200) trivia.push(`Otorga una alta cantidad de experiencia base al ser derrotado (${pokemon.base_experience} pts).`);
  if (species.hatch_counter) trivia.push(`Eclosionar un huevo de este Pokémon requiere aproximadamente ${species.hatch_counter * 256} pasos.`);
  
  if (trivia.length === 0) {
    trivia.push(`Posee un total acumulado de estadísticas base de ${pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0)} puntos.`);
    trivia.push(`Su nombre original en japonés registrado en PokéAPI es formalmente "${pokemon.name.toUpperCase()}".`);
  }

  trivia.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    modalTrivia.appendChild(li);
  });
}

// Cerrar Modal
function closeModal() {
  modal.classList.add('hidden');
  if (currentAudio) currentAudio.pause();
}