//...... menu........//
document.addEventListener('DOMContentLoaded', () => {
    const menuBox = document.getElementById('menuBox');
    // API for Categories
    const CATEGORIES_API_URL = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    // API for filtering by Category
    const FILTER_API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=';

    /**
     * Fetches meal categories from TheMealDB API.
     */
    async function fetchMenuData() {
        // 1. Clear the placeholder text
        menuBox.innerHTML = '<h2>Loading Menu... 🍽️</h2>';

        try {
            const response = await fetch(CATEGORIES_API_URL);
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // The API returns an object with a 'categories' array
            if (data && data.categories) {
                displayMenu(data.categories);
            } else {
                menuBox.innerHTML = '<p class="error">API returned no menu categories.</p>';
            }

        } catch (error) {
            console.error("Failed to fetch menu data:", error);
            menuBox.innerHTML = `<p class="error">Error loading menu: ${error.message}. Please try again later.</p>`;
        }
    }

    /**
     * Renders the fetched menu items to the page.
     * @param {Array} categories - The array of meal category objects.
     */
    function displayMenu(categories) {
        // Clear the loading message
        menuBox.innerHTML = '<h2>Browse Our Categories</h2>';
        
        const menuList = document.createElement('ul');
        menuList.id = 'menuList';

        categories.forEach(category => {
            const categoryName = category.strCategory; // Extract the category name
            const listItem = document.createElement('li');
            listItem.classList.add('menu-item');
            
            // **ADD EVENT LISTENER HERE**
            listItem.addEventListener('click', () => {
                fetchRecipesByCategory(categoryName);
            });
            
            // The API keys are strCategory, strCategoryThumb, and strCategoryDescription
            listItem.innerHTML = `
                <img src="${category.strCategoryThumb}" alt="${categoryName} thumbnail">
                <h3>${categoryName}</h3>
                <p class="menu-description">${category.strCategoryDescription.substring(0, 100)}...</p>
            `;
            
            menuList.appendChild(listItem);
        });

        menuBox.appendChild(menuList);
    }
    
    // ------------------------------------------------------------------
    // **NEW RECIPE FUNCTIONS BELOW**
    // ------------------------------------------------------------------

    /**
     * Fetches recipes for a specific category.
     * @param {string} categoryName - The name of the meal category (e.g., 'Beef').
     */
    async function fetchRecipesByCategory(categoryName) {
        menuBox.innerHTML = `<h2>Loading ${categoryName} Recipes... 🍜</h2>`;
        const categoryURL = `${FILTER_API_BASE_URL}${categoryName}`;

        try {
            const response = await fetch(categoryURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // The API returns an object with a 'meals' array
            if (data && data.meals) {
                displayRecipes(categoryName, data.meals);
            } else {
                // This happens if the category is empty or API returns no meals
                menuBox.innerHTML = `<p class="error">No recipes found for ${categoryName}.</p>`;
            }

        } catch (error) {
            console.error(`Failed to fetch recipes for ${categoryName}:`, error);
            menuBox.innerHTML = `<p class="error">Error loading ${categoryName} recipes: ${error.message}.</p>`;
        }
    }

    /**
     * Renders the list of meals for the selected category.
     * @param {string} categoryName - The name of the meal category.
     * @param {Array} meals - The array of meal objects.
     */
    function displayRecipes(categoryName, meals) {
        menuBox.innerHTML = `<h2>${categoryName} Recipes</h2>`;
        
        const recipesList = document.createElement('ul');
        recipesList.id = 'recipesList';
        recipesList.classList.add('recipe-grid'); // Add a class for potential grid styling

        meals.forEach(meal => {
            const listItem = document.createElement('li');
            listItem.classList.add('recipe-item');
            
            // The API keys are idMeal, strMeal, and strMealThumb
            listItem.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h4>${meal.strMeal}</h4>
                <p class="recipe-id">ID: ${meal.idMeal}</p>
                <button class="view-recipe-btn" data-meal-id="${meal.idMeal}">View Details</button>
            `;
            
            recipesList.appendChild(listItem);
        });

        menuBox.appendChild(recipesList);
    }

    // Call the function to fetch and display the data when the page loads
    fetchMenuData();
});


const appId = 'YOUR_APP_ID'; // Replace with your Edamam Application ID
const appKey = 'YOUR_APP_KEY'; // Replace with your Edamam Application Key
const baseUrl = 'https://api.edamam.com/api/nutrition-data';

const foodInput = document.querySelector('.input');
const checkBtn = document.querySelector('.btn');
const resultsBox = document.querySelector('.placeholder-box');

checkBtn.addEventListener('click', fetchNutrition);

function fetchNutrition() {
    const ingredient = foodInput.value.trim();

    if (!ingredient) {
        displayMessage('Please enter a food item (e.g., 1 apple, 1 cup cooked rice).');
        return;
    }

    // Edamam requires the query to be in a specific format (e.g., '1 large apple')
    const query = encodeURIComponent(ingredient);
    const apiUrl = `${baseUrl}?app_id=${appId}&app_key=${appKey}&ingr=${query}`;

    displayMessage('Fetching nutrition data...');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // Throw an error if the HTTP status is not 200-299
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.totalNutrients && Object.keys(data.totalNutrients).length > 0) {
                displayNutritionResults(data);
            } else {
                displayMessage('Could not find nutrition data for that item. Try a different format.');
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            displayMessage(`Error: Could not retrieve data. Check your API credentials or network connection. (${error.message})`);
        });
}

function displayMessage(message) {
    resultsBox.innerHTML = `<p class="message-text"><strong>${message}</strong></p>`;
}

function displayNutritionResults(data) {
    const nutrients = data.totalNutrients;
    const calories = Math.round(data.calories);

    let html = `
        <h3>📊 Nutrition Facts for: ${foodInput.value.trim()}</h3>
        <p class="calories-count">Total Calories: <strong>${calories} kcal</strong></p>
        <table>
            <thead>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Function to safely extract and format nutrient data
    const getNutrientRow = (key, name) => {
        const nutrient = nutrients[key];
        if (nutrient) {
            const amount = nutrient.quantity.toFixed(1); // One decimal place
            const unit = nutrient.unit;
            return `
                <tr>
                    <td>${name}</td>
                    <td>${amount}</td>
                    <td>${unit}</td>
                </tr>
            `;
        }
        return '';
    };

    // Major Nutrients
    html += getNutrientRow('FAT', 'Total Fat');
    html += getNutrientRow('FASAT', 'Saturated Fat');
    html += getNutrientRow('CHOCDF', 'Total Carbs');
    html += getNutrientRow('FIBTG', 'Dietary Fiber');
    html += getNutrientRow('SUGAR', 'Sugars');
    html += getNutrientRow('PROCNT', 'Protein');
    html += getNutrientRow('NA', 'Sodium');
    html += getNutrientRow('CHOL', 'Cholesterol');
    
    html += `
            </tbody>
        </table>
        <p class="disclaimer">*Values are per serving of the entered food item.</p>
    `;

    resultsBox.innerHTML = html;
}