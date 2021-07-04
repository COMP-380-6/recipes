import {IObserver} from "../../observe";
import {ModalMessage} from "../../models/modal";
import {Modal} from "bootstrap";

export abstract class PaginatedModal<T> implements IObserver<ModalMessage<T>> {
    protected readonly _element: Element;
    protected readonly _modal: Modal;

    protected constructor(element: Element, options?: Partial<Modal.Options>) {
        this._element = element;
        this._modal = new Modal(element, options);
    }

    abstract update(message: ModalMessage<T>): void;
}

export abstract class ModalPage<T> implements IObserver<ModalMessage<T>> {
    protected readonly _modal: Element;
    protected readonly _body: Element;
    protected readonly _link: Element;
    protected readonly _page: number;

    protected constructor(modal: Element, page: number) {
        this._modal = modal;
        this._page = page;

        const body = this._modal.querySelector(
            `.modal-body *[data-page=${page}]`
        );
        if (body === null) {
            throw new TypeError(`Can't find page ${page}'s body.`);
        } else {
            this._body = body;
        }

        // Note that the selector has parents. This means parentElement
        // shouldn't be null despite TypeScript's warnings.
        const link = this._modal.querySelector(
            `.modal-footer .page-item .page-link[data-page=${page}]`
        );
        if (link === null) {
            throw new TypeError(`Can't find page ${page}'s nav anchor.`);
        } else {
            this._link = link;
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
