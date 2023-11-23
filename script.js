// Constantes para acceder a los elementos del DOM
const query = document.getElementById("query");
const search = document.getElementById("search");
const results = document.getElementById("results");
const error = document.getElementById("error");
const theme = document.getElementById("theme");

// Variable para almacenar el tema actual
let currentTheme = "light";

// Variable para almacenar el último término de búsqueda
let lastQuery = "";

// Función para cambiar el tema entre oscuro y claro
function toggleTheme() {
  if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "dark");
    theme.textContent = "🌙";
    currentTheme = "dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    theme.textContent = "🌞";
    currentTheme = "light";
  }
}

// Función para buscar usuarios en GitHub usando la API
function searchUsers(term) {
  // Limpiar los resultados y el mensaje de error anteriores
  results.innerHTML = "";
  error.textContent = "";

  // Validar que el término de búsqueda no esté vacío
  if (term.trim() === "") {
    error.textContent = "Por favor, ingresa un término de búsqueda.";
    return;
  }

  // Actualizar el último término de búsqueda
  lastQuery = term;

  // Hacer una petición GET a la API de GitHub con el término de búsqueda
  fetch(`https://api.github.com/search/users?q=${term}`)
    .then(response => response.json())
    .then(data => {
      // Verificar que el término de búsqueda no haya cambiado
      if (term !== lastQuery) {
        return;
      }

      // Verificar que la API haya devuelto algún resultado
      if (data.total_count === 0) {
        error.textContent = "No se encontraron usuarios con ese término de búsqueda.";
        return;
      }

      // Mostrar los tres primeros usuarios que más se aproximen al término de búsqueda
      for (let i = 0; i < 3; i++) {
        // Crear un elemento div para cada usuario
        const user = document.createElement("div");
        user.className = "user";

        // Obtener los datos relevantes del usuario
        const avatar = data.items[i].avatar_url;
        const name = data.items[i].login;
        const url = data.items[i].html_url;

        // Hacer una petición GET a la API de GitHub para obtener más datos del usuario
        fetch(data.items[i].url)
          .then(response => response.json())
          .then(userData => {
            // Obtener los datos adicionales del usuario
            const company = userData.company || "N/A";
            const repos = userData.public_repos;

            // Agregar el contenido al elemento div del usuario
            user.innerHTML = `
              <img src="${avatar}" alt="${name}">
              <h3><a href="${url}" target="_blank">${name}</a></h3>
              <p>Empresa: ${company}</p>
              <p>Repositorios: ${repos}</p>
            `;

            // Agregar el elemento div del usuario al contenedor de resultados
            results.appendChild(user);
          })
          .catch(error => {
            // Mostrar un mensaje de error en caso de fallar la petición
            console.error(error);
            error.textContent = "Ocurrió un error al obtener los datos de los usuarios.";
          });
      }
    })
    .catch(error => {
      // Mostrar un mensaje de error en caso de fallar la petición
      console.error(error);
      error.textContent = "Ocurrió un error al buscar los usuarios.";
    });
}

// Función para aplicar un debounce a una función
function debounce(func, delay) {
  // Variable para almacenar el identificador del timeout
  let timeout;

  // Retornar una función que recibe los mismos argumentos que la función original
  return function(...args) {
    // Limpiar el timeout anterior si existe
    if (timeout) {
      clearTimeout(timeout);
    }

    // Crear un nuevo timeout que ejecute la función original después del delay
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Agregar un evento click al botón de cambio de tema
theme.addEventListener("click", toggleTheme);

// Agregar un evento click al botón de búsqueda
search.addEventListener("click", () => {
  // Obtener el valor del input de búsqueda
  const term = query.value;

  // Llamar a la función de búsqueda de usuarios con el término de búsqueda
  searchUsers(term);
});

// Agregar un evento input al input de búsqueda
query.addEventListener("input", debounce(() => {
  // Obtener el valor del input de búsqueda
  const term = query.value;

  // Llamar a la función de búsqueda de usuarios con el término de búsqueda
  searchUsers(term);
}, 500)); // Aplicar un debounce de 500 milisegundos
