const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type'); // Nuevo selector
const resultsDiv = document.getElementById('results');

let currentPage = 1; // Estado para la página actual
let currentQuery = ''; // Almacena la búsqueda actual

// Evento para manejar la búsqueda
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim(); // Guardar la búsqueda actual
  if (!currentQuery) return;

  currentPage = 1; // Reiniciar a la primera página
  resultsDiv.innerHTML = ''; // Limpiar resultados previos

  await fetchResults(currentQuery, currentPage, searchType.value);
});

// Función para obtener resultados de la API
async function fetchResults(query, page, type) {
  // Construir URL según el tipo de búsqueda
  const url = `https://openlibrary.org/search.json?${type}=${encodeURIComponent(query)}&page=${page}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Si no hay más resultados en la siguiente página
    if (data.docs.length === 0 && page > 1) {
      resultsDiv.innerHTML += '<p>No hay más resultados disponibles.</p>';
      return; // No continuar con la carga de más resultados
    }

    displayResults(data.docs, page, type);

    // Si hay resultados, crear el botón de "Cargar más"
    if (data.docs.length > 0) {
      createLoadMoreButton();
    }
  } catch (error) {
    resultsDiv.innerHTML = '<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>';
    console.error(error);
  }
}

// Función para mostrar los resultados
function displayResults(books, page, type) {
  if (books.length === 0 && currentPage === 1) {
    resultsDiv.innerHTML = '<p>No se encontraron libros.</p>';
    return;
  }

  // Si es búsqueda por ISBN, no mostrar el número de página
  if (type === 'isbn' && books.length === 1) {
    const book = books[0];
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');
    bookElement.innerHTML = `
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
      <p><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
    `;
    resultsDiv.appendChild(bookElement);
    return; // Evitar mostrar la página si es búsqueda por ISBN
  }

  // Crear un contenedor para los resultados de esta página
  const pageContainer = document.createElement('div');
  pageContainer.classList.add('page-container');
  pageContainer.innerHTML = `<h2>Página ${page}</h2>`;
  resultsDiv.appendChild(pageContainer);

  books.forEach((book) => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');
    bookElement.innerHTML = `
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
      <p><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
    `;
    pageContainer.appendChild(bookElement);
  });
}

// Función para crear botón de "Cargar más"
function createLoadMoreButton() {
  const existingButton = document.getElementById('load-more-button');
  if (existingButton) {
    existingButton.remove();
  }

  const loadMoreButton = document.createElement('button');
  loadMoreButton.id = 'load-more-button';
  loadMoreButton.textContent = 'Cargar más resultados';
  loadMoreButton.style.marginTop = '20px';
  loadMoreButton.style.padding = '10px 20px';
  loadMoreButton.style.backgroundColor = '#ff0202';
  loadMoreButton.style.color = 'white';
  loadMoreButton.style.border = 'none';
  loadMoreButton.style.borderRadius = '4px';
  loadMoreButton.style.cursor = 'pointer';

  resultsDiv.appendChild(loadMoreButton);

  loadMoreButton.addEventListener('click', async () => {
    currentPage++; // Incrementar la página
    await fetchResults(currentQuery, currentPage, searchType.value);
  });
}