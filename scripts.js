let matchingDeals = [];
function showHints(hints) {

  const hintsContainer = document.querySelector(".search-hints");
  hintsContainer.innerHTML = "";
  const hintList = hintsContainer.appendChild(document.createElement("ul"));
  hints.forEach((hint) => {
    const hintEl = hintList.appendChild(document.createElement("li"))
    hintEl.innerHTML = `<a href="game.html?appid=${hint.id}&slug=${hint.slug}">${hint.title}</a>`;
  });

}

function renderDeals(game, slug) {
  const wrapper = document.querySelector(".wrapper");
  wrapper.innerHTML = "";
  document.querySelector(".title").innerText = slug;
  game.deals.forEach((deal) => {
    const dealDiv = document.createElement("div");
    dealDiv.classList.add("deal");
    dealDiv.innerHTML = `
      <p>Store: ${deal.shop.name}</p>
      <p>Normal Price: $${deal.regular.amount}</p>
      <p>Sale Price: $${deal.price.amount}</p>
      <p>Discount: ${deal.cut}%</p>
      <a href="${deal.url}" target="_blank">View Deal</a>
    `;
    wrapper.appendChild(dealDiv);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  //loading deals info based on url parameter
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const appID = urlParams.get('appid');
  const slug = urlParams.get('slug');


  // If there's a appID in the URL, fetch and display that game
  if (appID) {
    fetch(`https://api.isthereanydeal.com/games/prices/v3?key=a6e7d7f3739530d34366b7b5d78ffbbbe90d75fe&country=US`, {
      method: 'POST',
      body: JSON.stringify([appID])
    })
      .then((response) => response.json())
      .then((gameInfo) => {
        renderDeals(gameInfo[0], slug);
      })
      .catch((error) => console.error("Error fetching game info:", error));
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
});


/*
 1. pass all filter data to url
 2. read url parameters and make a fetch request with those parameters(apply default parameters if not provided)
*/
