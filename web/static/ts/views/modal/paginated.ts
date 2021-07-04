import {IObserver} from "../../observe";
import {ModalMessage} from "../../models/modal";
import {PaginatedModalController} from "../../controllers/modal";

export abstract class PaginatedModal<T> implements IObserver<ModalMessage<T>> {
    protected readonly _element: Element;

    constructor(element: Element) {
        this._element = element;
    }

    abstract update(message: ModalMessage<T>): void;
}

export abstract class ModalPage<T> implements IObserver<ModalMessage<T>> {
    protected readonly _modal: Element;
    protected readonly _body: Element;
    protected readonly _link: Element;
    protected readonly _page: number;
    protected readonly _controller: PaginatedModalController<T>;

    protected constructor(
        modal: Element,
        page: number,
        controller: PaginatedModalController<T>
    ) {
        this._modal = modal;
        this._page = page;
        this._controller = controller;

        const body = this._modal.querySelector(
            `.modal-body *[data-page="${page}"]`
        );
        if (body === null) {
            throw new TypeError(`Can't find page ${page}'s body.`);
        } else {
            this._body = body;
        }

        // Note that the selector has parents. This means parentElement
        // shouldn't be null despite TypeScript's warnings.
        const link = this._modal.querySelector(
            `.modal-footer .page-item .page-link[data-page="${page}"]`
        );
        if (link === null) {
            throw new TypeError(`Can't find page ${page}'s nav anchor.`);
        } else {
            this._link = link;
            link.addEventListener(
                "click",
                controller.onNavigationClick.bind(controller)
            );
        }
    }

    public update(message: ModalMessage<T>): void {
        if (message.page === this._page) {
            this._show();
        } else if (this._link.parentElement?.classList.contains("active")) {
            // Only hide if it's the active element; avoids redundancy.
            this._hide();
        }
    }

    protected _show() {
        this._body.classList.remove("d-none");
        this._link.setAttribute("aria-current", "page");
        this._link.parentElement?.classList.add("active");
    }

    protected _hide() {
        this._body.classList.add("d-none");
        this._link.removeAttribute("aria-current");
        this._link.parentElement?.classList.remove("active");
    }
}
