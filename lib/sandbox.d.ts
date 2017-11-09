/**
 * Sandbox used to evaluate step functions
 */
export declare type Func = (...args: any[]) => {};
export interface StepDefinition {
    regex: RegExp;
    func: string;
}
export default class StepsSandbox {
    static get(stepKeyword: StepKeyword): StepDefinition[];
    static Given(regex: RegExp, func: Func): void;
    static When(regex: RegExp, func: Func): void;
    static Then(regex: RegExp, func: Func): void;
    static And(regex: RegExp, func: Func): void;
    static But(regex: RegExp, func: Func): void;
    static defineStep(regex: RegExp, func: Func): void;
}
