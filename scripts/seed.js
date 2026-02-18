const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI;

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: [
      {
        label: { type: String, required: true },
        text: { type: String, required: true },
        dcas_type: { type: String, enum: ["D", "C", "A", "S"], required: true },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const AssessmentTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    isLive: { type: Boolean, default: false },
    settings: {
      language: { type: String, default: "en" },
      timeLimit: { type: Number, default: 0 },
      shuffleQuestions: { type: Boolean, default: true },
      showResults: { type: Boolean, default: true },
    },
    selection_method: {
      type: String,
      enum: ["manual", "random"],
      default: "manual",
    },
    question_count: { type: Number, default: 30 },
  },
  { timestamps: true },
);

const questions = [
  {
    text: "When faced with a challenge at work or school, what do you do first?",
    options: [
      {
        label: "A",
        text: "Take charge and make a quick decision",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Discuss it with your team for ideas",
        dcas_type: "C",
      },
      { label: "C", text: "Think carefully before reacting", dcas_type: "A" },
      {
        label: "D",
        text: "Analyze the pros and cons logically",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "In a team project, what role do you naturally take?",
    options: [
      { label: "A", text: "The leader who delegates tasks", dcas_type: "D" },
      {
        label: "B",
        text: "The motivator who keeps energy high",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "The reliable one who completes tasks",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "The planner who organizes everything",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "How do you handle conflict in a group?",
    options: [
      { label: "A", text: "Address it directly and move on", dcas_type: "D" },
      {
        label: "B",
        text: "Try to find a win-win through conversation",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Avoid it and hope it resolves on its own",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Look at the facts to find the best solution",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "What motivates you the most?",
    options: [
      { label: "A", text: "Winning and achieving goals", dcas_type: "D" },
      {
        label: "B",
        text: "Being liked and appreciated by others",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Stability and a peaceful environment",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Accuracy and doing things the right way",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "How do you react to sudden changes?",
    options: [
      { label: "A", text: "Adapt quickly and take control", dcas_type: "D" },
      {
        label: "B",
        text: "Get excited about new possibilities",
        dcas_type: "C",
      },
      { label: "C", text: "Feel uneasy but go along with it", dcas_type: "A" },
      {
        label: "D",
        text: "Evaluate whether the change makes sense",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "On a weekend, you'd prefer to:",
    options: [
      {
        label: "A",
        text: "Work on a personal goal or project",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Hang out with friends or attend events",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Relax at home or with close family",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Read, research, or organize your space",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "Which word best describes you?",
    options: [
      { label: "A", text: "Bold", dcas_type: "D" },
      { label: "B", text: "Friendly", dcas_type: "C" },
      { label: "C", text: "Calm", dcas_type: "A" },
      { label: "D", text: "Precise", dcas_type: "S" },
    ],
  },
  {
    text: "When you communicate, you tend to:",
    options: [
      { label: "A", text: "Be direct and to the point", dcas_type: "D" },
      { label: "B", text: "Be enthusiastic and persuasive", dcas_type: "C" },
      { label: "C", text: "Listen more than you speak", dcas_type: "A" },
      { label: "D", text: "Use data and logical explanations", dcas_type: "S" },
    ],
  },
  {
    text: "When making a decision, you usually:",
    options: [
      { label: "A", text: "Decide fast and with confidence", dcas_type: "D" },
      { label: "B", text: "Ask others for their opinions", dcas_type: "C" },
      {
        label: "C",
        text: "Take your time and consider carefully",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Research thoroughly before choosing",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "What kind of feedback do you prefer?",
    options: [
      {
        label: "A",
        text: "Straight and honest — even if it's tough",
        dcas_type: "D",
      },
      { label: "B", text: "Positive and encouraging", dcas_type: "C" },
      { label: "C", text: "Gentle and private", dcas_type: "A" },
      { label: "D", text: "Specific and fact-based", dcas_type: "S" },
    ],
  },
  {
    text: "In a meeting, you usually:",
    options: [
      { label: "A", text: "Lead the discussion", dcas_type: "D" },
      { label: "B", text: "Speak up and share ideas", dcas_type: "C" },
      {
        label: "C",
        text: "Agree with the group and stay supportive",
        dcas_type: "A",
      },
      { label: "D", text: "Take detailed notes and analyze", dcas_type: "S" },
    ],
  },
  {
    text: "When under stress, you tend to:",
    options: [
      {
        label: "A",
        text: "Become more demanding and controlling",
        dcas_type: "D",
      },
      { label: "B", text: "Talk more and seek attention", dcas_type: "C" },
      { label: "C", text: "Withdraw and become passive", dcas_type: "A" },
      { label: "D", text: "Over-analyze and become critical", dcas_type: "S" },
    ],
  },
  {
    text: "What type of work environment do you prefer?",
    options: [
      { label: "A", text: "Fast-paced and results-oriented", dcas_type: "D" },
      { label: "B", text: "Fun, social, and collaborative", dcas_type: "C" },
      { label: "C", text: "Calm, structured, and supportive", dcas_type: "A" },
      { label: "D", text: "Organized, quiet, and focused", dcas_type: "S" },
    ],
  },
  {
    text: "What's your biggest fear?",
    options: [
      {
        label: "A",
        text: "Losing control or being taken advantage of",
        dcas_type: "D",
      },
      { label: "B", text: "Being ignored or rejected", dcas_type: "C" },
      { label: "C", text: "Sudden change or instability", dcas_type: "A" },
      { label: "D", text: "Being wrong or making mistakes", dcas_type: "S" },
    ],
  },
  {
    text: "You feel most productive when:",
    options: [
      {
        label: "A",
        text: "You're in charge and setting the pace",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "You're working with enthusiastic people",
        dcas_type: "C",
      },
      { label: "C", text: "Things are predictable and smooth", dcas_type: "A" },
      {
        label: "D",
        text: "You have a detailed plan to follow",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "When a friend is upset, you:",
    options: [
      { label: "A", text: "Give them a solution right away", dcas_type: "D" },
      {
        label: "B",
        text: "Cheer them up with humor or support",
        dcas_type: "C",
      },
      { label: "C", text: "Sit with them and listen quietly", dcas_type: "A" },
      {
        label: "D",
        text: "Help them think through the problem",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "What do people admire most about you?",
    options: [
      { label: "A", text: "Your determination and drive", dcas_type: "D" },
      { label: "B", text: "Your energy and charisma", dcas_type: "C" },
      { label: "C", text: "Your patience and loyalty", dcas_type: "A" },
      { label: "D", text: "Your intelligence and accuracy", dcas_type: "S" },
    ],
  },
  {
    text: "When working on a task, you:",
    options: [
      { label: "A", text: "Focus on the end result", dcas_type: "D" },
      { label: "B", text: "Brainstorm creative ideas", dcas_type: "C" },
      { label: "C", text: "Follow a step-by-step approach", dcas_type: "A" },
      { label: "D", text: "Check all the details twice", dcas_type: "S" },
    ],
  },
  {
    text: "If someone disagrees with you, you:",
    options: [
      { label: "A", text: "Stand firm and defend your point", dcas_type: "D" },
      {
        label: "B",
        text: "Try to persuade them enthusiastically",
        dcas_type: "C",
      },
      { label: "C", text: "Let it go to keep the peace", dcas_type: "A" },
      {
        label: "D",
        text: "Ask for data to support their argument",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "Which career sounds most appealing?",
    options: [
      { label: "A", text: "CEO or entrepreneur", dcas_type: "D" },
      { label: "B", text: "Public relations or event manager", dcas_type: "C" },
      { label: "C", text: "Counselor or teacher", dcas_type: "A" },
      { label: "D", text: "Data analyst or researcher", dcas_type: "S" },
    ],
  },
  {
    text: "When it comes to rules, you usually:",
    options: [
      { label: "A", text: "Prefer to make your own rules", dcas_type: "D" },
      { label: "B", text: "Follow them if they're not boring", dcas_type: "C" },
      {
        label: "C",
        text: "Respect and follow them consistently",
        dcas_type: "A",
      },
      { label: "D", text: "Ensure everyone follows them", dcas_type: "S" },
    ],
  },
  {
    text: "When learning something new, you prefer:",
    options: [
      {
        label: "A",
        text: "Jumping right in and figuring it out",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Learning through group discussions",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Going at your own pace with guidance",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Reading instructions and studying first",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "How would your friends describe you?",
    options: [
      { label: "A", text: "Ambitious and confident", dcas_type: "D" },
      { label: "B", text: "Fun-loving and talkative", dcas_type: "C" },
      { label: "C", text: "Dependable and kind", dcas_type: "A" },
      { label: "D", text: "Thoughtful and detail-oriented", dcas_type: "S" },
    ],
  },
  {
    text: "How do you feel about public speaking?",
    options: [
      { label: "A", text: "I enjoy it — I like to lead", dcas_type: "D" },
      { label: "B", text: "I love it — I enjoy the spotlight", dcas_type: "C" },
      {
        label: "C",
        text: "I'd rather not — I'm more of a listener",
        dcas_type: "A",
      },
      { label: "D", text: "I can do it if I've prepared well", dcas_type: "S" },
    ],
  },
  {
    text: "What kind of movie would you choose?",
    options: [
      {
        label: "A",
        text: "Action or thriller — fast-paced and bold",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Comedy or musical — fun and social",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Drama or family — emotional and meaningful",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Documentary or mystery — smart and logical",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "When managing your time, you:",
    options: [
      {
        label: "A",
        text: "Prioritize tasks by importance and act fast",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Tend to multitask and sometimes run late",
        dcas_type: "C",
      },
      {
        label: "C",
        text: "Prefer a steady routine with no surprises",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Make a detailed to-do list and follow it",
        dcas_type: "S",
      },
    ],
  },
  {
    text: "If you were an animal, you'd be:",
    options: [
      { label: "A", text: "A lion — strong and commanding", dcas_type: "D" },
      { label: "B", text: "A dolphin — social and playful", dcas_type: "C" },
      {
        label: "C",
        text: "A golden retriever — loyal and gentle",
        dcas_type: "A",
      },
      { label: "D", text: "An owl — wise and observant", dcas_type: "S" },
    ],
  },
  {
    text: "When setting goals, you:",
    options: [
      {
        label: "A",
        text: "Set ambitious, high-reaching goals",
        dcas_type: "D",
      },
      {
        label: "B",
        text: "Set goals that involve collaboration",
        dcas_type: "C",
      },
      { label: "C", text: "Set realistic, manageable goals", dcas_type: "A" },
      { label: "D", text: "Set precise, measurable goals", dcas_type: "S" },
    ],
  },
  {
    text: "Your ideal leader is someone who:",
    options: [
      { label: "A", text: "Is decisive and action-oriented", dcas_type: "D" },
      { label: "B", text: "Is inspiring and charismatic", dcas_type: "C" },
      { label: "C", text: "Is supportive and empathetic", dcas_type: "A" },
      { label: "D", text: "Is knowledgeable and competent", dcas_type: "S" },
    ],
  },
  {
    text: "What would you improve about yourself?",
    options: [
      { label: "A", text: "Being more patient with others", dcas_type: "D" },
      { label: "B", text: "Being more organized and focused", dcas_type: "C" },
      {
        label: "C",
        text: "Being more assertive and speaking up",
        dcas_type: "A",
      },
      {
        label: "D",
        text: "Being more flexible and open to change",
        dcas_type: "S",
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Question =
      mongoose.models.Question || mongoose.model("Question", QuestionSchema);
    const AssessmentTemplate =
      mongoose.models.AssessmentTemplate ||
      mongoose.model("AssessmentTemplate", AssessmentTemplateSchema);

    // Clear existing questions
    await Question.deleteMany({});
    console.log("Cleared existing questions");

    // Insert all questions
    const insertedQuestions = await Question.insertMany(
      questions.map((q) => ({ ...q, active: true })),
    );
    console.log(`Inserted ${insertedQuestions.length} questions`);

    // Create a default assessment template with all questions
    await AssessmentTemplate.deleteMany({});
    const template = await AssessmentTemplate.create({
      name: "DCAS Assessment - Default",
      description: "Default DCAS assessment with all 30 questions",
      questions: insertedQuestions.map((q) => q._id),
      isLive: true,
      settings: {
        language: "en",
        timeLimit: 0,
        shuffleQuestions: true,
        showResults: true,
      },
      selection_method: "manual",
      question_count: 30,
    });
    console.log(`Created default assessment template: ${template.name} (LIVE)`);

    await mongoose.disconnect();
    console.log("\nSeed complete!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
