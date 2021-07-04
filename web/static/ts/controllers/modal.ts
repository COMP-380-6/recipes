import {PaginatedModalModel} from "../models/modal";

export class PaginatedModalController<T> {
    protected _model: PaginatedModalModel<T>;

    constructor(model: PaginatedModalModel<T>) {
        this._model = model;
    }

    public onNavigationClick(event: Event): void {
        if (event.target === null) {
            throw new TypeError("Can't get active page: event target is null.");
        }

        const page = (event.target as Element).getAttribute("data-page");
        this._model.page = Number(page);
    }
}
