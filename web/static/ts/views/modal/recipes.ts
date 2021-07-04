import {ModalPage, PaginatedModal} from "./paginated";
import {ModalMessage} from "../../models/modal";
import {Recipe} from "../../models/spoonacular";

export class RecipeModal extends PaginatedModal<Recipe> {
    public update(message: ModalMessage<Recipe>): void {
        // Easier to query it here every time than to save it as a field.
        const title = this._element.querySelector(".modal-title");
        if (title === null) {
            throw new TypeError("Can't set modal title: element not found.");
        } else {
            title.textContent = message.data.title;
        }
    }
}

export class SummaryPage extends ModalPage<Recipe> {
    private readonly _summary: Element;
    private readonly _image: HTMLImageElement;

    constructor(element: Element, page: number) {
        super(element, page);

        const summary = this._modal.querySelector("#summary");
        if (summary === null) {
            throw new TypeError("Can't find the summary element in the page.");
        } else {
            this._summary = summary;
        }

        const image = this._modal.querySelector("img#summary-img");
        if (image === null) {
            throw new TypeError("Can't find the summary image in the page.");
        } else {
            this._image = image as HTMLImageElement;
        }
    }

    public update(message: ModalMessage<Recipe>): void {
        super.update(message);
        this._summary.innerHTML = message.data.summary;
        this._image.src = message.data.image;
    }
}

export class InstructionsPage extends ModalPage<Recipe> {
    private _list: Element;

    constructor(element: Element, page: number) {
        super(element, page);

        const list = this._modal.querySelector("#instructions");
        if (list === null) {
            throw new TypeError(
                "Can't find the instructions element in the page."
            );
        } else {
            this._list = list;
        }
    }

    public update(message: ModalMessage<Recipe>): void {
        super.update(message);
        // @ts-expect-error
        this._list.replaceChildren();

        for (const instructions of message.data.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                this._list.appendChild(listItem);
            }
        }
    }
}
