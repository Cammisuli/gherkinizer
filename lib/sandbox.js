"use strict";
/**
 * Sandbox used to evaluate step functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const STEP_MAP = new Map([
    ['Given', []],
    ['When', []],
    ['Then', []],
    ['And', []],
    ['But', []],
    ['Step', []]
]);
class StepsSandbox {
    static get(stepKeyword) {
        return STEP_MAP.get(stepKeyword);
    }
    static Given(regex, func) {
        STEP_MAP.get('Given').push({ regex, func: func.toString() });
    }
    static When(regex, func) {
        STEP_MAP.get('When').push({ regex, func: func.toString() });
    }
    static Then(regex, func) {
        STEP_MAP.get('Then').push({ regex, func: func.toString() });
    }
    static And(regex, func) {
        STEP_MAP.get('And').push({ regex, func: func.toString() });
    }
    static But(regex, func) {
        STEP_MAP.get('But').push({ regex, func: func.toString() });
    }
    static defineStep(regex, func) {
        STEP_MAP.get('Step').push({ regex, func: func.toString() });
    }
}
exports.default = StepsSandbox;
//# sourceMappingURL=sandbox.js.map