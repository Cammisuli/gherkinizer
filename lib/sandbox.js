"use strict";
/**
 * Sandbox used to evaluate step functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
class StepsSandbox {
    static Given(regex, func) {
        this.map.set('Given', { regex, func });
    }
    static When(regex, func) {
        this.map.set('Given', { regex, func });
    }
    static Then(regex, func) {
        this.map.set('Given', { regex, func });
    }
    static And(regex, func) {
        this.map.set('Given', { regex, func });
    }
}
StepsSandbox.map = new Map();
exports.StepsSandbox = StepsSandbox;
//# sourceMappingURL=sandbox.js.map