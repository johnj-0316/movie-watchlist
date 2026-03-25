const key = 825421;
const url = `https://www.omdbapi.com/?apikey=${key}&`;
const movieSection = document.querySelector('#movies-section');
const searchBtn = document.querySelector('#search-btn');
const searchInput = document.querySelector('#searchbar');

searchBtn.addEventListener('click', handleDisplay);
searchInput.addEventListener('keydown', handleEnter);
movieSection.addEventListener('click', e => {
    const parent = e.target.parentElement;
    
    if (parent.classList.contains("add-btn")
        || e.target.classList.contains("add-btn")) {
        handleAdd(e);
    }
    else if (parent.classList.contains("remove-btn")
        || e.target.classList.contains("remove-btn")) {
        handleRemove(e);
    }
});

function alreadySaved(imdbID) {
    try {
        JSON.parse(localStorage.saved);
    }
    catch (err) {
        localStorage.saved = JSON.stringify([]);
    }
    
    const saved = JSON.parse(localStorage.saved);
    return saved.includes(imdbID);
}

function handleWatchlist(imdbID) {
    let element = '';
    
    if (alreadySaved(imdbID)) {
        element = `
            <div role="switch" tab-index="0" aria-label="Remove from your watchlist" class="remove-btn" data-id="${imdbID}">
                <i class="fa-regular fa-circle-check"></i>
            </div>
        `;
    }
    else {
        element = `
            <div role="switch" tab-index="0" aria-label="Add to your watchlist" class="add-btn" data-id="${imdbID}">
                <i class="fa-solid fa-circle-plus"></i>
                <p>Watchlist</p>
            </div>
        `;
    }
    
    return element;
}

function handleContainer(data) {
    const {
        Poster,
        Title,
        imdbID,
        imdbRating,
        Runtime,
        Genre,
        Plot
    } = data;
    return `
        <div class="movie-container">
            <img onerror="this.src = './images/default.jpeg'" src="${Poster}"/>
            <div>
                <div class="movie-line">
                    <h2 class="movie-title">${Title}</h2>
                    <div class="rating">
                        <p class="movie-rating">⭐️ ${imdbRating}</p>
                    </div>
                </div>
                <div class="movie-line">
                    <h3 class="movie-duration">${Runtime}</h3>
                    <h3 class="movie-genres">${Genre}</h3>
                    ${handleWatchlist(imdbID)}
                </div>
                <p class="movie-desc">${Plot}</p>
            </div>
        </div>
    `;
}

function handleStorage(imdbID) {
    try {
        const saved = JSON.parse(localStorage.saved);
    
        if (alreadySaved(imdbID))
            return;
            
        saved.push(imdbID);
        localStorage.saved = JSON.stringify(saved);
    }
    catch (err) {
        localStorage.saved = JSON.stringify([]);
        handleStorage(imdbID);
    }
}

function handleDelete(imdbID) {
    const saved = JSON.parse(localStorage.saved);
    
    if (!alreadySaved(imdbID))
        return;
        
    saved.splice(saved.indexOf(imdbID), 1);
    localStorage.saved = JSON.stringify(saved);
}

function handleAdd(e) {
    const parent = e.target.parentElement;
    let id, element;
    
    if (parent.classList.contains("add-btn")) {
        id = parent.dataset.id;
        element = parent;
    }
    else if (e.target.classList.contains("add-btn")) {
        id = e.target.dataset.id;
        element = e.target;
    }
    
    if (!id)
        return;
        
    handleStorage(id);
    element.classList.remove("add-btn");
    element.classList.add("remove-btn");
    element.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
}

function handleRemove(e) {
    const parent = e.target.parentElement;
    let id, element;
    
    if (parent.classList.contains("remove-btn")) {
        id = parent.dataset.id;
        element = parent;
    }
    else if (e.target.classList.contains("remove-btn")) {
        id = e.target.dataset.id;
        element = e.target;
    }
    
    if (!id)
        return;
        
    handleDelete(id);
    element.classList.remove("remove-btn");
    element.classList.add("add-btn");
    element.innerHTML = `
        <i class="fa-solid fa-circle-plus"></i>
        <p>Watchlist</p>
    `;
}

async function handleEnter(e) {    
    if (e.keyCode === 13)
        await handleDisplay();
}

async function handleSearch(type, input) {
    const res = await fetch(`${url}${type}=${input}`);
    const data = await res.json();
    return data;
}

async function handleDisplay() {
    const ids = [];
    let html = '';
    
    if (!searchInput.value)
        return;

    const {Search} = await handleSearch('s', searchInput.value);
    
    if (!Search)
        return movieSection.innerHTML = 
        `<div class="initial">
            <h2>An error occurred.</h2>
        </div>`;
    
    for (let movie of Search) {
        if (ids.includes(movie.imdbID))
            continue;

        const data = await handleSearch('i', movie.imdbID);
        const resultsHTML = handleContainer(data);
        html += resultsHTML;
        ids.push(movie.imdbID);
    }

    movieSection.innerHTML = html;
    searchInput.value = '';
}

