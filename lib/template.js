"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = require("handlebars");
class Template {
    constructor(templateFilePath) {
        this._template = handlebars_1.compile(templateFilePath);
    }
    create(model) {
        return this._template(model);
    }
}
exports.default = Template;
//# sourceMappingURL=template.js.map