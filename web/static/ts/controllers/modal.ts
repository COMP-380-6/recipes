import {IntegerModel, Model} from "../models/common";
import {Recipe} from "../models/spoonacular";
import {Quantities} from "../models/modal";

export class PaginatedModalController {
    protected _page: IntegerModel;

    constructor(model: IntegerModel) {
        this._page = model;
    }

    public onNavigationClick(event: Event): void {
        if (event.target === null) {
            throw new TypeError("Can't get active page: event target is null.");
        }

        const page = (event.target as Element).getAttribute("data-page");
        this._page.int = Number(page);
    }
}

export class RecipeModalController extends PaginatedModalController {
    private _data: Model<Recipe>;
    private _quantities: Quantities;

    constructor(
        pageModel: IntegerModel,
        dataModel: Model<Recipe>,
        quantitiesModel: Quantities
    ) {
        super(pageModel);
        this._data = dataModel;
        this._quantities = quantitiesModel;
    }

    public onClick(recipe: Recipe) {
        if (recipe.id !== this._data.data?.id) {
            // Go to the first page if a different recipe is opened.
            this._page.int = 1;
        }

        this._data.data = recipe;
    }

    public onUnitChange(unitType: string) {
        this._quantities.type = unitType;
    }
}
