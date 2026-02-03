import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
  });

  return <AdminDashboard universities={universities} />;
}
