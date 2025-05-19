# 🥫 BestBefore 
**Track your pantry. Cook smarter. Waste less.**

<br>

## 📖 About Us

**BestBefore** is a dynamic web application built to help households reduce food waste by tracking ingredient expiration dates and finding creative ways to use them before they go bad.

Households often waste food due to forgotten or unknown expiration dates, leading to unnecessary waste and environmental harm. BestBefore empowers users to:

- ✅ Track pantry ingredients with expiration dates  
- 🕒 Receive timely reminders before items expire  
- 🍽️ Discover recipes tailored to your available ingredients  
- 💸 Save money and help the environment  

<br>

## 🚀 Features & How to Use

1. **Add Ingredients**  
   Type items into the input box and click **"Add Ingredient"**. Be sure to include an expiration date!

2. **Check Expiration Dates**  
   View your pantry in **List View** or switch to **Calendar View** for a visual timeline of upcoming expirations.

3. **Manage Your Pantry**  
   In **List View**, click **"Find Recipes"** to browse recipes using that ingredient. Click the ❌ icon to delete an item.

4. **Flip Recipe Cards**  
   Click anywhere on a recipe card to flip it and reveal required ingredients.

5. **View Full Recipes**  
   Click **"View Recipe"** to open detailed instructions in a dedicated recipe page.

6. **Save Recipes**  
   Click the 🔖 bookmark icon to save or unsave recipes. View all saved recipes under **"Saved Recipes"**.

7. **Explore Random Recipes**  
   Scroll horizontally at the bottom of the page to explore random meals. Refresh for new options!

8. **Enjoy Your Meal!**  
   Cook confidently knowing you're saving food, money, and the planet.

<br>

## 🌐 Supported Browsers & Platforms

BestBefore is designed as a mobile-first web application and works seamlessly across modern web browsers:

- ✅ **Chrome** (Desktop, Android)  
- ✅ **Safari** (Desktop, iOS)  
- ✅ **Firefox**  
- ✅ **Edge**  
- ❌ *Internet Explorer is not supported*

Optimized for use on both **iOS** and **Android** devices via the mobile browser experience.

<br>

---

<br>

# 🛠️ Developer Manual

This Developer Manual provides guidance for future developers maintaining or extending the **BestBefore** web application. It includes installation steps, testing information, and API documentation for both external and internal services.

<br>

## 📦 Installation Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/bestbefore.git
cd bestbefore
npm install
npm start
```

2. **Run the App on a Server** <br>
   Navigate to [http://localhost:3000](http://localhost:3000) on a web browser

3. **Vercel** <br>
   Unfortunately, we were not unable to deploy our project to Vercel at the time of the project submission due to an issue with the Supabase. <br>
   Here is the link: [https://best-before-three.vercel.app/](https://best-before-three.vercel.app/)

<br>

## 🌐 API

**🍲 TheMealDB API** <br>
Main external data source for ingredients and recipes, primarily used to search for recipes by ingredient. Access the API at [https://www.themealdb.com/api.php](https://www.themealdb.com/api.php)

<br>

 **📡 Internal API Endpoints** <br>
These functions are used to interact with Supabase to store and retrieve saved recipes. Pantry data is stored locally in the browser.

- POST - Saves a recipe to the Supabase database.
`saveRecipeToSupabase(recipe)`

- GET - Retrieves all saved recipes from Supabase for the current user session.
`fetchSavedRecipes()`

- DELETE - Removes a saved recipe using its unique recipe_id.
`deleteRecipeFromSupabase(recipe_id)`

<br>

## 🐛 Known Bugs

- Newly added pantry items may not immediately appear; a page refresh might be needed.

- Deleting an item in list view may not reflect the change in calendar view until the page is refreshed.

- Pantry items are stored locally in the browser and will not persist across devices or sessions.
Only saved recipes are stored remotely in Supabase for convenience and due to project time constraints.

<br>

## 🔭 Future Developments

✅ Migrate pantry item storage to Supabase for persistence across devices

✅ Add authentication and user-specific data storage

✅ Implement automated tests

✅ Improve real-time UI reactivity without requiring refreshes

✅ Add filtering and sorting options for saved recipes

✅ Enable editing of expiration dates after adding an ingredient

✅ Deploy app successfully on Vercel

<br>

