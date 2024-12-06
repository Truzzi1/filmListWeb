const form = document.getElementById('add-book-form');
const library = document.getElementById('library');
const API_KEY = 'ce620cc0c672bd071a2ab55e336e2413'; // Substitua com sua chave da API do TMDb
const TMDB_API_URL = 'https://api.themoviedb.org/3/search/movie';

// Recuperar filmes do LocalStorage ao carregar a página
document.addEventListener('DOMContentLoaded', loadLibrary);

// Adicionar evento ao formulário
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const title = document.getElementById('book-title').value;

  try {
    // Buscar informações do filme pela API
    const movieData = await fetchMovieData(title);

    if (!movieData) {
      alert('Filme não encontrado! Verifique o título e tente novamente.');
      return;
    }

    // Extrair o ano da data de lançamento
    const releaseYear = movieData.release_date ? movieData.release_date.split('-')[0] : 'Ano desconhecido';

    // Calcular a porcentagem de aprovação
    const likedPercentage = movieData.vote_average ? `${(movieData.vote_average * 10).toFixed(0)}%` : 'Sem avaliação';

    // Criar objeto do filme
    const movie = {
      title: movieData.title,
      releaseDate: releaseYear, // Apenas o ano
      likedPercentage: likedPercentage, // Percentual de aprovação
      imageUrl: `https://image.tmdb.org/t/p/w200${movieData.poster_path}`,
      status: 'Não Visto',
    };

    // Salvar e exibir filme
    saveMovieToLocalStorage(movie);
    addMovieToDOM(movie);

    // Resetar o formulário
    form.reset();
  } catch (error) {
    console.error('Erro ao buscar informações do filme:', error);
    alert('Erro ao buscar informações do filme. Tente novamente mais tarde.');
  }
});

// Função para buscar informações do filme na API do TMDb
async function fetchMovieData(title) {
  const response = await fetch(`${TMDB_API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(title)}`);
  const data = await response.json();

  // Retorna o primeiro filme encontrado (se houver resultados)
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

// Funções de LocalStorage
function saveMovieToLocalStorage(movie) {
  const movies = getMoviesFromLocalStorage();
  movies.push(movie);
  localStorage.setItem('movies', JSON.stringify(movies));
}

function getMoviesFromLocalStorage() {
  const movies = localStorage.getItem('movies');
  return movies ? JSON.parse(movies) : [];
}

function removeMovieFromLocalStorage(title) {
  const movies = getMoviesFromLocalStorage();
  const updatedMovies = movies.filter(movie => movie.title !== title);
  localStorage.setItem('movies', JSON.stringify(updatedMovies));
}

// Função para carregar filmes do LocalStorage ao DOM
function loadLibrary() {
  const movies = getMoviesFromLocalStorage();
  movies.forEach(addMovieToDOM);
}

// Função para adicionar filme ao DOM
function addMovieToDOM(movie) {
  const bookCard = document.createElement('div');
  bookCard.classList.add('book-card');

  bookCard.innerHTML = `
    <button class="delete-btn" title="Excluir Filme">X</button>
    <img src="${movie.imageUrl}" alt="${movie.title}">
    <div class="book-title">${movie.title}</div>
    <div class="book-info">Lançado em: ${movie.releaseDate}</div>
    <div class="book-info">Aprovação: ${movie.likedPercentage}</div>
    <div class="book-info status" style="cursor: pointer;">Status: ${movie.status}</div>
  `;

  const statusDiv = bookCard.querySelector('.status');
  statusDiv.addEventListener('click', () => toggleMovieStatus(movie, statusDiv));

  const deleteButton = bookCard.querySelector('.delete-btn');
  deleteButton.addEventListener('click', () => deleteMovie(movie.title, bookCard));

  library.appendChild(bookCard);
}

// Função para alternar o status do filme
function toggleMovieStatus(movie, statusDiv) {
  movie.status = movie.status === 'Visto' ? 'Não Visto' : 'Visto';
  updateMovieInLocalStorage(movie);
  statusDiv.textContent = `Status: ${movie.status}`;
}

// Função para atualizar um filme no LocalStorage
function updateMovieInLocalStorage(updatedMovie) {
  const movies = getMoviesFromLocalStorage();
  const movieIndex = movies.findIndex(movie => movie.title === updatedMovie.title);
  if (movieIndex !== -1) {
    movies[movieIndex] = updatedMovie;
    localStorage.setItem('movies', JSON.stringify(movies));
  }
}

// Função para excluir um filme
function deleteMovie(title, bookCard) {
  bookCard.remove();
  removeMovieFromLocalStorage(title);
}
