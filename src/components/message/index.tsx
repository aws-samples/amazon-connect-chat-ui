import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './default.scss';

export interface ChatMessageProps {
    item: Connector.ChatItemOptions
    style?: any
    dateFormat?: string
    show?: ChatItemShow
    label?: ChatItemLabel
    labelSeparator?: string
}

export type ChatItemShow = Record<keyof Connector.ChatItemShowable, boolean>
export type ChatItemLabel = Record<keyof Connector.ChatItemShowable, string>

export const ChatMessage: React.FC<ChatMessageProps> = ({
    item,
    style = {},
    dateFormat = 'M/D/YYYY h:mmA',
    show = {
        sentAt: true,
        displayName: true,
        content: true,
    },
    label = {
        contentType: true,
        sentAt: show.readAt ? true : false,
        readAt: true
    },
    labelSeparator = ': '
}) => {    
    const [msg, setMsg] = useState<any>(item);

    useEffect(() => {
        const sentAt = moment(item.sentAt).format(dateFormat);
        const readAt = item.readAt ? moment(item.readAt).format(dateFormat) : undefined;
        const direction = item.direction?.toLowerCase() || '';
        setMsg({
            content: item.content,
            contentType: item.contentType,
            displayName: item.participant?.displayName || 'UNKNOWN',
            // TODO: Add support for attachments
            //attachments: item.attachments,
            sentAt, readAt, direction
        })
    },[item]);

    const attrs = {
        item: msg,
        show, 
        label, 
        separator: labelSeparator
    }
    return (
        <div style={style} className={'chui-row ' + msg.direction }>
            <div className="chui-top">
                <LabeledField field="sentAt" {...attrs}/>
                <LabeledField field="readAt" {...attrs}/>
                <LabeledField field="displayName"
                    tagName='span'
                    {...attrs}
                />
            </div>
            <div className="chui-main">
                <LabeledField field="content"
                    tagName="p"
                    {...attrs}
                />
            </div>
            <div className="chui-bottom">
                <LabeledField field="contentType" {...attrs}/>
            </div>
        </div>
    )
}

const Tag = ({name, children = '', ...props }) => {
    const Name = name;
    return (<Name {...props}>{children}</Name>)
}

const LabeledField = ({
    label,
    show,
    item,
    field,
    tagName = 'span',
    separator = ''
}) => {
    const [labelText, setLabelText] = useState(label[field] || '');
    useEffect(() => {
        if (label[field] && typeof label[field] === 'boolean') {
            const txt = field.substring(0,1).toUpperCase() + 
                field.substring(1).replaceAll(/[A-Z]/g, m => ` ${m}`);
            setLabelText(txt);
        }
    },[]);

    return show[field] ? (
        <div className={`chui-field chui-field-${field}`}>
            { label[field] && (
                <span className={`chui-label chui-label-${field}`}>{labelText}{separator}</span>
            )}
            <Tag name={tagName} className={`chui-${field}`}>{item[field]}</Tag>
        </div>
    ) : null
}