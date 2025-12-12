import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

function hasAuth0Env() {
  return Boolean(
    process.env.AUTH0_SECRET &&
      process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET &&
      process.env.APP_BASE_URL
  );
}

function createClient() {
  return new Auth0Client({
    authorizationParameters: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE,
    },
    signInReturnToPath: "/dashboard",
  });
}

export const auth0 = hasAuth0Env()
  ? createClient()
  : {
      middleware: async () => NextResponse.next(),
      getSession: async () => null,
      getAccessToken: async () => {
        throw new Error(
          "Auth0 env vars are missing. Access token is unavailable in this environment."
        );
      },
    };

export const getAccessToken = async () => {
  const tokenResult = await auth0.getAccessToken();

  if (!tokenResult?.token) {
    throw new Error("No access token found in Auth0 session");
  }

  return tokenResult.token;
};
