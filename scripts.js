// Firebase (CDN modular import)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhj6QjW99aKOV3HvlH9HsWGpksQ0kToUY",
  authDomain: "nake-10402.firebaseapp.com",
  projectId: "nake-10402",
  storageBucket: "nake-10402.firebasestorage.app",
  messagingSenderId: "382102518022",
  appId: "1:382102518022:web:64640513cb24e62cc8c687",
  measurementId: "G-JNCLBKDNET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth UI helpers
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('authMode').checked = (mode === 'signup');
  document.getElementById('authModalTitle').innerText = (mode === 'signup' ? 'Create account' : 'Login');
  document.getElementById('authMessage').innerText = '';
}
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}
function showAuthMessage(msg, isError = false) {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? '#ffb4b4' : 'var(--muted)';
}

function updateAuthUI(user) {
  const userStatus = document.getElementById('userStatus');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if (user) {
    userStatus.innerText = user.email || 'Signed in';
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    userStatus.innerText = 'Not signed in';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

// Wire up auth controls after DOM loaded (we also add listeners in DOMContentLoaded later)

let matchingDeals = [];
function showHints(hints) {

  const hintsContainer = document.querySelector(".search-hints");
  hintsContainer.innerHTML = "";
  const hintList = hintsContainer.appendChild(document.createElement("ul"));
  hints.forEach((hint) => {
    const hintEl = hintList.appendChild(document.createElement("li"))
    hintEl.innerHTML = `<a href="game.html?appid=${hint.id}&slug=${hint.title}">${hint.title}</a>`;
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
  let keys = Object.keys(localStorage), i = 0, key;

  for (; key = keys[i]; i++) {
    if (localStorage.getItem(key).timestamp + FULL_CACHE_DURATION < Date.now()) {
      localStorage.removeItem(key);
    }
  }
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


  // If there's a appID in the URL, fetch and display that game
  if (appID) {
    const cacheKey = `deals_${appID}`;
    const cachedDeals = getCachedData(cacheKey);

    if (cachedDeals) {
      renderDeals(cachedDeals, slug);
    } else {
      fetch(`https://api.isthereanydeal.com/games/prices/v3?key=a6e7d7f3739530d34366b7b5d78ffbbbe90d75fe&country=US`, {
        method: 'POST',
        body: JSON.stringify([appID])
      })
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
      fetch(`https://api.isthereanydeal.com/games/search/v1?key=a6e7d7f3739530d34366b7b5d78ffbbbe90d75fe&title=${searchTerm}&results=5`)
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

  // --- Firebase Auth UI wiring ---
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authForm = document.getElementById('authForm');
  const authCancel = document.getElementById('authCancel');
  const authModeCheckbox = document.getElementById('authMode');
  const authModal = document.getElementById('authModal');

  if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      showAuthMessage('Signed out');
    }).catch((error) => {
      console.error('Sign out error', error);
    });
  });

  if (authCancel) authCancel.addEventListener('click', () => closeAuthModal());
  if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });

  if (authForm) authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const isSignup = authModeCheckbox && authModeCheckbox.checked;

    showAuthMessage('Processing...');

    if (isSignup) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          showAuthMessage('Account created.');
          closeAuthModal();
        })
        .catch((error) => {
          console.error('Signup error', error);
          showAuthMessage(error.message || 'Signup failed', true);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          showAuthMessage('Signed in.');
          closeAuthModal();
        })
        .catch((error) => {
          console.error('Signin error', error);
          showAuthMessage(error.message || 'Sign in failed', true);
        });
    }
  });

  // React to auth changes
  onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
  });

});


/*
 1. pass all filter data to url
 2. read url parameters and make a fetch request with those parameters(apply default parameters if not provided)
*/
