"use server";

import z from "zod";
import { redirect } from "next/navigation";

import { env } from "~/env";
import {
  AlbumNameSchema,
  createAlbum,
  updateAlbum,
  deleteAlbum
} from "~/server/queries";

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

type UpdateAlbumActionState = {
    status: "init";
} | {
    status: "success";
    data: string;
} | {
  status: "error";
  message: string;
  data: string | null;
};

export async function updateAlbumAction(_previousState: UpdateAlbumActionState, formData: FormData): Promise<UpdateAlbumActionState> {
  "use server";
  try {
    const id = formData.get("id") as string;
    const parsedId = z.int().nonnegative().safeParse(Number(id));
    if (!parsedId.success) {
        return {
            status: "error",
            message: "Invalid album ID",
            data: z.prettifyError(parsedId.error),
        };
    }
    const name = formData.get("name") as string;
    const parsedName = AlbumNameSchema.safeParse(name);
    if (!parsedName.success) {
        return {
            status: "error",
            message: "Invalid album name",
            data: z.prettifyError(parsedName.error),
        };
    }

    const result = await updateAlbum(parsedId.data, { name: parsedName.data });
    return {
        status: "success",
        data: result.name
    };
  } catch (error) {
    console.error("Error updating album:", error);
    return {
        status: "error",
        message: "Failed to update album",
        data: (env.NODE_ENV === "development") ? ((error instanceof Error) ? error.message : null) : "Internal Server Error"
    };
  }
}

export async function deleteAlbumAction(albumId: number) {
  "use server";
  await deleteAlbum(albumId);
  redirect('/');
}
