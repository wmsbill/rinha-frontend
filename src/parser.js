import clarinet from "clarinet";

export async function* lazyParseJSON(text) {
  const parser = clarinet.parser();
  const parent = ["root"];
  const arrayIndex = [0];
  let currentKey = null;
  let depth = 0;
  let lines = 0;
  let resolve = null;
  const eventQueue = [];

  const resolveIfHanging = () => {
    if (resolve) {
      resolve();
      resolve = null;
    }
  };

  const pushEvent = (value, key = null) => {
    eventQueue.push({ value, depth, key, line: lines++ });
    resolveIfHanging();
  };

  const handleOpen = (type, value) => {
    if (
      parent.at(-1) === "array" ||
      (parent.at(-1) === "root" && type === "array")
    ) {
      currentKey = arrayIndex[depth]++;
    }
    if (currentKey !== null) {
      pushEvent(value, currentKey);
      depth++;
    }
    parent.push(type);
  };

  const handleClose = (value) => {
    depth--;
    pushEvent(value, null);
    parent.pop();
  };

  parser.onerror = (e) => {
    throw e;
  };

  parser.onkey = (key) => {
    currentKey = key;
  };

  parser.onvalue = (value) => {
    const key = parent.at(-1) === "array" ? arrayIndex[depth]++ : currentKey;
    currentKey = null;
    pushEvent(value, key);
  };

  parser.onopenobject = (key) => {
    handleOpen("object", "{", key);
    currentKey = key;
  };

  parser.onopenarray = () => {
    handleOpen("array", "[");
    arrayIndex[depth] = 0;
  };

  parser.oncloseobject = () => {
    if (depth === 0) {
      resolveIfHanging();
      return;
    }
    handleClose("}");
  };

  parser.onclosearray = () => {
    handleClose("]");
  };

  parser.onend = () => {
    console.info("end");
  };

  while (true) {
    if (eventQueue.length) {
      yield eventQueue.shift();
    } else {
      let { value, done } = await text.next();
      if (done) {
        break;
      }
      await new Promise((r) => {
        resolve = r;
        parser.write(value);
      });
    }
  }

  parser.close();
}
