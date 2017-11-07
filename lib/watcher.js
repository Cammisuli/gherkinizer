"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Watcher implementation using Chokidar
 */
const chokidar_1 = require("chokidar");
const events_1 = require("events");
const helpers_1 = require("./helpers");
class Watcher extends events_1.EventEmitter {
    constructor(filesToWatch) {
        super();
        this._setupFileWatch(filesToWatch);
    }
    _setupFileWatch(filesToWatch) {
        this._watch = chokidar_1.watch([...filesToWatch], {
            cwd: '.',
            depth: 10,
            ignoreInitial: true
        });
        this._watch.on('add', (filePath, stats) => this._add(filePath, stats));
        this._watch.on('change', (filePath, stats) => this._change(filePath, stats));
    }
    _add(filePath, stats) {
        helpers_1.log(`New file added: ${filePath}`);
        this.emit('add', filePath);
    }
    _change(filePath, stats) {
        helpers_1.log(`File changed: ${filePath}`);
        this.emit('change', filePath);
    }
}
exports.default = Watcher;
//# sourceMappingURL=watcher.js.map