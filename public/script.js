// Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const SUPABASE_URL = 'https://pmujfsicwwxcrvpaqyde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdWpmc2ljd3d4Y3J2cGFxeWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTU5NzAsImV4cCI6MjA2MzA5MTk3MH0.33bqWkGybWDLepLR8SW92bl3y8aVNf1kCVjcrP4x3zk';

// Create client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Save recipes
async function saveRecipeToSupabase(recipe) {
    const { data, error } = await supabase
        .from('saved-recipes')
        .insert([recipe]);

    if (error) {
        console.error('Error saving recipe:', error.message);
    } else {
        console.log('Recipe saved:', data);
    }
    console.log("Saving recipe to Supabase:", recipe);
}

// Fetch saved recipes
async function fetchSavedRecipes() {
    const { data, error } = await supabase
        .from('saved-recipes')
        .select('*');

    if (error) {
        console.error('Error fetching saved recipes:', error.message);
        return [];
    }

    return data;
}

// Unsave recipes
async function deleteRecipeFromSupabase(recipe_id) {
    const { data, error } = await supabase
        .from('saved-recipes')
        .delete()
        .eq('recipe_id', recipe_id);

    if (error) {
        console.error('❌ Error deleting recipe:', error.message);
    } else {
        console.log('✅ Recipe deleted from Supabase:', data);
    }
}

// Add Ingredient Button Functionality
document.getElementById("add-ingredient").addEventListener("click", function(event) {
    const ingredient = document.getElementById("ingredient").value.trim();
    const expirationRaw = document.getElementById("expiration").value.trim();
    const dt = luxon.DateTime.fromISO(expirationRaw);
    const formattedExpiration = dt.toFormat("MM/dd/yyyy");

    // Save to localStorage
    savePantryItem({
        ingredient: ingredient,
        expiration: formattedExpiration
    });

    calendar.addEvent({
        title: `${ingredient} expires`,
        start: dt.toISODate(), 
        allDay: true,
        color: "#de886e" 
      });      
    
    if (!ingredient || !expirationRaw) return;

    const now = luxon.DateTime.now();
    const daysUntilExpiration = dt.diff(now, 'days').days;
    
    let statusHTML = '';
    if (daysUntilExpiration < 0) {
        statusHTML = `<span class="expired">EXPIRED</span>`;
    } else if (daysUntilExpiration > 0 && daysUntilExpiration <= 7) {
        statusHTML = `<span class="expires-soon">EXPIRES SOON</span>`;
    }

    const pantrySidebar = document.getElementById("pantrySidebar");
    const pantryItemsContainer = document.getElementById("pantryItemsContainer");

    const pantryItem = document.createElement("div");
    pantryItem.className = "pantryitem";

    pantryItem.innerHTML = `
    <button class="delete" type="button"> X </button> 
    <h3 style="font-weight:bold">${ingredient}</h3>
    <p style="font-style:italic;color:#de886e">Expires ${formattedExpiration} ${statusHTML}</p>
    <button class="find-recipes" type="button" data-ingredient="${ingredient}">Find Recipes</button>
    <br>
`;

    pantryItem.querySelector(".delete").addEventListener("click", function() {
        pantryItem.remove();
        if (pantryItemsContainer.children.length === 0) {
            pantrySidebar.style.display = "none";
        }
        const eventTitle = `${ingredient} expires`;
        const eventDateStr = dt.toISODate();
        const events = calendar.getEvents();
        events.forEach(event => {
            if (event.title === eventTitle && event.startStr === eventDateStr) {
                event.remove();
            }
        });
    });

    pantryItem.querySelector(".find-recipes").addEventListener("click", function() {
        const ing = this.getAttribute("data-ingredient");
        findRecipes(ing);
    });

    pantryItemsContainer.appendChild(pantryItem);
    pantrySidebar.style.display = "block";

    document.getElementById("ingredient").value = "";
    document.getElementById("expiration").value = "";
});


let lastSearchedIngredient = null; // Store globally

