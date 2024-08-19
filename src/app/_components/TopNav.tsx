import {
 SignInButton,
 SignedIn,
 SignedOut,
 UserButton
} from '@clerk/nextjs';
import Link from 'next/link';
import { SimpleUploadButton } from "./uploadButton";

export default function TopNav() {
  return (
    <div className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div><Link href="/">T3 Gallery</Link></div>
      <div className="flex gap-5 items-center">
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
