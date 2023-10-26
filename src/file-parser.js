import { customJSONParser } from "./parser";

onmessage = (e) => {
  var [key, value] = e.data;

  if (key === "file-upload") {
    parseFile(value);
  }
};

function onPage(page) {
  postMessage(["parsing-page", page]);
}

function parseFile(file) {
  postMessage(["parsing-started"]);

  processJSON(file)
    .then((lines) => {
      postMessage(["parsing-done", lines]);
    })
    .catch(() => {
      postMessage(["parsing-error"]);
    });
}

async function processJSON(blob) {
  var reader = new FileReaderSync();
  var text = reader.readAsText(blob);

  return await customJSONParser(text, 250, onPage);
}
