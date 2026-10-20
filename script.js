// Load jobs from jobs.js + localStorage (added via admin)
let allJobs = [...jobsData];
const saved = localStorage.getItem("mzansi_custom_jobs");
if (saved) {
    allJobs = [...allJobs, ...JSON.parse(saved)];
}

const grid = document.getElementById("jobsGrid");
const searchInput = document.getElementById("searchInput");
let activeType = "all";
let activeProvince = "all";

function renderJobs() {
    const q = searchInput.value.toLowerCase();
    const filtered = allJobs.filter(j => {
        const matchSearch = j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
        const matchType = activeType === "all" || j.type === activeType;
        const matchProv = activeProvince === "all" || j.province === activeProvince;
        return matchSearch && matchType && matchProv;
    });

    grid.innerHTML = filtered.map(job => `
        <div class="job-card" onclick="openJob(${job.id})">
            <span class="badge ${job.type.toLowerCase()}">${job.type}</span>
            <span class="badge">${job.province}</span>
            <h3>${job.title}</h3>
            <div class="meta">${job.company} • ${job.location}</div>
            <div class="meta">${job.salary} • ${job.posted}</div>
            <button class="apply-btn">View & Apply</button>
        </div>
    `).join("") || "<p>No jobs found. Try another search.</p>";
}

window.openJob = function(id) {
    const job = allJobs.find(j => j.id == id);
    if (!job) return;
    document.getElementById("modalBody").innerHTML = `
        <span class="badge">${job.type}</span>
        <h2 style="margin:12px 0">${job.title}</h2>
        <p><strong>${job.company}</strong> - ${job.location} - ${job.province}</p>
        <p style="margin:10px 0"><strong>${job.salary}</strong> • Posted ${job.posted}</p>
        <hr style="margin:15px 0">
        <h4>Job Description</h4>
        <p style="margin:10px 0;line-height:1.6">${job.description}</p>
        <h4 style="margin-top:15px">Requirements</h4>
        <ul style="margin:10px 20px">${job.requirements.map(r=>`<li>${r}</li>`).join("")}</ul>
        <div style="margin-top:20px">
            <a href="${job.applyLink}" target="_blank" style="display:block;text-align:center;padding:14px;background:#0a66c2;color:white;border-radius:8px;text-decoration:none;font-weight:bold">Apply on LinkedIn / Official Site</a>
            <p style="font-size:12px;color:#888;margin-top:8px;text-align:center">You will be redirected to official site. Mzansi Plugs is not the employer.</p>
        </div>
    `;
    document.getElementById("jobModal").classList.remove("hidden");
}

// Filters
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.dataset.filter !== undefined) {
            document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            activeType = btn.dataset.filter;
        }
        if (btn.dataset.province !== undefined) {
            document.querySelectorAll("[data-province]").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            activeProvince = btn.dataset.province;
        }
        renderJobs();
    });
});

searchInput.addEventListener("input", renderJobs);

// Modals
document.getElementById("closeModal").onclick = () => document.getElementById("jobModal").classList.add("hidden");
document.getElementById("closeAddModal").onclick = () => document.getElementById("addJobModal").classList.add("hidden");
document.getElementById("adminBtn").onclick = () => document.getElementById("addJobModal").classList.remove("hidden");

// Add Job Form
document.getElementById("addJobForm").addEventListener("submit", e => {
    e.preventDefault();
    const newJob = {
        id: Date.now(),
        title: document.getElementById("f_title").value,
        company: document.getElementById("f_company").value,
        location: document.getElementById("f_location").value,
        province: document.getElementById("f_province").value,
        type: document.getElementById("f_type").value,
        salary: document.getElementById("f_salary").value || "Not specified",
        posted: "Just now",
        applyLink: document.getElementById("f_applyLink").value,
        description: document.getElementById("f_desc").value,
        requirements: document.getElementById("f_req").value.split("\n").filter(Boolean)
    };
    const custom = JSON.parse(localStorage.getItem("mzansi_custom_jobs") || "[]");
    custom.push(newJob);
    localStorage.setItem("mzansi_custom_jobs", JSON.stringify(custom));
    allJobs.push(newJob);
    alert("Job added! It will show on your site now.");
    document.getElementById("addJobModal").classList.add("hidden");
    renderJobs();
    e.target.reset();
});

renderJobs();