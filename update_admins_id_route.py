import sys

with open("src/app/api/admins/[id]/route.ts", "r") as f:
    content = f.read()

# GET
search_get = """export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id).select("-password");
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    return NextResponse.json({ admin });
  } catch (error) {"""

replace_get = """export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id).select("-password");
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin" && admin.role === "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ admin });
  } catch (error) {"""

# PUT
search_put = """export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name, role } = await request.json();
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id);
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    if (email) admin.email = email.toLowerCase();"""

replace_put = """export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name, role } = await request.json();
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id);
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin") {
      if (admin.role === "superadmin") {
        return NextResponse.json(
          { error: "Unauthorized to update superadmin" },
          { status: 403 },
        );
      }
      if (role === "superadmin") {
        return NextResponse.json(
          { error: "Unauthorized to promote to superadmin" },
          { status: 403 },
        );
      }
    }

    if (email) admin.email = email.toLowerCase();"""

# DELETE
search_delete = """export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    if (id === session.user?.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    return NextResponse.json({ message: "Admin deleted" });
  } catch (error) {"""

replace_delete = """export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    if (id === session.user?.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    const admin = await Admin.findById(id);
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin" && admin.role === "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized to delete superadmin" },
        { status: 403 },
      );
    }

    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ message: "Admin deleted" });
  } catch (error) {"""

new_content = content.replace(search_get, replace_get).replace(search_put, replace_put).replace(search_delete, replace_delete)

if new_content == content:
    print("Could not find search block")
    sys.exit(1)

with open("src/app/api/admins/[id]/route.ts", "w") as f:
    f.write(new_content)

print("Successfully updated src/app/api/admins/[id]/route.ts")
