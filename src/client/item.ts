export class ChatItem implements Connector.ChatItemOptions {
    readonly id: string = this.data.Id
    type: string = this.data.Type
    attachments: any[] = this.data.Attachments || []
    content: any = this.data.Content
    readonly contentType?: string = this.data.ContentType;
    readonly sentAt: number = this.getTime(this.data.AbsoluteTime)
    readonly readAt?: number
    readonly participant: Connector.ChatParticipant = {
        id: this.data.ParticipantId,
        displayName: this.data.DisplayName,
        role: this.data.ParticipantRole
    }

    constructor(protected incoming: any = {}, protected user: Connector.ChatParticipant) {}

    get direction(): 'INCOMING' | 'OUTGOING' {
        return this.participant.id === this.user.id ? 'OUTGOING' : 'INCOMING';
    }

    get isIncoming(): boolean {
        return this.direction === 'INCOMING';
    }

    get exists(): boolean {
        return this.data.Id ? true : false;
    }

    get data(): any {
        if (this.incoming.data) return this.incoming.data;
        return this.incoming || {};
    }

    protected getTime(time): number {
        if (!time) return 0;
        return new Date(time).getTime();
    }
}