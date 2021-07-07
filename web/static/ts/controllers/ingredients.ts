import {IngredientForm, SelectedIngredients} from "../models/ingredients";
import {Selection} from "../libs/autocomplete";
import levenshtein from "js-levenshtein";

export class IngredientFormController {
    private readonly _formModel: IngredientForm;
    private readonly _selectionsModel: SelectedIngredients;
    private _inputCount: number = 0;
    private _lastInput: string = "";
    private _lastInputTime: number = 0;

    constructor(
        formModel: IngredientForm,
        selectionsModel: SelectedIngredients
    ) {
        this._formModel = formModel;
        this._selectionsModel = selectionsModel;
    }

    public onInput(
        value: string,
        itemCount: number,
        maximumItems: number,
        threshold: number
    ) {
        if (value === this._lastInput) {
            return;
        }

        const passedThreshold = value.length >= threshold;
        const time = performance.now();
        const delta = time - this._lastInputTime;

        this._inputCount += levenshtein(value, this._lastInput);
        this._lastInput = value;
        this._lastInputTime = time;

        // Clear the count if the input is cleared.
        if (value.length === 0) {
            this._inputCount = 0;
            return;
        }

        // Get data when 3 more chars are entered or its been more than 1.5s.
        if (passedThreshold && (this._inputCount >= 3 || delta >= 1500)) {
            this._inputCount = 0;

            // Get new data if there aren't enough matches in the current data.
            if (itemCount < maximumItems) {
                this._formModel.update(value);
            }
        }
    }

    public onSelectItem(item: Selection) {
        this._selectionsModel.lastSelection = {
            name: item.label,
            image: item.value,
        };
    }

    public onSubmit(event: Event, input: string) {
        event.preventDefault();
        this._selectionsModel.addSelection(input);
    }
}

export class SelectedIngredientsController {
    private readonly _model: SelectedIngredients;

    constructor(selectionsModel: SelectedIngredients) {
        this._model = selectionsModel;
    }

    public onReset(event: Event) {
        this._model.clear();
    }

    public onDelete(name: string) {
        this._model.delete(name);
    }
}
