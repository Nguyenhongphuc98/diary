import { ipcRenderer } from "electron";

export function requestOpenDownload() {
    ipcRenderer.send("main:openDownloadWindow", "params");
    console.log("main#openDownloadWindow");
}