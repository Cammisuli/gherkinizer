import { compile } from 'handlebars';

export interface TemplateModel {
    feature: string;
    scenarios: ScenarioModel[];
}

export interface ScenarioModel {
    name: string;
    steps: Array<{
        text: string;
        func: string | null;
    }>;
}

export default class Template {

    private _template: HandlebarsTemplateDelegate;

    constructor(templateFilePath: string) {
        this._template = compile(templateFilePath);
    }

    public create(model: TemplateModel) {
        return this._template(model);
    }
}
