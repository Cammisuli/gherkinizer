/**
 * Sandbox used to evaluate step functions
 */

export type Func = (...args: any[]) => {};

export interface StepDefinition {
    regex: RegExp;
    func: string;
}

let STEP_MAP: Map<StepKeyword, StepDefinition[]> = new Map<StepKeyword, StepDefinition[]>([
    ['Given', []],
    ['When', []],
    ['Then', []],
    ['And', []],
    ['But', []],
    ['Step', []]
]);

export default class StepsSandbox {

    public static get(stepKeyword: StepKeyword): StepDefinition[] {
        return STEP_MAP.get(stepKeyword)!;
    }

    public static Given(regex: RegExp, func: Func) {
        STEP_MAP.get('Given')!.push({ regex, func: func.toString() });
    }

    public static When(regex: RegExp, func: Func) {
        STEP_MAP.get('When')!.push({ regex, func: func.toString() });
    }

    public static Then(regex: RegExp, func: Func) {
        STEP_MAP.get('Then')!.push({ regex, func: func.toString() });
    }

    public static And(regex: RegExp, func: Func) {
        STEP_MAP.get('And')!.push({ regex, func: func.toString() });
    }

    public static But(regex: RegExp, func: Func) {
        STEP_MAP.get('But')!.push({regex, func: func.toString()});
    }

    public static defineStep(regex: RegExp, func: Func) {
        STEP_MAP.get('Step')!.push({regex, func: func.toString()});
    }

    public static reset() {
        STEP_MAP = new Map<StepKeyword, StepDefinition[]>([
            ['Given', []],
            ['When', []],
            ['Then', []],
            ['And', []],
            ['But', []],
            ['Step', []]
        ]);
    }
}
