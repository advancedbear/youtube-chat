"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChatData = exports.getOptionsFromLivePage = void 0;
function getOptionsFromLivePage(data, chatType) {
    var _a, _b;
    let liveId;
    const idResult = data.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=(.+?)">/);
    if (idResult) {
        liveId = idResult[1];
    }
    else {
        throw new Error("Live Stream was not found");
    }
    const replayResult = data.match(/['"]isReplay['"]:\s*(true)/);
    if (replayResult) {
        throw new Error(`${liveId} is finished live`);
    }
    let apiKey;
    const keyResult = data.match(/['"]INNERTUBE_API_KEY['"]:\s*['"](.+?)['"]/);
    if (keyResult) {
        apiKey = keyResult[1];
    }
    else {
        throw new Error("API Key was not found");
    }
    let clientVersion;
    const verResult = data.match(/['"]clientVersion['"]:\s*['"]([\d.]+?)['"]/);
    if (verResult) {
        clientVersion = verResult[1];
    }
    else {
        throw new Error("Client Version was not found");
    }
    let continuation;
    const continuationResult = data.matchAll(/['"]continuation['"]:\s*['"](.+?)['"]/g);
    const list = Array.from(continuationResult);
    // Ensure that the required index exists before accessing it
    if (chatType && list.length > 2 && ((_a = list[2]) === null || _a === void 0 ? void 0 : _a[1])) {
        /** CONTINUATION to be used when retrieving all chats. */
        continuation = list[2][1];
    }
    else if (list.length > 1 && ((_b = list[1]) === null || _b === void 0 ? void 0 : _b[1])) {
        /** CONTINUATION to be used when retrieving the top chat. */
        continuation = list[1][1];
    }
    if (!continuation) {
        throw new Error("Continuation was not found");
    }
    return {
        liveId,
        apiKey,
        clientVersion,
        continuation,
    };
}
exports.getOptionsFromLivePage = getOptionsFromLivePage;
/** Convert get_live_chat response */
function parseChatData(data) {
    let chatItems = [];
    if (data.continuationContents.liveChatContinuation.actions) {
        chatItems = data.continuationContents.liveChatContinuation.actions
            .map((v) => parseActionToChatItem(v))
            .filter((v) => v !== null);
    }
    const continuationData = data.continuationContents.liveChatContinuation.continuations[0];
    let continuation = "";
    if (continuationData.invalidationContinuationData) {
        continuation = continuationData.invalidationContinuationData.continuation;
    }
    else if (continuationData.timedContinuationData) {
        continuation = continuationData.timedContinuationData.continuation;
    }
    return [chatItems, continuation];
}
exports.parseChatData = parseChatData;
/** Converting a Thumbnail object to an ImageItem. */
function parseThumbnailToImageItem(data, alt) {
    const thumbnail = data.pop();
    if (thumbnail) {
        return {
            url: thumbnail.url,
            alt: alt,
        };
    }
    else {
        return {
            url: "",
            alt: "",
        };
    }
}
function convertColorToHex6(colorNum) {
    return `#${colorNum.toString(16).slice(2).toLocaleUpperCase()}`;
}
/** Convert messagerun array to MessageItem array. */
function parseMessages(runs) {
    return runs.map((run) => {
        if ("text" in run) {
            return run;
        }
        else {
            // Emoji
            const thumbnail = run.emoji.image.thumbnails.shift();
            const isCustomEmoji = Boolean(run.emoji.isCustomEmoji);
            const shortcut = run.emoji.shortcuts ? run.emoji.shortcuts[0] : "";
            return {
                url: thumbnail ? thumbnail.url : "",
                alt: shortcut,
                isCustomEmoji: isCustomEmoji,
                emojiText: isCustomEmoji ? shortcut : run.emoji.emojiId,
            };
        }
    });
}
/** Determines the type of action and returns a Renderer. */
function rendererFromAction(action) {
    if (!action.addChatItemAction) {
        return null;
    }
    const item = action.addChatItemAction.item;
    if (item.liveChatTextMessageRenderer) {
        return item.liveChatTextMessageRenderer;
    }
    else if (item.liveChatPaidMessageRenderer) {
        return item.liveChatPaidMessageRenderer;
    }
    else if (item.liveChatPaidStickerRenderer) {
        return item.liveChatPaidStickerRenderer;
    }
    else if (item.liveChatMembershipItemRenderer) {
        return item.liveChatMembershipItemRenderer;
    }
    else if (item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer) {
        const parentRenderer = item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer;
        return Object.assign({ id: parentRenderer.id, timestampUsec: parentRenderer.timestampUsec, authorExternalChannelId: parentRenderer.authorExternalChannelId }, parentRenderer.header.liveChatSponsorshipsHeaderRenderer);
    }
    else if (item.LiveChatMembershipMilestoneRenderer) {
        return item.LiveChatMembershipMilestoneRenderer;
    }
    return null;
}
/** An action to a ChatItem */
function parseActionToChatItem(data) {
    var _a, _b, _c, _d, _e, _f;
    const messageRenderer = rendererFromAction(data);
    if (messageRenderer === null) {
        return null;
    }
    let message = [];
    if ("message" in messageRenderer) {
        message = messageRenderer.message.runs;
    }
    else if ("empty" in messageRenderer) {
        message = messageRenderer.headerPrimaryText.runs;
    }
    else if ("headerSubtext" in messageRenderer) {
        message = messageRenderer.headerSubtext.runs;
    }
    const authorNameText = (_b = (_a = messageRenderer.authorName) === null || _a === void 0 ? void 0 : _a.simpleText) !== null && _b !== void 0 ? _b : "";
    const ret = {
        id: messageRenderer.id,
        author: {
            name: authorNameText,
            thumbnail: parseThumbnailToImageItem(messageRenderer.authorPhoto.thumbnails, authorNameText),
            channelId: messageRenderer.authorExternalChannelId,
        },
        message: parseMessages(message),
        isMembership: false,
        isOwner: false,
        isVerified: false,
        isModerator: false,
        timestamp: new Date(Number(messageRenderer.timestampUsec) / 1000),
    };
    if (messageRenderer.authorBadges) {
        for (const entry of messageRenderer.authorBadges) {
            const badge = entry.liveChatAuthorBadgeRenderer;
            if (badge.customThumbnail) {
                ret.author.badge = {
                    thumbnail: parseThumbnailToImageItem(badge.customThumbnail.thumbnails, badge.tooltip),
                    label: badge.tooltip,
                };
                ret.isMembership = true;
            }
            else {
                switch ((_c = badge.icon) === null || _c === void 0 ? void 0 : _c.iconType) {
                    case "OWNER":
                        ret.isOwner = true;
                        break;
                    case "VERIFIED":
                        ret.isVerified = true;
                        break;
                    case "MODERATOR":
                        ret.isModerator = true;
                        break;
                }
            }
        }
    }
    if ("sticker" in messageRenderer) {
        ret.superchat = {
            amount: messageRenderer.purchaseAmountText.simpleText,
            color: convertColorToHex6(messageRenderer.backgroundColor),
            sticker: parseThumbnailToImageItem(messageRenderer.sticker.thumbnails, messageRenderer.sticker.accessibility.accessibilityData.label),
        };
    }
    else if ("purchaseAmountText" in messageRenderer) {
        ret.superchat = {
            amount: messageRenderer.purchaseAmountText.simpleText,
            color: convertColorToHex6(messageRenderer.bodyBackgroundColor),
        };
    }
    else if (((_d = data.addChatItemAction) === null || _d === void 0 ? void 0 : _d.item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer) &&
        "primaryText" in messageRenderer &&
        messageRenderer.primaryText.runs) {
        ret.membershipGift = {
            message: parseMessages(messageRenderer.primaryText.runs),
        };
        if ((_f = (_e = messageRenderer.image) === null || _e === void 0 ? void 0 : _e.thumbnails) === null || _f === void 0 ? void 0 : _f[0]) {
            ret.membershipGift.image = Object.assign(Object.assign({}, messageRenderer.image.thumbnails[0]), { alt: "" });
        }
    }
    return ret;
}
//# sourceMappingURL=parser.js.map