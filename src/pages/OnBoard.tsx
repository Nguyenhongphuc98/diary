import React, { ReactNode } from 'react';

interface IProps {
    children: ReactNode;
}

function OnBoard(props: IProps): JSX.Element {
    const { children } = props;
    return (
        <div>
            <div>
                <img src= '../assets/images/app_ic.png' alt="icon"/>
                <div>
                    { children }
                </div>
            </div>
        </div>
    );
}

export default OnBoard;