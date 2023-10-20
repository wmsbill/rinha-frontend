import clarinet from "clarinet";

export async function* lazyParseJSON(text) {
  var parser = clarinet.parser();
  var parent = ["root"];
  var arrayIndex = [0];
  var currentKey = null;
  var depth = 0;
  var lines = 0;
  var resolve = null;
  var eventQueue = [];

  function resolveIfHanging() {
    if (resolve) {
      resolve();
      resolve = null;
    }
  }

  function pushEvent(value, key = null) {
    eventQueue.push({ value, depth, key, line: lines++ });
    resolveIfHanging();
  }

  function handleOpen(type, value) {
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
  }

  function handleClose(value) {
    depth--;
    pushEvent(value, null);
    parent.pop();
  }

  parser.onerror = (e) => {
    throw e;
  };

  parser.onkey = (key) => {
    currentKey = key;
  };

  parser.onvalue = (value) => {
    var key = parent.at(-1) === "array" ? arrayIndex[depth]++ : currentKey;
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
      var { value, done } = await text.next();
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
