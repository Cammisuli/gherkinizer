import { compile } from 'handlebars';

export default class Template {

    private _template: HandlebarsTemplateDelegate;

    constructor(templateFilePath: string) {
        this._template = compile(templateFilePath);
    }

    public create(model: Pickle[]) {
        return this._template(model);
    }
}
