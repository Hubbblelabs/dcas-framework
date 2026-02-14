export interface DCASQuestion {
    id: number;
    question: string;
    options: {
        A: { text: string; type: "D" | "C" | "A" | "S" };
        B: { text: string; type: "D" | "C" | "A" | "S" };
        C: { text: string; type: "D" | "C" | "A" | "S" };
        D: { text: string; type: "D" | "C" | "A" | "S" };
    };
}

export const dcasQuestions: DCASQuestion[] = [
    {
        id: 1,
        question: "In a group project, your natural role is to:",
        options: {
            A: { text: "Take charge and delegate tasks", type: "D" },
            B: { text: "Motivate everyone and keep the energy high", type: "C" },
            C: { text: "Support others quietly and maintain harmony", type: "A" },
            D: { text: "Organize and ensure accuracy in all tasks", type: "S" },
        },
    },
    {
        id: 2,
        question: "When faced with a tight deadline, you usually:",
        options: {
            A: { text: "Push the team aggressively to finish fast", type: "D" },
            B: { text: "Encourage everyone with positive talk", type: "C" },
            C: { text: "Work calmly and steadily without stress", type: "A" },
            D: { text: "Plan systematically and check for errors", type: "S" },
        },
    },
    {
        id: 3,
        question: "How do you prefer others to communicate with you?",
        options: {
            A: { text: "Be direct and to the point", type: "D" },
            B: { text: "Be friendly and enthusiastic", type: "C" },
            C: { text: "Be polite and patient", type: "A" },
            D: { text: "Be detailed and precise", type: "S" },
        },
    },
    {
        id: 4,
        question: "When making decisions, you rely on:",
        options: {
            A: { text: "Quick judgment and gut instinct", type: "D" },
            B: { text: "Opinions and ideas from others", type: "C" },
            C: { text: "Stability and past experiences", type: "A" },
            D: { text: "Data, logic, and analysis", type: "S" },
        },
    },
    {
        id: 5,
        question: "In conflict situations, you tend to:",
        options: {
            A: { text: "Confront and resolve it quickly", type: "D" },
            B: { text: "Avoid conflict by lightening the mood", type: "C" },
            C: { text: "Stay quiet and let things settle naturally", type: "A" },
            D: { text: "Analyze the issue before reacting", type: "S" },
        },
    },
    {
        id: 6,
        question: "Your work style is best described as:",
        options: {
            A: { text: "Competitive and goal-oriented", type: "D" },
            B: { text: "Social and people-driven", type: "C" },
            C: { text: "Consistent and supportive", type: "A" },
            D: { text: "Structured and methodical", type: "S" },
        },
    },
    {
        id: 7,
        question: "What motivates you the most?",
        options: {
            A: { text: "Winning and achieving results", type: "D" },
            B: { text: "Recognition and appreciation", type: "C" },
            C: { text: "Stability and secure environment", type: "A" },
            D: { text: "Accuracy and high-quality output", type: "S" },
        },
    },
    {
        id: 8,
        question: "When a sudden change occurs, you:",
        options: {
            A: { text: "Adapt quickly and take charge", type: "D" },
            B: { text: "Try to involve others in finding solutions", type: "C" },
            C: { text: "Feel uneasy but slowly adjust", type: "A" },
            D: { text: "Re-evaluate the plan carefully", type: "S" },
        },
    },
    {
        id: 9,
        question: "How do you respond to criticism?",
        options: {
            A: { text: "Defend your position strongly", type: "D" },
            B: { text: "Feel emotional but try to stay positive", type: "C" },
            C: { text: "Become quiet and withdraw", type: "A" },
            D: { text: "Reflect deeply and analyze what went wrong", type: "S" },
        },
    },
    {
        id: 10,
        question: "In team discussions, you usually:",
        options: {
            A: { text: "Lead the conversation", type: "D" },
            B: { text: "Share creative ideas and stories", type: "C" },
            C: { text: "Listen more than you speak", type: "A" },
            D: { text: "Ask detailed, clarifying questions", type: "S" },
        },
    },
    {
        id: 11,
        question: "Your ideal work environment is:",
        options: {
            A: { text: "Fast-paced with pressure and challenges", type: "D" },
            B: { text: "Interactive and socially engaging", type: "C" },
            C: { text: "Stable and predictable", type: "A" },
            D: { text: "Organized and rule-based", type: "S" },
        },
    },
    {
        id: 12,
        question: "When learning something new, you prefer:",
        options: {
            A: { text: "Hands-on trials and experimentation", type: "D" },
            B: { text: "Group activities and discussions", type: "C" },
            C: { text: "Step-by-step tutorials", type: "A" },
            D: { text: "Reading manuals and structured materials", type: "S" },
        },
    },
    {
        id: 13,
        question: "You handle team disagreements by:",
        options: {
            A: { text: "Taking control and making the decision", type: "D" },
            B: { text: "Encouraging open conversation", type: "C" },
            C: { text: "Avoiding heated arguments and keeping peace", type: "A" },
            D: { text: "Reviewing facts and logic to decide", type: "S" },
        },
    },
    {
        id: 14,
        question: "What best describes your communication style?",
        options: {
            A: { text: "Direct and assertive", type: "D" },
            B: { text: "Expressive and friendly", type: "C" },
            C: { text: "Calm and reserved", type: "A" },
            D: { text: "Formal and systematic", type: "S" },
        },
    },
    {
        id: 15,
        question: "When given a new challenge, your first reaction is:",
        options: {
            A: { text: "\"Let's get started immediately!\"", type: "D" },
            B: { text: "\"Who can join me on this?\"", type: "C" },
            C: { text: "\"I'll take time to understand it\"", type: "A" },
            D: { text: "\"I need more information first\"", type: "S" },
        },
    },
    {
        id: 16,
        question: "What frustrates you the most at work?",
        options: {
            A: { text: "Slow decision-making", type: "D" },
            B: { text: "Lack of interaction or excitement", type: "C" },
            C: { text: "Too much pressure or sudden changes", type: "A" },
            D: { text: "Disorganization or unclear instructions", type: "S" },
        },
    },
    {
        id: 17,
        question: "How do you handle responsibilities?",
        options: {
            A: { text: "Take ownership and push for results", type: "D" },
            B: { text: "Prefer tasks with people interaction", type: "C" },
            C: { text: "Work steadily and reliably", type: "A" },
            D: { text: "Complete tasks with precision", type: "S" },
        },
    },
    {
        id: 18,
        question: "Your leadership style is:",
        options: {
            A: { text: "Commanding and decisive", type: "D" },
            B: { text: "Inspiring and motivational", type: "C" },
            C: { text: "Supportive and coaching", type: "A" },
            D: { text: "Analytical and process-driven", type: "S" },
        },
    },
    {
        id: 19,
        question: "Which statement fits you most?",
        options: {
            A: { text: "I love taking risks", type: "D" },
            B: { text: "I love meeting new people", type: "C" },
            C: { text: "I love maintaining routines", type: "A" },
            D: { text: "I love working systematically", type: "S" },
        },
    },
    {
        id: 20,
        question: "In large social events, you usually:",
        options: {
            A: { text: "Observe but take charge if needed", type: "D" },
            B: { text: "Socialize and meet new people", type: "C" },
            C: { text: "Stick with familiar people", type: "A" },
            D: { text: "Stay reserved unless necessary", type: "S" },
        },
    },
    {
        id: 21,
        question: "Your biggest strength is:",
        options: {
            A: { text: "Decision-making", type: "D" },
            B: { text: "Communication", type: "C" },
            C: { text: "Reliability", type: "A" },
            D: { text: "Problem-solving", type: "S" },
        },
    },
    {
        id: 22,
        question: "When assigned a group task, you prefer to:",
        options: {
            A: { text: "Lead the group", type: "D" },
            B: { text: "Be the spokesperson", type: "C" },
            C: { text: "Support others behind the scenes", type: "A" },
            D: { text: "Plan the structure and process", type: "S" },
        },
    },
    {
        id: 23,
        question: "What bothers you the most in group projects?",
        options: {
            A: { text: "Lack of urgency", type: "D" },
            B: { text: "Lack of collaboration", type: "C" },
            C: { text: "Conflicts or aggressive people", type: "A" },
            D: { text: "Improper planning", type: "S" },
        },
    },
    {
        id: 24,
        question: "Your risk-taking appetite is:",
        options: {
            A: { text: "High - I enjoy bold moves", type: "D" },
            B: { text: "Moderate - depends on people involved", type: "C" },
            C: { text: "Low - I prefer predictable outcomes", type: "A" },
            D: { text: "Very calculated and data-based", type: "S" },
        },
    },
    {
        id: 25,
        question: "When dealing with new people, you are:",
        options: {
            A: { text: "Assertive and confident", type: "D" },
            B: { text: "Friendly and talkative", type: "C" },
            C: { text: "Polite and reserved", type: "A" },
            D: { text: "Cautious and formal", type: "S" },
        },
    },
    {
        id: 26,
        question: "When assigned multiple tasks, you:",
        options: {
            A: { text: "Prioritize quickly and act fast", type: "D" },
            B: { text: "Seek help or collaborate", type: "C" },
            C: { text: "Work steadily, one at a time", type: "A" },
            D: { text: "Make a detailed checklist", type: "S" },
        },
    },
    {
        id: 27,
        question: "Your preferred role in innovation is:",
        options: {
            A: { text: "Driving change", type: "D" },
            B: { text: "Generating ideas", type: "C" },
            C: { text: "Ensuring smooth implementation", type: "A" },
            D: { text: "Analyzing feasibility", type: "S" },
        },
    },
    {
        id: 28,
        question: "Your time management style is:",
        options: {
            A: { text: "Focus on results, not process", type: "D" },
            B: { text: "Flexible and people-oriented", type: "C" },
            C: { text: "Steady and planned", type: "A" },
            D: { text: "Rigid and structured", type: "S" },
        },
    },
    {
        id: 29,
        question: "How do you respond to new responsibilities?",
        options: {
            A: { text: "\"Give it to me - I'll handle it.\"", type: "D" },
            B: { text: "\"Let's work together on it!\"", type: "C" },
            C: { text: "\"I'll adjust slowly.\"", type: "A" },
            D: { text: "\"I need clarity and structure first.\"", type: "S" },
        },
    },
    {
        id: 30,
        question: "You feel most stressed when:",
        options: {
            A: { text: "You are not in control", type: "D" },
            B: { text: "You are isolated from people", type: "C" },
            C: { text: "You face sudden disruptions", type: "A" },
            D: { text: "You get incomplete or unclear information", type: "S" },
        },
    },
];
