var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { parseChatData, getOptionsFromLivePage } from "./parser.js";
axios.defaults.headers.common["Accept-Encoding"] = "utf-8";
export function fetchChat(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`;
        const res = yield axios.post(url, {
            context: {
                client: {
                    clientVersion: options.clientVersion,
                    clientName: "WEB",
                },
            },
            continuation: options.continuation,
        });
        return parseChatData(res.data);
    });
}
export function fetchLivePage(id, chatType) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = generateLiveUrl(id);
        if (!url) {
            throw TypeError("not found id");
        }
        const res = yield axios.get(url);
        return getOptionsFromLivePage(res.data.toString(), chatType);
    });
}
function generateLiveUrl(id) {
    if ("channelId" in id) {
        return `https://www.youtube.com/channel/${id.channelId}/live`;
    }
    else if ("liveId" in id) {
        return `https://www.youtube.com/watch?v=${id.liveId}`;
    }
    else if ("handle" in id) {
        let handle = id.handle;
        if (!handle.startsWith("@")) {
            handle = "@" + handle;
        }
        return `https://www.youtube.com/${handle}/live`;
    }
    return "";
}
//# sourceMappingURL=requests.js.map