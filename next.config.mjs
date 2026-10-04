/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Section zips + preview images are uploaded through a server action.
    // Vercel caps request bodies at 4.5 MB, so stay under that.
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }] },
};
export default nextConfig;
