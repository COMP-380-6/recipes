const toolTipOptions = {
    html: true,
    template: `
        <div class="tooltip ingredient-tooltip" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner border bg-light"></div>
        </div>`,
};

// eslint-disable-next-line no-unused-vars
async function addIngredient() {
    const input = document.getElementById("ingredient-input");

    // TODO: check the returned status code.
    // TODO: check for empty input.
    const response = await fetch("api/ingredients", {
        method: "POST",
        body: new URLSearchParams({
            ingredientList: input.value,
        }),
    });

    // The API returns a list because it parses each line of input.
    // However, ingredients come from the front end 1 by 1, so only use the first list item.
    const info = (await response.json())[0];

    // TODO: check for duplicate inputs.
    createIngredient(info);
    input.value = ""; // Clear the input bar.
}

function createIngredient(info) {
    const template = document.getElementById("ingredient-template");

    // Create an element for the new ingredient by cloning the template.
    const clone = template.cloneNode(true);
    clone.id = `ingredient-${info.name}`;
    clone.firstElementChild.textContent = `${info.name}, ${info.amount} ${info.unitShort}`;
    template.after(clone);

    // Initialise the tooltip for the new element. Display the ingredient's image on hover.
    const title = `<img src="https://spoonacular.com/cdn/ingredients_100x100/${info.image}">`;
    const tooltip = new bootstrap.Tooltip(clone, {
        container: clone,
        title: title,
        ...toolTipOptions,
    });

    // Hide the tooltip when hovering over it. Therefore, in practice, the tooltip will only show
    // when hovering over the `clone` element created above. This is done to avoid obstructing
    // adjacent ingredients with the tooltip.
    clone.addEventListener("shown.bs.tooltip", (e) => {
        tooltip
            .getTipElement()
            .addEventListener("pointerenter", (e) => tooltip.hide());
    });
}

// eslint-disable-next-line no-unused-vars
function deleteIngredient(ingredientButton) {
    bootstrap.Tooltip.getInstance(ingredientButton.parentNode).dispose();
    ingredientButton.parentNode.remove();
}
