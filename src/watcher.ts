/**
 * Watcher implementation using Chokidar
 */
import { FSWatcher, watch } from 'chokidar';
import { EventEmitter } from 'events';
import { Stats } from 'fs';
import * as path from 'path';
import { log } from './helpers';

import { debounce } from 'lodash';

export default class Watcher extends EventEmitter {

    // private _directories: Set<string> = new Set<string>();
    // private _files: Set<string> = new Set<string>();

    private _watch: FSWatcher | null;

    constructor(filesToWatch: string[], private debounceTime: number = 500) {
        super();

        this._setupFileWatch(filesToWatch);
    }

    public close(): void {
        if (this._watch) {
            this._watch.close();
            this._watch = null;
        }
    }

    private _setupFileWatch(filesToWatch: string[]): any {
        this._watch = watch([...filesToWatch], {
            cwd: '.',
            depth: 10,
            ignoreInitial: true
        });
        this._watch.on('add', debounce((filePath, stats) => {
                this._add(filePath, stats);
            }, this.debounceTime));
        this._watch.on('change', debounce((filePath, stats) => {
            this._change(filePath, stats);
        }, this.debounceTime));
    }

    private _add(filePath: string, stats: Stats) {
        log(`New file added: ${filePath}`);
        this.emit('add', filePath);
    }

    private _change(filePath: string, stats: Stats) {
        log(`File changed: ${filePath}`);
        this.emit('change', filePath);
    }

}
