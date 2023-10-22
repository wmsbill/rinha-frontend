import { customJSONParser } from "./parser";

export async function processJSON(blob) {
  // var reader = read(blob);
  var resolve;
  var reader = new FileReader();
  reader.onload = (evt) => {
    console.info(evt);
    resolve(evt.target.result);
  };
  var text = await new Promise((r) => (resolve = r));
  reader.readAsText(blob);

  // var text = reader.readAsText(blob);
  console.info(text);
  // var ASL = lazyParseJSON(reader);
  // await logger(ASL);
}

async function logger(string) {
  for await (var part of string) {
    // console.log(part);
  }
}

async function* read(blob) {
  var reader = blob.stream().getReader();
  var decoder = new TextDecoder();

  while (true) {
    var { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value);
  }
}
