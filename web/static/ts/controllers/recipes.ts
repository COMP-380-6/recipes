import {Recipes} from "../models/recipes";
import {SelectedIngredients} from "../models/ingredients";
import {PaginatedModalModel, Quantities} from "../models/modal";
import {Recipe} from "../models/spoonacular";

export class RecipesController {
    private readonly _recipes: Recipes;
    private readonly _ingredients: SelectedIngredients;
    private readonly _modal: PaginatedModalModel<Recipe>;
    private readonly _quantities: Quantities;

    constructor(
        recipesModel: Recipes,
        ingredientsModel: SelectedIngredients,
        modalModel: PaginatedModalModel<Recipe>,
        quantitiesModel: Quantities
    ) {
        this._recipes = recipesModel;
        this._ingredients = ingredientsModel;
        this._modal = modalModel;
        this._quantities = quantitiesModel;
    }

    public async onSearch(
        sort: string,
        cuisines: string[],
        type: string,
        maxReadyTime: string
    ): Promise<void> {
        const ingred = Array.from(this._ingredients.ingredients).join(",");
        const cuisine = cuisines.join(",");
        await this._recipes.update(ingred, sort, cuisine, type, maxReadyTime);
    }

    public onClick(recipe: Recipe) {
        if (recipe.id !== this._modal.data?.id) {
            // Go to the first page if a different recipe is opened.
            // TODO: I think ideally this should be done in the model.
            this._modal.page = 1;
        }

        this._modal.data = recipe;
    }

    public onUnitChange(unitType: string) {
        this._quantities.type = unitType;
    }
}
