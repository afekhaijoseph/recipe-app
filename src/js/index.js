import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import {elements, renderLoader, clearLoader} from './views/base'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'


const state = {}

const controlSearch = async ()=>{
    //1. Get query from view
    const query = searchView.getInput()
    if (query){
        //2. Create new search object and add to state
        state.search = new Search(query);
        
        //3. Prepare UI for result
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try{
            //4. Get result
            await state.search.Results();
                    
            //Render result to the UI
            clearLoader();
            searchView.renderResults(state.search.recipes);
        }
        catch(error){
             alert('something went wrong');
             clearLoader();  
        }
       
        }

}

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if (btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.recipes, goToPage);
    }
})

const controlRecipe = async ()=>{
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search) searchView.highlightSelected(id);

        //create new recipe object
        try{
            state.recipe = new Recipe(id);
            console.log(state.recipe);

            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServing();
    
            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id)
                );
        }
        catch(error){
            console.log(error);
            alert('Error processing recipe');
        }
        
    }
}

const controlList = () => {
    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

    //Handle delete
    elements.shopping.addEventListener('click', e => {
            const id = e.target.closest('.shopping__item').dataset.itemid;

            if(e.target.matches('.shopping__delete, .shopping__delete *')){
                state.list.deleteItem(id);
                listView.deleteItem(id);
            }
            else if (e.target.matches('.shopping__count--value')){
                const val = parseFloat(e.target.value, 10);
                console.log(val);
                state.list.updateCount(id, val);
            }
           
    }) 

}

const controlLike = () => {

    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    if (!state.likes.isLiked(currentID)){
        const newLike = state.likes.addLike( currentID, state.recipe.title, state.recipe.author, state.recipe.image);

        likesView.toggleLikeBtn(true);

        likesView.renderLike(newLike);
    }
    else{
        state.likes.deleteLike(currentID);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentID);
        
    }
    likesView.toggleLikesMenu(state.likes.getNumLiked());

}

window.addEventListener('load', ()=>{
    state.likes = new Likes();

    state.likes.readStorage();

    likesView.toggleLikesMenu(state.likes.getNumLiked());

    state.likes.likes.forEach ( like => likesView.renderLike(like));
})


elements.recipe.addEventListener('click', el=>{
    if (el.target.matches('.btn-decrease, .btn-decrease *')){
        if (state.recipe.serving > 1){
            state.recipe.updateServing('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    }
    else if(el.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServing('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if (el.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }
    else if (el.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});

['load', 'hashchange'].forEach(event => window.addEventListener(event, controlRecipe));