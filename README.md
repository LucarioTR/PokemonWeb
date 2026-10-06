# PokemonWeb 🔴⚈ ․̫ ⚈🔴

Una aplicación web interactiva, rápida y responsive construida con **HTML5, CSS (Tailwind CSS) y JavaScript (ES6)** que consume la API oficial de [PokéAPI](https://pokeapi.co/). Permite explorar todos los Pokémon disponibles, filtrar por generaciones y tipos, escuchar sus gritos oficiales, ver sus versiones *Shiny* y descubrir datos curiosos y estadísticas detalladas.

---

## 📸 Vista Previa

- **Diseño Pokédex Retro-Futurista:** Inspirado en las clásicas consolas Pokédex con lente interactiva e indicadores LED.
- **Responsive:** Adaptado para teléfonos móviles, tablets y monitores de escritorio.

---

## ✨ Características Principales

- 🔍 **Búsqueda en Tiempo Real:** Filtra instantáneamente por nombre o número de Pokédex (`#25`, `Pikachu`, etc.).
- 🏷️ **Filtros Avanzados:**
  - **Por Tipo:** Fuego, Agua, Planta, Dragón, Hada, entre otros (con los colores oficiales del juego).
  - **Por Generación:** Desde la Gen 1 (Kanto) hasta la Gen 9 (Paldea).
  - **Ordenación:** Por número ascendente/descendente o por orden alfabético.
- 💡 **Curiosidades & Trivia Dinámica:**
  - Sección *"Sabías que..."* con generación de datos curiosos según rareza, felicidad base, género, hábitat y tasa de captura.
  - Descripción oficial de la Pokédex traducida al español.
- ✨ **Selector Variocolor (Shiny):** Alterna entre las ilustraciones oficiales normales y Shiny con un solo clic.
- 🔊 **Gritos Oficiales (*Cries*):** Reproduce el audio del sonido del Pokémon.
- 📊 **Estadísticas Base Animadas:** Visualiza los atributos de combate (PS, Ataque, Defensa, Velocidad...) con barras de progreso dinámicas.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica de la aplicación.
- **CSS3 / Tailwind CSS:** Estilizado moderno y utilitario, junto a animación de componentes como el spinner de Pokéball y la interfaz retro.
- **JavaScript (Vanilla ES6+):** Peticiones asíncronas (`fetch` / `async-await`), manipulación del DOM, lógica de filtrado y caché local para optimizar rendimiento.
- **[PokéAPI](https://pokeapi.co/):** Fuente de datos de los Pokémon.
- **FontAwesome:** Iconografía general.

---

## 📁 Estructura del Proyecto

```text
pokedex-project/
├── index.html     # Estructura principal e interfaz web
├── styles.css     # Estilos personalizados (animaciones, badge de tipos, etc.)
├── script.js     # Lógica de consumo de API, filtros, eventos y modal
└── README.md      # Documentación del proyecto