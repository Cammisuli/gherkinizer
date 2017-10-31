import { compile } from 'handlebars';
import { js_beautify } from 'js-beautify';

export interface TemplateModel {
    feature: string;
    scenarios: ScenarioModel[];
}

export interface ScenarioModel {
    name: string;
    steps: ScenarioStep[];
    type: 'Scenario' | 'Background';
}

interface ScenarioStep {
    text: string;
    func: string | null;
}

export default class Template {
    private _template: HandlebarsTemplateDelegate;

    constructor(templateFilePath: string) {
        this._template = compile(templateFilePath);
    }

    public create(model: TemplateModel) {
        return js_beautify(this._template(model));
    }
}
