import { DiscordSDK, Events } from "@discord/embedded-app-sdk";
import { hideSplashScreen, updateParticipantsLobby } from "./index.js";

let discordSdk = JSON.parse(sessionStorage.getItem("discord-sdk"));

if (!discordSdk) {
  discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
}

let auth;
setupDiscordSdk();

async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify", "guilds", "applications.commands"],
  });

  // Retrieve an access_token from your activity's server
  // Note: We need to prefix our backend `/api/token` route with `/.proxy` to stay compliant with the CSP.
  // Read more about constructing a full URL and using external resources at
  // https://discord.com/developers/docs/activities/development-guides#construct-a-full-url
  const response = await fetch(`/.proxy/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }

  discordSdk.subscribe(
    Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
    updateParticipantsLobby
  );

  sessionStorage.setItem("discord-sdk", JSON.stringify(discordSdk));

  hideSplashScreen();
}

export const getUser = () => {
  return auth?.user;
};

export const getParticipants = async () => {
  return await discordSdk.commands.getInstanceConnectedParticipants();
};

export { discordSdk };
