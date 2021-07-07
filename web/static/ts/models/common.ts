import {BaseObservable} from "../observe";

export class Model<T> extends BaseObservable<T> {
    protected _data?: T = undefined;

    public get data(): T | undefined {
        return this._data;
    }

    public set data(data: T | undefined) {
        if (data === undefined) {
            throw new TypeError("Cannot set data to undefined.");
        }

        // Don't notify if the data is the same.
        // Since it's generic, nothing more can be done here than check if the
        // objects are the exact same instance.
        if (this._data !== data) {
            this._data = data;
            this.notify(data);
        }
    }
}

export class IntegerModel extends BaseObservable<number> {
    private _int: number = 1;

    public get int(): number {
        return this._int;
    }

    public set int(num: number) {
        if (num === this._int) {
            // Don't notify if identical.
            return;
        }

        if (!Number.isInteger(num)) {
            throw new TypeError("Number must be an integer.");
        }

        this._int = num;
        this.notify(num);
    }
}
