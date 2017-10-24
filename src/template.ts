import { js_beautify } from 'js-beautify';
import { render } from 'mustache';


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
    constructor(private _templateFile: string) {
    }

    public create(model: TemplateModel) {
        return js_beautify(render(this._templateFile, model));
    }
}
