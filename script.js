// Add Ingredient Button Functionality
document.getElementById("add-ingredient").addEventListener("click", function(event) {
    const ingredient = document.getElementById("ingredient").value.trim();
    const expiration = document.getElementById("expiration").value.trim();

    if (!ingredient || !expiration) return;

    const pantrySidebar = document.getElementById("pantrySidebar");
    const pantryItemsContainer = document.getElementById("pantryItemsContainer");

    const pantryItem = document.createElement("div");
    pantryItem.className = "pantryitem";

    pantryItem.innerHTML = `
        <button class="delete" type="button"> X </button> 
        <h3 style="font-weight:bold">${ingredient}</h3>
        <p style="font-style:italic;color:#de886e">Expires ${expiration}</p>
        <button class="find-recipes" type="button" data-ingredient="${ingredient}">Find Recipes</button>
        <br>
    `;

    pantryItem.querySelector(".delete").addEventListener("click", function() {
        pantryItem.remove();
        if (pantryItemsContainer.children.length === 0) {
            pantrySidebar.style.display = "none";
        }
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


//Find Recipe Functionality
function findRecipes(ingredient) {
    // Fetch recipes from the API using the ingredient
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const recipeResults = data.meals;
            const recipeResultsContainer = document.getElementById("recipeResults");

            // Clear previous results
            recipeResultsContainer.innerHTML = '';

            if (recipeResults) {
                recipeResults.forEach(recipe => {
                    const recipeCard = document.createElement("div");
                    recipeCard.className = "recipeCard";

                    recipeCard.innerHTML = `
                    <div class="image-container">
                        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                        <div class="overlay"></div>
                    </div>
                    <p>${recipe.strMeal}</p>
                    <a id="view-recipe" href="https://www.themealdb.com/meal/${recipe.idMeal}-${recipe.strMeal.toLowerCase().split(' ').join('-')}" target="_blank">View Recipe</a>
                    `;

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


function showImageOverlay(src, alt) {
    const overlay = document.getElementById("imageOverlay");
    const overlayImg = document.getElementById("overlayImg");
    const closeBtn = document.getElementById("closeOverlay");

    overlayImg.src = src;
    overlayImg.alt = alt;
    overlay.classList.remove("hidden");

    // Add event listener to close the overlay when clicking the close button
    closeBtn.addEventListener("click", function() {
        overlay.classList.add("hidden");
    });

    // You can also close overlay by clicking on the background
    document.getElementById("overlayBg").addEventListener("click", function() {
        overlay.classList.add("hidden");
    });
}

