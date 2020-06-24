import papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function parse(source, fields, primaryId) {
  const primaryIndex = fields.findIndex(field => field.id === primaryId);
  const emailIndex = fields.findIndex(field => field.fieldName === "email");
  const malformedRaw = [];
  const firstFormat = Object.entries(
    source.data
      .slice(1)
      .filter(d => {
        if (
          !d[primaryIndex] ||
          !d[emailIndex] ||
          d[primaryIndex] === "#N/A" ||
          d[emailIndex] === "#N/A"
        ) {
          malformedRaw.push(d);
          return false;
        }

        return true;
      })
      .reduce((primaryMap, current) => {
        if (!primaryMap[current[primaryIndex]]) {
          primaryMap[current[primaryIndex]] = [current];
        } else {
          primaryMap[current[primaryIndex]] = [
            ...primaryMap[current[primaryIndex]],
            current
          ];
        }
        return primaryMap;
      }, {})
  ).map(([_, data]) => {
    let merged = {};
    fields.forEach((field, index) => {
      merged[field.fieldName] = data[0][index];
    });

    if (data.length > 1) {
      data.slice(1).forEach(d => {
        fields.forEach((field, index) => {
          if (!field.shouldMerge) {
            merged[field.fieldName] = `${merged[field.fieldName]}; ${d[index]}`;
          }
        });
      });
    }

    return merged;
  });

  const secondFormatCounter = {};
  const secondFormat = [[]];

  firstFormat.forEach(d => {
    if (!isNaN(Number(secondFormatCounter[d.email]))) {
      secondFormatCounter[d.email] = secondFormatCounter[d.email] + 1;

      if (secondFormatCounter[d.email] < secondFormat.length) {
        secondFormat[secondFormatCounter[d.email]].push(d);
      } else {
        secondFormat.push([d]);
      }
    } else {
      secondFormatCounter[d.email] = 0;
      secondFormat[0].push(d);
    }
  });

  const malformed = malformedRaw.map(data => {
    let result = {};
    fields.forEach((field, index) => {
      result[field.fieldName] = data[index];
    });
    return result;
  });

  return [firstFormat, secondFormat, malformed];
}

function save(first, second, malformed, onFinish) {
  const zipResults = new JSZip();
  const firstResult = papa.unparse(first);

  zipResults.file(`First Format Result - ${first.length}.csv`, firstResult, {
    type: "text/csv;charset=utf-8;"
  });

  const secondResultsFolder = zipResults.folder("Second Format Files");

  second.forEach((d, i) => {
    const result = papa.unparse(d);
    secondResultsFolder.file(
      `Second Result Batch #${i + 1} - ${d.length} Entries.csv`,
      result,
      {
        type: "text/csv;charset=utf-8;"
      }
    );
  });

  const malformedResult = papa.unparse(malformed);

  zipResults.file(
    `Malformed Entries - ${malformed.length}.csv`,
    malformedResult,
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  zipResults.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "Blast Data.zip");
    onFinish();
  });
}

export default function parseAndSave(source, fields, primaryId, onFinish) {
  const [first, second, malformed] = parse(source, fields, primaryId);
  save(first, second, malformed, onFinish);
}
