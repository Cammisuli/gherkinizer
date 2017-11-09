/// <reference types="node" />
import { EventEmitter } from 'events';
export default class Watcher extends EventEmitter {
    private _watch;
    constructor(filesToWatch: string[]);
    private _setupFileWatch(filesToWatch);
    private _add(filePath, stats);
    private _change(filePath, stats);
}
