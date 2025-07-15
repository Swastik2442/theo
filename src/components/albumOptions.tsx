"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, SquarePen, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { createAlbumAction, deleteAlbumAction } from "~/server/actions";
import { toast } from "sonner";

const initialState = { status: "init" } as const;

export const CreateAlbumButton = () => {
  const router = useRouter();
  const [albumName, setAlbumName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAlbumAction, initialState);

  useEffect(() => {
    if (state.status == 'error') {
      toast[state.status](state.message, {
        duration: 5000,
        description: state.data,
      });
    } else if (state.status == 'success') {
      router.push(`/albums/${state.data}`);
      setDialogOpen(false);
      setAlbumName("");
    }
  }, [state]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" title="Create Album" variant="link" size="icon" className="cursor-pointer size-4">
          <Plus />
          <span className="sr-only select-none">Create Album</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an Album</DialogTitle>
            <DialogDescription>
              Albums can be used to create a collection of images.
              Images can be added to an album after its creation.
            </DialogDescription>
          </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 pb-4">
            <div className="grid gap-3">
              <Label htmlFor="album-name">Name</Label>
              <Input
                id="album-name"
                name="name"
                placeholder="My Album"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                type="text"
                minLength={1}
                maxLength={256}
                autoFocus
                disabled={pending}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" title="Cancel" disabled={pending}>Cancel</Button>
            </DialogClose>
            <Button type="submit" title="Create" disabled={pending}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const DeleteAlbumButton = ({ albumId }: { albumId: number; }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" title="Delete Album" variant="link" size="icon" className="cursor-pointer size-4">
          <Trash2 />
          <span className="sr-only select-none">Delete Album</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            album and remove all the images in it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => await deleteAlbumAction(albumId)}>
            Delete Album
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
