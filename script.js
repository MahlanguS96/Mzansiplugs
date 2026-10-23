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

function formatClosingDate(dateStr) {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

function getClosingStatus(dateStr) {
    if (!dateStr) return { text: "", cls: "" };
    const today = new Date(); today.setHours(0,0,0,0);
    const close = new Date(dateStr); close.setHours(0,0,0,0);
    if (isNaN(close)) return { text: dateStr, cls: "" };
    const diffDays = Math.ceil((close - today) / (1000*60*60*24));
    if (diffDays < 0) return { text: `Closed on ${formatClosingDate(dateStr)}`, cls: "closed" };
    if (diffDays === 0) return { text: "Closes Today!", cls: "urgent" };
    if (diffDays === 1) return { text: "Closes Tomorrow", cls: "urgent" };
    if (diffDays <= 3) return { text: `Closes in ${diffDays} days`, cls: "urgent" };
    return { text: `Closes: ${formatClosingDate(dateStr)}`, cls: "" };
}

function shareLink(job) { return `https://saplugs.netlify.app/?job=${job.id}`; }
function shareText(job) { return `🔥 ${job.title} at ${job.company} | ${job.location} | ${job.salary}\nApply: ${shareLink(job)}\nVia Mzansi Plugs - saplugs.netlify.app`; }

window.shareWhatsApp = function(id) {
    const job = allJobs.find(j => j.id == id); if(!job) return;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText(job))}`;
    window.open(url, '_blank');
}
window.copyChannelPost = function(id) {
    const job = allJobs.find(j => j.id == id); if(!job) return;
    const closing = job.closingDate ? formatClosingDate(job.closingDate) : 'Not specified';
    const text = `🔥 NEW JOB ALERT - ${job.company.toUpperCase()}

📌 ${job.title}
📍 ${job.location} | ${job.province}
💰 ${job.salary}
🎓 ${(job.requirements||[]).slice(0,2).join(' | ')}
⏰ Closing: ${closing}

👉 Apply here:
${shareLink(job)}

📲 More jobs daily:
https://saplugs.netlify.app

Follow our channel for daily updates!

#MzansiPlugs #${job.province.replace(' ', '')}Jobs #${job.type} #JobsSA`;
    navigator.clipboard.writeText(text).then(()=>{
        alert('Copied! Now just paste it directly into your WhatsApp Channel - no typing needed!');
    }).catch(()=>{
        prompt('Copy this text for WhatsApp Channel:', text);
    });
}

window.shareFacebook = function(id) {
    const job = allJobs.find(j => j.id == id); if(!job) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink(job))}`;
    window.open(url, '_blank', 'width=600,height=400');
}

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
        
        const closing = getClosingStatus(job.closingDate);

        return `
        <div class="job-card" onclick="openJob(${job.id})">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                <div>
                    <span class="badge ${job.type.toLowerCase()}">${job.type}</span>
                    <span class="badge province-badge">${job.province}</span>
                </div>
                ${applyHint ? `<span class="apply-hint">${applyHint}</span>` : ''}
            </div>
            <h3>${job.title}</h3>
            <div class="meta">${job.company} • ${job.location}</div>
            <div class="meta">${job.salary} • ${job.posted}</div>
            ${closing.text ? `<div class="meta closing-meta ${closing.cls}">⏰ ${closing.text}</div>` : ''}
            <button class="apply-btn">View & Apply</button>
            <div class="card-share" onclick="event.stopPropagation()">
                <button onclick="shareWhatsApp(${job.id})" class="share-btn wa">💬 WhatsApp</button>
                <button onclick="shareFacebook(${job.id})" class="share-btn fb">📘 Facebook</button>
            </div>
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
        html += `<a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-apply btn-online"><span>🔗</span> Apply Online</a>`;
      }

      if (email) {
        html += `<div class="email-box"><p><b>📧 Send CV to:</b> ${email}</p></div>
        <a href="mailto:${email}?subject=${encodeURIComponent("Application for " + job.title)}" class="btn-apply btn-email"><span>✉️</span> Email CV Now</a>`;
      }

      if (!link && !email) html += "<p>No application method provided.</p>";
      html += '</div>';
      return html;
    })();

    const closing = getClosingStatus(job.closingDate);
    const closingDetailHtml = job.closingDate ? `
        <div class="closing-detail ${closing.cls}">
            ⏰ <strong>Closing Date:</strong> ${formatClosingDate(job.closingDate)} - ${closing.text}
        </div>
    ` : '';

    const shareHtml = `
        <div class="modal-share">
            <p style="font-weight:700;margin:20px 0 10px;">Share this job:</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button onclick="shareWhatsApp(${job.id})" class="share-btn wa big">💬 Share on WhatsApp</button>
                <button onclick="shareFacebook(${job.id})" class="share-btn fb big">📘 Share on Facebook</button>
            </div>
        </div>
    `;

    document.getElementById("modalBody").innerHTML = `
        <span class="badge ${job.type.toLowerCase()}">${job.type}</span>
        <h2 style="margin:12px 0">${job.title}</h2>
        <p><strong>${job.company}</strong> - ${job.location} - ${job.province}</p>
        <p style="margin:10px 0"><strong>${job.salary}</strong> • Posted ${job.posted}</p>
        ${closingDetailHtml}
        <hr style="margin:15px 0;border:none;border-top:1px solid #e5e7eb;">
        <h4>Job Description</h4>
        <p style="margin:10px 0;line-height:1.6">${job.description}</p>
        <h4 style="margin-top:15px">Requirements</h4>
        <ul style="margin:10px 20px;line-height:1.7;">${(job.requirements || []).map(r => `<li>${r}</li>`).join("")}</ul>
        <div style="margin-top:24px">${applyMarkup}</div>
        ${shareHtml}
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
        function openBulkWhatsApp() {
    const container = document.getElementById('bulkList');
    container.innerHTML = allJobs.map(job => {
        const closing = job.closingDate ? formatClosingDate(job.closingDate) : 'Not specified';
        const text = `🔥 NEW JOB ALERT - ${job.company.toUpperCase()}

