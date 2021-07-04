import "./bootstrap";
import "../style.css";
import {Client} from "./api";
import {IngredientForm, SelectedIngredients} from "./models/ingredients";
import {
    IngredientFormController,
    SelectedIngredientsController,
} from "./controllers/ingredients";
import {IngredientFormView, SelectedIngredientsView} from "./views/ingredients";
import {Recipes} from "./models/recipes";
import {RecipesController} from "./controllers/recipes";
import {RecipesView} from "./views/recipes";
import {PaginatedModalModel} from "./models/modal";
import {Recipe} from "./models/spoonacular";
import {
    InstructionsPage,
    RecipeModal,
    SummaryPage,
} from "./views/modal/recipes";
import {PaginatedModalController} from "./controllers/modal";

const client = new Client();

const formModel = new IngredientForm(client);
const selectionsModel = new SelectedIngredients();
const recipesModel = new Recipes(client);
const modalModel = new PaginatedModalModel<Recipe>();

const formController = new IngredientFormController(formModel, selectionsModel);
const selectionsController = new SelectedIngredientsController(selectionsModel);
const recipesController = new RecipesController(
    recipesModel,
    selectionsModel,
    modalModel
);
const modalController = new PaginatedModalController<Recipe>(modalModel);

const form = document.querySelector("#form-ingredients");
if (form === null) {
    throw new TypeError("Cannot find the ingredients form.");
}

const formView = new IngredientFormView(
    form as HTMLFormElement,
    formController
);
formModel.register(formView);

const selectionsView = new SelectedIngredientsView(
    form as HTMLFormElement,
    selectionsController
);
selectionsModel.register(selectionsView);

const searchButton = document.querySelector("#button-search");
if (searchButton === null) {
    throw new TypeError("Cannot find the search button.");
}

const missingToggle = document.querySelector("#check-recipe-hide");
if (missingToggle === null) {
    throw new TypeError("Cannot find the missing recipes toggle switch.");
}

const recipesView = new RecipesView(
    searchButton,
    missingToggle,
    recipesController
);
recipesModel.register(recipesView);

const modal = document.querySelector("#recipe-modal");
if (modal === null) {
    throw new TypeError("Cannot find the recipe modal.");
}

const modalView = new RecipeModal(modal);
modalModel.register(modalView);

const summaryView = new SummaryPage(modal, 1, modalController);
modalModel.register(summaryView);

const instructionsView = new InstructionsPage(modal, 3, modalController);
modalModel.register(instructionsView);
