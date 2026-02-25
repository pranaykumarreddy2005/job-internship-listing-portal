// Load jobs after page loads
document.addEventListener("DOMContentLoaded", loadJobs);

/* ================= LOAD JOBS ================= */
function loadJobs() {
  fetch("http://localhost:3000/jobs")
    .then(res => res.json())
    .then(data => displayJobs(data))
    .catch(err => console.error(err));
}

/* ================= DISPLAY JOBS ================= */
function displayJobs(jobs) {
  const jobsDiv = document.getElementById("jobs");

  jobsDiv.innerHTML = jobs.map(j => `
    <div class="card">
      <h3>${j.title}</h3>
      <p>${j.company} | ${j.location}</p>

      <button onclick="bookmark(${j.job_id})">Bookmark</button>

      <!-- pass job_id -->
      <a href="apply.html?job_id=${j.job_id}">Apply</a>
    </div>
  `).join("");
}

/* ================= SEARCH ================= */
function searchJobs() {
  const q = document.getElementById("search").value;

  fetch(`http://localhost:3000/jobs/search?q=${q}`)
    .then(res => res.json())
    .then(data => displayJobs(data))
    .catch(err => console.error(err));
}

/* ================= BOOKMARK ================= */
function bookmark(id) {
  fetch("http://localhost:3000/bookmark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: id })
  })
  .then(() => alert("Job bookmarked ✅"))
  .catch(err => console.error(err));
}

/* ================= ROLE-BASED FIELDS ================= */
function showFields() {
  const web = document.getElementById("web");
  const data = document.getElementById("data");
  const cloud = document.getElementById("cloud");

  web.style.display = "none";
  data.style.display = "none";
  cloud.style.display = "none";

  const role = document.getElementById("role").value;

  if (role === "Web Developer") web.style.display = "block";
  else if (role === "Data Analyst") data.style.display = "block";
  else if (role === "Cloud Engineer") cloud.style.display = "block";
}