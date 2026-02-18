import sys

with open("src/components/admin/AdminSidebar.tsx", "r") as f:
    content = f.read()

search_imports = """  ClipboardList,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";"""

replace_imports = """  ClipboardList,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";"""

search_items = """  { title: "Question Bank", href: "/admin/questions", icon: FileQuestion },
  { title: "Assessments", href: "/admin/assessments", icon: ClipboardList },
  {
    title: "DCAS Configuration","""

replace_items = """  { title: "Question Bank", href: "/admin/questions", icon: FileQuestion },
  { title: "Assessments", href: "/admin/assessments", icon: ClipboardList },
  {
    title: "Manage Admins",
    href: "/admin/admins",
    icon: ShieldCheck,
  },
  {
    title: "DCAS Configuration","""

new_content = content.replace(search_imports, replace_imports).replace(search_items, replace_items)

if new_content == content:
    print("Could not find search block")
    sys.exit(1)

with open("src/components/admin/AdminSidebar.tsx", "w") as f:
    f.write(new_content)

print("Successfully updated src/components/admin/AdminSidebar.tsx")
