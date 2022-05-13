import { 
    ChatClient
} from './client';
import { ChatItem } from './item';
import { 
    ChatSession,
    ChatStart
} from './session';
import { EventHandler } from './events';
import { ChatTranscript } from './transcript';
import { Connect } from 'aws-sdk';

export class Chat {
    readonly lib = connect;

    messages: ChatItem[] = []
    events = new EventHandler(this);
    client?: ChatClient;
    protected messageProps: connect.GetTranscriptArgs = {};
    protected onActive: ((...a:any[])=>void)[] = [];
    private $error?: any;
    private sessionHandler?: ChatSession
    private $sdk: Connect = new Connect(this.props)

    static init(props: Connector.ChatSessionProps, onConnected?: (client:ChatClient)=>void): Chat {
        const chat = new Chat();
        chat.init(props, onConnected);
        return chat;
    }
    
    constructor(public props?: Connector.ChatSessionProps) {
        this.events.on('messages', msgs => this.messages = msgs);
        this.events.on('connected', () => {
            this.sdk = this.sessionHandler?.sdk as Connect;
            while(this.onActive.length && this.isActive) {
                const fn = this.onActive[0];
                fn.call(this,this);
                this.onActive.shift();
            }
        });
    }

    get isActive():boolean { return this.client?.isActive ? true : false }
    
    parseMessages(msgs:ChatItem[] = [], order?: 'asc' | 'desc' | boolean): ChatItem[] {
        return ChatTranscript.parse(msgs, 'MESSAGE', order);
    }

    parseEvents(msgs:ChatItem[] = [], order?: 'asc' | 'desc' | boolean): ChatItem[] {
        return ChatTranscript.parse(msgs, 'EVENT', order);
    }

    sort(msgs:ChatItem[] = [], order?: 'asc' | 'desc' | boolean): ChatItem[] {
        return ChatTranscript.sort(msgs, order);
    }
    
    setMessageProps(args: connect.GetTranscriptArgs = {}): this {
        this.messageProps = {...this.messageProps, ...args};
        return this;
    }
    onError(callback) {
        if (this.error) {
            callback(this.error);
            return;
        }
        return this.events.on('error', callback);
    }

    setError(e: string) {
        this.error = new Error(e);
    }

    async sendMessage(message: string, isMarkdown?: boolean): Promise<Connector.ChatMessageResult | false> {
        if (this.client) {
            return await this.client.sendMessage(message, isMarkdown);
        }
        return false;
    }

    set sdk(sdk) {
        if (sdk instanceof Connect) this.$sdk = sdk;
    }

    get sdk(): Connect {
        return this.$sdk;
    }

    set error(e:any) {
        this.$error = e;
        this.events.fire('error', e);
    }

    get error(): any {
        return this.$error;
    }

    call(fn: (chat: ChatClient) => void): Promise<any> {
        const $this = this;
        const cb = (res,rej) => {
            if (!$this.client) {
                const e = new Error('Chat Client not found');
                $this.error = e;
                rej(e);
            }
            res(fn.call($this, $this.client as ChatClient));
        }
        return new Promise(async (res, rej) => {
            if ($this.client?.isActive) cb(res,rej);
            else $this.onActive.push(() => cb(res, rej));
        });
    }

    async init(
        props: Connector.ChatSessionProps | undefined = this.props, 
        onConnected?:((client:ChatClient)=>void),
    ): Promise<ChatClient> {
        if (!props) throw new Error("instanceId and contactFlowId are required to initialize");
        this.sessionHandler = new ChatSession(props);
        const session = await this.sessionHandler.init();
        if (!session) throw new Error('Invalid Session');
        const user = {
            id: session.getChatDetails().participantId,
            displayName: props.displayName || 'User'
        }
        this.client = new ChatClient(session, user, this.events);
        if (typeof onConnected === 'function') {
            this.events.one('connected', client => onConnected?.call(this, client));
        }
        const result = await this.client.connect();
        if (!result || !result.connectSuccess) this.setError('Connection failed');
        return this.client;
    }
}

export { ChatItem }
export { ChatClient };
export { EventHandler };
export { ChatTranscript };
export { ChatSession, ChatStart };