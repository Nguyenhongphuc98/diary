import { ipcRenderer } from "electron";

export function requestDownload() {
    ipcRenderer.send("main:download", "params");
}

export function requestAsyncDownload() {
    ipcRenderer.send("main:asyncdownload", "params");
}

export function requestMakeRequest() {
    ipcRenderer.send("main:runsomerequest", "params");
}

export function requestMakeAsyncRequest() {
    ipcRenderer.send("main:runsomeasyncrequest", "params");
}