// Find Recipe Button Functionality
async function findRecipes(ingredient = '') {
    lastSearchedIngredient = ingredient;
    const savedRecipes = await fetchSavedRecipes();
    const savedRecipeIds = savedRecipes.map(r => r.recipe_id);
    
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const recipeResults = data.meals;
            const recipeResultsContainer = document.getElementById("recipeResults");

            recipeResultsContainer.innerHTML = '';

            if (recipeResults) {
                recipeResults.forEach(recipe => {
                    const isSaved = savedRecipeIds.includes(recipe.idMeal);

                    const recipeCard = document.createElement("div");
                    recipeCard.className = "recipeCard";

                    recipeCard.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front">
                                <button class="save" type="button"> 
                                    <img src="${isSaved ? 'images/filled-bookmark.png' : 'images/empty-bookmark.png'}"/> 
                                </button> 
                                <div class="image-container">
                                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                                    <div class="overlay"></div>
                                </div>
                                <p>${recipe.strMeal}</p>
                                <a class="view-recipe" href="https://www.themealdb.com/meal/${recipe.idMeal}-${recipe.strMeal.toLowerCase().split(' ').join('-')}" target="_blank">View Recipe</a>
                            </div>
                            <div class="card-back">
                                <p style="font-weight: bold;">Ingredients:</p>
                                <ul class="ingredients-list" style="padding-left: 20px;"></ul>
                            </div>
                        </div>
                    `;

                    const saveBtn = recipeCard.querySelector('.save');
                    saveBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const img = saveBtn.querySelector('img');
                        const isEmpty = img.src.includes('empty-bookmark.png');
                        img.src = isEmpty ? 'images/filled-bookmark.png' : 'images/empty-bookmark.png';

                        if (isEmpty) {
                            await saveRecipeToSupabase({
                                recipe_id: recipe.idMeal,
                                name: recipe.strMeal,
                                thumbnail_url: recipe.strMealThumb
                            });
                        } else {
                            await deleteRecipeFromSupabase(recipe.idMeal);
                        }
                    });

                    recipeCard.addEventListener("click", function(e) {
                        if (
                            e.target.tagName.toLowerCase() !== 'img' &&
                            !e.target.closest(".save") &&
                            !e.target.classList.contains('view-recipe')
                        ) {
                            recipeCard.classList.toggle("flipped");

                            const ingredientsList = recipeCard.querySelector(".ingredients-list");
                            if (ingredientsList.children.length === 0) {
                                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`)
                                    .then(response => response.json())
                                    .then(data => {
                                        const meal = data.meals[0];
                                        for (let i = 1; i <= 20; i++) {
                                            const ing = meal[`strIngredient${i}`];
                                            const measure = meal[`strMeasure${i}`];
                                            if (ing && ing.trim()) {
                                                const li = document.createElement("li");
                                                li.textContent = `${ing} - ${measure}`;
                                                ingredientsList.appendChild(li);
                                            }
                                        }
                                    })
                                    .catch(() => {
                                        ingredientsList.innerHTML = `<li>Error loading ingredients.</li>`;
                                    });
                            }
                        }
                    });

                    const image = recipeCard.querySelector("img");
                    image.addEventListener("click", function() {
                        showImageOverlay(recipe.strMealThumb, recipe.strMeal);
                    });

                    recipeResultsContainer.appendChild(recipeCard);
                });
            } else {
                recipeResultsContainer.innerHTML = '<p>No recipes found for this ingredient.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            document.getElementById("recipeResults").innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
        });
}


