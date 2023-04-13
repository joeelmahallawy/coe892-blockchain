import jsonwebtoken from "jsonwebtoken";

import SHA256 from "crypto-js/sha256";

import { deleteCookie, getCookie, setCookie } from "cookies-next";
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
      // personal info access
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
  try {
    // create session
    const response = await grantInstance(req, res);

    const {
      profile: { email, name, picture },
    } = response.response;

    const walletAddress = SHA256(`${Math.random()}`).toString();

    // const address = jsonwebtoken.sign(
    //   { data: walletAddress },
    //   process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
    //   // 2 months
    //   { expiresIn: 60 * 60 * 24 * 60 }
    // );

    setCookie("address", walletAddress, {
      req,
      res,
      maxAge: 60 * 60 * 24 * 60,
    });
    setCookie("profilePicture", picture, {
      req,
      res,
      maxAge: 60 * 60 * 24 * 60,
    });

    return res.redirect(`/`);
  } catch (err) {
    throw {
      error: `${err.message}. IF YOU SEE THIS ERROR, PLEASE EMAIL THE DEVELOPER ABOUT IT (youssef.elmahallawy01@gmail.com)`,
    };
  }
};

export default handler;
//
