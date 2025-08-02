console.log("✅ main.js is running");

fetch("data/companies.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load JSON");
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("company-cards");
    if (!container) throw new Error("Missing #company-cards container");

    data.forEach(company => {
      const card = document.createElement("div");
      card.className = "company-card";
      card.innerHTML = `
        <h3>${company.name}</h3>
        <p>${company.description}</p>
        <a href="${company.website}" target="_blank">Website</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => console.error("Error loading companies:", err));