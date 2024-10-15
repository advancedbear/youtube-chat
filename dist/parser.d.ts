import { FetchOptions, GetLiveChatResponse } from "./types/yt-response";
import { ChatItem } from "./types/data";
export declare function getOptionsFromLivePage(data: string, chatType?: boolean): FetchOptions & {
    liveId: string;
};
/** Convert get_live_chat response */
export declare function parseChatData(data: GetLiveChatResponse): [ChatItem[], string];
