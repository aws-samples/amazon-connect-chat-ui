import AWS from 'aws-sdk';
import 'amazon-connect-streams';
import 'amazon-connect-chatjs';
const Connect = AWS.Connect;

export class ChatStart {
    public hasChatDetails: boolean = false;
    readonly connect = new Connect(this.props.connectOptions);
    private $chatDetails?: Connector.ChatDetailsSdkInput

    constructor(protected props: Connector.ChatStartProps) {
        if (this.props.connectOptions && !this.props.connectOptions.region) {
            this.props.connectOptions.region = 'us-east-1';
        }
    }

    static async getDetails(props: Connector.ChatStartProps): Promise<connect.ChatDetailsInput> {
        const start = new ChatStart(props);
        const details = await start.request();
        if (!details) throw new Error('Request failed, Chat Details not found');
        return details;
    }

    get chatDetails(): connect.ChatDetailsInput | null {
        if (!this.$chatDetails) {
            this.hasChatDetails = false;
            return null;
        }
        this.hasChatDetails = true;
        return {
            contactId: this.$chatDetails.ContactId || '',
            participantId: this.$chatDetails.ParticipantId || '',
            participantToken: this.$chatDetails.ParticipantToken || ''
        }
    }

    get requestBody() {
        const body: any = {
            InstanceId:this.props.instanceId,
            ContactFlowId:this.props.contactFlowId,
            ParticipantDetails: this.ParticipantDetails
        }
        body.Attributes = this.props.contactAttributes || {};
        if (!body.Attributes.customerName) body.Attributes.customerName = body.ParticipantDetails.DisplayName;
        if (this.props.initialMessage) body.InitialMessage = this.InitialMessage;
        if (this.props.userName) body.Username = this.props.userName;
        return body;
    }

    get ParticipantDetails() {
        return {
            DisplayName: this.props.displayName || this.props.userName || ''
        }
    }

    get InitialMessage() {
       return {
           ContentType: 'text/plain',
           Content: this.props.initialMessage || ''
       } 
    }

    async request(override:boolean = false): Promise<connect.ChatDetailsInput | null> {
        if (this.hasChatDetails && !override) return this.chatDetails;
        this.$chatDetails = await this.connect.startChatContact(this.requestBody).promise();
        return this.chatDetails;
    }
} 