📌 ${job.title}
📍 ${job.location} | ${job.province}
💰 ${job.salary}
⏰ Closing: ${closing}

👉 Apply: https://saplugs.netlify.app/?job=${job.id}
📲 More: https://saplugs.netlify.app

#MzansiPlugs #JobsSA`;
        return `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:10px;margin-bottom:12px;">
            <strong>${job.title}</strong> - ${job.company}
            <textarea id="bulk-${job.id}" style="width:100%;height:140px;margin:8px 0;padding:10px;font-size:13px;white-space:pre-wrap;">${text}</textarea>
            <button onclick="document.getElementById('bulk-${job.id}').select(); document.execCommand('copy'); alert('Copied ${job.title}')" style="padding:8px 12px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">📋 Copy for WhatsApp</button>
        </div>`;
    }).join('');
    document.getElementById('bulkModal').classList.remove('hidden');
}

renderJobs();

    });
});

searchInput.addEventListener("input", renderJobs);

// Modals
document.getElementById("closeModal").onclick = () => document.getElementById("jobModal").classList.add("hidden");
document.getElementById("closeAddModal").onclick = () => document.getElementById("addJobModal").classList.add("hidden");
document.getElementById("adminBtn").onclick = () => document.getElementById("addJobModal").classList.remove("hidden");
window.addEventListener("click", (e) => {
    if (e.target.id === "jobModal") document.getElementById("jobModal").classList.add("hidden");
    if (e.target.id === "addJobModal") document.getElementById("addJobModal").classList.add("hidden");
});

// Add Job Form - SUPPORTS BOTH LINK + EMAIL + CLOSING DATE
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
        closingDate: document.getElementById("f_closingDate").value,
        applyLink: applyLink,
        email: email,
        description: document.getElementById("f_desc").value,
        requirements: document.getElementById("f_req").value.split("\n").filter(Boolean)
    };
    const custom = JSON.parse(localStorage.getItem("mzansi_custom_jobs") || "[]");
    custom.push(newJob);
    localStorage.setItem("mzansi_custom_jobs", JSON.stringify(custom));
    allJobs.push(newJob);
    alert("Job added! It will show on your site now.");
    document.getElementById("addJobModal").classList.add("hidden");
    function openBulkWhatsApp() {
    const container = document.getElementById('bulkList');
    container.innerHTML = allJobs.map(job => {
        const closing = job.closingDate ? formatClosingDate(job.closingDate) : 'Not specified';
        const text = `🔥 NEW JOB ALERT - ${job.company.toUpperCase()}

📌 ${job.title}
📍 ${job.location} | ${job.province}
💰 ${job.salary}
⏰ Closing: ${closing}

👉 Apply: https://saplugs.netlify.app/?job=${job.id}
📲 More: https://saplugs.netlify.app

#MzansiPlugs #JobsSA`;
        return `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:10px;margin-bottom:12px;">
            <strong>${job.title}</strong> - ${job.company}
            <textarea id="bulk-${job.id}" style="width:100%;height:140px;margin:8px 0;padding:10px;font-size:13px;white-space:pre-wrap;">${text}</textarea>
            <button onclick="document.getElementById('bulk-${job.id}').select(); document.execCommand('copy'); alert('Copied ${job.title}')" style="padding:8px 12px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">📋 Copy for WhatsApp</button>
        </div>`;
    }).join('');
    document.getElementById('bulkModal').classList.remove('hidden');
}

renderJobs();

    e.target.reset();
});

function openBulkWhatsApp() {
    const container = document.getElementById('bulkList');
    container.innerHTML = allJobs.map(job => {
        const closing = job.closingDate ? formatClosingDate(job.closingDate) : 'Not specified';
        const text = `🔥 NEW JOB ALERT - ${job.company.toUpperCase()}

📌 ${job.title}
📍 ${job.location} | ${job.province}
💰 ${job.salary}
⏰ Closing: ${closing}

👉 Apply: https://saplugs.netlify.app/?job=${job.id}
📲 More: https://saplugs.netlify.app

#MzansiPlugs #JobsSA`;
        return `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:10px;margin-bottom:12px;">
            <strong>${job.title}</strong> - ${job.company}
            <textarea id="bulk-${job.id}" style="width:100%;height:140px;margin:8px 0;padding:10px;font-size:13px;white-space:pre-wrap;">${text}</textarea>
            <button onclick="document.getElementById('bulk-${job.id}').select(); document.execCommand('copy'); alert('Copied ${job.title}')" style="padding:8px 12px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">📋 Copy for WhatsApp</button>
        </div>`;
    }).join('');
    document.getElementById('bulkModal').classList.remove('hidden');
}

renderJobs();
