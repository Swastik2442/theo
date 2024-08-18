import {
 SignInButton,
 SignedIn,
 SignedOut,
 UserButton
} from '@clerk/nextjs';

export default function TopNav() {
  return (
    <div className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>T3 Gallery</div>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  )
}