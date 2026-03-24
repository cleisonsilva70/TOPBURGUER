import { NextResponse } from "next/server";
import { isOwnerAuthenticated } from "@/lib/auth";
import { listStoreCategories, OrderFlowError, upsertAdminCategory } from "@/lib/order-repository";
import { adminCategorySchema } from "@/lib/validators";

export async function GET() {
  const isAuthenticated = await isOwnerAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const categories = await listStoreCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const isAuthenticated = await isOwnerAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = adminCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados invalidos." },
        { status: 400 },
      );
    }

    const category = await upsertAdminCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof OrderFlowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Nao foi possivel salvar a categoria." },
      { status: 500 },
    );
  }
}
