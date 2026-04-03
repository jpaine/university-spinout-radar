import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            socialButtonsBlockButton: { display: "none" },
            dividerRow: { display: "none" },
          },
        }}
      />
    </div>
  );
}
