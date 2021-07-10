// replaceChildren polyfill
// @ts-ignore
if (Node.prototype.replaceChildren === undefined) {
    // @ts-ignore
    Node.prototype.replaceChildren = function (addNodes) {
        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
        if (addNodes !== undefined) {
            // @ts-ignore
            this.append(addNodes);
        }
    };
}
