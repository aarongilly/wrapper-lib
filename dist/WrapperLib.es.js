var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
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
    let style = "";
    if (append && this.element.getAttribute("style") != null) {
      style = this.element.getAttribute("style").trim();
      if (style.charAt(style.length - 1) != ";")
        style = style + "; ";
    }
    this.element.setAttribute("style", style + styleString);
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
export { Observer, WrappedInputLabelPair, Wrapper, WrapperlessObservable };
//# sourceMappingURL=WrapperLib.es.js.map
