import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CircularProgress } from '@mui/material';

export interface ChatLoaderProps {
    active: boolean
    size?: number | string
    thickness?: number
    disableShrink?: boolean
    backdrop?: Element | boolean | string
    backdropColor?: string
    clickable?: boolean
}

export const ChatLoader: React.FC<ChatLoaderProps & {children?:any}> = ({
    active,
    size,
    thickness,
    disableShrink,
    backdropColor = 'rgba(0,0,0,0.4)',
    backdrop = false,
    children
}) => {

    const getLoader = useCallback(() => {
        const styleProps = {
            size,
            thickness,
            disableShrink
        }
        const Loader = (<div className="chui-loader">
            <CircularProgress {...styleProps} />
        </div>)
        let el;
        if (backdrop && backdrop !== true) {
            el = typeof backdrop === 'string' ? 
            backdrop === 'full' ? document.body :
            document.createElement(backdrop) :
            backdrop;
        }
        const FullLoader = backdrop ? (
            <div className='chui-backdrop'
                style={{
                    backgroundColor:backdropColor
                }}
            >
                {Loader}
            </div>
        ) : Loader

        return el ? createPortal(FullLoader,el) : FullLoader;

    }, [backdrop,backdropColor,size,thickness,disableShrink])

    return active ? getLoader() : children || null;

}