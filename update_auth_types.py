import os

file_path = 'src/app/api/auth/[...nextauth]/route.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Add imports
if 'import { JWT } from "next-auth/jwt";' not in content:
    content = content.replace(
        'import NextAuth, { NextAuthOptions } from "next-auth";',
        'import NextAuth, { NextAuthOptions, Session, User } from "next-auth";\nimport { JWT } from "next-auth/jwt";'
    )

# Replace jwt callback signature
content = content.replace(
    'async jwt({ token, user }: any) {',
    'async jwt({ token, user }: { token: JWT; user?: User }) {'
)

# Replace session callback signature
content = content.replace(
    'async session({ session, token }: any) {',
    'async session({ session, token }: { session: Session; token: JWT }) {'
)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated file successfully.")
