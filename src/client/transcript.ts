import { ChatItem } from "./item";

export class ChatTranscript {
    private $messages: ChatItem[] = []
    constructor(
        private session: connect.CustomerChatSession,
        private user: Connector.ChatParticipant,
        private args: connect.GetTranscriptArgs = {}
    ) {}

    static parse(
        messages: ChatItem[] = [], 
        type:string = 'message',
        order: 'asc' | 'desc' | boolean = true
    ): ChatItem[] {
        const res:ChatItem[] = [];
        const ids:string[] = [];
        const regex = new RegExp(type, 'i');
        for (let i = 0; i < messages.length;i++) {
            const msg = messages[i];
            if (regex.test(msg.type)) {
                if (!ids.includes(msg.id)) {
                    res.push(msg);
                    ids.push(msg.id);
                }
            }
        }
        return ChatTranscript.sort(res,order);
    }

    static sort(
        messages: ChatItem[] = [], 
        order: 'asc' | 'desc' | boolean = true
    ): ChatItem[] {
        if (order === 'desc' || order === false) messages.sort((a,b) => b.sentAt - a.sentAt);
        else if (order) messages.sort((a,b) => a.sentAt - b.sentAt);
        return messages;
    }

    async getMessageLog(order?: 'asc' | 'desc' | boolean): Promise<ChatItem[]> {
        const msgs = await this.getTranscript({});
        return ChatTranscript.parse(msgs, 'MESSAGE', order);
    }

    async getEventLog(order?: 'asc' | 'desc' | boolean): Promise<ChatItem[]> {
        const msgs = await this.getTranscript({});
        return ChatTranscript.parse(msgs, 'EVENT', order);
    }

    async getTranscript(transcriptArgs: connect.GetTranscriptArgs = {}): Promise<ChatItem[]> {
        // TODO, handle next tokens
        const args = {
            ...this.args, 
            ...transcriptArgs,
            contactId:  this.session.getChatDetails().contactId
        }
        const {data} = await this.session.getTranscript(args);
        if (!data || !data.Transcript) return this.$messages;
        const {Transcript} = data;
        this.$messages = Transcript.map(l => new ChatItem(l, this.user));
        return this.$messages;
    }

}