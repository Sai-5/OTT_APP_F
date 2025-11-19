const host = "http://localhost:3001";
export default host;

// Watchlist API functions
export const watchlistAPI = {
  addMovie: async (movieData, token) => {
    const response = await fetch(`${host}/api/saved/addmovie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(movieData),
    });
    return response.json();
  },

  getMovies: async (token) => {
    const response = await fetch(`${host}/api/saved/getmovies`, {
      method: 'GET',
      headers: {
        'auth-token': token,
      },
    });
    return response.json();
  },

  deleteMovie: async (movieId, token) => {
    const response = await fetch(`${host}/api/saved/deletemovie/${movieId}`, {
      method: 'DELETE',
      headers: {
        'auth-token': token,
      },
    });
    return response.json();
  },

  markAsWatched: async (movieId, token) => {
    const response = await fetch(`${host}/api/saved/watch/${movieId}`, {
      method: 'PUT',
      headers: {
        'auth-token': token,
      },
    });
    return response.json();
  },
};
