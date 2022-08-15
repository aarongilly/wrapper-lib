var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Observable {
  constructor(initVal) {
    __publicField(this, "obsVal");
    __publicField(this, "boundFrom");
    this.obsVal = initVal;
    this.boundFrom = [];
  }
  getVal(changeKey) {
    if (changeKey == void 0)
      return this.obsVal;
    let pathParts = changeKey.split(".");
    let target = this.obsVal;
    while (pathParts.length > 1) {
      let part = pathParts.shift();
      target = target[part];
    }
    return target[pathParts[0]];
  }
  setVal(newVal, changeKey) {
    if (changeKey) {
      let pathParts = changeKey.split(".");
      let target = this.obsVal;
      while (pathParts.length > 1) {
        let part = pathParts.shift();
        target = target[part];
      }
      target[pathParts[0]] = newVal;
    } else {
      this.obsVal = newVal;
    }
    this.notifySubscribers(newVal, changeKey);
    return this.obsVal;
  }
  notifySubscribers(newVal, changeKey) {
    this.boundFrom.forEach((b) => {
      if (b.to == this) {
        b.handleChange(newVal, changeKey);
      }
    });
  }
}
class Observer {
  constructor(initVal) {
    __publicField(this, "boundVal");
    __publicField(this, "boundTo");
    this.boundVal = initVal;
    this.boundTo = [];
  }
  bindTo(target, changeKey, xferFunc) {
    let binding = new Binding(this, target, changeKey, xferFunc);
    target.boundFrom.push(binding);
    this.boundTo.push(binding);
    return this;
  }
  getBindings() {
    return this.boundTo;
  }
  breakBinding(target, changeKey) {
    this.boundTo.forEach((b) => {
      if (b.to == target && b.changeKey == changeKey) {
        b.break();
      }
    });
    return this;
  }
}
class Binding {
  constructor(observer, boundTo, changeKey, xferFunc) {
    __publicField(this, "from");
    __publicField(this, "to");
    __publicField(this, "changeKey");
    __publicField(this, "xferFunc");
    this.from = observer;
    this.to = boundTo;
    this.changeKey = changeKey;
    if (xferFunc) {
      this.xferFunc = xferFunc;
    } else {
      if (changeKey) {
        this.xferFunc = () => {
          let pathParts = changeKey.split(".");
          let target = this.to.getVal();
          pathParts.forEach((p) => {
            if (target.hasOwnProperty(p)) {
              target = target[p];
            } else {
              console.warn(`
                            Attempting to traverse bound path '${changeKey}' 
                            failed at '${p}'`);
            }
          });
          this.from.boundVal = target;
        };
      } else {
        this.xferFunc = () => {
          this.from.boundVal = this.to.getVal();
        };
      }
    }
  }
  handleChange(newVal, changeKey) {
    if (changeKey == this.changeKey) {
      let xferResult = this.xferFunc(newVal, changeKey);
      if (xferResult != null && xferResult != void 0) {
        if (this.from.constructor.name == "Wrapper") {
          this.from.text(xferResult);
        } else {
          this.from.boundVal = xferResult;
        }
      }
    }
  }
  break() {
    this.from.boundTo = this.from.boundTo.filter((b) => b != this);
    this.to.boundFrom = this.to.boundFrom.filter((b) => b != this);
  }
}
class Wrapper extends Observable {
  constructor(tag, existingElement, intializers) {
    super("");
    __publicField(this, "element");
    __publicField(this, "parent");
    __publicField(this, "children");
    __publicField(this, "boundFrom");
    __publicField(this, "boundTo");
    __publicField(this, "boundVal");
    this.boundFrom = [];
    this.boundTo = [];
    this.children = [];
    if (existingElement) {
      this.element = existingElement;
    } else {
      this.element = document.createElement(tag);
    }
    if (this.element.tagName === "INPUT")
      this.onEvent("input", () => {
        this.notifySubscribers.bind(this)(this.getVal(), "value");
      });
    if (this.element.tagName === "SELECT")
      this.onEvent("change", () => {
        this.notifySubscribers.bind(this)(this.getVal(), "value");
      });
    if (this.element.tagName === "TEXTAREA")
      this.onEvent("input", () => {
        this.notifySubscribers.bind(this)(this.getVal(), "value");
      });
    if (intializers) {
      if (intializers.i)
        this.element.id = intializers.i;
      if (intializers.n)
        this.element.setAttribute("name", intializers.n);
      if (intializers.v) {
        if (this.element.hasOwnProperty("value")) {
          this.element.value = intializers.v;
        } else {
          throw new Error("attempted to set value on a tag that doesn't support that");
        }
      }
      if (intializers.t != void 0)
        this.element.innerText = intializers.t;
      if (intializers.h != void 0)
        this.element.innerHTML = intializers.h;
      if (intializers.c != void 0)
        this.class(intializers.c);
      if (intializers.s)
        this.element.setAttribute("style", intializers.s);
      if (intializers.iT)
        this.element.setAttribute("type", intializers.iT);
      if (intializers.b) {
        this.bindTo(intializers.b, void 0, (nv) => {
          this.text(nv);
        });
      }
    }
  }
  notifySubscribers(newVal, changeKey) {
    this.boundFrom.forEach((b) => {
      if (b.to == this) {
        b.handleChange(newVal, changeKey);
      }
    });
  }
  bindTo(target, changeKey, xferFunc) {
    if (!xferFunc)
      xferFunc = (nv) => {
        this.text(nv);
      };
    if (!changeKey && target.constructor.name == "Wrapper")
      changeKey = "value";
    let binding = new Binding(this, target, changeKey, xferFunc);
    target.boundFrom.push(binding);
    this.boundTo.push(binding);
    return this;
  }
  bindTextTo(target, changeKey, xferFunc) {
    this.text(JSON.stringify(target.getVal()));
    if (typeof target.getVal() == "string")
      this.text(target.getVal());
    if (target.constructor.name == "Wrapper" && changeKey == "text")
      this.text(target.getText());
    if (target.constructor.name == "Wrapper" && changeKey == "style")
      this.text(target.getStyle());
    return this.bindTo(target, changeKey, xferFunc);
  }
  bindStyleTo(target, changeKey, xferFunc) {
    if (!xferFunc)
      xferFunc = (nv) => {
        this.style(nv);
      };
    return this.bindTo(target, changeKey, xferFunc);
  }
  bindValueTo(target, changeKey, xferFunc) {
    if (!xferFunc)
      xferFunc = (nv) => {
        this.setVal(nv);
      };
    return this.bindTo(target, changeKey, xferFunc);
  }
  bindListTo(target, changeKey) {
    this.bindTo(target, changeKey, (nv) => {
      this.html("");
      this.listContent(nv);
    }).listContent(target.getVal());
  }
  bindSelectTo(target, changeKey) {
    this.bindTo(target, changeKey, (nv) => {
      this.html("");
      this.selectContent(nv);
    }).selectContent(target.getVal());
  }
  getBindings() {
    return this.boundTo;
  }
  breakBinding(target, changeKey) {
    this.boundTo.forEach((b) => {
      if (b.to == target && b.changeKey == changeKey) {
        b.break();
      }
    });
    return this;
  }
  static wrap(element, initializers) {
    return new Wrapper(element.tagName, element, initializers);
  }
  newWrap(tag, initializers, location = "inside") {
    let nW = new Wrapper(tag, void 0, initializers);
    if (location === "inside") {
      this.element.appendChild(nW.element);
      this.children.push(nW);
      nW.parent = this;
    }
    if (location === "after")
      this.element.after(nW.element);
    if (location === "before")
      this.element.before(nW.element);
    return nW;
  }
  text(text) {
    this.element.innerText = text;
    this.notifySubscribers(text, "text");
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
    this.notifySubscribers(this.getStyle(), "style");
    return this;
  }
  class(classText) {
    if (typeof classText === "string")
      classText = [classText];
    let classes = this.element.classList;
    classes.add(classText.join(" "));
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
  inputType(inputType) {
    this.element.setAttribute("type", inputType);
    return this;
  }
  kill() {
    this.element.remove();
  }
  killChildren() {
    this.children.forEach((child) => {
      child.kill();
    });
  }
  removeClass(className) {
    let classes = this.element.classList;
    classes.remove(className);
    return this;
  }
  relocate(relativeTo, location) {
    if (location === "inside")
      relativeTo.element.appendChild(this.element);
    if (location === "before")
      relativeTo.element.before(this.element);
    if (location === "after")
      relativeTo.element.after(this.element);
    return this;
  }
  getAttr(attribute) {
    return this.element.getAttribute(attribute);
  }
  setAttr(attribute, value) {
    return this.attr(attribute, value);
  }
  getStyle() {
    let style = this.element.getAttribute("style");
    if (style == null)
      style = "";
    return style;
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
    this.notifySubscribers(val, "value");
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
  onEnterKey(fun) {
    this.element.addEventListener("keyup", function(event) {
      if (event.code === "Enter") {
        event.preventDefault();
        fun(event);
      }
    });
    return this;
  }
  listContent(textList, idList) {
    if (this.element.tagName != "UL" && this.element.tagName != "OL") {
      console.error(`The Wrapper instance from which listContent was called is not 
            wrapped around a 'ul' or 'ol' element. It's a ${this.element}`);
      throw new Error('List Content must be appended to a "ul" or "ol"');
    }
    this.killChildren();
    if (idList) {
      if (textList.length != idList.length) {
        console.error({ "not the same length": textList, "as": idList });
        throw new Error("textList and idList not the same length");
      }
      textList.forEach((text, ind) => {
        this.newWrap("li", { "i": idList[ind] }).text(text);
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
        this.newWrap("option", { i: idList[ind] }).text(text).setVal(valList[ind]);
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
class WrappedInputLabelPair extends Wrapper {
  constructor(existingContainer, inputId, inputTag = "input", options) {
    super("div", existingContainer);
    __publicField(this, "container");
    __publicField(this, "label");
    __publicField(this, "input");
    this.container = this.element;
    this.style("display:flex");
    if (inputId === void 0)
      inputId = Math.random().toString(36).slice(6);
    this.label = this.newWrap("label").attr("for", inputId).text("Input");
    this.input = this.newWrap(inputTag, { i: inputId });
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
export { Binding, Observable, Observer, WrappedInputLabelPair, Wrapper };
