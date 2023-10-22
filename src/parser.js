import clarinet from "clarinet";

export function customJSONParser(text) {
  var parser = clarinet.parser();
  var parent = ["root"];
  var arrayIndex = [0];
  var currentKey = null;
  var depth = 0;
  var eventQueue = [];
  var resolve;
  var promise = new Promise((r) => (resolve = r));

  function pushEvent(value, key) {
    eventQueue.push([depth, key, value]);
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
    parent.pop();
    pushEvent(value, "");
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
      return;
    }
    handleClose("}");
  };

  parser.onclosearray = () => {
    handleClose("]");
  };

  parser.onend = () => {
    resolve(eventQueue);
  };

  parser.write(text).close();
  return promise;
}
