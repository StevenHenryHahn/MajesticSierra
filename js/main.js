console.log("✅ main.js is running");

// Set the desired category for this page
const PAGE_CATEGORY = "chips"; // Change to "software" or "datacenters" per subpage

fetch("/data/companies.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load JSON");
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("company-cards");
    if (!container) throw new Error("Missing #company-cards container");

    const filtered = data.filter(company => {
      return company.category === PAGE_CATEGORY;
    });

    if (filtered.length === 0) {
      container.innerHTML = "<p>No companies found for this category.</p>";
      return;
    }

    filtered.forEach(company => {
      const card = document.createElement("div");
      card.className = "company-card";
      card.innerHTML = `
        <h3>${company.name}</h3>
        <p>${company.description}</p>
        <a href="${company.website}" target="_blank">Website</a> |
        <a href="${company.careers}" target="_blank">Careers</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => console.error("Error loading companies:", err));