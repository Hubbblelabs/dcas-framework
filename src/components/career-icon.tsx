import {
  Rocket,
  Briefcase,
  Settings,
  TrendingUp,
  Target,
  Brain,
  Link,
  Megaphone,
  Users,
  Smartphone,
  Star,
  Handshake,
  MessageCircle,
  PartyPopper,
  Shield,
  Clipboard,
  BookOpen,
  Building,
  Pill,
  FileSignature,
  Sprout,
  BarChart3,
  Coins,
  CheckCircle,
  Microscope,
  Lock,
  Zap,
  Scale,
  LucideIcon,
  HelpCircle,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Briefcase,
  Settings,
  TrendingUp,
  Target,
  Brain,
  Link,
  Megaphone,
  Users,
  Smartphone,
  Star,
  Handshake,
  MessageCircle,
  PartyPopper,
  Shield,
  Clipboard,
  BookOpen,
  Building,
  Pill,
  FileSignature,
  Sprout,
  BarChart3,
  Coins,
  CheckCircle,
  Microscope,
  Lock,
  Zap,
  Scale,
};

interface CareerIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CareerIcon({ name, className, style }: CareerIconProps) {
  const Icon = iconMap[name] || HelpCircle;
  return <Icon className={className} style={style} />;
}
