function handleOpen(key, value, parent) {
  const className = value === "{" ? "type-obj" : "type-array";
  const node = document.createElement("details");
  const summary = document.createElement("summary");

  summary.classList.add("key");
  summary.textContent = key + ":";

  node.classList.add(className);
  node.setAttribute("open", "");

  node.appendChild(summary);

  parent.appendChild(node);

  return node;
}

function handleField(key, value, parent) {
  const node = document.createElement("p");
  const valueNode = document.createElement("span");

  node.classList.add("field");
  node.textContent = key + ": ";

  valueNode.textContent = value;

  node.appendChild(valueNode);

  parent.appendChild(node);
}

export function renderer(lines, viewer) {
  const root = document.createDocumentFragment();
  let currentParent = root;

  for (let [_, key, value] of lines) {
    switch (value) {
      case "{":
      case "[":
        currentParent = handleOpen(key, value, currentParent);
        break;
      case "}":
      case "]":
        currentParent = currentParent.parentElement;
        break;
      default:
        handleField(key, value, currentParent);
    }
  }

  viewer.innerHTML = "";
  viewer.appendChild(root);
}
