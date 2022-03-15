async function fetchLastComments() {
    const rawResponse = await fetch('https://steamcommunity.com/my/allcomments', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    let res = await rawResponse.text();

    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(res, 'text/html');

    let comments = htmlDoc.getElementsByClassName("commentthread_comment responsive_body_text   ");

    let returnComments = [];

    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        returnComments.push({
            profile: comment.getElementsByClassName("hoverunderline commentthread_author_link")[0].getAttribute("href"),
            message: comment.getElementsByClassName("commentthread_comment_text")[0].innerText,
            timestamp: comment.getElementsByClassName("commentthread_comment_timestamp")[0].getAttribute("data-timestamp")
        })

    }

    chrome.storage.local.get(["comments"], async (storage) => {
        let storageComments = storage.comments;

        if (storageComments === undefined) {
            storageComments = [];
        }

        returnComments.forEach(comment => {
            if (!storageComments.some(c => c.profile === comment.profile && c.message === comment.message && c.timestamp === comment.timestamp)) {
                storageComments.push(comment);
            }
        })

        await chrome.storage.local.set({comments: storageComments});
    });

}

let nextCommentCheck = 0;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "getLastComments") {
            if (nextCommentCheck < new Date().getTime()) {
                fetchLastComments().then(() => {
                    nextCommentCheck = new Date().getTime() + 1000 * 60 * 2;
                    chrome.storage.local.get(["comments"], async (storage) => {
                        sendResponse({lastComments: storage.comments});
                    });
                });
            } else {
                chrome.storage.local.get(["comments"], async (storage) => {
                    sendResponse({lastComments: storage.comments});
                });
            }
        }
        return true;
    }
);
