import "./bootstrap";
import "./fontawesome";
import "../style.css";
import "./utils/polyfills";
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
import {Quantities} from "./models/modal";
import {Recipe} from "./models/spoonacular";
import {
    IngredientQuantitiesView,
    RecipeInstructionsView,
    RecipeModalView,
    RecipeRequirementsView,
    RecipeSummaryView,
} from "./views/modal/recipes";
import {RecipeModalController} from "./controllers/modal";
import {IntegerModel, Model} from "./models/common";
import {PaginatedModalView} from "./views/modal/paginated";

const client = new Client();

// Models
const formModel = new IngredientForm(client);
const selectionsModel = new SelectedIngredients();
const recipesModel = new Recipes(client);
const modalModel = new Model<Recipe>();
const modalPageModel = new IntegerModel();
const quantitiesModel = new Quantities();

// Controllers
const formController = new IngredientFormController(formModel, selectionsModel);
const selectionsController = new SelectedIngredientsController(selectionsModel);
const recipesController = new RecipesController(recipesModel, selectionsModel);
const modalController = new RecipeModalController(
    modalPageModel,
    modalModel,
    quantitiesModel
);

// Elements
const form = document.querySelector("#form-ingredients") as HTMLFormElement;
if (form === null) {
    throw new TypeError("Cannot find the ingredients form.");
}

const modal = document.querySelector("#recipe-modal");
if (modal === null) {
    throw new TypeError("Cannot find the recipe modal.");
}

// Views
const formView = new IngredientFormView(form, formController);
formModel.register(formView);

const selectionsView = new SelectedIngredientsView(form, selectionsController);
selectionsModel.register(selectionsView);

const recipesView = new RecipesView(recipesController, modalController);
recipesModel.register(recipesView);

const paginatedModalView = new PaginatedModalView(modal, modalController);
modalPageModel.register(paginatedModalView);

const modalView = new RecipeModalView(modal);
modalModel.register(modalView);

const summaryView = new RecipeSummaryView(modal);
modalModel.register(summaryView);

const requirementsView = new RecipeRequirementsView(modal);
modalModel.register(requirementsView);

const instructionsView = new RecipeInstructionsView(modal);
modalModel.register(instructionsView);

const quantitiesView = new IngredientQuantitiesView(modal, modalController);
quantitiesModel.register(quantitiesView);
// TODO: don't rely on order of registration.
modalModel.register(quantitiesModel);
