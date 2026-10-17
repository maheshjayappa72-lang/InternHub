const list = document.getElementById("internship-list");
const searchInput = document.getElementById("search-input");
const domainFilter = document.getElementById("domain-filter");
const modeFilter = document.getElementById("mode-filter");
const resultsCount = document.getElementById("results-count");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const filterForm = document.getElementById("filter-form");
const detailsDialog = document.getElementById("details-dialog");
const applyDialog = document.getElementById("apply-dialog");
const dialogContent = document.getElementById("dialog-content");
const applicationForm = document.getElementById("application-form");

let internships = [];
let activeInternship = null;
const markStyles = ["", "purple", "orange", "blue", "pink"];
const icons = { "Full Stack Development": "F", "UI/UX": "U", "Data Analytics": "D", "Cyber Security": "S" };

function setLoading(isLoading) {
  loadingState.hidden = !isLoading;
  list.setAttribute("aria-busy", String(isLoading));
}

function setError(message = "We couldn’t load the listings. Check your connection and try again.") {
  setLoading(false);
  list.replaceChildren();
  emptyState.hidden = true;
  errorState.hidden = false;
  errorState.querySelector("p").textContent = message;
  resultsCount.textContent = "Listings unavailable";
}

async function loadInternships() {
  setLoading(true);
  errorState.hidden = true;
  emptyState.hidden = true;
  resultsCount.textContent = "Loading opportunities…";
  try {
    const response = await fetch("./internships.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    const records = Array.isArray(payload.internships)
      ? payload.internships
      : (payload.status === "success" && Array.isArray(payload.data) ? payload.data : null);
    if (!records || records.some((item) =>
      !item.id || !item.title || !item.domain || !item.mode ||
      !item.location || !Array.isArray(item.skills) || !Number.isInteger(item.openings)
    )) {
      throw new Error("The internship data is not in the expected format.");
    }
    internships = records;
    document.getElementById("stat-roles").textContent = String(internships.length).padStart(2, "0");
    setLoading(false);
    renderInternships();
  } catch (error) {
    setError();
  }
}

function getFilteredInternships() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const domain = domainFilter.value;
  const mode = modeFilter.value;
  return internships.filter((item) => {
    const searchable = [item.id, item.title, item.domain, item.mode, item.location, ...item.skills].join(" ").toLocaleLowerCase();
    return (!query || searchable.includes(query)) &&
      (domain === "all" || item.domain === domain) &&
      (mode === "all" || item.mode === mode);
  });
}

