import {ModalPage, PaginatedModal} from "./paginated";
import {ModalMessage, Quantity} from "../../models/modal";
import {Recipe} from "../../models/spoonacular";
import {PaginatedModalController} from "../../controllers/modal";
import {IObserver} from "../../observe";
import {RecipesController} from "../../controllers/recipes";

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

    constructor(
        element: Element,
        page: number,
        controller: PaginatedModalController<Recipe>
    ) {
        super(element, page, controller);

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

    constructor(
        element: Element,
        page: number,
        controller: PaginatedModalController<Recipe>
    ) {
        super(element, page, controller);

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

export class RequirementsPage extends ModalPage<Recipe> {
    private readonly _ingredientsTemplate: Element;
    private readonly _shoppingList: Element;
    private readonly _equipmentTemplate: Element;

    constructor(
        element: Element,
        page: number,
        controller: PaginatedModalController<Recipe>
    ) {
        super(element, page, controller);

        let template = this._modal.querySelector("#req-ingr-template");
        if (template === null) {
            throw new TypeError(
                "Can't find the ingredients template in the page."
            );
        } else {
            this._ingredientsTemplate = template;
        }

        template = this._modal.querySelector("#req-shopping");
        if (template === null) {
            throw new TypeError(
                "Can't find the shopping list template in the page."
            );
        } else {
            this._shoppingList = template;
        }

        template = this._modal.querySelector("#req-equip-template");
        if (template === null) {
            throw new TypeError(
                "Can't find the equipment template in the page."
            );
        } else {
            this._equipmentTemplate = template;
        }
    }

    public update(message: ModalMessage<Recipe>): void {
        super.update(message);
        this._createIngredients(message.data);
        this._createShoppingList(message.data);
        this._createEquipment(message.data);
    }

    _createIngredients(recipe: Recipe) {
        if (this._ingredientsTemplate.parentElement === null) {
            throw new TypeError(
                "Required ingredient template doesn't have a parent"
            );
        }

        // @ts-expect-error
        this._ingredientsTemplate.parentElement.replaceChildren(
            this._ingredientsTemplate
        );

        for (const data of recipe.extendedIngredients) {
            if (data.id === null) {
                // It's probably some nonsense from failed parsing.
                continue;
            }

            this._createRequirement(
                // @ts-expect-error: the null check for the ID is above
                data,
                this._ingredientsTemplate,
                "ingredients"
            );
        }
    }

    private _createShoppingList(recipe: Recipe) {
        // @ts-expect-error
        this._shoppingList.replaceChildren();

        for (const ingredient of recipe.missedIngredients) {
            if (ingredient.id === null) {
                // It's probably some nonsense from failed parsing.
                continue;
            }

            const item = document.createElement("li");
            item.textContent = ingredient.name;
            item.setAttribute("data-id", ingredient.id.toString());

            // The quantity gets set by IngredientQuantitiesView.
            const quantity = document.createElement("span");
            quantity.classList.add("quantity");
            item.appendChild(quantity);

            this._shoppingList.appendChild(item);
        }
    }

    private _createEquipment(recipe: Recipe) {
        if (this._equipmentTemplate.parentElement === null) {
            throw new TypeError(
                "Required equipment template doesn't have a parent"
            );
        }

        // @ts-expect-error
        this._equipmentTemplate.parentElement.replaceChildren(
            this._equipmentTemplate
        );

        const seen = new Set(); // Used to skip duplicate equipment.

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                for (const equip of step.equipment) {
                    if (!seen.has(equip.id)) {
                        this._createRequirement(
                            equip,
                            this._equipmentTemplate,
                            "equipment"
                        );
                        seen.add(equip.id);
                    }
                }
            }
        }
    }

    private _createRequirement(
        data: {id: number; name: string; image: string},
        template: Element,
        type: "ingredient" | "equipment"
    ) {
        const clone = template.cloneNode(true) as Element;
        clone.id = `req-${type}-${data.id}`;
        clone.setAttribute("data-id", data.id.toString());

        const name = clone.querySelector(".name");
        if (name === null) {
            throw new TypeError("Name not found in requirement template.");
        }

        name.textContent = data.name;

        const image = clone.querySelector("img");
        if (image === null) {
            throw new TypeError("Image not found in requirement template.");
        }

        const imageName = data.image || "no.png";
        image.src = `https://spoonacular.com/cdn/${type}_100x100/${imageName}`;
        image.title = data.name;

        // There were already null checks for this.
        template.parentElement?.appendChild(clone);
        return clone;
    }
}

export class IngredientQuantitiesView implements IObserver<Quantity[]> {
    private readonly _modal: Element;
    private readonly _controller: RecipesController;

    constructor(modal: Element, controller: RecipesController) {
        this._modal = modal;
        this._controller = controller;

        const radios = this._modal.querySelectorAll("#radio-units input");
        for (const radio of radios) {
            radio.addEventListener("change", this._onUnitChange.bind(this));
        }
    }

    public update(ingredients: Quantity[]): void {
        for (const ingredient of ingredients) {
            const quantity = this._formatQuantity(ingredient);
            this._setQuantity(ingredient.id, quantity);
            this._setShoppingQuantity(ingredient.id, quantity);
        }
    }

    private _setQuantity(id: number, quantity: string) {
        const element = this._modal.querySelector(
            `.req-ingr[data-id="${id}"] .quantity`
        );

        if (element === null) {
            throw new TypeError(
                `Quantity element not found for ingredient ${id}.`
            );
        }

        element.textContent = quantity;
    }

    private _setShoppingQuantity(id: number, quantity: string) {
        const item = this._modal.querySelector(
            `#req-shopping li[data-id="${id}"] .quantity`
        );

        // Shopping list is a subset of all ingredients.
        // Therefore, not all ingredient may be found.
        if (item !== null) {
            item.textContent = `, ${quantity}`.trim();
        }
    }

    private _onUnitChange(event: Event) {
        const type = (event.target as Element).getAttribute("data-unit");
        if (type === null) {
            throw new TypeError("Radio button lacks a data-unit attribute.");
        } else {
            this._controller.onUnitChange(type);
        }
    }

    private _formatQuantity(ingredient: Quantity) {
        const amount = +ingredient.amount.toFixed(2);
        return `${amount} ${ingredient.unit}`.trim();
    }
}
