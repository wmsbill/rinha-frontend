import { customJSONParser } from "./parser";

onmessage = (e) => {
  processJSON(e.data).then(() => {
    postMessage("pong");
  });
};

async function processJSON(blob) {
  const reader = new FileReaderSync();
  const text = reader.readAsText(blob);

  return await customJSONParser(text);
}
