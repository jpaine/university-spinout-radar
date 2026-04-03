import { Resend } from "resend";

export const FROM_EMAIL = "Oxford Deal Flow <noreply@oxforddealflow.com>";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { id: "dev-skipped" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("[email] Send failed:", error);
    throw new Error(error.message);
  }

  return data;
}
