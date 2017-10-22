/**
 * Sandbox used to evaluate step functions
 */

type Step = 'Given' | 'When' | 'Then' | 'And';
type Func = (...args: any[]) => {};

interface StepDefinition {
    regex: RegExp;
    func: Func;
}

export default class StepsSandbox {

    public static map: Map<Step, StepDefinition> = new Map<Step, StepDefinition>();

    public static Given(regex: RegExp, func: Func) {
        this.map.set('Given', { regex, func });
    }

    public static When(regex: RegExp, func: Func) {
        this.map.set('Given', { regex, func });
    }

    public static Then(regex: RegExp, func: Func) {
        this.map.set('Given', { regex, func });
    }

    public static And(regex: RegExp, func: Func) {
        this.map.set('Given', { regex, func });
    }
}
