/// <reference types="../index"/>

export class EventCallback {
    active: boolean = true;
    public calc?: boolean; 
    public before?: boolean; 
    public after?: boolean; 
    public first?: boolean; 
    public last?: boolean; 

    private $function?: Connector.EventFunction | null;

    constructor(
        public index:string, 
        callback: Connector.EventFunction | null | undefined, 
        private $type:Connector.EventOrder,
        public one: boolean = false
    ) {
        if (typeof callback !== 'function') {
            callback = this.default;
        }
        this.$function = callback;
        let types = ['before', 'after', 'first', 'last', 'calc'];
        types.forEach(t => {
            Object.defineProperty(this, t, 
                { get: function() { return this.type == t } }    
            )
        }, this);
    }
    
    activate() {
        this.active = true;
        return this;
    }
    
    deactivate() {
        this.active = false;
        return this;
    }
    
    set function(fn) {
        if (typeof fn === 'function') {
            this.$function = fn;
        } 
    }
    
    get function(): Connector.EventFunction {
        return this.$function || this.default;
    }
    
    set type(o) {
        if (!['first', 'before', 'after', 'last', 'calc'].includes(o)) {
            this.$type = 'any';
        }    
        this.$type = o;
    }
    
    get type(): Connector.EventOrder {
        return this.$type || 'any';
    }
    
    get default(): Connector.EventFunction {
        return this.type == 'calc' ? arg => arg : () => {};
    }
    
    get order(): number {
        switch(this.type) {
            case 'first': return 1;
            break;
            case 'before': return 2;
            break;
            case 'after': return 4;
            break;
            case 'last': return 5;
            break;
            default: return 3;
            break;
        }
    }
    
}