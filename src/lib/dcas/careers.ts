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
        { title: "Business Development Manager", description: "Lead growth strategies and drive business expansion", icon: "🚀", skills: ["Leadership", "Strategy", "Negotiation"] },
        { title: "Entrepreneur / Startup Founder", description: "Build and scale your own business ventures", icon: "💼", skills: ["Vision", "Risk-taking", "Decision-making"] },
        { title: "Operations Manager", description: "Oversee daily operations and optimize efficiency", icon: "⚙️", skills: ["Efficiency", "Management", "Problem-solving"] },
        { title: "Sales Manager (B2B)", description: "Lead sales teams and close high-value deals", icon: "📈", skills: ["Sales", "Team Leadership", "Persuasion"] },
        { title: "Project Leader / Program Manager", description: "Drive projects to completion with decisive leadership", icon: "🎯", skills: ["Planning", "Execution", "Accountability"] },
        { title: "Strategy Consultant", description: "Advise organizations on strategic decisions", icon: "🧠", skills: ["Analysis", "Advisory", "Communication"] },
        { title: "Supply Chain Manager", description: "Optimize logistics and manage complex supply networks", icon: "🔗", skills: ["Logistics", "Optimization", "Coordination"] },
    ],
    C: [
        { title: "Marketing Manager", description: "Create compelling campaigns and build brand awareness", icon: "📣", skills: ["Creativity", "Communication", "Branding"] },
        { title: "HR and Training Specialist", description: "Develop talent and create engaging training programs", icon: "👥", skills: ["Empathy", "Training", "Development"] },
        { title: "Digital Marketing Strategist", description: "Drive online engagement and social media presence", icon: "📱", skills: ["Social Media", "Content", "Analytics"] },
        { title: "Brand Ambassador / PR Specialist", description: "Represent brands and manage public relations", icon: "🌟", skills: ["Public Speaking", "Networking", "Branding"] },
        { title: "Customer Engagement Manager", description: "Build relationships and enhance customer experiences", icon: "🤝", skills: ["Relationship Building", "CX", "Communication"] },
        { title: "Inside Sales / Relationship Manager", description: "Nurture client relationships and drive sales", icon: "💬", skills: ["Rapport", "Trust", "Follow-up"] },
        { title: "Event Manager", description: "Organize and execute memorable events", icon: "🎉", skills: ["Organization", "Creativity", "Coordination"] },
    ],
    A: [
        { title: "Customer Success Specialist", description: "Ensure customer satisfaction and long-term relationships", icon: "🛡️", skills: ["Patience", "Empathy", "Support"] },
        { title: "Operations Coordinator", description: "Maintain smooth workflows and support team operations", icon: "📋", skills: ["Organization", "Reliability", "Teamwork"] },
        { title: "Teacher / Mentor / Coach", description: "Guide and develop others with patience and care", icon: "📚", skills: ["Mentoring", "Patience", "Communication"] },
        { title: "Administrative Manager", description: "Manage administrative functions with consistency", icon: "🏢", skills: ["Organization", "Consistency", "Detail"] },
        { title: "Healthcare Support Roles", description: "Provide compassionate care and patient support", icon: "💊", skills: ["Compassion", "Care", "Stability"] },
        { title: "HR Support / Recruitment Coordinator", description: "Support hiring processes and employee relations", icon: "📝", skills: ["People Skills", "Process", "Support"] },
        { title: "Community Manager", description: "Build and nurture community relationships", icon: "🌱", skills: ["Community", "Trust", "Engagement"] },
    ],
    S: [
        { title: "Data Analyst / Business Analyst", description: "Analyze data to drive business decisions", icon: "📊", skills: ["Analytics", "Critical Thinking", "Excel"] },
        { title: "Financial Analyst / Accountant", description: "Manage financial data with precision and accuracy", icon: "💰", skills: ["Finance", "Precision", "Reporting"] },
        { title: "Quality Assurance & Compliance", description: "Ensure standards and regulatory compliance", icon: "✅", skills: ["Quality", "Standards", "Testing"] },
        { title: "Research & Analytics", description: "Conduct thorough research and detailed analysis", icon: "🔬", skills: ["Research", "Data", "Methodology"] },
        { title: "IT System Design / Cybersecurity", description: "Design secure systems with meticulous attention", icon: "🔒", skills: ["Security", "Systems", "Architecture"] },
        { title: "Engineering & Technical Design", description: "Create detailed technical solutions and designs", icon: "⚡", skills: ["Engineering", "Design", "Precision"] },
        { title: "Legal Analyst", description: "Analyze legal documents and ensure compliance", icon: "⚖️", skills: ["Legal", "Analysis", "Compliance"] },
    ],
};

export function getCareerRecommendations(
    primaryType: DCASType,
    secondaryType: DCASType
): CareerRecommendation[] {
    const primaryCareers = careersByType[primaryType].slice(0, 2).map(c => ({ ...c, source: "primary" as const }));
    const secondaryCareers = careersByType[secondaryType].slice(0, 1).map(c => ({ ...c, source: "secondary" as const }));
    return [...primaryCareers, ...secondaryCareers];
}

export function getAllCareersForType(type: DCASType): CareerRecommendation[] {
    return careersByType[type];
}
