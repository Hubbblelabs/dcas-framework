import sys

with open("src/app/api/admins/route.ts", "r") as f:
    content = f.read()

search_get = """export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const admins = await Admin.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({ admins });
  } catch (error) {"""

replace_get = """export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const query: any = {};
    if (session.user.role === "admin") {
      // Admins cannot see superadmins
      query.role = { : "superadmin" };
    }

    const admins = await Admin.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({ admins });
  } catch (error) {"""

search_post = """export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name, role } = await request.json();
    if (!email || !password || !name) {"""

replace_post = """export async function POST(request: NextRequest) {
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

    if (session.user.role === "admin" && role === "superadmin") {
      return NextResponse.json(
        { error: "Admins cannot create superadmins" },
        { status: 403 },
      );
    }

    if (!email || !password || !name) {"""

new_content = content.replace(search_get, replace_get).replace(search_post, replace_post)

if new_content == content:
    print("Could not find search block")
    sys.exit(1)

with open("src/app/api/admins/route.ts", "w") as f:
    f.write(new_content)

print("Successfully updated src/app/api/admins/route.ts")
