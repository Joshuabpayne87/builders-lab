import { getFunnelBySlug } from "@/app/apps/funnels/services/funnelService";
import { notFound } from "next/navigation";

export default async function PublicFunnelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const funnel = await getFunnelBySlug(slug);

  if (!funnel || !funnel.html_code) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: funnel.html_code }}
      suppressHydrationWarning
    />
  );
}
