"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_beautify_1 = require("js-beautify");
const mustache_1 = require("mustache");
class Template {
    constructor(_templateFile) {
        this._templateFile = _templateFile;
    }
    create(model) {
        return js_beautify_1.js_beautify(mustache_1.render(this._templateFile, model));
    }
}
exports.default = Template;
//# sourceMappingURL=template.js.map