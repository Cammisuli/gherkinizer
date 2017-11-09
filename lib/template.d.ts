export interface TemplateModel {
    feature: string;
    scenarios: ScenarioModel[];
}
export interface ScenarioModel {
    name: string;
    steps: ScenarioStep[];
    type: 'Scenario' | 'Background';
}
export interface ScenarioStep {
    text: string;
    func: string | null;
}
export default class Template {
    private _template;
    constructor(templateFilePath: string);
    create(model: TemplateModel): string;
}
