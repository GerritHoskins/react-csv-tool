import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import parseAndSave from "./parseAndSave";
import DragAndDropColumn from "./dragAndDropColumns";
import DropZoneInput from "./dropZoneInput";

import "react-toastify/dist/ReactToastify.min.css";
import "./styles.css";


export default function App() {
  const [initialFields, initialPrimaryId] = useMemo(
    () => generateInitalState(),   [] );
  const [primaryId, setPrimaryId] = useState(initialPrimaryId);

  const [fields, setFields] = useState(initialFields);
  const [source, setSource] = useState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [valid, reason] = isValid(source, fields, primaryId);

  return (
    <div className="App">
      <div className="wrapper">
        <h1>Quick and Drag - CSV Tool</h1>
        <h2>Upload CSV:</h2>
        <DropZoneInput />
        <input
          className="fileInput"
          type="file"
          placeholder="scv"
          onChange={evt => {
            if (evt.target.files && evt.target.files[0]) {
              Papa.parse(evt.target.files[0], {
                complete: res => setSource(res)
              });
            }
          }}
        />
        <div className="configTitle">
          <h2>Enter columns:</h2>
          <button
            onClick={() => {
              copy(generatePermalink(fields, primaryId));
              toast("Copied link to clipboard");
            }}
          >
            Copy Permalink
          </button>
        </div>
       
            <DragAndDropColumn fieldsets={fields} pId={primaryId} initialFields={initialFields} />

        <h2>Download new data set</h2>
        {!valid && <div className="invalidReason">{reason}</div>}
        <button
          className={!valid ? "invalidReason" : "download" }        
          onClick={() => {
            setIsProcessing(true);
            parseAndSave(source, fields, primaryId, () =>
              setIsProcessing(false)
            );
          }}
          disabled={!valid || isProcessing}
        >
          {valid
            ? isProcessing
              ? "Loading ..."
              : "Download now"
            : "Error. Check your input fields."}
        </button>
      </div>        
      <ToastContainer />
    </div>
  );
}

function isValid(source, fields, primaryId) {
  if (!source) {
    return [false, "You need to upload a CSV file first"];
  }

  if (fields.length !== source.data[0].length) {
    return [
      false,
      `Error1, ${
        source.data[0].length
      } Error12, ${fields.length} `
    ];
  }

  if (!fields.find(field => field.fieldName === "email")) {
    return [false, 'Error3"'];
  }

  if (!primaryId || !fields.find(field => field.id === primaryId)) {
    return [false, "Error13"];
  }

  if (fields.find(field => !field.fieldName)) {
    return [false, "Error15"];
  }

  return [true, ""];
}

function generateInitalState() {
  const search = new URLSearchParams(window.location.search);

  if (search.has("fields") && search.has("primary")) {
    const fieldsRaw = search.get("fields").split("|");
    const primaryIndex = Number(search.get("primary"));
    let primaryId = "";
    const fields = fieldsRaw.map((fieldRaw, index) => {
      const [fieldName, shouldMerge] = fieldRaw.split("-");
      const id = uuidv4();

      if (index === primaryIndex) primaryId = id;

      return {
        id,
        fieldName,
        shouldMerge: shouldMerge === "true"
      };
    });

    return [fields, primaryId];
  } else {
    return [
      [
        {
          id: uuidv4(),
          fieldName: "",
          shouldMerge: false
        }
      ],
      ""
    ];
  }
}


function generatePermalink(fields, primaryId) {
  const params = new URLSearchParams();
  params.set("fields", "");
  params.set("primary", fields.findIndex(field => field.id === primaryId));

  fields.forEach((field, index) => {
    const prevParam = params.get("fields");
    params.set(
      "fields",
      `${prevParam}${field.fieldName}-${field.shouldMerge}${
        index === fields.length - 1 ? "" : "|"
      }`
    );
  });

  return `${window.location.origin}?${params.toString()}`;
}
