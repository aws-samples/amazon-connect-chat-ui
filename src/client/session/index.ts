import { ChatStart } from './start';
import { Connect } from 'aws-sdk';

export class ChatSession {
    session?: connect.CustomerChatSession;
    sdk?: Connect
    status: connect.ConnectChatResult = {
        connectCalled: false,
        connectSuccess: false
    }
    constructor(protected props: Connector.ChatSessionProps) {
        connect.ChatSession.setGlobalConfig({
            loggerConfig: {
              logger: {
                debug: (msg) => console.debug(msg),
                info: (msg) => console.info(msg),
                warn: (msg) => console.warn(msg),
                error: (msg) => console.error(msg)
              },
              level: props.logLevel || connect.ChatSession.LogLevel.ERROR
            },
            region: props.region || "us-east-1",
        });
    }

    static async connect(props:Connector.ChatSessionProps):  Promise<connect.CustomerChatSession> {
        const sessionHandler = new ChatSession(props);
        return await sessionHandler.init();
    }

    static async request(props:Connector.ChatSessionProps):  Promise<connect.CustomerChatSession> {
        const session = new ChatSession(props);
        return await session.request();
    }

    async request(): Promise<connect.CustomerChatSession> {
        const start = new ChatStart(this.props);
        this.sdk = start.connect; 
        const chatDetails = await start.request();
        if (!chatDetails) throw new Error('Request failed, Chat Details not found');
        this.session = await connect.ChatSession.create({
            chatDetails,
            type: 'CUSTOMER'
        });
        return this.session;
    }

    async init(): Promise<connect.CustomerChatSession> {
        const $this = this;
        return await this.request().then(session => {
            return $this.connect(session).then(({connectSuccess}) => {
                if (connectSuccess) return session;
                throw new Error('Connection failed');
            }).catch(e => { throw e });
        }).catch(e => { throw e });
    }

    async connect(session?:connect.CustomerChatSession): Promise<connect.ConnectChatResult> {
        if (session) this.session = session;
        if (!this.session) throw new Error("No Session Found");
        this.status = await this.session.connect();
        return this.status;
    }

    disconnect(): any {
        this.status = {
            connectCalled: false,
            connectSuccess: false
        }
        return this.session?.disconnectParticipant();
    }

    
}

export { ChatStart } from "./start";