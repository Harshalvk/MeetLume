"use server";

import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export async function CloudinaryImageUpload(file: File) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "meetlume-bot-avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(buffer).pipe(stream);
      });

    const result = (await uploadStream()) as Record<
      string,
      string | number | []
    >;

    return { success: true, result };
  } catch (error) {
    console.error("cloudinary image upload server action error:", error);
    return { success: false, result: null };
  }
}
