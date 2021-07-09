/**
 * Create a div element containing the given inner HTML.
 *
 * @param html The inner HTML to place in the created element.
 * @returns The first element created by the inner HTML.
 */
export function createElement(html: string): Element {
    const div = document.createElement("div");
    div.innerHTML = html;

    if (div.firstElementChild === null) {
        throw new TypeError("The given HTML does not create any elements.");
    }

    return div.firstElementChild;
}

/**
 * @param elem The element to insert.
 * @param refElem The reference element after which to insert the element.
 * @returns The added child element.
 */
export function insertAfter(elem: Element, refElem: Element): Element {
    if (refElem.parentElement === null) {
        throw new TypeError(
            "Cannot insert after the reference element: it has no parent."
        );
    }

    return refElem.parentElement.insertBefore(elem, refElem.nextElementSibling);
}

/**
 * @param alert The alert caused by the User/System.
 */
export function alertBox(alert: alertMessage) {
    const error = document.querySelector("#errorAlert");
    const errorBtn = document.querySelector("#errorAlertButton");
    if (alert === null) {
        throw new TypeError("Can't display alert: alert element not found");
    }
    if (alert.severity == 0) {
        document.getElementById("errorAlert").classList.remove("alert-danger");
        document.getElementById("errorAlert").classList.add("alert-warning");
    } else {
        document.getElementById("errorAlert").classList.add("alert-danger");
    }
    errorBtn.style.visibility = "revert";
    error.style.visibility = "revert";
    error.childNodes[0].nodeValue = alert.message;
    console.error(alert.message);
    errorBtn.addEventListener("click", updateError);
    function updateError() {
        error.style.visibility = "hidden";
    }
}
