const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dcas-unified";

// Minimal Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: "student" },
  created_at: { type: Date, default: Date.now },
  result: {
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    score: {
      primary: String,
      secondary: String,
    },
    completed_at: Date,
  },
  meta: {
      batch: String,
      institution: String,
  }
});

const SessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["started", "completed", "abandoned"] },
  score: {
      primary: String,
      secondary: String,
  },
  completed_at: Date,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

async function benchmark() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const USER_COUNT = 500; // 500 users for benchmark

    // 1. Seed Data
    console.log(`Seeding ${USER_COUNT} users...`);
    await User.deleteMany({ email: { $regex: /^bench_user_/ } });

    const users = [];
    const sessions = [];
    const userIds = [];

    for (let i = 0; i < USER_COUNT; i++) {
      const userId = new mongoose.Types.ObjectId();
      userIds.push(userId);
      users.push({
        _id: userId,
        email: `bench_user_${i}_${Date.now()}@example.com`,
        name: `Benchmark User ${i}`,
        role: 'student',
        created_at: new Date(),
        meta: {
            batch: `Batch ${i % 5}`,
            institution: `Inst ${i % 3}`
        },
        // Intentionally leaving result undefined to trigger N+1 fallback logic
      });

      if (i % 2 === 0) { // 50% have completed sessions
        sessions.push({
          user_id: userId,
          status: 'completed',
          score: { primary: 'D', secondary: 'C' },
          completed_at: new Date()
        });
      }
    }

    await User.insertMany(users);
    await Session.insertMany(sessions);
    console.log("Seeding complete.");

    // 2. Measure "Old" Way (N+1 simulation)
    console.log("Measuring Baseline (N+1) - fetching all users...");
    const start = performance.now();

    // Fetch users
    const fetchedUsers = await User.find({ email: { $regex: /^bench_user_/ } }).sort({ created_at: -1 }).lean();

    // Simulate N+1
    await Promise.all(fetchedUsers.map(async (u) => {
      let score = null;
      let status = "Not Attempted";

      if (u.result?.score?.primary) {
          // embedded
      } else {
          const session = await Session.findOne({ user_id: u._id, status: "completed" }).sort({ completed_at: -1 }).lean();
          if (session) {
              status = "Completed";
              // Simulate Backfill update
               await User.findByIdAndUpdate(u._id, {
                $set: {
                  result: {
                    session_id: session._id,
                    score: session.score,
                    completed_at: session.completed_at,
                  },
                },
              });
          }
      }
      return { ...u, status };
    }));

    const end = performance.now();
    console.log(`Baseline Time: ${(end - start).toFixed(2)}ms for ${fetchedUsers.length} users`);

    // Reset data for Optimized test (clear result fields)
    console.log("Resetting data for optimized run...");
    await User.updateMany(
        { _id: { $in: userIds } },
        { $unset: { result: "" } }
    );

    // 3. Measure "New" Way (Optimized)
    console.log("Measuring Optimized Way (Batching + Pagination)...");
    const startOpt = performance.now();

    // Simulate Pagination (fetching only 50)
    const PAGE_SIZE = 50;
    const fetchedUsersOpt = await User.find({ email: { $regex: /^bench_user_/ } })
        .sort({ created_at: -1 })
        .limit(PAGE_SIZE) // Pagination
        .lean();

    const pagedUserIds = fetchedUsersOpt.map(u => u._id);

    // Bulk fetch sessions for ONLY the paged users
    const allSessions = await Session.find({
        user_id: { $in: pagedUserIds },
        status: "completed"
    }).lean();

    const sessionMap = new Map();
    allSessions.forEach(s => {
        const uid = s.user_id.toString();
        if (!sessionMap.has(uid) || new Date(s.completed_at) > new Date(sessionMap.get(uid).completed_at)) {
            sessionMap.set(uid, s);
        }
    });

    const resultsOpt = fetchedUsersOpt.map(u => {
        const session = sessionMap.get(u._id.toString());
        // ... mapping logic
        return u;
    });

    const endOpt = performance.now();
    console.log(`Optimized Time (Page 1 of 50 users): ${(endOpt - startOpt).toFixed(2)}ms`);

    // Cleanup
    console.log("Cleaning up...");
    await User.deleteMany({ email: { $regex: /^bench_user_/ } });
    await Session.deleteMany({ user_id: { $in: userIds } });

    await mongoose.disconnect();
  } catch (e) {
      console.error(e);
  }
}

benchmark();
