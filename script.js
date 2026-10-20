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

    grid.innerHTML = filtered.map(job => {
        const hasLink = (job.applyLink || "").trim();
        const hasEmail = (job.email || "").trim();
        let applyHint = "";
        if (hasLink && hasEmail) applyHint = "Link + Email";
        else if (hasLink) applyHint = "Online Apply";
        else if (hasEmail) applyHint = "Email CV";
        
        return `
        <div class="job-card" onclick="openJob(${job.id})">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                    <span class="badge ${job.type.toLowerCase()}">${job.type}</span>
                    <span class="badge province-badge">${job.province}</span>
                </div>
                ${applyHint ? `<span class="apply-hint">${applyHint}</span>` : ''}
            </div>
            <h3>${job.title}</h3>
            <div class="meta">${job.company} • ${job.location}</div>
            <div class="meta">${job.salary} • ${job.posted}</div>
            <button class="apply-btn">View & Apply</button>
        </div>
    `}).join("") || "<p>No jobs found. Try another search.</p>";
}

window.openJob = function(id) {
    const job = allJobs.find(j => j.id == id);
    if (!job) return;

    const applyMarkup = (() => {
      const link = (job.applyLink || "").trim();
      const email = (job.email || "").trim();
      let html = '<div class="apply-section">';

      if (link && email) {
        html += '<p style="font-size:14px;color:#444;margin-bottom:12px;font-weight:600;">Choose how to apply:</p>';
      }

      if (link) {
        html += `<a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-apply btn-online">
            <span>🔗</span> Apply Online
        </a>`;
      }

      if (email) {
        html += `<div class="email-box">
            <p><b>📧 Send CV to:</b> ${email}</p>
        </div>
        <a href="mailto:${email}?subject=${encodeURIComponent("Application for " + job.title)}&body=${encodeURIComponent("Hello,\n\nPlease find my CV attached for the position: " + job.title + " at " + job.company + ".\n\nThank you.")}" class="btn-apply btn-email">
            <span>✉️</span> Email CV Now
        </a>`;
      }

      if (!link && !email) {
        html += "<p>No application method provided.</p>";
      }

      html += '</div>';
      return html;
    })();

    document.getElementById("modalBody").innerHTML = `
        <span class="badge ${job.type.toLowerCase()}">${job.type}</span>
        <h2 style="margin:12px 0">${job.title}</h2>
        <p><strong>${job.company}</strong> - ${job.location} - ${job.province}</p>
        <p style="margin:10px 0"><strong>${job.salary}</strong> • Posted ${job.posted}</p>
        <hr style="margin:15px 0;border:none;border-top:1px solid #e5e7eb;">
        <h4>Job Description</h4>
        <p style="margin:10px 0;line-height:1.6">${job.description}</p>
        <h4 style="margin-top:15px">Requirements</h4>
        <ul style="margin:10px 20px;line-height:1.7;">${(job.requirements || []).map(r => `<li>${r}</li>`).join("")}</ul>
        <div style="margin-top:24px">
            ${applyMarkup}
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

// Close modal on outside click
window.addEventListener("click", (e) => {
    if (e.target.id === "jobModal") document.getElementById("jobModal").classList.add("hidden");
    if (e.target.id === "addJobModal") document.getElementById("addJobModal").classList.add("hidden");
});

// Add Job Form - NOW SUPPORTS BOTH LINK + EMAIL
document.getElementById("addJobForm").addEventListener("submit", e => {
    e.preventDefault();
    const applyLink = document.getElementById("f_applyLink").value.trim();
    const email = document.getElementById("f_email").value.trim();

    if (!applyLink && !email) {
        alert("Please add at least ONE: Apply Link OR Email CV. You can add both if you want!");
        return;
    }

    const newJob = {
        id: Date.now(),
        title: document.getElementById("f_title").value,
        company: document.getElementById("f_company").value,
        location: document.getElementById("f_location").value,
        province: document.getElementById("f_province").value,
        type: document.getElementById("f_type").value,
        salary: document.getElementById("f_salary").value || "Not specified",
        posted: "Just now",
        applyLink: applyLink,
        email: email,
        description: document.getElementById("f_desc").value,
        requirements: document.getElementById("f_req").value.split("\n").filter(Boolean)
    };
    const custom = JSON.parse(localStorage.getItem("mzansi_custom_jobs") || "[]");
    custom.push(newJob);
    localStorage.setItem("mzansi_custom_jobs", JSON.stringify(custom));
    allJobs.push(newJob);
    alert("Job added! It will show on your site now. " + (applyLink && email ? "Both Link + Email enabled." : ""));
    document.getElementById("addJobModal").classList.add("hidden");
    renderJobs();
    e.target.reset();
});

renderJobs();