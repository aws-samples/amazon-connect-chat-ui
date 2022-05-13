export const props = {
    instanceId: '<Amazon Connect Instance ID>',
    contactFlowId: '<Amazon Connect Contact Flow Id>',

    /** 
     * Connect Options are passed directly to the AWS SDK Connect Service Object, 
     * if you authenticate in other ways then delete the connectOptions field 
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Connect.html#constructor-property
    */
    connectOptions: {
        accessKeyId: '<AWS Account Credentials Access Key ID>',
        secretAccessKey: '<AWS Account Credentials Secret Access Key>',
        /**
         * sessionToken is needed for temporary credentials to assume a role,
         * if you don't have a session token remove this field
        */
        sessionToken: '<AWS Account Session Token>',
        region: '<AWS Account Region>'
    },
    displayName: '<Name of Chat Participant>',
    /**
     * Optionally pass a message to start off the conversation. To have no initial message, remove this option.
    */
    initialMessage: 'Hello Connect'
 }