import React, { ReactNode } from 'react';
import logo from '../assets/images/app_ic.png';
import '../assets/css/password.css';

interface IProps {
    children: ReactNode;
}

function OnBoard(props: IProps): JSX.Element {
    const { children } = props;
    return (
        <div>
            <div>
                <img id = 'logo' src= {logo} alt="icon"/>
                <div>
                    { children }
                </div>
            </div>
        </div>
    );
}

export default OnBoard;