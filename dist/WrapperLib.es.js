var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var style = "";
class Wrapper {
  constructor(tag, existingElement, intializers) {
    __publicField(this, "element");
    __publicField(this, "subscribers");
    this.subscribers = [];
    if (existingElement) {
      this.element = existingElement;
    } else {
      this.element = document.createElement(tag);
    }
    if (this.element.tagName === "INPUT")
      this.onEvent("input", this.notifySubscribers.bind(this));
    if (this.element.tagName === "SELECT")
      this.onEvent("change", this.notifySubscribers.bind(this));
    if (this.element.tagName === "TEXTAREA")
      this.onEvent("input", this.notifySubscribers.bind(this));
    if (intializers) {
      if (intializers.id)
        this.element.id = intializers.id;
      if (intializers.name)
        this.element.setAttribute("name", intializers.name);
      if (intializers.value) {
        if (this.element.hasOwnProperty("value")) {
          this.element.value = intializers.value;
        } else {
          throw new Error("attempted to set value on a tag that doesn't support that");
        }
      }
      if (intializers.text != void 0)
        this.element.innerText = intializers.text;
      if (intializers.html != void 0)
        this.element.innerHTML = intializers.html;
      if (intializers.style)
        this.element.setAttribute("style", intializers.style);
      if (intializers.bind) {
        let sub = {
          bindFeature: intializers.bind.bindFeature,
          toFeature: intializers.bind.toFeature,
          ofWrapper: this,
          xferFunc: intializers.bind.xferFunc
        };
        intializers.bind.ofWrapper.addSubscriber(sub);
      }
    }
  }
  static wrap(element, initializers) {
    return new Wrapper(element.tagName, element, initializers);
  }
  newWrap(tag, initializers, location = "inside") {
    let nW = new Wrapper(tag, void 0, initializers);
    if (location === "inside")
      this.element.appendChild(nW.element);
    if (location === "after")
      this.element.after(nW.element);
    if (location === "before")
      this.element.before(nW.element);
    return nW;
  }
  bindTo(target, boundFeature, xferFunc) {
    if (xferFunc != void 0) {
      target.addSubscriber(this, xferFunc);
    } else {
      if (boundFeature == void 0)
        throw new Error("No bound feature or xferFunc included.");
      if (boundFeature == "text")
        target.addSubscriber(this, (nv) => this.text(nv));
      if (boundFeature == "value")
        target.addSubscriber(this, (nv) => this.setVal(nv));
      if (boundFeature == "style")
        target.addSubscriber(this, (nv) => this.style(nv));
    }
  }
  bindToWrapper(targetWrapper, targetFeature, thisFeature, using) {
    let sub = {
      bindFeature: targetFeature,
      toFeature: thisFeature,
      ofWrapper: this,
      xferFunc: using
    };
    targetWrapper.addSubscriber(sub);
    let currentVal = targetWrapper.getText();
    if (sub.bindFeature === "style" && targetWrapper.getStyle() != null)
      currentVal = targetWrapper.getStyle();
    if (sub.bindFeature === "value")
      currentVal = targetWrapper.getVal().toString();
    this.handleChange(currentVal, sub);
    return this;
  }
  notifySubscribers() {
    this.subscribers.forEach((sub) => {
      let newVal = this.getText();
      if (sub.bindFeature == "value")
        newVal = this.getVal().toString();
      if (sub.bindFeature == "style")
        newVal = this.getStyle();
      sub.ofWrapper.handleChange(newVal, sub);
    });
    return this;
  }
  handleChange(newValue, subscription) {
    if (typeof subscription === "function") {
      subscription(newValue);
    } else {
      if (subscription.xferFunc) {
        subscription.xferFunc(newValue);
      } else {
        if (subscription.toFeature === "text")
          this.text(newValue);
        if (subscription.toFeature === "style")
          this.style(newValue);
        if (subscription.toFeature === "value")
          this.setVal(newValue);
      }
    }
  }
  addSubscriber(newSub) {
    this.subscribers.push(newSub);
    return this;
  }
  removeSubscriber(subbedWrapper) {
    this.subscribers = this.subscribers.filter((sub) => sub.ofWrapper != subbedWrapper);
    return this;
  }
  purgeSubscribers() {
    this.subscribers = [];
    return this;
  }
  text(text) {
    this.element.innerText = text;
    this.subscribers.forEach((sub) => {
      if (sub.bindFeature == "text")
        sub.ofWrapper.handleChange(text, sub);
    });
    return this;
  }
  attr(attribute, value) {
    this.element.setAttribute(attribute, value);
    return this;
  }
  html(html) {
    this.element.innerHTML = html;
    return this;
  }
  style(styleString, append) {
    let style2 = "";
    if (append && this.element.getAttribute("style") != null) {
      style2 = this.element.getAttribute("style").trim();
      if (style2.charAt(style2.length - 1) != ";")
        style2 = style2 + "; ";
    }
    this.element.setAttribute("style", style2 + styleString);
    this.subscribers.forEach((sub) => {
      if (sub.bindFeature === "style")
        sub.ofWrapper.handleChange(styleString, sub);
    });
    return this;
  }
  name(name) {
    this.element.setAttribute("name", name);
    return this;
  }
  placehold(placeholder) {
    this.element.setAttribute("placeholder", placeholder);
    return this;
  }
  getAttr(attribute) {
    return this.element.getAttribute(attribute);
  }
  setAttr(attribute, value) {
    return this.attr(attribute, value);
  }
  getStyle() {
    return this.element.getAttribute("style");
  }
  setStyle(styleString) {
    return this.style(styleString);
  }
  getText() {
    return this.element.innerText;
  }
  setText(text) {
    return this.text(text);
  }
  getVal() {
    if (this.element.tagName == "INPUT" && this.getAttr("type") == "checkbox")
      return this.element.checked;
    return this.element.value;
  }
  setVal(val) {
    this.element.value = val;
    this.subscribers.forEach((sub) => {
      if (sub.bindFeature === "value")
        sub.ofWrapper.handleChange(val, sub);
    });
    return this;
  }
  getData(key) {
    return this.element.dataset[key];
  }
  setData(key, val) {
    this.element.setAttribute("data-" + key, val);
    return this;
  }
  onEvent(eventType, fun) {
    this.element.addEventListener(eventType, (e) => fun(e));
    return this;
  }
  onClick(fun) {
    this.onEvent("click", fun);
    return this;
  }
  onInput(fun) {
    this.onEvent("input", fun);
    return this;
  }
  onChange(fun) {
    this.onEvent("change", fun);
    return this;
  }
  listContent(textList, idList) {
    if (this.element.tagName != "UL" && this.element.tagName != "OL") {
      console.error({ "Not a list container->:": this.element });
      throw new Error('List Content must be appended to a "ul" or "ol"');
    }
    if (idList) {
      if (textList.length != idList.length) {
        console.error({ "not the same length": textList, "as": idList });
        throw new Error("textList and idList not the same length");
      }
      textList.forEach((text, ind) => {
        this.newWrap("li", { "id": idList[ind] }).text(text);
      });
    } else {
      textList.forEach((text) => {
        this.newWrap("li").text(text);
      });
    }
    return this;
  }
  selectContent(textList, valList, idList) {
    if (!valList)
      valList = textList;
    if (textList.length != valList.length) {
      console.error({ "not the same length": textList, "as": valList });
      throw new Error("textList and idList not the same length");
    }
    if (idList) {
      if (textList.length != idList.length) {
        console.error({ "not the same length": textList, "as": idList });
        throw new Error("textList and idList not the same length");
      }
      textList.forEach((text, ind) => {
        this.newWrap("option", { id: idList[ind] }).text(text).setVal(valList[ind]);
      });
    } else {
      textList.forEach((text, ind) => {
        this.newWrap("option").text(text).setVal(valList[ind]);
      });
    }
    return this;
  }
  makeLabeledInput(id, inputTag, location, options) {
    let container = this.newWrap("div", void 0, location);
    inputTag = inputTag === void 0 ? "input" : inputTag;
    location = location === void 0 ? "inside" : location;
    let lbldInpt = new WrappedInputLabelPair(container.element, id, inputTag, options);
    return lbldInpt;
  }
}
class WrapperlessObservable {
  constructor(initVal) {
    __publicField(this, "value");
    __publicField(this, "subscribers");
    this.value = initVal;
    this.subscribers = [];
  }
  getVal() {
    return this.value;
  }
  setVal(newValue) {
    this.value = newValue;
    this.notifySubscribers();
  }
  addSubscriber(newSub, xferFunc) {
    this.subscribers.push({ sub: newSub, xferFunc });
  }
  notifySubscribers() {
    this.subscribers.forEach((m) => {
      m.sub.handleChange(this.value, m.xferFunc);
    });
  }
}
class Observer {
  constructor(init) {
    __publicField(this, "value");
    this.value = init;
  }
  bindTo(target, xferFunc) {
    if (xferFunc != void 0) {
      target.addSubscriber(this, xferFunc);
    } else {
      target.addSubscriber(this, (nv) => {
        this.value = nv;
      });
    }
    return this;
  }
  bindToWrapper(targetWrapper, targetFeature, using) {
    if (using == void 0)
      using = (nv) => {
        return nv;
      };
    let sub = {
      toFeature: "text",
      bindFeature: targetFeature,
      ofWrapper: targetWrapper,
      xferFunc: using
    };
    targetWrapper.addSubscriber(sub);
    let currentVal = targetWrapper.getText();
    if (sub.bindFeature === "style" && targetWrapper.getStyle() != null)
      currentVal = targetWrapper.getStyle();
    if (sub.bindFeature === "value")
      currentVal = targetWrapper.getVal();
    this.handleChange(currentVal, using);
    return this;
  }
  handleChange(newVal, doFun) {
    this.value = doFun(newVal);
  }
}
class WrappedInputLabelPair extends Wrapper {
  constructor(container, inputId, inputTag = "input", options) {
    super("div", container);
    __publicField(this, "container");
    __publicField(this, "label");
    __publicField(this, "input");
    this.container = this.element;
    this.style("display:flex");
    this.label = this.newWrap("label").attr("for", inputId).text("Input");
    this.input = this.newWrap(inputTag, { id: inputId });
    if (options) {
      if (options.contStyle)
        this.style(options.contStyle);
      if (options.inputStyle)
        this.input.style(options.inputStyle);
      if (options.lblStyle)
        this.label.style(options.lblStyle);
      if (options.lbl)
        this.label.text(options.lbl);
      if (options.placehold)
        this.input.placehold(options.placehold);
      if (options.default)
        this.input.setVal(options.default);
      if (options.inputType)
        this.input.attr("type", options.inputType);
      if (options.stacked && !options.contStyle && !options.inputStyle) {
        this.style("display:block");
        this.input.style("width: 100%; display: block");
      }
    }
  }
}
const app = Wrapper.wrap(document.querySelector("#app"));
app.newWrap("h1", { text: "Wrapper Library Test Page" });
let simpleSection = app.newWrap("section", { html: "<h1>Simple Examples</h1>" });
let myBody = simpleSection.newWrap("p", { id: "my-paragraph-2", style: "font-size:1.5em" }).text("Last time I checked, the time was: " + new Date().toLocaleTimeString());
simpleSection.newWrap("button", { text: "Check again" }).onEvent("click", () => {
  myBody.text(myBody.getText().substring(0, 35) + new Date().toLocaleTimeString());
});
let compositeSection = app.newWrap("section").newWrap("h1", { text: "Composite Examples" }).newWrap("div", { style: "display: grid; grid-column-layout: 1fr 1fr" }, "after");
let features = ["Supports Chaining", "Concise(er) syntax", "Basic data binding", "Component-ish things"];
compositeSection.newWrap("div", { style: "grid-column-start:1" }).newWrap("h2", { text: "Create Lists from Arrays" }).newWrap("ul", void 0, "after").listContent(features);
compositeSection.newWrap("div", { style: "grid-column-start:2" }).newWrap("h2", { text: "Create Selects from Arrays" }).newWrap("select", void 0, "after").selectContent(features);
let lbldInptSection = app.newWrap("section", { html: "<h1>Label-Input Pairs</h1>" });
lbldInptSection.newWrap("h2").text("Simple Text Input Example");
let inputPair = lbldInptSection.makeLabeledInput("text-input-example");
inputPair.label.style("margin-right: 0.5em");
lbldInptSection.newWrap("h2").text("Textarea Example");
let textareaPair = lbldInptSection.makeLabeledInput("textarea-example", "textarea", "inside", { stacked: true });
textareaPair.label.style("margin-right: 0.5em");
lbldInptSection.newWrap("h2").text("Other Types of Inputs");
let grid = lbldInptSection.newWrap("div").style("display: grid; grid-template-columns: 1fr 1fr");
let checkPair = grid.makeLabeledInput("check-input", "input", "inside", { inputType: "checkbox", lbl: "Show Date Example, too?" });
checkPair.input.element.checked = true;
checkPair.input.onEvent("click", () => {
  if (checkPair.input.getVal()) {
    datePair.style("display:flex");
  } else {
    datePair.style("display:none");
  }
});
let datePair = grid.makeLabeledInput("date-input", void 0, void 0, { inputType: "date", lbl: "Date Input", lblStyle: "margin-right: 0.5em" });
let genericBindingSection = app.newWrap("section", { html: "<h1>Generic Data Binding</h1>" });
genericBindingSection.newWrap("h2").text("Bound Wrapper to WrapperlessObservable");
let boundToVar = new WrapperlessObservable(5);
genericBindingSection.newWrap("p").text(boundToVar.getVal().toString()).bindTo(boundToVar, "text");
genericBindingSection.newWrap("button").text("Increment").onClick(() => {
  boundToVar.setVal(boundToVar.getVal() + 1);
});
genericBindingSection.newWrap("h2").text("Observer Watching the Observable From Above");
let boundVarView = genericBindingSection.newWrap("p").text("Double the number above: 10");
new Observer(boundToVar.getVal()).bindTo(boundToVar, (nv) => {
  boundVarView.text("Double the number above: " + nv * 2);
  return nv * 2;
});
genericBindingSection.newWrap("h2").text("Observer of Wrappers");
let inputToBindAgainst = genericBindingSection.newWrap("input").placehold("Enter some text");
let wrapperBondVarView = genericBindingSection.newWrap("p").text("Input value: ");
new Observer("whatever").bindToWrapper(inputToBindAgainst, "value", (nv) => {
  wrapperBondVarView.text("Input value: " + nv);
  return nv;
});
let wrapperBindingSection = app.newWrap("section", { html: "<h1>Inter-Wrapper Binding Example</h1>" });
wrapperBindingSection.newWrap("h2").text("Bound Select, with Binding Breaker Demo");
let bindingSelect = wrapperBindingSection.newWrap("select").selectContent(["1", "2", "3"], ["You picked one", "You picked two", "You picked three"]);
let boundToSelect = wrapperBindingSection.newWrap("p").bindToWrapper(bindingSelect, "value", "text");
wrapperBindingSection.newWrap("button", { text: "Break Binding" }).onEvent("click", () => {
  bindingSelect.removeSubscriber(boundToSelect);
  boundToSelect.text("Binding broken, this will no longer update.");
}).style("margin-right: 0.5em");
wrapperBindingSection.newWrap("button", { text: "Re-bind" }).onEvent("click", () => boundToSelect.bindToWrapper(bindingSelect, "value", "text"));
wrapperBindingSection.newWrap("h2", { text: "Binding Text & Style (via xferFunc)" });
let boundText = wrapperBindingSection.newWrap("p", { text: "Enter some text below and watch me change..." });
let bindingInput = wrapperBindingSection.newWrap("input").setVal("Enter a Color name!").placehold("Type a color name...");
boundText.bindToWrapper(bindingInput, "value", "text").bindToWrapper(bindingInput, "value", "style", (newVal) => {
  boundText.style("color:" + newVal);
});
//# sourceMappingURL=WrapperLib.es.js.map
