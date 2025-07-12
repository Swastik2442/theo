"use server";

import z from "zod";
import { env } from "~/env";
import { AlbumNameSchema, createAlbum } from "~/server/queries";

type CreateAlbumActionState = {
    status: "init";
} | {
    status: "success";
    data: number;
} | {
  status: "error";
  message: string;
  data: string | null;
};

export async function createAlbumAction(_previousState: CreateAlbumActionState, formData: FormData): Promise<CreateAlbumActionState> {
  "use server";
  try {
    const name = formData.get("name") as string;
    const parsedName = AlbumNameSchema.safeParse(name);
    if (!parsedName.success) {
        return {
            status: "error",
            message: "Invalid album name",
            data: z.prettifyError(parsedName.error),
        };
    }

    const result = await createAlbum(parsedName.data);
    return {
        status: "success",
        data: result.id
    };
  } catch (error) {
    console.error("Error creating album:", error);
    return {
        status: "error",
        message: "Failed to create album",
        data: (env.NODE_ENV === "development") ? ((error instanceof Error) ? error.message : null) : "Internal Server Error"
    };
  }
}
