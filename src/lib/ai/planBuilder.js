/**
 * planBuilder.js
 * Core AI planning logic — pure functions, no HTTP coupling.
 * Combines exam urgency + NLP prompt hints to build a priority-weighted study plan prompt.
 */

// ─── Priority Extraction ────────────────────────────────────────────────────

/**
 * Scan the user's natural language prompt for priority signals.
 * Returns a map of { subjectKeyword (lowercase) → multiplier }
 * e.g. { "dsa": 1.5, "math": 0.5 }
 */
export function extractPromptPriorities(userPrompt) {
  const priorities = {};
  if (!userPrompt?.trim()) return priorities;

  const text = userPrompt.toLowerCase();

  const HIGH_PATTERNS = [
    /focus (?:more )?on ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /prioritize ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /more (?:time (?:on|for) )?([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /emphasize ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /important[:\s]+([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
  ];

  const LOW_PATTERNS = [
    /less (?:time (?:on|for) )?([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /skip ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /ignore ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /light (?:on )?([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
    /not (?:much )?focus on ([a-z][a-z0-9\s]*?)(?:\s*,|\s+and|\s*$)/gi,
  ];

  const applyPatterns = (patterns, multiplier) => {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Take the first meaningful word of the match (the subject keyword)
        const keyword = match[1].trim().split(/\s+/)[0];
        if (keyword.length >= 2) {
          priorities[keyword] = multiplier;
        }
      }
    }
  };

  applyPatterns(HIGH_PATTERNS, 1.5);
  applyPatterns(LOW_PATTERNS, 0.5); // Low overrides high if both found

  return priorities;
}

// ─── Priority Score Computation ─────────────────────────────────────────────

/**
 * Compute a priority score for each topic by combining:
 *  1. Exam urgency: score = 100 / daysLeft (closer exam → higher score)
 *  2. User hint multiplier from NLP extraction
 *  3. Strength modifier: weak topics need more time (×1.3)
 *
 * Returns sorted array (highest priority first):
 * [{ subjectName, topicName, strength, priorityScore, priorityLabel }]
 */
export function computePriorities(subjects, topics, exams, userPrompt) {
  const promptHints = extractPromptPriorities(userPrompt);

  // Build base subject scores from exam urgency
  const subjectBaseScore = {};
  for (const subject of subjects || []) {
    subjectBaseScore[subject.id] = 10; // Default base score if no exam
  }

  for (const exam of exams || []) {
    const subjectId = exam.subject_id;
    const daysLeft = exam.daysLeft ?? exam.days_left ?? 999;
    const urgency = daysLeft > 0 ? Math.round(100 / daysLeft) : 100;
    subjectBaseScore[subjectId] = Math.max(subjectBaseScore[subjectId] || 0, urgency);
  }

  // Apply NLP multipliers matching subject names
  const getMultiplier = (subjectName) => {
    const nameLower = subjectName.toLowerCase();
    for (const [keyword, mult] of Object.entries(promptHints)) {
      if (nameLower.includes(keyword) || keyword.includes(nameLower.split(" ")[0])) {
        return mult;
      }
    }
    return 1;
  };

  // Strength modifier: weaker → needs more time
  const strengthModifier = { weak: 1.3, medium: 1.0, strong: 0.8 };

  const prioritizedTopics = (topics || []).map((topic) => {
    const subject = (subjects || []).find((s) => s.id === topic.subject_id);
    const subjectName = subject?.name || "General";
    const baseScore = subjectBaseScore[topic.subject_id] || 10;
    const multiplier = getMultiplier(subjectName);
    const strMod = strengthModifier[topic.strength] ?? 1.0;
    const priorityScore = Math.round(baseScore * multiplier * strMod);

    const priorityLabel =
      priorityScore >= 50 ? "high" : priorityScore >= 20 ? "medium" : "low";

    return {
      subjectName,
      topicName: topic.name,
      strength: topic.strength || "medium",
      priorityScore,
      priorityLabel,
    };
  });

  return prioritizedTopics.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

/**
 * Build the full structured prompt sent to Groq.
 * Returns a string that instructs the AI to return a specific JSON schema.
 *
 * @param {object} params
 * @param {Array}  params.subjects       - [{ id, name }]
 * @param {Array}  params.topics         - [{ id, subject_id, name, strength }]
 * @param {Array}  params.exams          - [{ subject_id, exam_date, daysLeft, subjects: { name } }]
 * @param {string} params.userPrompt     - Natural language instructions from user
 * @param {number} params.studyDuration  - Number of days to plan for
 * @param {string} params.currentDate    - Today's date (YYYY-MM-DD)
 */
export function buildPlanPrompt({ subjects, topics, exams, userPrompt, studyDuration, currentDate }) {
  const prioritized = computePriorities(subjects, topics, exams, userPrompt);

  const examLines =
    (exams || [])
      .map((e) => {
        const name = e.subjects?.name || subjects?.find((s) => s.id === e.subject_id)?.name || "Unknown";
        const daysLeft = e.daysLeft ?? e.days_left ?? "N/A";
        return `  - ${name}: exam on ${e.exam_date} (${daysLeft} days away)`;
      })
      .join("\n") || "  - No upcoming exams";

  const topicLines = prioritized
    .map(
      (t) =>
        `  - [${t.priorityLabel.toUpperCase()}] ${t.subjectName} > ${t.topicName}` +
        ` | strength: ${t.strength} | priority score: ${t.priorityScore}`
    )
    .join("\n");

  return `You are an expert AI study planner. Your job is to generate a structured, realistic study schedule.

TODAY: ${currentDate}
PLAN DURATION: ${studyDuration} days
USER INSTRUCTIONS: "${userPrompt?.trim() || "No special instructions provided — use exam urgency to prioritize."}"

SUBJECTS: ${(subjects || []).map((s) => s.name).join(", ") || "None"}

PRIORITIZED TOPICS (sorted by urgency + user preference, higher score = needs more time):
${topicLines || "  - No topics available"}

UPCOMING EXAMS:
${examLines}

SCHEDULING RULES:
1. Distribute all topics across ${studyDuration} days — high-priority topics appear more frequently.
2. Each session slot is 45–90 minutes. Schedule 3–5 slots per day.
3. Add a 10–15 min break after each slot (reflect in startTime/endTime).
4. Start each day at 09:00.
5. Weak-strength topics must always get at least one dedicated slot.
6. Strictly follow the user's priority instructions (focus more / less on subjects).
7. Days closer to an exam should include more of that exam's subject.
8. Write a summary explaining your prioritization decisions.

RETURN ONLY valid JSON — no markdown, no explanation outside the JSON object.
Use this exact schema:

{
  "totalDays": ${studyDuration},
  "hoursPerDay": <number — average hours per day>,
  "summary": "<2–3 sentence explanation of how topics were prioritized>",
  "days": [
    {
      "day": <1-based day number>,
      "date": "<YYYY-MM-DD — starting from ${currentDate}>",
      "totalHours": <number>,
      "slots": [
        {
          "subject": "<subject name>",
          "topic": "<topic name>",
          "startTime": "<HH:MM>",
          "endTime": "<HH:MM>",
          "durationMinutes": <number>,
          "priority": "<high | medium | low>"
        }
      ]
    }
  ]
}`;
}

// ─── Pure Plan Prompt Builder ──────────────────────────────────────────────

/**
 * Instructs the AI that it is generating everything from scratch.
 *
 * @param {string} userPrompt - Natural language instructions from user
 * @param {number} studyDuration - Number of days to plan for
 * @param {string} currentDate - Today's date (YYYY-MM-DD)
 */
export function buildPurePlanPrompt(userPrompt, studyDuration, currentDate) {
  return `You are an expert AI study planner.

Your job is to generate a structured study plan STRICTLY based on the user's input.
You must FOLLOW the user's instructions precisely and MUST NOT invent unrelated topics.

---

TODAY: ${currentDate}
PLAN DURATION: ${studyDuration} days
USER INPUT: "${userPrompt?.trim() || "Create a general study plan."}"

---

## 🔒 INPUT INTERPRETATION (VERY IMPORTANT)

- Extract:
  • Subjects mentioned by the user  
  • Topics explicitly mentioned by the user  
  • Exam deadlines (if mentioned)

### Example:
"I have DSA exam in 5 days topics Arrays Stack BST Linked List"
→ Subject: Data Structures and Algorithms  
→ Topics: Arrays, Stack, BST, Linked List  
→ Exam: within 5 days  

---

## ❗ STRICT USER CONSTRAINT RULES

1. If the user provides topics → USE ONLY those topics  
2. DO NOT generate unrelated topics  
3. DO NOT add topics like Graph Theory, DP, etc unless explicitly mentioned  
4. Always prioritize subjects with upcoming exams  
5. Allocate MORE time to topics mentioned by the user  
6. If no topics are provided → then and only then generate reasonable ones  

---

## 📅 SCHEDULING RULES

1. Distribute topics across ${studyDuration} days  
2. Each day should have 3–5 study sessions  
3. Each session duration: 45–90 minutes  
4. Start each day at 09:00  
5. Add 10–15 minute breaks between sessions  
6. Days closer to exam should have:
   → more revision  
   → more practice sessions  
7. Ensure ALL user-provided topics are covered multiple times before exam  

---

If user mentions a subject without topics:
- Generate minimal introductory topics
- Assign LOW priority to those topics
- Allocate significantly less time compared to user-specified topics

## 🧠 PRIORITY RULES

- High priority:
  • Topics mentioned by user  
  • Subjects with exams soon  

- Medium priority:
  • Supporting topics (ONLY if user did not specify enough topics)

- Low priority:
  • Optional revision  

---

## 🔥 PRIORITY ENFORCEMENT (CRITICAL)

1. Subjects with explicitly listed topics from the user MUST be treated as HIGH priority
2. Subjects mentioned without topics are LOW priority
3. At least 70–80% of total study time must go to high-priority subjects
4. Low-priority subjects should have fewer sessions and shorter durations
5. NEVER give equal time to both unless user explicitly says so

## ⚠️ IMPORTANT

- DO NOT ignore user input  
- DO NOT hallucinate unrelated content  
- DO NOT output text explanation outside JSON  
- Follow schema EXACTLY  

---

## 📤 OUTPUT FORMAT (STRICT JSON ONLY)

{
  "totalDays": ${studyDuration},
  "hoursPerDay": <number>,
  "summary": "<short explanation of how plan follows user input>",
  "subjects": [
    { "name": "<subject name>" }
  ],
  "topics": [
    { "subjectName": "<subject name>", "name": "<topic name>" }
  ],
  "exams": [
    { "subjectName": "<subject name>", "examDate": "<YYYY-MM-DD>" }
  ],
  "days": [
    {
      "day": <1-based day>,
      "date": "<YYYY-MM-DD>",
      "totalHours": <number>,
      "slots": [
        {
          "subjectName": "<subject name>",
          "topic": "<topic name>",
          "startTime": "<HH:MM>",
          "endTime": "<HH:MM>",
          "durationMinutes": <number>,
          "priority": "<high | medium | low>",
          "completed": false
        }
      ]
    }
  ]
}`;
}

