import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  if (!/^[a-f0-9]{48}$/.test(params.token)) {
    return NextResponse.json({ error: "Invalid link." }, { status: 404 });
  }
  const rows = (await db().query(
    `UPDATE orders SET downloads = downloads + 1
     WHERE download_token = $1 AND status = 'paid'
     RETURNING (SELECT file_url FROM sections WHERE id = orders.section_id) AS file_url`,
    [params.token]
  )) as { file_url: string | null }[];

  const url = rows[0]?.file_url;
  if (!url) return NextResponse.json({ error: "This link is not valid or the payment is not complete." }, { status: 404 });
  return NextResponse.redirect(url);
}
