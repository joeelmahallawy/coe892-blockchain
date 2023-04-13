import { setCookie, setCookies } from "cookies-next";
import grant from "grant";
import { NextApiRequest, NextApiResponse } from "next";
import { getEnvironmentWebsiteURL } from "../../../../utils";

const config = {
  defaults: {
    origin: getEnvironmentWebsiteURL(),
    prefix: "/api/oauth",
    transport: "state",
    response: ["tokens", "raw", "jwt", "profile"],
  },
  google: {
    key: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    scope: [
      "openid",
      "email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    nonce: true,
    prompt: "consent",
    custom_params: { access_type: "offline" },
    callback: `${getEnvironmentWebsiteURL()}/api/oauth/google/callback`,
  },
};

const grantInstance = grant.vercel({
  config: config,
  session: { secret: "grant" },
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await grantInstance(req, res);
};

export default handler;
