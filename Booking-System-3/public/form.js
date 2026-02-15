// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (form) {
    form.addEventListener("submit", onSubmit);
  } else {
    console.error("Form with id 'resourceForm' not found");
  }
});

async function onSubmit(event) {
  event.preventDefault();
  
  try {
    // FIXED: Check if submitter exists
    const submitter = event.submitter;
    let actionValue = "create"; // Default value
    
    if (submitter && submitter.value) {
      actionValue = submitter.value;
    }
    
    // FIXED: Check if price unit radio exists
    const priceUnitElement = document.querySelector('input[name="resourcePriceUnit"]:checked');
    const selectedUnit = priceUnitElement ? priceUnitElement.value : "hour"; // Default to "hour"
    
    // FIXED: Check if price element exists
    const priceElement = $("resourcePrice");
    const priceRaw = priceElement ? priceElement.value : "0";
    const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);
    
    // FIXED: Check element existence with proper error messages
    const nameElement = $("resourceName");
    const descriptionElement = $("resourceDescription");
    const availableElement = $("resourceAvailable");
    
    // FIXED: Better error handling for missing elements
    if (!nameElement) {
      console.error("Element with id 'resourceName' not found");
    }
    
    if (!descriptionElement) {
      console.error("Element with id 'resourceDescription' not found");
    }
    
    const payload = {
      action: actionValue,
      resourceName: nameElement ? nameElement.value : "",
      resourceDescription: descriptionElement ? descriptionElement.value : "",
      resourceAvailable: availableElement ? availableElement.checked : false,
      resourcePrice: resourcePrice,
      resourcePriceUnit: selectedUnit
    };

    console.log("--------------------------");
    console.log("The request sent to the server " + `[${timestamp()}]`);
    console.log("--------------------------");
    console.log("Payload:", payload);
    
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText}\n${text}`);
    }

    // Creates an alert and a log message
    const data = await response.json();
    
    // FIXED: Check if data.echo exists before accessing properties
    const echo = data.echo || payload; // Fallback to payload if echo doesn't exist
    const serverData = data.resource || data; // Handle different response formats
    
    let msg = "Server response " + `[${timestamp()}]\n`;
    msg += "--------------------------\n";
    msg += "Status ➡️ " + response.status + "\n";
    msg += "Action ➡️ " + (echo.action || actionValue) + "\n";
    msg += "Name ➡️ " + (echo.resourceName || payload.resourceName) + "\n";
    msg += "Description ➡️ " + (echo.resourceDescription || payload.resourceDescription) + "\n";
    msg += "Availability ➡️ " + (echo.resourceAvailable || payload.resourceAvailable) + "\n";
    msg += "Price ➡️ " + (echo.resourcePrice || payload.resourcePrice) + "\n";
    msg += "Price unit ➡️ " + (echo.resourcePriceUnit || payload.resourcePriceUnit) + "\n";

    console.log("Server response " + `[${timestamp()}]`);
    console.log("--------------------------");
    console.log("Status ➡️ ", response.status);
    console.log("Data received ➡️ ", data);
    console.log("Action ➡️ ", echo.action || actionValue);
    console.log("Name ➡️ ", echo.resourceName || payload.resourceName);
    console.log("Description ➡️ ", echo.resourceDescription || payload.resourceDescription);
    console.log("Availability ➡️ ", echo.resourceAvailable || payload.resourceAvailable);
    console.log("Price ➡️ ", echo.resourcePrice || payload.resourcePrice);
    console.log("Price unit ➡️ ", echo.resourcePriceUnit || payload.resourcePriceUnit);
    console.log("--------------------------");
    
    // FIXED: Show success message
    if (data.success) {
      alert("✅ Resource created successfully!");
      // Optionally reset form
      // form.reset();
    } else {
      alert(msg);
    }

  } catch (err) {
    console.error("POST error:", err);
    alert("Error: " + err.message);
  }
}

// FIXED: Add a function to test if form elements exist
function checkFormElements() {
  const elements = [
    "resourceForm",
    "resourceName", 
    "resourceDescription", 
    "resourceAvailable", 
    "resourcePrice"
  ];
  
  console.log("Checking form elements:");
  elements.forEach(id => {
    const element = $(id);
    console.log(`- ${id}: ${element ? "✅ Found" : "❌ Missing"}`);
  });
  
  // Check price unit radio buttons
  const priceUnits = document.querySelectorAll('input[name="resourcePriceUnit"]');
  console.log(`- Price unit radios: ${priceUnits.length} ${priceUnits.length > 0 ? "✅ Found" : "❌ Missing"}`);
}

// Run check when page loads
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(checkFormElements, 100); // Check after a short delay
});