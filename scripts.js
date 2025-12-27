
import { createAuth0Client } from '@auth0/auth0-spa-js';
// DOM elements
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorDetails = document.getElementById('error-details');
const loggedOutSection = document.getElementById('logged-out');
const loggedInSection = document.getElementById('logged-in');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const profileContainer = document.getElementById('profile');
let auth0Client;

// Initialize Auth0 client
async function initAuth0() {
  try {
    // Validate environment variables
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      throw new Error('Auth0 configuration missing. Please check your .env.local file for VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID');
    }

    // Normalize and validate Auth0 domain format
    let hostname = domain;
    try {
      // Allow developers to accidentally include protocol, e.g. "https://your-domain.auth0.com"
      if (typeof domain === 'string' && (domain.startsWith('http://') || domain.startsWith('https://') || domain.includes('://'))) {
        const parsed = new URL(domain);
        hostname = parsed.hostname;
      }
    } catch (e) {
      // If URL parsing fails, fall back to the raw domain string
      hostname = domain;
    }

    const allowedAuth0Suffixes = [
      '.auth0.com',
      '.us.auth0.com',
      '.eu.auth0.com',
      '.au.auth0.com'
    ];

    const hasValidAuth0Suffix = allowedAuth0Suffixes.some(suffix => typeof hostname === 'string' && hostname.endsWith(suffix));

    if (!hasValidAuth0Suffix) {
      console.warn('Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com');
    }

    auth0Client = await createAuth0Client({
      domain: domain,
      clientId: clientId,
      // Persist tokens across pages / reloads and allow refresh tokens
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      authorizationParams: {
        // Redirect back to the same page the user initiated login from
        redirect_uri: window.location.origin + window.location.pathname
      }
    });

    // Check if user is returning from login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      await handleRedirectCallback();
    }

    // Update UI based on authentication state
    await updateUI();
  } catch (err) {
    console.error('Auth0 initialization error:', err);
    showError(err.message);
  }
}

// Handle redirect callback
async function handleRedirectCallback() {
  try {
    await auth0Client.handleRedirectCallback();
    // Clean up the URL to remove query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (err) {
    console.error('Redirect callback error:', err);
    showError(err.message);
  }
}

// Update UI based on authentication state
async function updateUI() {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      showLoggedIn();
      await displayProfile();
    } else {
      showLoggedOut();
    }

    hideLoading();
  } catch (err) {
    console.error('UI update error:', err);
    showError(err.message); 
  }
}

// Display user profile
async function displayProfile() {
  try {
    const user = await auth0Client.getUser();
    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`;

    profileContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 5px;">
        <img 
          src="${user.picture || placeholderImage}" 
          alt="${user.name || 'User'}" 
          class="profile-picture"
          onerror="this.src='${placeholderImage}'"
        />
        <div style="text-align: center;">
          <div class="profile-email" style="font-weight: 600; color: #a0aec0;">
            ${user.email || 'No email provided'}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error displaying profile:', err);
  }
}

// Event handlers
async function login() {
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + window.location.pathname
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    showError(err.message);
  }
}

async function logout() {
  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.error('Logout error:', err);
    showError(err.message);
  }
}

function hideLoading() {
  loading.style.display = 'none';
}

function showError(message) {
  loading.style.display = 'none';
  error.style.display = 'block';
  errorDetails.textContent = message;
}

function showLoggedIn() {
  loggedOutSection.style.display = 'none';
  loggedInSection.style.display = 'flex';
}

function showLoggedOut() {
  loggedInSection.style.display = 'none';
  loggedOutSection.style.display = 'flex';
}
// Event listeners
loginBtn.addEventListener('click', login);

logoutBtn.addEventListener('click', logout);

// Initialize the app
initAuth0();


















































const PROXY_BASE = "https://itad-proxy.ivanprokopenkose7en.workers.dev";

let matchingGames = [];
function showHints(hints) {

  const hintsContainer = document.querySelector(".search-hints");
  hintsContainer.innerHTML = "";
  const hintList = hintsContainer.appendChild(document.createElement("ul"));
  hints.forEach((hint) => {
    const hintEl = hintList.appendChild(document.createElement("li"))
    // Use /game (no .html) to avoid server redirect that may strip query params
    hintEl.innerHTML = `<a href="/game?appid=${hint.id}&slug=${encodeURIComponent(hint.title)}">${hint.title}</a>`;
  });

}

function renderDeals(game, slug) {
  const wrapper = document.querySelector(".game-list");
  document.querySelector(".title").innerText = slug;
  game.deals.forEach((deal) => {
    const dealDiv = document.createElement("li");
    const dealA = document.createElement("a");
    dealDiv.classList.add("game-list_deal");
    dealA.classList.add("game-list_link");
    dealA.href = deal.url;
    dealA.target = "_blank";
    dealA.innerHTML = `
      <div class="game-list_shop">${deal.shop.name}</div>
      <div class="game-list_sale">$${deal.price.amount}</div>
      <div class="game-list_discount">${deal.cut}%</div>
    `;
    dealDiv.appendChild(dealA);
    wrapper.appendChild(dealDiv);
  });
}
const FULL_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
function getCachedData(key) {
  const cachedItem = localStorage.getItem(key);
  if (!cachedItem) return null;

  if (cachedItem.timestamp + CACHE_DURATION < Date.now()) {
    localStorage.removeItem(key);
    return null;
  }
  return JSON.parse(cachedItem).data;
}
function clearDayOldStorage() {
  Object.keys(localStorage).forEach(key => {
    try {
      const { timestamp } = JSON.parse(localStorage.getItem(key));
      if (timestamp + FULL_CACHE_DURATION < Date.now()) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      localStorage.removeItem(key);
    }
  });
}

function setCachedData(key, data) {
  const cacheObject = {
    data: data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheObject));
}



document.addEventListener("DOMContentLoaded", () => {
  clearDayOldStorage();
  //loading deals info based on url parameter
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const appID = urlParams.get('appid');
  const slug = urlParams.get('slug');
  const code = urlParams.get('code');
  if (code) {

  }


  // If there's a appID in the URL, fetch and display that game
  if (appID) {
    const cacheKey = `deals_${appID}`;
    const cachedDeals = getCachedData(cacheKey);

    if (cachedDeals) {
      renderDeals(cachedDeals, slug);
    } else {
      fetch(`${PROXY_BASE}/prices?appid=${appID}`)
        .then((response) => response.json())
        .then((gameInfo) => {

          renderDeals(gameInfo[0], slug);
          setCachedData(cacheKey, gameInfo[0]);
        })
        .catch((error) => console.error("Error fetching game info:", error));
    }
  }
  //searching
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (searchTerm.length === 0) {
        showHints([]);
        return;
      }
      fetch(`${PROXY_BASE}/search?title=${encodeURIComponent(searchTerm)}`)

        .then((response) => response.json())
        .then((data) => {
          matchingGames = data;
          const filteredHints = matchingGames.filter((game) =>
            game.title.toLowerCase().includes(searchTerm)
          );
          showHints(filteredHints)
        })
        .catch((error) => console.error("Error fetching hints:", error));
    });
  }

});


/*
 1. pass all filter data to url
 2. read url parameters and make a fetch request with those parameters(apply default parameters if not provided)
*/