function renderInternships() {
  const filtered = getFilteredInternships();
  list.replaceChildren();
  errorState.hidden = true;
  emptyState.hidden = filtered.length !== 0;
  list.hidden = filtered.length === 0;
  resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? "opportunity" : "opportunities"} found`;
  filtered.forEach((item) => list.appendChild(createCard(item)));
  list.setAttribute("aria-busy", "false");
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "internship-card";
  const top = document.createElement("div");
  top.className = "card-top";
  const mark = document.createElement("div");
  mark.className = `company-mark ${markStyles[internships.indexOf(item) % markStyles.length]}`;
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = icons[item.domain] || item.title.charAt(0);
  const id = document.createElement("span");
  id.className = "role-id";
  id.textContent = item.id;
  top.append(mark, id);

  const domain = document.createElement("span");
  domain.className = "domain-pill";
  domain.textContent = item.domain;
  const title = document.createElement("h3");
  title.textContent = item.title;
  const meta = document.createElement("div");
  meta.className = "meta-list";
  meta.append(
    makeMeta("⌖", item.location),
    makeMeta("◷", item.mode),
    makeMeta("▣", `${item.openings} ${item.openings === 1 ? "opening" : "openings"}`)
  );
  const skills = document.createElement("div");
  skills.className = "skill-list";
  item.skills.forEach((skill) => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = skill;
    skills.appendChild(tag);
  });
  const footer = document.createElement("div");
  footer.className = "card-footer";
  const opening = document.createElement("span");
  opening.className = "opening-count";
  opening.innerHTML = `<strong>${item.openings}</strong> available`;
  const actions = document.createElement("div");
  actions.className = "card-actions";
  const details = document.createElement("button");
  details.className = "button button-light button-small";
  details.type = "button";
  details.textContent = "Details";
  details.setAttribute("aria-label", `View details for ${item.title}`);
  details.addEventListener("click", () => openDetails(item));
  const apply = document.createElement("button");
  apply.className = "button button-dark button-small";
  apply.type = "button";
  apply.textContent = "Apply ↗";
  apply.setAttribute("aria-label", `Apply for ${item.title}`);
  apply.addEventListener("click", () => openApplication(item));
  actions.append(details, apply);
  footer.append(opening, actions);
  card.append(top, domain, title, meta, skills, footer);
  return card;
}

function makeMeta(symbol, text) {
  const span = document.createElement("span");
  const icon = document.createElement("span");
  icon.className = "meta-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = symbol;
  span.append(icon, document.createTextNode(text));
  return span;
}

function openDetails(item) {
  activeInternship = item;
  dialogContent.replaceChildren();
  const id = document.createElement("span");
  id.className = "dialog-role-id";
  id.textContent = item.id;
  const title = document.createElement("h2");
  title.className = "dialog-title";
  title.id = "dialog-title";
  title.textContent = item.title;
  const domain = document.createElement("span");
  domain.className = "domain-pill";
  domain.textContent = item.domain;
  const description = document.createElement("p");
  description.className = "dialog-description";
  description.textContent = `Build practical experience in ${item.domain.toLowerCase()} while working with ${item.skills.join(", ")}. This sample listing is a starting point for learning and professional growth.`;
  const facts = document.createElement("div");
  facts.className = "detail-block";
  facts.innerHTML = "<h3>Role overview</h3>";
  const factGrid = document.createElement("div");
  factGrid.className = "detail-facts";
  [["Work mode", item.mode], ["Location", item.location], ["Openings", String(item.openings)]].forEach(([label, value]) => {
    const box = document.createElement("div");
    const small = document.createElement("small");
    small.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    box.append(small, strong);
    factGrid.appendChild(box);
  });
  facts.appendChild(factGrid);
  const skillBlock = document.createElement("div");
  skillBlock.className = "detail-block";
  const skillHeading = document.createElement("h3");
  skillHeading.textContent = "Skills you’ll explore";
  const skills = document.createElement("div");
  skills.className = "skill-list";
  item.skills.forEach((skill) => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = skill;
    skills.appendChild(tag);
  });
  skillBlock.append(skillHeading, skills);
  const actions = document.createElement("div");
  actions.className = "dialog-actions";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "button button-light";
  close.textContent = "Close";
  close.addEventListener("click", () => detailsDialog.close());
  const apply = document.createElement("button");
  apply.type = "button";
  apply.className = "button button-dark";
  apply.textContent = "Apply for this role ↗";
  apply.addEventListener("click", () => {
    detailsDialog.close();
    openApplication(item);
  });
  actions.append(close, apply);
  dialogContent.append(id, title, domain, description, facts, skillBlock, actions);
  detailsDialog.showModal();
}

function openApplication(item) {
  activeInternship = item;
  applicationForm.reset();
  clearFormErrors();
  document.getElementById("apply-internship-id").value = item.id;
  document.getElementById("apply-role").textContent = `${item.title} · ${item.id}`;
  document.getElementById("application-feedback").textContent = "";
  document.getElementById("application-feedback").className = "form-feedback";
  applyDialog.showModal();
  document.getElementById("applicant-name").focus();
}

function clearFormErrors() {
  ["name", "email", "portfolio"].forEach((field) => {
    document.getElementById(`${field}-error`).textContent = "";
    const input = document.getElementById(field === "name" ? "applicant-name" : field === "email" ? "applicant-email" : "portfolio-url");
    input.removeAttribute("aria-invalid");
  });
}

function showFieldError(field, message) {
  const inputId = field === "name" ? "applicant-name" : field === "email" ? "applicant-email" : "portfolio-url";
  document.getElementById(`${field}-error`).textContent = message;
  document.getElementById(inputId).setAttribute("aria-invalid", "true");
}

function isSafeHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol) && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormErrors();
  const name = document.getElementById("applicant-name").value.trim();
  const email = document.getElementById("applicant-email").value.trim();
  const portfolio = document.getElementById("portfolio-url").value.trim();
  const internshipId = document.getElementById("apply-internship-id").value;
  let valid = true;
  if (name.length < 2) { showFieldError("name", "Please enter your full name (at least 2 characters)."); valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError("email", "Enter a valid email address, such as name@example.com."); valid = false; }
  if (portfolio && !isSafeHttpUrl(portfolio)) { showFieldError("portfolio", "Use a valid http:// or https:// URL."); valid = false; }
  if (!valid) {
    const firstInvalid = applicationForm.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  const storageKey = "internhub-demo-applications";
  let applications = [];
  try { applications = JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { applications = []; }
  const duplicate = applications.some((app) => app.internshipId === internshipId && app.email.toLowerCase() === email.toLowerCase());
  const feedback = document.getElementById("application-feedback");
  if (duplicate) {
    feedback.textContent = "A demo application with this email already exists for this role.";
    feedback.className = "form-feedback error";
    return;
  }
  applications.push({ internshipId, email: email.toLowerCase(), submittedAt: new Date().toISOString() });
  try { localStorage.setItem(storageKey, JSON.stringify(applications)); } catch {}
  applicationForm.querySelector(".submit-button").disabled = true;
  applicationForm.querySelector(".submit-button").textContent = "Demo application saved ✓";
  feedback.textContent = "Success! Your demo application was saved in this browser. It has not been sent to an employer.";
  feedback.className = "form-feedback";
});

applicationForm.addEventListener("input", (event) => {
  const field = event.target.id === "applicant-name" ? "name" : event.target.id === "applicant-email" ? "email" : event.target.id === "portfolio-url" ? "portfolio" : null;
  if (field) {
    document.getElementById(`${field}-error`).textContent = "";
    event.target.removeAttribute("aria-invalid");
  }
});

function resetFilters() {
  searchInput.value = "";
  domainFilter.value = "all";
  modeFilter.value = "all";
  renderInternships();
  searchInput.focus();
}

searchInput.addEventListener("input", renderInternships);
domainFilter.addEventListener("change", renderInternships);
modeFilter.addEventListener("change", renderInternships);
filterForm.addEventListener("submit", (event) => event.preventDefault());
document.getElementById("reset-filters").addEventListener("click", resetFilters);
document.getElementById("empty-reset").addEventListener("click", resetFilters);
document.getElementById("retry-button").addEventListener("click", loadInternships);
document.getElementById("close-details").addEventListener("click", () => detailsDialog.close());
document.getElementById("close-apply").addEventListener("click", () => applyDialog.close());
[detailsDialog, applyDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (dialog === applyDialog) {
      const submit = applicationForm.querySelector(".submit-button");
      submit.disabled = false;
      submit.innerHTML = 'Submit demo application <span aria-hidden="true">↗</span>';
    }
  });
});

loadInternships();
