import { MessageType } from "../Types";
import err from "../assets/icons/err-ic.png";
import info from "../assets/icons/info-ic.png";
import warn from "../assets/icons/warning-ic.png";

export function getIcon(type: MessageType): string {
    switch (type) {
        case "error":
            return err;
        case "info":
            return info;
        case "warning":
            return warn;
        default:
            return "";
    }
}