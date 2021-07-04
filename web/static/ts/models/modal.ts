import {BaseObservable} from "../observe";

export interface ModalMessage<T> {
    data: T;
    page: number;
}

export class PaginatedModalModel<T> extends BaseObservable<ModalMessage<T>> {
    private _data?: T = undefined;
    private _page: number = 1;

    public get data(): T {
        if (this._data === undefined) {
            throw new TypeError("Cannot get data: nothing has been set yet.");
        }

        return this._data;
    }

    public get page(): number {
        return this._page;
    }

    public set data(data: T) {
        this._data = data;
        this.notify({data: data, page: this._page});
    }

    public set page(page: number) {
        this._page = page;
        if (this._data !== undefined) {
            // Only notify page changes if data has been set.
            this.notify({data: this._data, page: page});
        }
    }
}