async function loadDiscoverRecipes() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const promises = letters.map(letter =>
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`).then(res => res.json())
    );

    const results = await Promise.all(promises);
    const allMeals = results.flatMap(r => r.meals || []);
    const shuffled = allMeals.sort(() => 0.5 - Math.random()).slice(0, 10);
    const container = document.getElementById("discoverRecipes");
    container.innerHTML = ""; // Clear previous content

    const savedRecipes = await fetchSavedRecipes();
    const savedRecipeIds = savedRecipes.map(r => r.recipe_id);

    shuffled.forEach(recipe => {
        const isSaved = savedRecipeIds.includes(recipe.idMeal);

        const recipeCard = document.createElement("div");
        recipeCard.className = "recipeCard";

        recipeCard.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <button class="save" type="button">
                        <img src="${isSaved ? 'images/filled-bookmark.png' : 'images/empty-bookmark.png'}"/>
                    </button>
                    <div class="image-container">
                        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                        <div class="overlay"></div>
                    </div>
                    <p>${recipe.strMeal}</p>
                    <a class="view-recipe" href="https://www.themealdb.com/meal/${recipe.idMeal}-${recipe.strMeal.toLowerCase().split(' ').join('-')}" target="_blank">View Recipe</a>
                </div>
                <div class="card-back">
                    <p style="font-weight: bold;">Ingredients:</p>
                    <ul class="ingredients-list" style="padding-left: 20px;"></ul>
                </div>
            </div>
        `;

        // SAVE/UNSAVE functionality
        const saveBtn = recipeCard.querySelector('.save');
        saveBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const img = saveBtn.querySelector('img');
            const isEmpty = img.src.includes('images/empty-bookmark.png');
            img.src = isEmpty ? 'images/filled-bookmark.png' : 'images/empty-bookmark.png';

            if (isEmpty) {
                await saveRecipeToSupabase({
                    recipe_id: recipe.idMeal,
                    name: recipe.strMeal,
                    thumbnail_url: recipe.strMealThumb
                });
            } else {
                await deleteRecipeFromSupabase(recipe.idMeal);
                // Optionally remove from DOM immediately
                recipeCard.remove();
            }
        });

        // FLIP CARD functionality
        recipeCard.addEventListener("click", function (e) {
            if (
                e.target.tagName.toLowerCase() !== 'img' &&
                !e.target.closest(".save") &&
                !e.target.classList.contains('view-recipe')
            ) {
                recipeCard.classList.toggle("flipped");

                const ingredientsList = recipeCard.querySelector(".ingredients-list");
                if (ingredientsList.children.length === 0) {
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`)
                        .then(res => res.json())
                        .then(data => {
                            const details = data.meals[0];
                            for (let i = 1; i <= 20; i++) {
                                const ing = details[`strIngredient${i}`];
                                const measure = details[`strMeasure${i}`];
                                if (ing && ing.trim()) {
                                    const li = document.createElement("li");
                                    li.textContent = `${measure.trim()} ${ing.trim()}`;
                                    ingredientsList.appendChild(li);
                                }
                            }
                        })
                        .catch(() => {
                            ingredientsList.innerHTML = `<li>Error loading ingredients.</li>`;
                        });
                }
            }
        });

        // Overlay on image click
        const image = recipeCard.querySelector("img");
        image.addEventListener("click", function () {
            showImageOverlay(recipe.strMealThumb, recipe.strMeal);
        });

        container.appendChild(recipeCard);
    });
}


loadDiscoverRecipes();

// Save Recipes Button
const allRecipesBtn = document.getElementById("allRecipesBtn");
const savedRecipesBtn = document.getElementById("savedRecipesBtn");
const recipeResultsContainer = document.getElementById("recipeResults");

// All Recipes View
allRecipesBtn.classList.add("active");
allRecipesBtn.addEventListener("click", () => {
    allRecipesBtn.classList.add("active");
    savedRecipesBtn.classList.remove("active");

    recipeResultsContainer.innerHTML = ""; // Clear previous cards
    if (lastSearchedIngredient) {
        findRecipes(lastSearchedIngredient); // Reload last search
    } else {
        recipeResultsContainer.innerHTML = "<p>Please search for an ingredient first.</p>";
    }
});

// Saved Recipes View
savedRecipesBtn.addEventListener("click", async () => {
    savedRecipesBtn.classList.add("active");
    allRecipesBtn.classList.remove("active");

    recipeResultsContainer.innerHTML = ""; // Clear previous cards
    const savedRecipes = await fetchSavedRecipes();

    savedRecipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipeCard";

        recipeCard.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <button class="save" type="button">
                        <img src="images/filled-bookmark.png" />
                    </button>
                    <div class="image-container">
                        <img src="${recipe.thumbnail_url}" alt="${recipe.name}">
                        <div class="overlay"></div>
                    </div>
                    <p>${recipe.name}</p>
                    <a class="view-recipe" href="https://www.themealdb.com/meal/${recipe.recipe_id}" target="_blank">View Recipe</a>
                </div>
                <div class="card-back">
                    <p style="font-weight: bold;">Ingredients:</p>
                    <ul class="ingredients-list" style="padding-left: 20px;"></ul>
                </div>
            </div>
        `;

        // Unsave button logic
        const saveBtn = recipeCard.querySelector('.save');
        saveBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // prevent card flip

            const img = saveBtn.querySelector('img');
            img.src = 'images/empty-bookmark.png';

            recipeCard.remove(); // remove from DOM
            await deleteRecipeFromSupabase(recipe.recipe_id); // delete from Supabase
        });

        // Flip logic and fetch ingredients
        recipeCard.addEventListener("click", function (e) {
            if (
                e.target.tagName.toLowerCase() !== 'img' &&
                !e.target.closest(".save") &&
                !e.target.classList.contains('view-recipe')
            ) {
                recipeCard.classList.toggle("flipped");

                const ingredientsList = recipeCard.querySelector(".ingredients-list");
                if (ingredientsList.children.length === 0) {
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.recipe_id}`)
                        .then(res => res.json())
                        .then(data => {
                            const details = data.meals[0];
                            for (let i = 1; i <= 20; i++) {
                                const ing = details[`strIngredient${i}`];
                                const measure = details[`strMeasure${i}`];
                                if (ing && ing.trim()) {
                                    const li = document.createElement("li");
                                    li.textContent = `${measure.trim()} ${ing.trim()}`;
                                    ingredientsList.appendChild(li);
                                }
                            }
                        })
                        .catch(() => {
                            ingredientsList.innerHTML = `<li>Error loading ingredients.</li>`;
                        });
                }
            }
        });

        recipeResultsContainer.appendChild(recipeCard);
    });
});


function savePantryItem(item) {
    let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
    pantry.push(item);
    localStorage.setItem('pantry', JSON.stringify(pantry));
}

function loadPantry() {
    const pantry = JSON.parse(localStorage.getItem('pantry')) || [];
    const pantryItemsContainer = document.getElementById("pantryItemsContainer");
    const pantrySidebar = document.getElementById("pantrySidebar");
    pantry.forEach(item => {
        const expirationDate = luxon.DateTime.fromFormat(item.expiration, "MM/dd/yyyy");
        const now = luxon.DateTime.now();
        const daysUntilExpiration = expirationDate.diff(now, 'days').days;

        let statusHTML = '';
        if (daysUntilExpiration < 0) {
            statusHTML = `<span class="expired">EXPIRED</span>`;
        } else if (daysUntilExpiration > 0 && daysUntilExpiration <= 7) {
            statusHTML = `<span class="expires-soon">EXPIRES SOON</span>`;
        }

        const pantryItem = document.createElement("div");
        pantryItem.className = "pantryitem";

        pantryItem.innerHTML = `
        <button class="delete" type="button"> X </button> 
        <h3 style="font-weight:bold">${item.ingredient}</h3>
        <p style="font-style:italic;color:#de886e">Expires ${item.expiration} ${statusHTML}</p>
        <button class="find-recipes" type="button" data-ingredient="${item.ingredient}">Find Recipes</button>
        <br>
        `;

        pantryItem.querySelector(".delete").addEventListener("click", function() {
            pantryItem.remove();
            removePantryItem(item); // remove from localStorage
            if (pantryItemsContainer.children.length === 0) {
                pantrySidebar.style.display = "none";
            }
            const eventTitle = `${ingredient} expires`;
            const eventDateStr = dt.toISODate();
            const events = calendar.getEvents();
            events.forEach(event => {
                if (event.title === eventTitle && event.startStr === eventDateStr) {
                    event.remove();
                }
            });

        });

        pantryItem.querySelector(".find-recipes").addEventListener("click", function() {
            findRecipes(item.ingredient);
        });

        pantryItemsContainer.appendChild(pantryItem);
        pantrySidebar.style.display = "block";
    });
}


function removePantryItem(itemToRemove) {
    let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
    pantry = pantry.filter(item => 
        !(item.ingredient === itemToRemove.ingredient && item.expiration === itemToRemove.expiration)
    );
    localStorage.setItem('pantry', JSON.stringify(pantry));
}

loadPantry();

let calendar; // To keep calendar instance
let calendarInitialized = false;

// Event listeners for toggle buttons
listViewBtn.classList.add("active");
document.getElementById("listViewBtn").addEventListener("click", () => {
    listViewBtn.classList.add("active");
    calendarViewBtn.classList.remove("active");
    document.getElementById("pantryItemsContainer").style.display = "block";
    document.getElementById("calendarContainer").style.display = "none";
    document.getElementById("listViewBtn").classList.add("active");
    document.getElementById("calendarViewBtn").classList.remove("active");
});

document.getElementById("calendarViewBtn").addEventListener("click", () => {
    calendarViewBtn.classList.add("active");
    listViewBtn.classList.remove("active");
    document.getElementById("pantryItemsContainer").style.display = "none";
    document.getElementById("calendarContainer").style.display = "block";
    document.getElementById("calendarViewBtn").classList.add("active");
    document.getElementById("listViewBtn").classList.remove("active");
    renderCalendar(); // initialize if not already done
});

// Render FullCalendar and populate it with localStorage items
function renderCalendar() {
    if (calendarInitialized) return;
    calendarInitialized = true;

    const pantry = JSON.parse(localStorage.getItem('pantry')) || [];

    const events = pantry.map(item => {
        const [month, day, year] = item.expiration.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return {
            title: `${item.ingredient} expires`,
            start: isoDate,
            allDay: true,
            color: '#de886e'
        };
    });

    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        height: 'auto',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next'
          },
    });

    calendar.render();
}

