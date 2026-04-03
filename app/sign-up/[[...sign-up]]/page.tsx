import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp
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
