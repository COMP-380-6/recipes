import {BaseObservable, IObserver} from "../observe";
import {Recipe} from "./spoonacular";

export interface Quantity {
    readonly id: number;
    readonly amount: number;
    readonly unit: string;
}

export class Quantities
    extends BaseObservable<Quantity[]>
    implements IObserver<Recipe>
{
    private _us: Quantity[] = [];
    private _metric: Quantity[] = [];
    private _type: "us" | "metric" = "us";

    public get type(): "us" | "metric" {
        return this._type;
    }

    public get quantities(): Quantity[] {
        // TODO: return iterator to avoid mutation?
        return this._type === "us" ? this._us : this._metric;
    }

    public set type(value: string) {
        if (value !== "metric" && value !== "us") {
            throw new TypeError("Unit type must be 'metric' or 'us'.");
        }

        this._type = value;
        this.notify(this.quantities);
    }

    public update(recipe: Recipe): void {
        this._us = [];
        this._metric = [];

        for (const ingredient of recipe.extendedIngredients) {
            if (ingredient.id === null) {
                // A null ID probably means it's some nonsense data from
                // a failed parse on Spoonacular's end.
                continue;
            }

            this._us.push({
                id: ingredient.id,
                amount: ingredient.measures.us.amount,
                unit: ingredient.measures.us.unitShort,
            });

            this._metric.push({
                id: ingredient.id,
                amount: ingredient.measures.metric.amount,
                unit: ingredient.measures.metric.unitShort,
            });
        }

        this.notify(this.quantities);
    }
}
