import {IObserver} from "../../observe";
import {PaginatedModalController} from "../../controllers/modal";

export class PaginatedModal implements IObserver<number> {
    private readonly _modal: Element;

    constructor(modal: Element, controller: PaginatedModalController) {
        this._modal = modal;

        const links = this._modal.querySelectorAll(
            ".modal-footer .page-item .page-link"
        );

        for (const link of links) {
            link.addEventListener(
                "click",
                controller.onNavigationClick.bind(controller)
            );
        }
    }

    public update(page: number) {
        this._hideActive();

        const link = this._getLink(`[data-page="${page}"]`);
        link.setAttribute("aria-current", "page");
        link.parentElement?.classList.add("active");

        this._getBody(page).classList.remove("d-none");
    }

    private _hideActive() {
        const link = this._getLink("[aria-current=page]");
        link.removeAttribute("aria-current");
        link.parentElement?.classList.remove("active");

        const page = link.getAttribute("data-page");
        this._getBody(page).classList.add("d-none");
    }

    private _getBody(page: any): Element {
        const body = this._modal.querySelector(
            `.modal-body *[data-page="${page}"]`
        );
        if (body === null) {
            throw new TypeError(`Can't find page ${page}'s body.`);
        } else {
            return body;
        }
    }

    private _getLink(selector: string): Element {
        // Note that the selector has parents. This means parentElement
        // shouldn't be null despite TypeScript's warnings.
        const link = this._modal.querySelector(
            `.modal-footer .page-item .page-link${selector}`
        );
        if (link === null) {
            throw new TypeError(`Can't find active page's nav anchor.`);
        } else {
            return link;
        }
    }
}
