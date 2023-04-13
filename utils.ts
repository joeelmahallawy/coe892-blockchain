export const getEnvironmentWebsiteURL = () =>
  process.env.NODE_ENV === "production"
    ? `https://coe892-blockchain.vercel.app`
    : `http://localhost:3000`;
