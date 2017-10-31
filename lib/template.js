"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = require("handlebars");
const js_beautify_1 = require("js-beautify");
class Template {
    constructor(templateFilePath) {
        this._template = handlebars_1.compile(templateFilePath);
    }
    create(model) {
        return js_beautify_1.js_beautify(this._template(model));
    }
}
exports.default = Template;
/**
 * Register helper to check if a two arguments match
 */
handlebars_1.registerHelper('is', function (arg1, arg2, options) {
    if (arg1 === arg2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
//# sourceMappingURL=template.js.map