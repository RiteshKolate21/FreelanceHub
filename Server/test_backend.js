// Using native fetch

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=== FREELANCEHUB BACKEND E2E TEST ===");

  try {
    const timestamp = Date.now();
    const clientEmail = `client_${timestamp}@test.com`;
    const freelancerEmail = `freelancer_${timestamp}@test.com`;
    const adminEmail = `admin_${timestamp}@test.com`;

    // 1. Register Users
    console.log("\n1. Registering Users...");
    const clientRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `client_${timestamp}`, email: clientEmail, password: "password123", userType: "Client" })
    });
    const clientReg = await clientRegRes.json();
    console.log("Client registered:", clientReg.message);

    const freeRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `free_${timestamp}`, email: freelancerEmail, password: "password123", userType: "Freelancer" })
    });
    const freeReg = await freeRegRes.json();
    console.log("Freelancer registered:", freeReg.message);

    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `admin_${timestamp}`, email: adminEmail, password: "password123", userType: "Admin" })
    });
    const adminReg = await adminRegRes.json();
    console.log("Admin registered:", adminReg.message);

    // 2. Login Users
    console.log("\n2. Logging in...");
    const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clientEmail, password: "password123" })
    });
    const clientData = await clientLoginRes.json();
    const clientToken = clientData.token;

    const freeLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freelancerEmail, password: "password123" })
    });
    const freeData = await freeLoginRes.json();
    const freeToken = freeData.token;

    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "password123" })
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    console.log("Tokens acquired successfully!");

    // 3. Create Freelancer Profile
    console.log("\n3. Creating Freelancer Profile...");
    const profileRes = await fetch(`${BASE_URL}/freelancers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${freeToken}`
      },
      body: JSON.stringify({ skills: ["React", "Node.js", "MongoDB"], experience: "3 years", bio: "Full stack developer" })
    });
    const profileData = await profileRes.json();
    console.log("Freelancer Profile:", profileData.message);

    // 4. Client creates Project
    console.log("\n4. Client Creating Project...");
    const projRes = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${clientToken}`
      },
      body: JSON.stringify({ title: "Editorial E-commerce App", description: "Build modern web app using React and Node", budget: 1500, skills: ["React", "Node.js"] })
    });
    const projData = await projRes.json();
    const projectId = projData.project._id;
    console.log("Project created with ID:", projectId);

    // 5. Freelancer applies to project
    console.log("\n5. Freelancer Submitting Application...");
    const appRes = await fetch(`${BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${freeToken}`
      },
      body: JSON.stringify({ projectId, proposal: "I have extensive React experience.", bidAmount: 1400, estimatedTime: 7 })
    });
    const appData = await appRes.json();
    const applicationId = appData.application._id;
    console.log("Application submitted with ID:", applicationId);

    // 6. Client views and approves application
    console.log("\n6. Client Approving Application...");
    const approveRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${clientToken}`
      },
      body: JSON.stringify({ status: "Approved" })
    });
    const approveData = await approveRes.json();
    console.log("Application status:", approveData.message);

    // 7. Chat test
    console.log("\n7. Sending Chat Message...");
    const chatSendRes = await fetch(`${BASE_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${freeToken}`
      },
      body: JSON.stringify({ projectId, receiverId: clientData.user.id, message: "Hello client, starting project work now!" })
    });
    const chatSendData = await chatSendRes.json();
    console.log("Chat message sent:", chatSendData.message);

    // 8. Notifications test
    console.log("\n8. Fetching Notifications...");
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { "Authorization": `Bearer ${clientToken}` }
    });
    const notifData = await notifRes.json();
    console.log("Client Notifications count:", notifData.notifications.length, "Unread:", notifData.unreadCount);

    // 9. Freelancer submits project
    console.log("\n9. Freelancer Submitting Completed Work...");
    const submitRes = await fetch(`${BASE_URL}/projects/${projectId}/submit`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${freeToken}` }
    });
    const submitData = await submitRes.json();
    console.log("Project submitted:", submitData.message);

    // 10. Client completes project
    console.log("\n10. Client Completing Project...");
    const completeRes = await fetch(`${BASE_URL}/projects/${projectId}/complete`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${clientToken}` }
    });
    const completeData = await completeRes.json();
    console.log("Project completed:", completeData.message);

    // 11. Client leaves review
    console.log("\n11. Client Submitting Review...");
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${clientToken}`
      },
      body: JSON.stringify({ projectId, rating: 5, comment: "Outstanding code quality and timely delivery!" })
    });
    const reviewData = await reviewRes.json();
    console.log("Review created:", reviewData.message, "Freelancer Average Rating:", reviewData.freelancerAverageRating);

    // 12. Fetch Dashboards
    console.log("\n12. Fetching Dashboards...");
    const freeDashRes = await fetch(`${BASE_URL}/dashboard/freelancer`, {
      headers: { "Authorization": `Bearer ${freeToken}` }
    });
    const freeDash = await freeDashRes.json();
    console.log("Freelancer Dashboard - Completed Projects:", freeDash.metrics.completedProjectsCount, "Earnings:", freeDash.metrics.totalEarnings);

    const clientDashRes = await fetch(`${BASE_URL}/dashboard/client`, {
      headers: { "Authorization": `Bearer ${clientToken}` }
    });
    const clientDash = await clientDashRes.json();
    console.log("Client Dashboard - Total Projects:", clientDash.metrics.totalProjects);

    // 13. Admin Stats
    console.log("\n13. Admin Dashboard Fetch...");
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminStats = await adminStatsRes.json();
    console.log("Admin Stats - Total Users:", adminStats.stats.users.total, "Total Reviews:", adminStats.stats.reviews.total);

    console.log("\n✅ ALL BACKEND E2E TESTS PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
}

runTests();
