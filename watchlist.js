const key = 825421;
const url = `https://www.omdbapi.com/?apikey=${key}&`;
const movieSection = document.querySelector('#movies-section');

document.addEventListener('DOMContentLoaded', handleDisplay);
movieSection.addEventListener('click', e => {
    const parent = e.target.parentElement;

    if (parent.classList.contains("remove-btn")
        || e.target.classList.contains("remove-btn")) {
        handleRemove(e);
    }
});

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
            <img onerror="this.src = './images/default.png'" src="${Poster}"/>
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
                    <div role="switch" tab-index="0" aria-label="Remove from your watchlist" class="remove-btn" data-id="${imdbID}">
                        <i class="fa-solid fa-circle-minus"></i>
                        <p>Remove</p>
                    </div>
                </div>
                <p class="movie-desc">${Plot}</p>
            </div>
        </div>
    `;
}

function handleDelete(imdbID) {
    const saved = JSON.parse(localStorage.saved);        
    saved.splice(saved.indexOf(imdbID), 1);
    localStorage.saved = JSON.stringify(saved);
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
    
    const container = element.parentElement.parentElement.parentElement;
    handleDelete(id);
    container.classList.add('remove');
    setTimeout(() => {
        movieSection.removeChild(container);
        handleEmpty();
    }, 600);
}

function handleEmpty() {
    const saved = JSON.parse(localStorage.saved);
    
    if (saved.length)
        return;
        
    movieSection.innerHTML = `
        <div class="initial">
            <i class="fa-solid fa-film"></i>
            <h2>Saved movies go here!</h2>
        </div>
    `;
}

async function handleSearch(type, input) {
    const res = await fetch(`${url}${type}=${input}`);
    const data = await res.json();
    return data;
}

async function handleDisplay() {
    handleEmpty();
    const saved = JSON.parse(localStorage.saved);
    
    if (!saved.length)
        return;
    
    let html = '';

    for (let imdbID of saved) {
        const data = await handleSearch('i', imdbID);
        const resultsHTML = handleContainer(data);
        html += resultsHTML;
    }

    movieSection.innerHTML = html;
}