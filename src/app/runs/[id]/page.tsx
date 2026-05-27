import { notFound } from "next/navigation";
import { Activity } from "lucide-react";
import { RunReport } from "@/components/RunReport";
import { PrintButton } from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicRunPage({ params }: { params: { id: string } }) {
  const run = await prisma.run.findFirst({
    where: { id: params.id, isPublic: true },
    include: { route: true, user: { select: { name: true } } },
  });

  if (!run) notFound();

  return (
    <div className="export-page">
      {/* Brand header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Activity size={22} color="#FC5200" />
        <span style={{ fontSize: 20, fontWeight: 800, fontStyle: "italic", color: "#FC5200", letterSpacing: "-0.5px" }}>STAVRA</span>
      </div>

      {/* The card */}
      <div className="screenshot-card">
        <RunReport run={run} />
      </div>

      {/* Export actions */}
      <div className="export-actions">
        <PrintButton />
      </div>
      <p className="export-hint">Нажмите правой кнопкой → «Сохранить как изображение» или используйте PrintScreen</p>
    </div>
  );
}
