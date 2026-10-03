import { publicPageMetadata } from "@/lib/seo/publicMetadata";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return publicPageMetadata(params, "lessons");
}

export default function LessonsLayout({ children }: { children: ReactNode }) {
  return children;
}
