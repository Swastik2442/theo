"use client";

import {
 SignInButton,
 SignedIn,
 SignedOut,
 UserButton
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UploadButton } from "~/utils/uploadthing";

export default function TopNav() {
  const router = useRouter();
  return (
    <div className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>T3 Gallery</div>
      <div className="flex gap-5">
        <SignedIn>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(data) => {
              console.log("Client Upload Complete", data);
              router.refresh();
            }}
          />
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  )
}
