import { DCASType } from "./scoring";

export interface CareerRecommendation {
  title: string;
  description: string;
  icon: string;
  skills: string[];
  source?: "primary" | "secondary";
}

export const careersByType: Record<DCASType, CareerRecommendation[]> = {
  D: [
    {
      title: "Business Development Manager",
      description: "Lead growth strategies and drive business expansion",
      icon: "Rocket",
      skills: ["Leadership", "Strategy", "Negotiation"],
    },
    {
      title: "Entrepreneur / Startup Founder",
      description: "Build and scale your own business ventures",
      icon: "Briefcase",
      skills: ["Vision", "Risk-taking", "Decision-making"],
    },
    {
      title: "Operations Manager",
      description: "Oversee daily operations and optimize efficiency",
      icon: "Settings",
      skills: ["Efficiency", "Management", "Problem-solving"],
    },
    {
      title: "Sales Manager (B2B)",
      description: "Lead sales teams and close high-value deals",
      icon: "TrendingUp",
      skills: ["Sales", "Team Leadership", "Persuasion"],
    },
    {
      title: "Project Leader / Program Manager",
      description: "Drive projects to completion with decisive leadership",
      icon: "Target",
      skills: ["Planning", "Execution", "Accountability"],
    },
    {
      title: "Strategy Consultant",
      description: "Advise organizations on strategic decisions",
      icon: "Brain",
      skills: ["Analysis", "Advisory", "Communication"],
    },
    {
      title: "Supply Chain Manager",
      description: "Optimize logistics and manage complex supply networks",
      icon: "Link",
      skills: ["Logistics", "Optimization", "Coordination"],
    },
  ],
  C: [
    {
      title: "Marketing Manager",
      description: "Create compelling campaigns and build brand awareness",
      icon: "Megaphone",
      skills: ["Creativity", "Communication", "Branding"],
    },
    {
      title: "HR and Training Specialist",
      description: "Develop talent and create engaging training programs",
      icon: "Users",
      skills: ["Empathy", "Training", "Development"],
    },
    {
      title: "Digital Marketing Strategist",
      description: "Drive online engagement and social media presence",
      icon: "Smartphone",
      skills: ["Social Media", "Content", "Analytics"],
    },
    {
      title: "Brand Ambassador / PR Specialist",
      description: "Represent brands and manage public relations",
      icon: "Star",
      skills: ["Public Speaking", "Networking", "Branding"],
    },
    {
      title: "Customer Engagement Manager",
      description: "Build relationships and enhance customer experiences",
      icon: "Handshake",
      skills: ["Relationship Building", "CX", "Communication"],
    },
    {
      title: "Inside Sales / Relationship Manager",
      description: "Nurture client relationships and drive sales",
      icon: "MessageCircle",
      skills: ["Rapport", "Trust", "Follow-up"],
    },
    {
      title: "Event Manager",
      description: "Organize and execute memorable events",
      icon: "PartyPopper",
      skills: ["Organization", "Creativity", "Coordination"],
    },
  ],
  A: [
    {
      title: "Customer Success Specialist",
      description: "Ensure customer satisfaction and long-term relationships",
      icon: "Shield",
      skills: ["Patience", "Empathy", "Support"],
    },
    {
      title: "Operations Coordinator",
      description: "Maintain smooth workflows and support team operations",
      icon: "Clipboard",
      skills: ["Organization", "Reliability", "Teamwork"],
    },
    {
      title: "Teacher / Mentor / Coach",
      description: "Guide and develop others with patience and care",
      icon: "BookOpen",
      skills: ["Mentoring", "Patience", "Communication"],
    },
    {
      title: "Administrative Manager",
      description: "Manage administrative functions with consistency",
      icon: "Building",
      skills: ["Organization", "Consistency", "Detail"],
    },
    {
      title: "Healthcare Support Roles",
      description: "Provide compassionate care and patient support",
      icon: "Pill",
      skills: ["Compassion", "Care", "Stability"],
    },
    {
      title: "HR Support / Recruitment Coordinator",
      description: "Support hiring processes and employee relations",
      icon: "FileSignature",
      skills: ["People Skills", "Process", "Support"],
    },
    {
      title: "Community Manager",
      description: "Build and nurture community relationships",
      icon: "Sprout",
      skills: ["Community", "Trust", "Engagement"],
    },
  ],
  S: [
    {
      title: "Data Analyst / Business Analyst",
      description: "Analyze data to drive business decisions",
      icon: "BarChart3",
      skills: ["Analytics", "Critical Thinking", "Excel"],
    },
    {
      title: "Financial Analyst / Accountant",
      description: "Manage financial data with precision and accuracy",
      icon: "Coins",
      skills: ["Finance", "Precision", "Reporting"],
    },
    {
      title: "Quality Assurance & Compliance",
      description: "Ensure standards and regulatory compliance",
      icon: "CheckCircle",
      skills: ["Quality", "Standards", "Testing"],
    },
    {
      title: "Research & Analytics",
      description: "Conduct thorough research and detailed analysis",
      icon: "Microscope",
      skills: ["Research", "Data", "Methodology"],
    },
    {
      title: "IT System Design / Cybersecurity",
      description: "Design secure systems with meticulous attention",
      icon: "Lock",
      skills: ["Security", "Systems", "Architecture"],
    },
    {
      title: "Engineering & Technical Design",
      description: "Create detailed technical solutions and designs",
      icon: "Zap",
      skills: ["Engineering", "Design", "Precision"],
    },
    {
      title: "Legal Analyst",
      description: "Analyze legal documents and ensure compliance",
      icon: "Scale",
      skills: ["Legal", "Analysis", "Compliance"],
    },
  ],
};

export function getCareerRecommendations(
  primaryType: DCASType,
  secondaryType: DCASType,
): CareerRecommendation[] {
  const primaryCareers = careersByType[primaryType]
    .slice(0, 2)
    .map((c) => ({ ...c, source: "primary" as const }));
  const secondaryCareers = careersByType[secondaryType]
    .slice(0, 1)
    .map((c) => ({ ...c, source: "secondary" as const }));
  return [...primaryCareers, ...secondaryCareers];
}

export function getAllCareersForType(type: DCASType): CareerRecommendation[] {
  return careersByType[type];
}
