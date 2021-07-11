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
    const container = document.querySelector("#alert");
    if (container === null) {
        throw new TypeError("Can't display alert: alert container not found");
    }

    let alertClass = "";
    if (alert.severity === Severity.WARNING) {
        alertClass = "alert-warning";
    } else if (alert.severity === Severity.ERROR) {
        alertClass = "alert-danger";
    } else {
        throw new TypeError("Can't display alert: unsupported severity");
    }

    // TODO: display multiple alerts simultaneously?
    container.innerHTML = `
        <div id="alert" class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <span>${alert.message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
            </button>
        </div>
    `;

    container.firstElementChild?.addEventListener("closed.bs.alert", () => {
        // TODO: don't hard-code selecting this element.
        // Not only should the input element not be hard coded, but this should
        // support focusing other elements e.g. the search button, depending on
        // the origin of the alert.
        const input = document.querySelector(
            "#form-ingredients input[type='search']"
        ) as HTMLInputElement;
        input?.focus();
    });
}
