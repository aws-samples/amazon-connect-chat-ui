///<reference types="amazon-connect-chatjs"/>

import { EventHandler } from './events'
import { ChatItem } from './item';
import { ChatTranscript } from './transcript';

export class ChatClient implements connect.ChatDetailsInput {
    readonly transcript: ChatTranscript = new ChatTranscript(this.session, this.user);
    messages: ChatItem[] = []
    eventLog: ChatItem[] = []
    private status?: connect.ConnectChatResult;
    
    constructor(
        protected session: connect.CustomerChatSession, 
        private user: Connector.ChatParticipant,
        public readonly events: EventHandler
    ) {
        const $this = this;
        this.events.on('connected', () => {
            if (!$this.status) $this.status = {
                connectCalled: true,
                connectSuccess: true
            }
        });
        this.events.on('disconnected', () => {
            if (!$this.status) $this.status = {
                connectCalled: true,
                connectSuccess: false
            }
        });
        this.setTriggers(session);
    }

    get isActive(): boolean {
        if (this.status) return this.status.connectSuccess;
        return false;
    }

    get contactId() {
        return this.session.getChatDetails().contactId;
    }
    
    get participantId() {
        return this.session.getChatDetails().participantId;
    }
  
    get participantToken() {
        return this.session.getChatDetails().participantToken || '';
    }

    sendMessage(message: string, isMarkdown?: boolean): Promise<Connector.ChatMessageResult> {
        return this.waitForConnect((res,rej) => {
            try {
                res(this.$sendMessage(message, isMarkdown));
            } catch(e) {
                rej(e);
            }
        })
    }
  
    sendAttachment(file: any): Promise<Connector.ChatAttachmentResult> {
        return this.waitForConnect((res,rej) => {
            try {
                res(this.$sendAttachment(file));
            } catch(e) {
                rej(e);
            }
        })
    }

    sendEvent(event: Connector.SendableEvent, content?: string): Promise<any> {
        return this.waitForConnect((res,rej) => {
            try {
                res(this.session.sendEvent({
                    contentType: event,
                    content
                }));
            } catch(e) {
                rej(e);
            }
        })
    }

    async connect(): Promise<connect.ConnectChatResult> {
        if (this.isActive) {
            this.status = {
                connectCalled: true,
                connectSuccess: true
            }
        } else this.status = await this.session.connect();
        return this.status;
    }

    async disconnect(): Promise<any> {
        if (this.isActive) await this.session?.disconnectParticipant();
        this.status = {
            connectCalled: true,
            connectSuccess: false
        }
        return this.status;
    }

    protected handleMessage(incoming: any = {}) {

        const item = new ChatItem(incoming, this.user);
        if (!item.exists) return;
        if (/MESSAGE/i.test(item.type)) {
            this.messages.push(item);
            this.events.fire('message', item, this.user);
            this.events.fire('messages', this.messages, this.user);
        } else if (/EVENT/i.test(item.type)) {
            this.eventLog.push(item);
            this.events.fire('event', item, this.user);
        }
    }

    private setTriggers(session:connect.CustomerChatSession) {
        const $this = this;
        session.onTyping(e => $this.events.fire('typing', $this, e));
        session.onEnded(e => $this.events.fire('done', $this, e));
        session.onMessage(e => $this.handleMessage.call($this, e));
        session.onConnectionEstablished(e => $this.events.fire('connected', $this, e));
        session.onConnectionBroken((e) => $this.events.fire('disconnected', e));
    }

    private waitForConnect(fn: (res,rej)=>any): Promise<any> {
        return new Promise((res, rej) => {
            if (!this.isActive) {
                this.events.on('connected', () => fn(res,rej));
            } else {
                fn(res,rej)
            }
        });
    }

    private async $sendMessage(message: string, isMarkdown?: boolean): Promise<Connector.ChatMessageResult> {
        const contentType = isMarkdown ? 'text/markdown' : 'text/plain';
        return await this.session.sendMessage({
            contentType,
            message
        })
    }
  
    private async $sendAttachment(file: any): Promise<Connector.ChatAttachmentResult> {
        return await this.session.sendAttachment({
            attachment: file
        })
    }
}
