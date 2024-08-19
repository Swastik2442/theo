import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { SimpleUploadButton } from "./uploadButton";

export default function TopNav() {
  return (
    <div className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <Link href="/" className="flex flex-col">
        <span className="text-end">Theo</span>
        <span className="text-xs">A Simple Image Gallery</span>
      </Link>
      <div className="flex flex-col-reverse sm:flex-row pl-4 sm:pl-0 gap-5 items-center">
        <SignedIn>
          <SimpleUploadButton />
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  )
}
