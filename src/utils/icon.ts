import { MessageType } from "../Types";

export function getIcon(type: MessageType): string {
    switch (type) {
        case "error":
            return "src/assets/icons/err-ic.png";
        case "info":
            return "./assets/icons/info-ic.png";
        case "warning":
            return "./assets/icons/warning-ic.png";
        default:
            return "";
    }
}