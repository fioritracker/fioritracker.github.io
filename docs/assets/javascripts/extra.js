/*
    Add parameters with additional data to send to each page
*/
//document$.subscribe(function() {
document.addEventListener("DOMContentLoaded", () => {

  // From each list item gather code text and attach it to the link together with the referrer
  const defaultStepHandler = (target, name, step) => {
    const codeElements = target.parentElement.querySelectorAll("code");
    const codeValues = [];
    for (const code of codeElements) {
      codeValues.push(code.innerText);
    }

    // const ref = encodeURIComponent(location.pathname.substr(1).split("/")[0]);
    const param = encodeURIComponent(codeValues.join(","));

    target.href = `${target.href}?${name}=${param}`;

  };

  const anchors = document.querySelectorAll(".md-content__inner a");
  for (const a of anchors) {
    const match = a.href.match(/inst\/step-(\d)\/$/i);

    if (!match) {
      continue;
    }

    const step = parseInt(match[1]);
    defaultStepHandler(a, "param", step);
  }

});

/*
    Receive the data from the params
*/
//document$.subscribe(function() {
document.addEventListener("DOMContentLoaded", () => {

  const match = location.pathname.match(/inst\/step-(\d)\/$/i);
  if (!match || location.search.length === 0) {
    return;
  }
  const step = parseInt(match[1]);
  const releaseBase = "https://github.com/fioritracker";

  const placeholder = {
    "1": "Release",
    "2": "ICF node",
    "3": "service name",
    "4": "Role",
  };

  const singularForStep = {
    "1": "release",
    "2": "node",
    "3": "service",
    "4": "role",
  }

  const searchParams = new URLSearchParams(location.search);
  if (!searchParams.has("param")) {
    return;
  }

  const param = searchParams.get("param").split(",");

  // This creates an HTML structure <code>ParamValue</code>, <code..
  // it will be injected in place of the placeholder
  const newNodes = [];
  for (let i = 0; i < param.length; i++) {
    const p = param[i];
    const codeElement = document.createElement("code");
    codeElement.innerHTML = p;
    newNodes.push(codeElement);
    // Add comma between the values
    if (i !== param.length - 1) {
      newNodes.push(document.createTextNode(", "));
    }
  }

  // Add a word to represent the data, easier to get singular and plural values right
  // instead of static word in text
  if (param.length === 1) {
    newNodes.push(document.createTextNode(` ${singularForStep[step]}`));
  } else {
    newNodes.push(document.createTextNode(` ${singularForStep[step]}s`));
  }

  // Only replace <code> elements to have a more fine-tuned targeting
  // If the innerHTML value is a perfect match with the placehoder then replace it 
  // with the whole newNodes structure. Example: `service name`
  // If the innerHTML includes the placehoder, but isn't a perfect match then
  // check if there is exactly 1 ParamValue and replace the placeholder with it and
  // inject the newly found node within the newNodes structure. Also omit the last 
  // textNode in the newNodes. Example: `service name_0001`
  const internalCodeElements = document.querySelectorAll(".md-content__inner code");
  for (const el of internalCodeElements) {
    if (el.innerHTML === placeholder[step]) {

      // Perfect match replace everything as prepared
      el.replaceWith(...newNodes.map(n => n.cloneNode(true)));

    } else if (el.innerHTML.includes(placeholder[step]) && param.length === 1) {

      // Partial match of the placeholder, make adjustments
      const codeCopy = el.cloneNode(true);

      // Replace the placeholder inside the bigger amount of text
      codeCopy.innerHTML = codeCopy.innerHTML.replace(placeholder[step], param[0]);

      // Replace the new <code> with the modified copy
      newNodes[0] = codeCopy;

      // Remove last node with the data representation text
      newNodes.splice(newNodes.length - 1);

      // Once all was done replace everything
      el.replaceWith(...newNodes.map(n => n.cloneNode(true)));
    }
  }

});