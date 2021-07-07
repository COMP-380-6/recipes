import {Client} from "../api";
import {Recipe, RecipeSearchResults} from "./spoonacular";
import {APIObservable} from "../observe";
import isequal from "lodash.isequal";

export class Recipes extends APIObservable<Recipe[]> {
    protected readonly _api: Client;
    private _data: Recipe[] = [];
    private _prevParams: Record<string, any> = {};

    constructor(apiClient: Client) {
        super();
        this._api = apiClient;
    }

    get data(): Recipe[] {
        return this._data;
    }

    set data(value: Recipe[]) {
        this._data = value;
        this.notify({data: this._data});
    }

    async update(
        ingredients: string,
        sort: string,
        cuisine: string,
        type: string,
        maxReadyTime: string
    ): Promise<void> {
        const params = {
            includeIngredients: ingredients,
            addRecipeInformation: "true",
            fillIngredients: "true",
            cuisine: cuisine,
            type: type,
            sort: sort,
            maxReadyTime: maxReadyTime,
        };

        // Avoid redundant requests.
        if (isequal(params, this._prevParams)) {
            return;
        }

        try {
            const response = await this._api.get("search", params);
            const results = (await response.json()) as RecipeSearchResults;
            this.data = results.results;
            this._prevParams = params;
        } catch (e) {
            this._notifyResponseError(e);
        }
    }
}
