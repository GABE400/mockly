import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
  console.warn("Warning: ImageKit environment variables are missing.");
}

export const imagekit = new ImageKit({
  publicKey: publicKey || "placeholder_public_key",
  privateKey: privateKey || "placeholder_private_key",
  urlEndpoint: urlEndpoint || "https://ik.imagekit.io/placeholder/",
});
