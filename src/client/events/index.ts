import { EventOccurrence } from './event';

export interface EventList {
    [name:string]: EventOccurrence
}

export class EventHandler {
    public caller: any
    public onCalc?: boolean; 
    public before?: boolean; 
    public after?: boolean; 
    public first?: boolean; 
    public last?: boolean; 
    private $events:EventList = {};
    private $index:number = 0;

    constructor(caller?: any, initialEvents:string[] = []) {
        this.caller = this.getCaller(caller);
        initialEvents.forEach(ev => {
            this.event = ev;
        },this)
        let types = ['before', 'after', 'first', 'last', 'calc'];
        types.forEach(type => {
            let method = type == 'calc' ? 'onCalc' : type;
            this[method] = this.$updateTypes(type);
        }, this);
    }
    
    get length() {
        const $this = this;
        return this.events.filter(ev => $this.$events[ev].active).length;
    }
    
    get index() {
        this.$index++;
        return 'ev-' + this.$index;
    }
    
    on(
        event:string,
        callback:Connector.EventFunction | string, 
        option:Connector.EventOrder = 'any', 
        one: boolean = false
    ) {
        if (option && typeof option === 'boolean') {
            option = 'calc';
        }
        this.event = event;
        return this.update(event, 'on', callback, option, one);
    }
     
    one(
        event:string,
        callback:Connector.EventFunction | string, 
        option:Connector.EventOrder = 'any'
    ) {
        return this.on(event, callback, option, true);
    }
     
    off(event, key) {
        this.update(event, 'off', key);
        return this;
    }
     
    fire(event, ...args) {
         if (Array.isArray(event)) {
             event.forEach(e => {
                 this.$fire(e, ...args);
             }, this)
         } else {
             this.$fire(event, ...args);
         }
         return this;
    }
     
    calc(event, ...args) {
        if (!this.exists(event)) {
            this.event = event;
            this.get(event).active = false;
        }
        return this.update(event, 'calc', this.caller, ...args);
     }
    
    set event(e) {
        if (this.exists(e) && !this.isActive(e)) {
            this.$events[e].active = true;
            return;
        }
        if (!this.exists(e)) {
            this.$events[e] = new EventOccurrence(e);
        }
    }
    
    set events(e) {
        if (!e) {
            return;
        }
        if (Array.isArray(e)) {
            e.forEach(name => {
                this.event = name;
            }, this);
        } else if (typeof e === 'string') {
            this.event = e;
        }
    }
    
    get events(): string[] {
        return Object.keys(this.$events) || [];
    }
    
    get state() {
        let $this = this;
        return Object.keys(this.$events).reduce((acc, e) =>{
            let ev = $this.$events[e];
            if (ev.length || ev.hasCalc) {
                acc[e] = ev;
            }
            return acc;
        }, {});
    }
    
    get(event) {
        if (event && typeof event !== 'string' && event instanceof EventOccurrence) {
            return event;
        }
        return this.$events[event];
    }
    
    count(event) {
        if (this.exists(event)) {
            return this.get(event).count;
        }
        return 0;
    }
    
    bypass(event) {
        if (this.exists(event)) {
            this.get(event).bypass();
        }
        return this;
    }
    
    removeBypass(event) {
        if (this.exists(event)) {
            this.get(event).removeBypass();
        }
        return this;
    }
    
    getEvent(event, key) {
        if (this.exists(event)) {
            if (key) {
                return this.get(event).getCallback(key);
            } else {
                return this.get(event).getCallbacks();
            }
        }
        return null;
    }
    
    getCalc(event) {
        if (this.exists(event)) {
           return this.get(event).getCalc();
        }
        return null;
    }
    
    exists(ev) {
        let e = this.get(ev);
        return e && e instanceof EventOccurrence;
    }
    
    isActive(ev) {
        let e = this.get(ev);
        return e && e instanceof EventOccurrence && e.active;
    }
    
    reset(event) {
        if (event) {
            this.update(event, 'reset');
        } else {
            this.events.forEach(ev => {
               this.$events[ev].active = false; 
            });
        }
        return this;
    }
    
    update(event, callback, ...args) {
        let ev = this.get(event);
        let res = false;
        if (ev instanceof EventOccurrence) {
            if (typeof callback === 'string' && typeof ev[callback] === 'function') {
                res = ev[callback].call(ev, ...args);
            } else if (typeof callback === 'function') {
                res = callback.call(this.caller, ev, ...args);
            }   
        }
        return res;
    }
    
    protected $fire(event, ...args) {
        if (!this.exists(event)) {
            this.event = event;
            this.get(event).active = false;
        }
        this.update(event, 'fire', this.caller, ...args); 
        return this;
    }
    
    protected $updateTypes(type) {
        const $this = this;
        return function(event, callback) {
            return $this.on(event, callback, type);
        }
    }

    private getCaller(caller): any {
        if (!caller || 
            (typeof caller !== 'function' &&
            typeof caller != 'object')
        ) {
           caller = this; 
        }
        return caller;
    }
    
    static get instance() {
        return new EventHandler();
    }
}
