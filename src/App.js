import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Select from "react-select";
import XLSX from "xlsx";
import "./App.css";

function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [dockets, setDockets] = useState([]);
  const [formFields, setFormFields] = useState({
    name: "",
    startTime: "",
    endTime: "",
    hoursWorked: "",
    ratePerHour: "",
  });

  useEffect(() => {
    fetch(
      "https://cc7f306eef219b562546a6c765f5960d.cdn.bubble.io/f1697415553805x314024720575284000/export29913.xlsx"
    )
      .then((response) => response.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const csvText = XLSX.utils.sheet_to_csv(
          workbook.Sheets[workbook.SheetNames[0]]
        );

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: function (result) {
            const data = result.data;
            setCsvData(data);
          },
        });
      });
  }, []);

  const Suppliers = [...new Set(csvData.map((item) => item["Supplier"]))];
  const SupplierOptions = Suppliers.map((Supplier) => ({
    value: Supplier,
    label: Supplier,
  }));

  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
    setSelectedPurchaseOrder(null);
  };

  const purchaseOrders = csvData
    .filter((item) => item["Supplier"] === selectedSupplier?.value)
    .map((item) => item["PO Number"]);
  const purchaseOrderOptions = purchaseOrders.map((po) => ({
    value: po,
    label: po,
  }));

  const handlePurchaseOrderChange = (selectedOption) => {
    setSelectedPurchaseOrder(selectedOption);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormFields({
      ...formFields,
      [name]: value,
    });
  };

  const handleDocketSubmit = () => {
    if (selectedSupplier && selectedPurchaseOrder) {
      const selectedData = csvData.find(
        (item) =>
          item["Supplier"] === selectedSupplier.value &&
          item["PO Number"] === selectedPurchaseOrder.value
      );

      if (selectedData) {
        const newDocket = {
          Supplier: selectedSupplier.label,
          purchaseOrder: selectedPurchaseOrder.label,
          purchaseOrderNumber: selectedData["PO Number"],
          Description: selectedData["Description"],
          ...formFields, // Include all form fields
        };
        setDockets([...dockets, newDocket]);
      }
    }
  };

  return (
    <div>
      
        <div className="app-container">
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formFields.name}
              onChange={handleFieldChange}
            />
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="text"
              name="startTime"
              value={formFields.startTime}
              onChange={handleFieldChange}
            />
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="text"
              name="endTime"
              value={formFields.endTime}
              onChange={handleFieldChange}
            />
          </div>
          <div>
            <label>Hours Worked:</label>
            <input
              type="text"
              name="hoursWorked"
              value={formFields.hoursWorked}
              onChange={handleFieldChange}
            />
          </div>
          <div>
            <label>Rate Per Hour:</label>
            <input
              type="text"
              name="ratePerHour"
              value={formFields.ratePerHour}
              onChange={handleFieldChange}
            />
          </div>
          <div>
            <label>Supplier:</label>
            <Select
              value={selectedSupplier}
              onChange={handleSupplierChange}
              options={SupplierOptions}
              isSearchable
            />
          </div>
          <div>
            <label>PO Number:</label>
            <Select
              value={selectedPurchaseOrder}
              onChange={handlePurchaseOrderChange}
              options={purchaseOrderOptions}
              isSearchable
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={handleDocketSubmit}>Submit to Create Docket</button>
        </div>
     
      <h2 className="docket">Docket List</h2>
      <ul className="docket">
        {dockets.map((docket, index) => (
          <li key={index}>
            <strong>Name:</strong> {docket.name},<strong>Start Time:</strong>{" "}
            {docket.startTime},<strong>End Time:</strong> {docket.endTime},
            <strong>Hours Worked:</strong> {docket.hoursWorked},
            <strong>Rate Per Hour:</strong> {docket.ratePerHour}
            <strong>Supplier:</strong> {docket.Supplier},
            <strong>PO Number:</strong> {docket.purchaseOrder},
            <strong>PO Number:</strong> {docket.purchaseOrderNumber},
            <strong>Description:</strong> {docket.Description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
