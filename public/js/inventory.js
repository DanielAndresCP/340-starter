"use strict";

async function getInventoryByClassificationId(classification_id) {
    const classIdUrl = `/inv/getInventory/${classification_id}`;

    try {
        const response = await fetch(classIdUrl);

        if (!response.ok) {
            throw new Error("Network response was not OK");
        }

        return await response.json();
    } catch (error) {
        console.log("There was a problem:", error.message);
    }
}

/**
 * Builds the inventory table based on the provided inventory
 * @param {Array<Object>} inventory
 */
function buildInventoryTable(inventory) {
    /**
     * @type {HTMLTableElement}
     */
    const inventoryDisplay = document.getElementById("inventoryDisplay");
    // this deletes all previous elements inside the table
    inventoryDisplay.replaceChildren();

    const header = inventoryDisplay.createTHead().insertRow();
    // First header cell
    header.insertCell().textContent = "Vehicle Name";

    // Second and third header cells
    header.insertCell();
    header.insertCell();

    const tBody = inventoryDisplay.createTBody();

    for (const item of inventory) {
        console.log(item.inv_make, ",", item.inv_model);

        const row = tBody.insertRow();

        // Cell for the item name
        row.insertCell().textContent = `${item.inv_make} ${item.inv_model}`;

        // Cell for the update action
        const updateLink = document.createElement("a");
        updateLink.href = `/inv/edit/${item.inv_id}`;
        updateLink.title = "Click to update";
        updateLink.textContent = "Modify";
        row.insertCell().appendChild(updateLink);

        // Cell for the delete action
        const deleteLink = document.createElement("a");
        deleteLink.href = `/inv/delete/${item.inv_id}`;
        deleteLink.title = "Click to delete";
        deleteLink.textContent = "Delete";
        row.insertCell().appendChild(deleteLink);
    }
}

/**
 * @type {HTMLSelectElement}
 */
const classificationList = document.querySelector(
    'select[name="classification_id"]'
);

classificationList.addEventListener("change", async function () {
    const classification_id = classificationList.value;
    console.log("classification_id is:", classification_id);

    const inventory = await getInventoryByClassificationId(classification_id);

    console.log(inventory);

    buildInventoryTable(inventory);
});
