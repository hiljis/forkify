import { API_URL, API_KEY, RES_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RES_PER_PAGE,
        currentPage: 1,
        numPages: 0,
    },
    bookmarks: []
}

const createRecipeObject = function (data) {
    const { recipe } = data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        bookmarked: state.bookmarks.some(bookmark => bookmark.id === recipe.id),
        ...(recipe.key && { key: recipe.key })
    };
}

export const loadRecipe = async function (id) {
    try {
        const { data } = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
        state.recipe = createRecipeObject(data);
    } catch (err) {
        throw (`💥💥💥 Model - loadRecipe: ${err.message} 💥💥💥`);
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const { data } = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
        state.search.results = data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key })
            }
        });
        state.search.numPages = Math.ceil(state.search.results.length / state.search.resultsPerPage);
        state.search.currentPage = 1;
    } catch (err) {
        console.log(`💥💥💥 Model - loadSearch: ${err.message} 💥💥💥`);
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.currentPage) {
    state.search.currentPage = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
    });
    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const loadBookmarks = function () {
    const bookmarks = localStorage.getItem('bookmarks');
    if (!bookmarks) return;
    state.bookmarks = JSON.parse(bookmarks);
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    // state.recipe.bookmarked = true;

    // Update local storage
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
    if (index < 0) return;

    state.bookmarks.splice(index, 1);
    // state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== id);

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    // Update local storage
    persistBookmarks();
}

const init = function () {
    loadBookmarks();
}
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
}
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).
            filter(entry => entry[0].startsWith('ingredient-') && entry[1] !== '')
            .map(([_, ing]) => {
                // const ingArr = ing.replaceAll(' ', '').split(',');
                const ingArr = ing.split(',').map(str => str.trim());
                if (ingArr.length < 3) throw new Error('Wrong ingredient format. Please use the correct format :)');
                const [quantity, unit, description] = ingArr;
                return {
                    quantity: quantity ? Number(quantity) : null,
                    unit: unit,
                    description: description
                };
            });

        const recipe = {
            title: newRecipe.title,
            publisher: newRecipe.publisher,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            servings: Number(newRecipe.servings),
            cooking_time: Number(newRecipe.cookingTime),
            ingredients: ingredients,
        };

        const { data } = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        console.error(`💥💥💥 Model - uploadRecipe: ${err} 💥💥💥`);
        throw err;
    }
}