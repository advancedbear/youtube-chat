import { FetchOptions } from "./types/yt-response.js";
import { ChatItem } from "./types/data.js";
export declare function fetchChat(options: FetchOptions): Promise<[ChatItem[], string]>;
export declare function fetchLivePage(id: {
    channelId: string;
} | {
    liveId: string;
} | {
    handle: string;
}, chatType?: boolean): Promise<FetchOptions & {
    liveId: string;
}>;
