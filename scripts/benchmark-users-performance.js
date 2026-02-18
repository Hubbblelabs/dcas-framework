const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://kavinnandha:kavin4343@cluster0.ipg5jxa.mongodb.net/dcas-unified";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    role: { type: String, default: "student" },
    result: {
      session_id: mongoose.Schema.Types.ObjectId,
      score: Object,
      completed_at: Date,
    },
    created_at: { type: Date, default: Date.now },
  },
  { strict: false },
);

const SessionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: String,
    completed_at: Date,
    score: Object,
  },
  { strict: false },
);

async function benchmarkNew() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Session =
      mongoose.models.Session || mongoose.model("Session", SessionSchema);

    console.log("Starting Benchmark of NEW logic (N+1 Fix) for one page...");

    // Simulate pagination params
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const start = process.hrtime();

    // 1. Fetch Users (Paginated)
    const users = await User.find({ role: "student" })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 2. Identify users needing session
    const usersNeedingSession = users.filter((u) => !u.result?.score?.primary);
    const userIdsNeedingSession = usersNeedingSession.map((u) => u._id);

    // 3. Batch Fetch Sessions
    let sessionMap = {};
    if (userIdsNeedingSession.length > 0) {
      const sessions = await Session.find({
        user_id: { $in: userIdsNeedingSession },
        status: "completed",
      }).lean();

      sessions.forEach((s) => {
        const uid = s.user_id.toString();
        if (
          !sessionMap[uid] ||
          new Date(s.completed_at) > new Date(sessionMap[uid].completed_at)
        ) {
          sessionMap[uid] = s;
        }
      });
    }

    // 4. Map Results
    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        let score = null;
        let status = "Not Attempted";

        if (u.result?.score?.primary) {
          status = "Completed";
        } else {
          const session = sessionMap[u._id.toString()];
          if (session) {
            status = "Completed";
            // Simulate async backfill (fire and forget)
            // User.findByIdAndUpdate(...)
          }
        }
        return { ...u, status };
      }),
    );

    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(2);

    console.log(`-------------------------------------------`);
    console.log(`Benchmark Results (New Logic):`);
    console.log(
      `Fetched and processed ${formattedUsers.length} users (Page 1).`,
    );
    console.log(`Time Taken: ${timeInMs} ms`);
    console.log(`-------------------------------------------`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Benchmark failed:", error);
    process.exit(1);
  }
}

benchmarkNew();
