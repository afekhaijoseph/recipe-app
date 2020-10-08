import axios from 'axios';

export default class Recipe {
    constructor (id){
        this.id = id;

    }
    async getRecipe(){
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            const recipe = res.data.recipe;

            this.title = recipe.title;
            this.author = recipe.publisher;
            this.image = recipe.image_url;
            this.url = recipe.source_url;
            this.ingredients = recipe.ingredients;
    
        }
        catch(error){
            console.log('an error occured');
              
        }
        
    }

    calcTime (){
        const numIng = this.ingredients.length;
        const periods = numIng / 3;

        this.time = periods * 15;
    }

    calcServing (){
        this.serving = 4;
    }

    parseIngredients (){
        const longUnits = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const shortUnits = ['tbsp', 'tbsps', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const newIngredients = this.ingredients.map(el =>{
            let ingredient = el.toLowerCase();
            longUnits.forEach((unit, i) =>{
               ingredient = ingredient.replace(unit, shortUnits[i]);
            })
             // remove bracket information
            ingredient = ingredient.replace(/ *\([^)]*\) */g, "");


            // parse ingredients into count, unit and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => shortUnits.includes(el2));
            
            let objIng;
            if (unitIndex > -1){
                //there is a unit
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else{
                    count = eval(arrCount.join('+'));
                }

                objIng = {
                    count,
                    unit : arrIng[unitIndex],
                    ingredient : arrIng.slice(unitIndex + 1).join(' '),
                }

            }
            else if (parseInt(arrIng[0], 10)){
                //there is no unit but there is a number

                objIng = {
                    count : parseInt(arrIng[0], 10),
                    unit : "",
                    ingredient : arrIng.slice(1).join(' ')
                }
            }
            else if(unitIndex === -1){
                //this is no unit

                objIng = {
                    count : 1,
                    unit : "",
                    ingredient,
                }  
            }
            return objIng;
        })

        this.ingredients = newIngredients;
    }

    updateServing (type) {
        console.log(type);
        const newServing = type === 'dec' ? this.serving - 1 : this.serving + 1;

        this.ingredients.forEach(ing =>{
            ing.count *= (newServing / this.serving);
        })
            
        this.serving = newServing;
    }
    
}

