import { FetchOptions, GetLiveChatResponse } from "./types/yt-response.js";
import { ChatItem } from "./types/data.js";
export declare function getOptionsFromLivePage(data: string, chatType?: boolean): FetchOptions & {
    liveId: string;
};
/** Convert get_live_chat response */
export declare function parseChatData(data: GetLiveChatResponse): [ChatItem[], string];
