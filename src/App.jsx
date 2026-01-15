import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Search, Home, Film, Tv, Bookmark, Star, Clock, Play } from 'lucide-react';

const API_BASE = 'https://tmdbdk.dktczn.workers.dev/tmdb/';
const API_KEY = '7bffed716d50c95ed1c4790cfab4866a';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const MovieSite = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [movies, setMovies] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('movies');
  const [filters, setFilters] = useState({
    type: 'movie',
    genre: '',
    year: '',
    language: 'hi',
    sort: 'popularity.desc'
  });

  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
    fetchHeroSlides();
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [filters, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const fetchAPI = async (endpoint) => {
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE}${endpoint}${sep}api_key=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  };

  const fetchHeroSlides = async () => {
    const data = await fetchAPI('movie/popular?page=1');
    setHeroSlides(data.results?.slice(0, 5) || []);
  };

  const fetchMovies = async () => {
    let endpoint = '';
    if (activeTab === 'movies') {
      endpoint = `discover/movie?page=1&sort_by=${filters.sort}`;
    } else if (activeTab === 'series') {
      endpoint = `discover/tv?page=1&sort_by=${filters.sort}`;
    } else if (activeTab === 'anime') {
      endpoint = `discover/tv?page=1&with_genres=16&sort_by=${filters.sort}`;
    } else if (activeTab === 'kdrama') {
      endpoint = `discover/tv?page=1&with_origin_country=KR&sort_by=${filters.sort}`;
    }

    if (filters.genre) endpoint += `&with_genres=${filters.genre}`;
    if (filters.year) endpoint += `&primary_release_year=${filters.year}`;
    if (filters.language) endpoint += `&with_original_language=${filters.language}`;

    const data = await fetchAPI(endpoint);
    setMovies(data.results || []);
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      fetchMovies();
      return;
    }
    const data = await fetchAPI(`search/multi?query=${encodeURIComponent(query)}`);
    setMovies(data.results?.filter(m => m.media_type !== 'person') || []);
  };

  const toggleBookmark = (movie) => {
    const exists = bookmarks.find(b => b.id === movie.id);
    let newBookmarks;
    if (exists) {
      newBookmarks = bookmarks.filter(b => b.id !== movie.id);
    } else {
      newBookmarks = [...bookmarks, movie];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
  };

  const isBookmarked = (id) => bookmarks.some(b => b.id === id);

  const getImageUrl = (path, size = 'w342') => {
    return path ? `${IMG_BASE}/${size}${path}` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%23151823" width="100%25" height="100%25"/%3E%3C/svg%3E';
  };

  const currentHero = heroSlides[currentSlide];

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --bg: ${darkMode ? '#0e0f14' : '#f8f9fa'};
          --card: ${darkMode ? '#151823' : '#ffffff'};
          --text: ${darkMode ? '#e9ebf2' : '#1a1a1a'};
          --muted: ${darkMode ? '#aab1c2' : '#6c757d'};
          --accent: #ff2d95;
          --border: ${darkMode ? '#212636' : '#e0e0e0'};
        }
        
        body { 
          background: var(--bg); 
          color: var(--text); 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }
        
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 12px 16px;
        }
        
        .menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 150;
          opacity: ${menuOpen ? 1 : 0};
          pointer-events: ${menuOpen ? 'auto' : 'none'};
          transition: opacity 0.3s;
        }
        
        .menu {
          position: fixed;
          left: ${menuOpen ? '0' : '-280px'};
          top: 0;
          width: 280px;
          height: 100vh;
          background: var(--card);
          z-index: 200;
          transition: left 0.3s;
          overflow-y: auto;
          padding: 20px;
        }
        
        .hero {
          position: relative;
          height: 400px;
          margin: 16px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .hero-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9));
          padding: 24px;
          color: white;
        }
        
        .card {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .card:hover {
          transform: translateY(-4px);
        }
        
        .card-poster {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 2/3;
          background: var(--border);
        }
        
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
          padding: 16px;
        }
        
        input, select, button {
          outline: none;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text);
        }
        
        @media (min-width: 768px) {
          .grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <Menu size={24} />
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchMovies(e.target.value);
              }}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px' }}
            />
          </div>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '8px' }}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', position: 'relative' }}>
            <Bookmark size={20} />
            {bookmarks.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent)', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      
      {/* Side Menu */}
      <div className="menu">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>FilmyFly</h2>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <X size={24} />
          </button>
        </div>
        <nav>
          {[
            { icon: Home, label: 'Home', tab: 'movies' },
            { icon: Film, label: 'Movies', tab: 'movies' },
            { icon: Tv, label: 'TV Series', tab: 'series' },
            { icon: Film, label: 'Anime', tab: 'anime' },
            { icon: Tv, label: 'K-Drama', tab: 'kdrama' },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: 8,
                background: activeTab === item.tab ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: activeTab === item.tab ? 'white' : 'var(--text)',
                fontSize: 16
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Hero Section */}
      {currentHero && (
        <div className="hero">
          <img src={getImageUrl(currentHero.backdrop_path, 'w1280')} alt={currentHero.title} className="hero-bg" />
          <div className="hero-overlay">
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{currentHero.title}</h1>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#ffd700" stroke="#ffd700" />
                {currentHero.vote_average?.toFixed(1)}
              </span>
              <span>{new Date(currentHero.release_date).getFullYear()}</span>
            </div>
            <button style={{ background: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: 24, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <Play size={16} fill="white" />
              Play Now
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <select value={filters.genre} onChange={(e) => setFilters({...filters, genre: e.target.value})} style={{ padding: 10, borderRadius: 8 }}>
            <option value="">All Genres</option>
            <option value="28">Action</option>
            <option value="35">Comedy</option>
            <option value="18">Drama</option>
            <option value="27">Horror</option>
            <option value="10749">Romance</option>
            <option value="878">Sci-Fi</option>
          </select>
          <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})} style={{ padding: 10, borderRadius: 8 }}>
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid">
        {movies.map(movie => (
          <div key={movie.id} className="card">
            <div className="card-poster">
              <img src={getImageUrl(movie.poster_path)} alt={movie.title || movie.name} className="card-img" />
              <button
                onClick={() => toggleBookmark(movie)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: isBookmarked(movie.id) ? 'var(--accent)' : 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <Bookmark size={16} fill={isBookmarked(movie.id) ? 'white' : 'none'} />
              </button>
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={12} fill="#ffd700" stroke="#ffd700" />
                {movie.vote_average?.toFixed(1)}
              </div>
            </div>
            <div style={{ padding: '8px 4px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {movie.title || movie.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                {new Date(movie.release_date || movie.first_air_date).getFullYear()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSite;
