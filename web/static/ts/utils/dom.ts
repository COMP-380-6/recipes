import {Alert, Severity} from "../alerts";

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
 * Display an alert.
 *
 * @param alert The alert to display.
 */
export function displayAlert(alert: Alert) {
    const errorBtn = document.querySelector("#error-alert-button");
    const error = document.querySelector("#error-alert");
    const errorText = document.querySelector("#error-text");

    if (error === null) {
        throw new TypeError("Can't display alert: alert element not found");
    }
    if (errorBtn === null) {
        throw new TypeError("Can't display alert: button element not found");
    }
    if (errorText === null) {
        throw new TypeError("Can't display alert: text element not found");
    }

    if (alert.severity === Severity.WARNING) {
        error.classList.remove("alert-danger");
        error.classList.add("alert-warning");
    } else if (alert.severity === Severity.ERROR) {
        error.classList.remove("alert-danger");
        error.classList.add("alert-danger");
    } else {
        error.classList.remove("alert-danger");
        error.classList.add("alert-info");
    }

    (error as HTMLElement).style.visibility = "visible";

    errorText.textContent = alert.message;
    errorBtn.addEventListener(
        "click",
        () => ((error as HTMLElement).style.visibility = "hidden")
    );
}
