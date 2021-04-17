import React from 'react';
import { MessageType } from '../Types';
import { getIcon } from '../utils/icon';

interface Props {
    type: MessageType;
    message: string
}

function MessageLog(props: Props): JSX.Element {
    const { type, message } = props;
    const icon = getIcon(type);
    return (
        <div>
            <img src={icon} alt="icon message"/>
            <p>{message}</p>
        </div>
    );
}

export default MessageLog;