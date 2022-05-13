declare namespace Connector {

    export type EventFunction = (...a:any[]) => any
    export type EventOrder = 'before' | 'after' | 'first' | 'last' | 'calc' | 'any'
    export type ChatMessageResult = connect.AWSResponse<connect.SendMessageResult>
    export type ChatAttachmentResult = connect.AWSResponse<connect.SendAttachmentResult>    

    export enum SendableEvent {
        ENDED = "application/vnd.amazonaws.connect.event.chat.ended",
        JOINED = "application/vnd.amazonaws.connect.event.participant.joined",
        LEFT = "application/vnd.amazonaws.connect.event.participant.left",
        TRANSFERRED = "application/vnd.amazonaws.connect.event.transfer.succeeded",
        TRANSFERFAILED = "application/vnd.amazonaws.connect.event.transfer.failed",
        TYPING = "application/vnd.amazonaws.connect.event.typing",
    }


    export interface QueueSet {
        [name:string | number]: EventCallback
    }

    export interface ChatDetailsSdkInput {
        readonly ContactId?: string;
        readonly ParticipantId?: string;
        readonly ParticipantToken?: string;
    }
    
    export interface ContactAttributes {
        [attribute:string]: any
    }
    
    export interface HeaderValues {
        [header: string]: string
    }
    
    export interface AmazonConnectSdkOptions {
        [option:string]: any
    }
    
    export interface ChatStartProps {
        instanceId: string
        contactFlowId: string
        /**
         * Options to pass to SDK Connect service, credentials for account can be passed here
         * @see - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Connect.html#constructor-property
         */
        connectOptions?: AmazonConnectSdkOptions
        userName?: string
        displayName?: string
        initialMessage?: string
        contactAttributes?: ContactAttributes
        headers?: HeaderValues
    }
    
    export interface ChatSessionProps extends ChatStartProps {
        region?: string
        logLevel?: 10 | 20 | 30 | 40
    }

    export interface ChatParticipant {
        id: string
        displayName: string
        role?: string
    }
    
    export interface ChatItemShowable extends $ChatItemShowable {
        displayName: string
    }
    
    export interface ChatItemOptions extends $ChatItemShowable {
        participant: ChatParticipant
        direction: 'INCOMING' | 'OUTGOING'
    }
    
    interface $ChatItemShowable {
        type: string
        sentAt: number
        readAt?: number
        content?: any
        contentType?: string
        attachments?: any[]
    }
}