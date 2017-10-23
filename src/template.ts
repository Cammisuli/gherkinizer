import { compile } from 'handlebars';

interface TemplateModel {
    feature: string;
    scenarios: Pickle[];
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
