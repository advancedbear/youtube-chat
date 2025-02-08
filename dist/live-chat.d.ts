import TypedEmitter from "typed-emitter";
import { ChatItem, YoutubeId } from "./types/data.js";
type LiveChatEvents = {
    start: (liveId: string) => void;
    end: (reason?: string) => void;
    chat: (chatItem: ChatItem) => void;
    error: (err: Error | unknown) => void;
};
declare const LiveChat_base: new () => TypedEmitter<LiveChatEvents>;
/**
 * YouTube live chat acquisition event
 */
export declare class LiveChat extends LiveChat_base {
    #private;
    liveId?: string;
    constructor(id: YoutubeId, chatType?: boolean, interval?: number);
    start(): Promise<boolean>;
    stop(reason?: string): void;
}
export {};
