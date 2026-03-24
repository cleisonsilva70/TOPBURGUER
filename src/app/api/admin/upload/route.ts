import { NextResponse } from "next/server";
import { isOwnerAuthenticated } from "@/lib/auth";

const allowedScopes = new Set(["branding", "products", "banners"]);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);
const maxFileSizeInBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const isAuthenticated = await isOwnerAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const scope = String(formData.get("scope") ?? "branding");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao enviado." }, { status: 400 });
  }

  if (!allowedScopes.has(scope)) {
    return NextResponse.json({ error: "Destino de upload invalido." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo nao suportado." }, { status: 400 });
  }

  if (file.size > maxFileSizeInBytes) {
    return NextResponse.json(
      { error: "A imagem deve ter no maximo 4 MB." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const url = `data:${file.type};base64,${base64}`;

  return NextResponse.json({
    scope,
    url,
  });
}
