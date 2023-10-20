import { lazyParseJSON } from "./parser";

onmessage = (e) => {
  processJSON(e.data).then(() => postMessage("pong"));
};

async function processJSON(blob) {
  const reader = read(blob);
  const text = decode(reader);
  const ASL = lazyParseJSON(text);
  await logger(ASL);
}

async function logger(string) {
  for await (const part of string) {
    console.log(part);
  }
}

async function* read(blob) {
  const reader = blob.stream().getReader();

  while (true) {
    var { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield value;
  }
}

async function* decode(chunk) {
  const decoder = new TextDecoder();

  for await (const part of chunk) {
    yield decoder.decode(part);
  }
}
