import sys

with open("src/app/api/admins/route.ts", "r") as f:
    content = f.read()

search = """    if (session.user.role === "admin") {
      // Admins cannot see superadmins
      query.role = { : "superadmin" };
    }"""

replace = """    if (session.user.role === "admin") {
      // Admins cannot see superadmins
      query.role = { $ne: "superadmin" };
    }"""

new_content = content.replace(search, replace)

if new_content == content:
    print("Could not find search block")
    sys.exit(1)

with open("src/app/api/admins/route.ts", "w") as f:
    f.write(new_content)

print("Successfully fixed src/app/api/admins/route.ts")
