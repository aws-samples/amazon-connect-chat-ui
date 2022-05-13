import React, { useCallback, useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react';
import { TextField, IconButton } from '@mui/material';
import { ArrowCircleUp } from '@mui/icons-material';
import { Chat } from '../../client';
import './default.scss';

export interface ChatInputProps {
    rows?: number
    onSend?: (msg:string, setIsSending: Dispatch<SetStateAction<boolean>>, $chat:Chat) => void
    onSent?: (msg:string, setIsSending: Dispatch<SetStateAction<boolean>>, $chat:Chat) => void
    onSendError?: (e:any, $chat:Chat) => void
   // onKeyUp?: (val:string, $chat:Chat) => string
    onChange?: (val:string, $chat:Chat) => string

    chat: Chat
    isLoading: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
    rows,
    onSend,
    onSent,
    onSendError,
   // onKeyUp,
    onChange,
    chat,
    isLoading
}) => {
    const [content,setContent] = useState('');
    const [isSending,setIsSending] = useState(false);
    const sendMessage = useCallback((content:string) => {
        setIsSending(true);
        if (typeof onSend === 'function') {
            onSend(content, setIsSending, chat);
        }
        chat.sendMessage(content).then(() => {
            if (typeof onSent === 'function') {
                onSent(content, setIsSending, chat);
            }
        }).catch(e => {
            if (typeof onSendError === 'function') {
                chat.messages.pop();
                onSendError(e, chat);
            }
        }).finally(() => setIsSending(false));
    },[chat]);

    const onClick = useCallback(() => {
        sendMessage(content);
    }, [content]);

    const keyUp = useCallback(e => {
        console.log(e.target.value);
       // if (isSending) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(e.target.value);
            setContent('');
        }

    }, [isSending, chat]);

    const change = useCallback(e => {
        //if (isSending) return;
        if (typeof onChange === 'function') {
            setContent(onChange(e.target.value, chat));
            return;
        }
        setContent(e.target.value);
    }, [chat]);
    const rowCount = useMemo(() => {
        if (rows) return rows;
        const ta = document.querySelector('textarea');
        if (!ta || !content) return 1;
        const baseHeight = ta.offsetHeight/ta.rows;
        return Math.ceil(ta.scrollHeight/baseHeight)
    }, [content, rows]);

    return (
        <div className="chui-input">
            <TextField 
                id="chui-send-text"
                classes={{
                    root:"chui-text"
                }}
                multiline={true}
                rows={rowCount}
                inputProps={{
                    style:{
                        resize:'none',
                    },
                    disabled:isLoading
                }}
                size='small'
                onKeyUp={keyUp}
                onChange={change}
                value={content}
                variant='standard'
                autoFocus={true}
            />
            <span className="chui-send">
                <IconButton 
                    onClick={onClick}
                    disabled={isLoading}
                    color={ isLoading ? "default" : "primary"}
                >
                    <ArrowCircleUp />
                </IconButton>
            </span>
        </div>
    )
}