"use server";

import z from "zod";
import { redirect } from "next/navigation";

import { env } from "~/env";
import {
  AlbumNameSchema,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  moveImagesToAlbum,
  deleteMultiple
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

type MoveImagesActionState = {
    status: "init";
} | {
    status: "success";
} | {
  status: "error";
  message: string;
  data: string | null;
};

export async function moveImagesAction(_previousState: MoveImagesActionState, formData: FormData): Promise<MoveImagesActionState> {
  "use server";
  try {
    const imageIds = JSON.parse(formData.get("imageIds") as string) as number[];
    const parsedImageIds = z.array(z.int().nonnegative()).min(1).safeParse(imageIds);
    if (!parsedImageIds.success) {
        return {
            status: "error",
            message: "Invalid image IDs",
            data: z.prettifyError(parsedImageIds.error),
        };
    }
    const albumId = JSON.parse(formData.get("albumId") as string) as Nullable<number>;
    const parsedAlbumId = z.int().nonnegative().nullable().safeParse(albumId);
    if (!parsedAlbumId.success) {
        return {
            status: "error",
            message: "Invalid album ID",
            data: z.prettifyError(parsedAlbumId.error),
        };
    }

    await moveImagesToAlbum(parsedImageIds.data, parsedAlbumId.data);
    return { status: "success" };
  } catch (error) {
    console.error("Error moving images:", error);
    return {
        status: "error",
        message: "Failed to move images",
        data: (env.NODE_ENV === "development") ? ((error instanceof Error) ? error.message : null) : "Internal Server Error"
    };
  }
}

export async function deleteMultipleAction(imageIds: number[], albumIds: number[]) {
  "use server";
  await deleteMultiple(imageIds, albumIds);
}
