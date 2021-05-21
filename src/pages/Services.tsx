import React from 'react';
import { requestMakeRequest, requestDownload, requestAsyncDownload, requestMakeAsyncRequest } from '../../main/browser/ipc';
import OnBoard from './OnBoard';

function Services(): JSX.Element {
    
    return (
        <div>
            <OnBoard>
                <div style={{margin: 10, display: 'flex', justifyContent: "space-around"}}>
                    <button onClick={requestAsyncDownload}>[Async] Download Something</button>
                    <button onClick={requestDownload}>Download Something</button>
                    <button onClick={requestMakeAsyncRequest}>[Async] Make some Request</button>
                    <button onClick={requestMakeRequest}>Make some Request</button>
                </div>

            </OnBoard>
        </div>
    );
}

export default Services;