chrome.runtime.sendMessage({action: "getLastComments"}, function (response) {

    let invites = document.getElementsByClassName("selectable invite_row");

    for (let i = 0; i < invites.length; i++) {
        let invite = invites[i];

        let profileName = invite.getAttribute("data-persona");
        let nameElement = invite.getElementsByClassName("linkTitle event_title")[0];
        let url = nameElement.getAttribute("href");
        let commentsFromUrl = getCommentsFromProfileUrl(response.lastComments, url);


        let showCommentsElement = document.createElement("div");
        showCommentsElement.className = "invite_block_details leftLongInviterSmallText";
        showCommentsElement.innerHTML = `Left <a className="whiteLink">${commentsFromUrl.length + (commentsFromUrl.length === 1 ? " comment" : " comments")}</a>`;

        if (commentsFromUrl.length > 0) {
            showCommentsElement.onclick = function () {
                buildModal(commentsFromUrl, profileName);
            }
        }

        invite.getElementsByClassName("invite_block_name")[0].appendChild(showCommentsElement);

    }

});

async function buildModal(comments, profileName) {

    let html = await fetch(chrome.runtime.getURL("ModalHtml.html")).then(response => response.text());

    let result = html.replace("{{{PERSONANAME}}}", profileName);

    let modal = document.createElement("div");
    modal.innerHTML = result;

    let commentDiv = modal.getElementsByClassName("player_list_results responsive_friendblocks ")[0];

    comments.forEach(comment => {
        let commentElement = document.createElement("div");
        commentElement.innerText = new Date(comment.timestamp * 1000).toLocaleDateString() + " " + new Date(comment.timestamp * 1000).toLocaleTimeString() + ": " + comment.message;
        commentElement.className = "persona";
        let spacer = document.createElement("hr");
        commentDiv.appendChild(commentElement);
        commentDiv.appendChild(spacer);
    })

    modal.getElementsByClassName("newmodal_close")[0].onclick = function () {
        modal.remove();
    }

    modal.getElementsByClassName("btn_grey_steamui btn_medium")[0].onclick = function () {
        modal.remove();
    }

    document.body.appendChild(modal);
}

function getCommentsFromProfileUrl(comments, url) {
    return comments.filter(obj => {
        return obj.profile === url;
    }).reverse();
}
