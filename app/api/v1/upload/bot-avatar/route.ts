import { CloudinaryImageUpload } from "@/app/actions/upload/CloudinaryImageUpload";
import GetUserSession from "@/app/actions/user/getUserSession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await GetUserSession();

    if (!user) {
      return NextResponse.json({ error: "unauthroized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "no file provided" }, { status: 400 });
    }

    const uploadRes = await CloudinaryImageUpload(file);

    return NextResponse.json(
      { success: true, url: uploadRes.result?.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("bot-avatar api error, ", error);
    return NextResponse.json(
      { error: "bot-avatar not uploaded" },
      { status: 401 }
    );
  }
}
