import { EventCallback } from './callback';

export class EventOccurrence {
    hasCalc:boolean = false;
    count: number = 0;
    private $$queue:Connector.QueueSet = {}
    private $active:boolean = true;
    private $calc: EventCallback =  new EventCallback(this.name + '-0', null, 'calc');
    private $index:number = 0;

    constructor(
        public name: string, 
        private $bypass:boolean = false  
    ) {
        if (!name) {
            throw new Error('Event name is required');
        }
        if (typeof name !== 'string') {
            throw new Error('Event name must be a string');
        }
    }

    get length() {
        return Object.values(this.$queue).length;
    }

    get index() {
        this.$index++;
        return this.name + '-' + this.$index.toString();
    }

    get queue(): EventCallback[] {
        return this.getCallbacks();
    }

    set active(a) {
        if (a) this.$active = true;
        else {
            this.$active = false;
            this.reset();
        }
    }
    
    get active() {
        return this.$active === false ? false : true;
    }

    fire(caller, ...args) {
        let q: EventCallback[] = this.queue;
        this.count++;
        if (this.hasCalc && !this.$bypass) {
            let arg = this.$$calc(caller, ...args);
            args = [arg];
        }
        q.forEach(cb => {
            if (cb.active) {
                cb.function.call(caller, ...args);
                if (cb.one) {
                    cb.deactivate();
                }
            }
        }, this);
        return this;
    }

    calc(caller, ...args) {
        this.count++;
        return this.$$calc(caller, ...args);
    }

    on(
        callback:Connector.EventFunction | string, 
        option:Connector.EventOrder = 'any', 
        one: boolean = false
    ) {
        let index = this.index;
        if (option == 'first') {
            let oldFirst = this.getCallback('first');
            if (oldFirst) {
                oldFirst.type = 'before';
            }
        } else if (option == 'last') {
            let oldLast = this.getCallback('last');
            if (oldLast) {
                oldLast.type = 'after';
            }
        }
        if (typeof callback === 'string') {
            if (this.$queue[callback] && this.$queue[callback] instanceof EventCallback) {
                this.$queue[callback].activate();
            } else if (this.$calc && this.$calc.index == callback) {
                this.$calc.activate();
            } 
            return callback;
        }
        let cb = new EventCallback(index, callback, option, one);
        if (cb.calc) {
            this.hasCalc = true;
            this.$calc = cb;
        } else {
            this.$queue[index] = cb;
        }
        return index;
    }

    onCalc(callback) {
        return this.on(callback, 'calc');
    }

    after(callback) {
        return this.on(callback, 'after');
    }

    before(callback) {
        return this.on(callback, 'before');
    }

    last(callback) {
        return this.on(callback, 'last');
    }

    first(callback) {
        return this.on(callback, 'last');
    }

    off(key) {
        if (this.$queue.hasOwnProperty(key)) {
            this.$queue[key].deactivate();
        } else if (this.$calc.index == key) {
            this.$calc.deactivate();
        } else {
            this.active = false;
        }
        return this;
    }

    reset() {
        this.$queue = {};
        return this;
    }

    getCallbacks(): EventCallback[] {
        let q = Object.values(this.$queue);
        q.sort((a, b) => {
            if (a.order == b.order) {
                return 0;
            }
            return a.order - b.order;
        });
        return q;
    }

    getCallback(key): EventCallback | null {
        let len = this.length;
        if (!len) {
            return null;
        }
        if (key == 'last') {
            return this.queue[len - 1];
        } else if (key == 'first') {
            return this.$queue[0];
        }
        return this.$queue[key];
    }

    getCalc() {
        return this.$calc.function;
    }
    
    bypass() {
        this.$bypass = true;
    }
    
    removeBypass() {
        this.$bypass = false;
    }

    private set $queue(q) {
        let oldQ = this.$$queue || {};

        this.$$queue = q;

        if (!this.$$queue || typeof this.$$queue !== 'object' || Array.isArray(this.$$queue)) {
            this.$$queue = oldQ;
        }

    }

    private get $queue(): Connector.QueueSet {
        return this.$$queue || {};
    }

    private $$calc(caller, ...args) {
        if (this.$calc.active) {
            return this.$calc.function.call(caller, ...args);
        } else {
            return args && args.length ? args[0] : null;
        }
    }
}
