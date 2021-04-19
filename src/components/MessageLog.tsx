import React from 'react';
import { MessageType } from '../Types';
import { getIcon } from '../utils/icon';

import '../assets/css/message.css'

interface Props {
    type: MessageType;
    message: string
}

function MessageLog(props: Props): JSX.Element {
    const { type, message } = props;
    const icon = getIcon(type);
    return (
        <div>
            <img className = "icon" src={icon} alt="icon message"/>
            <p>{message}</p>
        </div>
    );
}

export default MessageLog;