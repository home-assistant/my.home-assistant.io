const SUPPORTED_PARAMS = ["url"];

const INVITE_URL = new URL("homeassistant://invite");
// We read params from location.hash instead of location.search, as they
// won't be sent to the server when the user visits the link.
const hashParams = new URLSearchParams(location.hash.substring(1));
const inviteHashParams = new URLSearchParams();
for (const [key, value] of hashParams.entries()) {
  if (SUPPORTED_PARAMS.includes(key)) {
    inviteHashParams.append(key, value);
  }
}
if (inviteHashParams.toString()) {
  INVITE_URL.hash = inviteHashParams.toString();
}

const inviteLink = document.querySelector(".invite-link");

if (inviteLink) {
  inviteLink.outerHTML = `
    <a href="${INVITE_URL.toString()}" class="ha-button accent">Accept Invite</a>
  `;
}
