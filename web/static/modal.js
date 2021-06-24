export class PaginatedModal extends bootstrap.Modal {
    constructor(element, config) {
        super(element, config);
        this._pageLinks = [];

        const links = this._element.querySelectorAll(
            ".modal-footer .page-link"
        );
        for (const link of links) {
            this._pageLinks.push(link);
            link.addEventListener("click", (e) => this._setPage(e.target));
        }
    }

    _setPage(target) {
        const activeLink = this._element.querySelector(
            ".modal-footer .page-item.active .page-link"
        );
        if (target === activeLink) {
            // Exit early if the selected page is already the current page.
            return;
        }

        let pageClass = activeLink.getAttribute("data-page");

        // Hide the current page and make it inactive.
        this._element.querySelector(pageClass).classList.add("d-none");
        activeLink.removeAttribute("aria-current");
        activeLink.parentElement.classList.remove("active");

        // Show the selected page and make it active.
        pageClass = target.getAttribute("data-page");
        this._element.querySelector(pageClass).classList.remove("d-none");
        target.setAttribute("aria-current", "page");
        target.parentElement.classList.add("active");
    }

    setPage(pageNum) {
        this._setPage(this._pageLinks[pageNum - 1]);
    }
}

export class RecipeModal extends PaginatedModal {
    constructor(element, config) {
        super(element, config);
        this._prevRecipeID = undefined;
    }

    toggle(relatedTarget, recipe) {
        return this._isShown ? this.hide() : this.show(relatedTarget, recipe);
    }

    show(relatedTarget, recipe) {
        if (this._prevRecipeID !== recipe.id) {
            this._fillSummary(recipe);
            this._fillIngredients(recipe);
            this._fillInstructions(recipe);

            this.setPage(1);
        }

        this._prevRecipeID = recipe.id;
        return super.show(relatedTarget);
    }

    _fillSummary(recipe) {
        this._element.querySelector(".modal-title").textContent = recipe.title;
        this._element.querySelector("#summary").innerHTML = recipe.summary;
        this._element.querySelector("#summary-img").src = recipe.image;
    }

    _fillInstructions(recipe) {
        const orderedList = this._element.querySelector("#instructions");
        orderedList.replaceChildren();

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                orderedList.appendChild(listItem);
            }
        }
    }

    _fillIngredients(recipe) {
        const template = this._element.querySelector("#req-ingr-template");
        template.parentElement.replaceChildren(template);

        for (const ingredient of recipe.extendedIngredients) {
            const clone = template.cloneNode(true);
            clone.id = `req-ingr-${ingredient.id}`;

            const name = clone.querySelector(".name");
            name.textContent = ingredient.name;

            const quantity = clone.querySelector(".quantity");
            quantity.textContent = `${+ingredient.amount.toFixed(2)} `;
            quantity.textContent += ingredient.unit;

            const image = clone.querySelector("img");
            const imageName = ingredient.image ?? "no.jpg";
            image.title = `${quantity.textContent} ${ingredient.name}`;
            image.src = `https://spoonacular.com/cdn/ingredients_100x100/${imageName}`;

            template.parentElement.appendChild(clone);
        }
    }
}
