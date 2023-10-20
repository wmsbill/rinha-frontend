import { lazyParseJSON } from "./parser";

onmessage = (e) => {
  processJSON(e.data).then(() => {
    postMessage("pong");
  });
};

async function processJSON(blob) {
  const reader = read(blob);
  const ASL = lazyParseJSON(reader);
  for await (const part of ASL) {
    // console.log(part);
  }
}

async function* read(blob) {
  const reader = blob.stream().getReader();
  const decoder = new TextDecoder();

  while (true) {
    var { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value);
  }
}
