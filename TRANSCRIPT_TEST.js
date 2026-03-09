// TRANSCRIPT TEST - Run this locally BEFORE deploying to Teams
// Tests if Gemini can process meeting transcripts

// Sample meeting transcript (simulating what Teams sends)
const sampleTranscript = `
Meeting: Q1 Budget Review
Date: March 9, 2026
Participants: Alice (Finance Lead), Bob (Engineering), Carol (Product)

[00:00] Alice: Hey everyone, let's go through the Q1 budget. We have $500k allocated.

[00:15] Bob: We should prioritize infrastructure upgrades. I'm requesting $150k for our new servers.

[00:45] Carol: I agree with Bob. Product also needs $100k for the new dashboard development.

[01:20] Alice: That's $250k so far. We have $250k left. Can you both submit detailed breakdowns by tomorrow?

[01:50] Bob: Sure, I'll have mine by EOD today. We also need to hire 2 engineers.

[02:15] Carol: Product hiring: we need 1 UX designer and 1 QA. Can that come from the remaining budget?

[02:45] Alice: Let's review in next week's meeting. Bob, send breakdown today. Carol, prepare hiring plan. 
         I'll compile and send the budget proposal to leadership tomorrow afternoon.

[03:00] Bob: Got it. My breakdown will include engineer salary projections.

[03:20] Carol: I'll add designer and QA costs plus their start dates.

[03:40] Alice: Perfect. Let's wrap up here.
`;

// Test 1: Can Summarizer handle the transcript?
console.log("=== TEST 1: SUMMARIZE MEETING ===");
console.log("Input: Meeting transcript (400+ words)");
console.log("Expected: Gemini generates summary with topics, participants, decisions");
console.log("Test transcript snippet:", sampleTranscript.substring(0, 150) + "...");

// Test 2: Can Action Items extract properly?
console.log("\n=== TEST 2: EXTRACT ACTION ITEMS ===");
console.log("Expected output from Gemini:");
// This is what Gemini SHOULD extract:
console.log(`
✅ Bob to submit infrastructure budget breakdown by EOD today
✅ Alice to compile budget proposal and send to leadership by tomorrow afternoon
✅ Carol to prepare hiring plan (1 UX designer + 1 QA) with costs
✅ Team to review hiring budget in next week's meeting
`);

// Test 3: Can Search find keywords across transcript?
console.log("\n=== TEST 3: SEARCH FOR KEYWORDS ===");
console.log("Search for: 'budget' or 'hiring'");
console.log("Expected: Gemini finds all mentions and provides context");

// Test 4: Real Teams Meeting Transcript Format
console.log("\n=== TEST 4: REAL TEAMS TRANSCRIPT FORMAT ===");
const teamsTranscript = {
  id: "meeting-abc123",
  meetingId: "meeting-xyz789",
  createdDateTime: "2026-03-09T11:00:00Z",
  participants: [
    { id: "user1", displayName: "Alice" },
    { id: "user2", displayName: "Bob" },
    { id: "user3", displayName: "Carol" }
  ],
  transcript: "Full meeting transcript text here...",
  recordingUrl: "https://teams.microsoft.com/recordings/abc123"
};
console.log("Teams provides this structure:", JSON.stringify(teamsTranscript, null, 2));

// HOW TO RUN THIS TEST:
console.log("\n=== HOW TO TEST LOCALLY ===");
console.log("1. Send to your bot: '@paNhari summarize [paste above transcript]'");
console.log("2. Bot should respond with:");
console.log("   - Summary of Q1 Budget Review meeting");
console.log("   - List of participants");
console.log("   - Key decisions made");
console.log("");
console.log("3. Send: '@paNhari find action items [paste transcript]'");
console.log("4. Bot should extract:");
console.log("   - All tasks assigned (who does what)");
console.log("   - Deadlines (by EOD, tomorrow, next week)");
console.log("   - Responsible parties");
console.log("");
console.log("✅ IF ALL TESTS PASS: Safe to deploy");
console.log("❌ IF TESTS FAIL: Debug before hosting");
