import React, { ChangeEvent, FormEvent, useState } from 'react';
import MessageLog from '../components/MessageLog';
import { MessageType } from '../Types';
import OnBoard from './OnBoard';

interface IRegisterPassword {
    passOne: string;
    passTwo: string;
}

interface IRegisterInfo {
    state: MessageType;
    message: string;
}

function PasswordCreate(): JSX.Element {
    const [password, setPassword] = useState<IRegisterPassword>({
        passOne: "",
        passTwo: ""
    });

    const [info, setInfo] = useState<IRegisterInfo>({
        state: "none",
        message: ""
    });

    const isMatch = (): boolean => {
        return password.passOne === password.passTwo;
    }

    const onChangePOne = (e: ChangeEvent<HTMLInputElement>): void => {
        setPassword({
            ...password,
            passOne: e.target.value
        });

        if (password.passOne.length < 8 && password.passOne.length !== 0) {
            setInfo({
                state: "warning",
                message: "Password to weak!"
            })
        } else {
            setInfo({
                state: "none",
                message: ""
            })
        }
    }

    const onChangePTwo = (e: ChangeEvent<HTMLInputElement>): void => {
        setPassword({
            ...password,
            passTwo: e.target.value
        });
    }

    const onSubmit = (e: FormEvent): void => {
        e.preventDefault();

        if (isMatch()) {
            console.log("ok");
        } else {
            setInfo({
                state: "error",
                message: "Password not match!"
            })
        }
    }

    return (
        <div>
            <OnBoard>
                {info.state !== "none" && <MessageLog type={info.state} message={info.message} />}

                <form onSubmit={onSubmit}>
                    <p>Enter Password</p>
                    <input type="password"
                        autoFocus required
                        value={password.passOne}
                        onChange={onChangePOne}
                    />
                    <p>Confirm Password</p>
                    <input type="password"
                        autoFocus required
                        value={password.passTwo}
                        onChange={onChangePTwo}
                    />
                    <input type="submit" value="Create"/>
                </form>
            </OnBoard>
        </div>
    );
}

export default PasswordCreate