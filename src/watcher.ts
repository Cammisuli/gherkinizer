/**
 * Watcher implementation using Chokidar
 */
import { EventEmitter } from 'events';

import { watch } from 'chokidar';

export default class Watcher extends EventEmitter {
    constructor(filesToWatch: string[]) {
        super();
    }
}
