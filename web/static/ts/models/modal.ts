import {BaseObservable, IObserver} from "../observe";
import {Recipe} from "./spoonacular";

export interface ModalMessage<T> {
    data: T;
    page: number;
}

export class PaginatedModalModel<T> extends BaseObservable<ModalMessage<T>> {
    private _data?: T = undefined;
    private _page: number = 1;

    public get data(): T | undefined {
        return this._data;
    }

    public get page(): number {
        return this._page;
    }

    public set data(data: T | undefined) {
        if (data === undefined) {
            throw new TypeError("Cannot set data to undefined.");
        }

        // Don't notify if the data is the same.
        // Since it's generic, nothing more can be done here than check if the
        // objects are the exact same instance.
        if (this._data !== data) {
            this._data = data;
            this.notify({data: data, page: this._page});
        }
    }

    public set page(page: number) {
        if (page === this._page) {
            // Don't notify if the page is identical.
            return;
        }

        if (!Number.isInteger(page)) {
            throw new TypeError("Page number must be an integer.");
        }

        this._page = page;
        if (this._data !== undefined) {
            // Only notify page changes if data has been set.
            this.notify({data: this._data, page: page});
        }
    }
}

export interface Quantity {
    readonly id: number;
    readonly amount: number;
    readonly unit: string;
}

export class Quantities
    extends BaseObservable<Quantity[]>
    implements IObserver<ModalMessage<Recipe>>
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

    public update(message: ModalMessage<Recipe>): void {
        this._us = [];
        this._metric = [];

        for (const ingredient of message.data.extendedIngredients) {
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
