import React, { useMemo, useEffect, useReducer, useState, useCallback } from 'react';
import { ChatMessage, ChatInput, ChatLoader } from '..';
import { Chat, ChatClient, ChatItem } from '../../client';
import './default.scss';

export const chat = new Chat(); 
export interface ChatWidgetProps {
    props:Connector.ChatSessionProps
    milliseconds?:number
    order?: 'desc' | 'asc' | boolean
    header?: string
    errorMessage?: string
    errorColor?:string
    textColor?:string
    onInit?: (props: Connector.ChatSessionProps, client: ChatClient) => void
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    milliseconds=15000, 
    order='asc',
    props,
    header = 'Welcome to Chat',
    errorMessage =  'Request Timed Out, Please Try Again',
    errorColor = '#f00',
    textColor = '#000',
    onInit
}) => {
  
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState(header);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [color, setColor] = useState(textColor);

    const [messages, setMessages] = useReducer((st,action) => {
        if (Array.isArray(action)) return checkSort(action, order);
        const msgs = checkSort(st,order);
        if (!(msgs.some(msg => msg.id === action.id))) {
            if (order === 'desc' || order === false) msgs.unshift(action);
            else if (order) msgs.push(action);
        }
        return msgs;
    },[]);  

    useEffect(() => {
        chat.init(props, client => {
            if (onInit) {
                onInit(props, client);
            } else {
                client.events.one('message', () => {
                    setTimeout(() => {
                        client.transcript.getMessageLog().then(msgs => {
                            setIsLoading(false);
                            setMessages(msgs);
                        });
                        client.events.on('message', msg => setMessages(msg));
                    });
                });
            }
        }); 
    }, []);

    const updateGreeting = useCallback((
        greeting: string = header,
        color: string = textColor,
        cancelLoading:boolean = true 
    ) => {
        setGreeting(greeting);
        setColor(color);
        setCancelLoading(cancelLoading);
    }, []);

    const onSend = useCallback(() => {
        // Todo - add send event support
    },[]);

    const timeout = useMemo(() => {
        
        return setTimeout(() => {
            if (!isLoading && !chat.error) updateGreeting();
            else updateGreeting(chat.error ? chat.error.message : errorMessage, errorColor);
        }, milliseconds);
    },[]);

    useEffect(() => {
        if (!isLoading) {
            clearTimeout(timeout);
            return;
        } 
        chat.onError(e => {
            updateGreeting(e.message, errorColor);
            if (timeout) clearTimeout(timeout);
        });
    }, [isLoading]);

    const getMessages = useCallback(() => {
        return messages.map((item, ind) => {
            return (
                <ChatMessage
                    key={ind}
                    item={item}   
                />
            )
        })
    },[messages]);

    return (
        <div className='chui-widget'>
            <h1 style={{
                color 
            }}>{greeting}</h1>
            <ChatLoader active={isLoading && !cancelLoading}>
                {getMessages()}
            </ChatLoader>
            <div className="chui-bottom">
                <ChatInput chat={chat} isLoading={isLoading} />
            </div>
        </div>
    )
}

function checkSort(msgs:ChatItem[], order): ChatItem[] {
    const isAsc = order === 'desc' || order === false ? false : order ? true : false;
    const ln = msgs.length;
    if (
        ln < 2 ||
        (isAsc && msgs[0]!.sentAt < msgs[1]!.sentAt) ||
        (!isAsc && msgs[0]!.sentAt > msgs[1].sentAt)
    ) return msgs;
    return chat.sort(msgs,isAsc);
}