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
          if (typeof target == "object") {
            pathParts.forEach((p) => {
              if (target.hasOwnProperty(p)) {
                target = target[p];
              } else {
                console.warn(`
                                Attempting to traverse bound path '${changeKey}' 
                                failed at '${p}'`);
              }
            });
          }
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
  addChild(child) {
    child.relocate(this, "inside");
    this.children.push(child);
    child.parent = this;
    return child;
  }
  addBefore(child) {
    return child.relocate(this, "before");
  }
  addAfter(child) {
    return child.relocate(this, "after");
  }
  addMultiWrap(children2dArray, gapSizeCSS = "0.5em", containerType) {
    return new WrapGrid(children2dArray, this.element, gapSizeCSS, containerType);
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
  makeInputFor(singleKeyObj, label, forceTextarea, location = "inside") {
    let container = this.newWrap("div", void 0, location).style("display: flex;");
    let inputPair = new WrappedInputLabelPair(singleKeyObj, label, forceTextarea, container.element);
    container.addChild(inputPair.label);
    container.addChild(inputPair.input);
    return inputPair;
  }
  makeFormFor(obj, gridStyle, lblStyle, inputStyle) {
    let dynoForm = new DynamicForm(obj, gridStyle, lblStyle, inputStyle);
    dynoForm.form.relocate(this, "inside");
    return dynoForm;
  }
}
class LabeledInput {
  constructor(singleKeyObj, label, forceTextarea) {
    __publicField(this, "label");
    __publicField(this, "input");
    __publicField(this, "observer");
    if (typeof singleKeyObj != "object")
      throw new Error("Primatives cannot be used to create LabeledInput instances.");
    if (Object.keys(singleKeyObj).length > 1)
      console.warn("More than one key was passed into makeInputFor. Other keys were ignored");
    const key = Object.keys(singleKeyObj)[0];
    const val = singleKeyObj[key];
    const lbl = label ? label : key;
    let inputId = Math.random().toString(36).slice(7);
    this.label = new Wrapper("label").attr("for", inputId).text(lbl);
    let type = "text";
    if (typeof val === "number")
      type = "number";
    if (typeof val === "boolean")
      type = "checkbox";
    if (typeof val === "string" && val.length > 99)
      type = "textarea";
    if (Array.isArray(val)) {
      if (isArrayOfPrimatives(val)) {
        type = "select";
      } else {
        console.warn("An array of Objects is not supported by LabeledInput");
      }
    } else if (typeof val === "object") {
      if (Object.prototype.toString.call(val) === "[object Date]") {
        type = "date";
      } else {
        console.warn("Create a DynamicForm instance instead of a LabeledInput. (i.e. New DyanmicForm or wrapper.makeFormFor(...)");
      }
    }
    let inputTag = "input";
    if (forceTextarea != void 0) {
      if (forceTextarea) {
        type = "textarea";
      } else {
        type = "text";
      }
    }
    if (type === "textarea" || type === "select") {
      this.input = new Wrapper(type, void 0, { i: inputId });
      if (type === "select") {
        this.input.selectContent(val);
      }
    } else {
      this.input = new Wrapper(inputTag, void 0, { i: inputId, iT: type });
    }
    this.observer = new Observer();
    this.observer.bindTo(this.input, "value");
    if (type == "date") {
      this.input.setVal(val.toISOString().substr(0, 10));
    } else if (type === "checkbox") {
      this.observer.boundVal = val;
      if (val === true)
        this.input.setAttr("checked", "");
    } else {
      this.input.setVal(val);
    }
  }
}
class WrappedInputLabelPair extends Wrapper {
  constructor(singleKeyObj, label, forceTextarea, existingContainer) {
    super("div", existingContainer);
    __publicField(this, "container");
    __publicField(this, "label");
    __publicField(this, "input");
    __publicField(this, "observer");
    this.container = this.element;
    this.style("display:flex; gap: 0.5em;");
    let lbledInput = new LabeledInput(singleKeyObj, label, forceTextarea);
    this.label = lbledInput.label;
    this.input = lbledInput.input;
    this.observer = lbledInput.observer;
  }
}
class DynamicForm {
  constructor(obj, gridStyle, lblStyle, inputStyle, parentBreadCrumb) {
    __publicField(this, "form");
    __publicField(this, "parentBreadcrumb");
    __publicField(this, "gridStyle");
    __publicField(this, "lblStyle");
    __publicField(this, "inputStyle");
    __publicField(this, "lines");
    __publicField(this, "values");
    if (typeof obj != "object")
      throw new Error("Primatives cannot be used to create DynamicForm instances.");
    let items = Object.keys(obj);
    this.lines = [[]];
    this.inputStyle = inputStyle;
    this.gridStyle = gridStyle;
    this.lblStyle = lblStyle;
    this.values = {};
    this.parentBreadcrumb = parentBreadCrumb;
    items.forEach((key) => {
      let val = obj[key];
      if (isPrimative(val) || isDate(val) || isArrayOfPrimatives(val)) {
        let line = new LabeledInput({ [key]: obj[key] });
        if (lblStyle)
          line.label.style(lblStyle);
        if (inputStyle)
          line.input.style(inputStyle);
        this.values[key] = line.observer;
        this.lines.push([line.label, line.input]);
      } else {
        if (Array.isArray(val)) {
          this.lines.push([new Wrapper("h4", void 0, { s: "margin-bottom: 0.25em", t: key })]);
          val.forEach((i, j) => {
            let subform = new DynamicForm(i, gridStyle, lblStyle, inputStyle, j.toString());
            if (this.values[key] == void 0)
              this.values[key] = [];
            this.values[key].push(subform);
            this.lines.push([subform.form, "merge"]);
          });
        } else {
          let subform = new DynamicForm(val, gridStyle, lblStyle, inputStyle, key);
          this.values[key] = subform;
          this.lines.push([subform.form, "merge"]);
        }
      }
    });
    let containerType = "form";
    if (parentBreadCrumb)
      containerType = "fieldset";
    this.form = new Wrapper(containerType).addMultiWrap(this.lines);
    if (parentBreadCrumb)
      this.form.newWrap("legend").text(parentBreadCrumb.toString());
    if (gridStyle)
      this.form.style(this.form.getStyle() + "; " + gridStyle);
  }
  getFormData() {
    let returnObj = {};
    Object.keys(this.values).forEach((key) => {
      if (this.values[key].constructor.name == "DynamicForm") {
        returnObj[key] = this.values[key].getFormData();
      } else if (Array.isArray(this.values[key])) {
        let inside = [];
        this.values[key].forEach((subform) => {
          inside.push(subform.getFormData());
        });
        returnObj[key] = inside;
      } else {
        returnObj[key] = this.values[key].boundVal;
      }
    });
    return returnObj;
  }
  addFormSection(obj, mapKey) {
    let subform = new DynamicForm(obj, this.gridStyle, this.lblStyle, this.inputStyle, mapKey);
    this.form.addRow([subform.form, "merge"]);
    this.values[mapKey] = subform;
    return this;
  }
  addInputToForm(singleKeyObj, label, forceTextarea) {
    let key = Object.keys(singleKeyObj)[0];
    if (Object.keys(this.getFormData()).some((existingKey) => existingKey === key))
      console.warn("duplicate key detected: " + key);
    let inputPair = new WrappedInputLabelPair(singleKeyObj, label, forceTextarea);
    this.values[key] = inputPair.observer;
    this.form.addRow([inputPair.label, inputPair.input]);
    return this;
  }
}
class WrapGrid extends Wrapper {
  constructor(children2dArray, existingContainer, gapSizeCSS = "0.5em", containerType = "div") {
    super(containerType, existingContainer);
    __publicField(this, "rows");
    __publicField(this, "cols");
    this.style("display: grid; gap:" + gapSizeCSS);
    this.rows = children2dArray.length;
    this.cols = 0;
    children2dArray.forEach((row) => {
      if (row.length > this.cols)
        this.cols = row.length;
    });
    children2dArray.forEach((row, i) => {
      row.forEach((child, col) => {
        if (child != "merge") {
          let k = col + 1;
          while (row[k] == "merge")
            k++;
          child.style(`
                            ${child.getStyle()};
                            grid-row: ${i + 1};
                            grid-column: ${col + 1} / ${k + 1}
                        `);
          child.relocate(this, "inside");
        }
      });
    });
  }
  addRow(row) {
    row.forEach((child, col) => {
      if (child != "merge") {
        let k = col + 1;
        while (row[k] == "merge")
          k++;
        child.style(`
                        ${child.getStyle()};
                        grid-row: ${this.rows + 1};
                        grid-column: ${col + 1} / ${k + 1}
                    `);
        child.relocate(this, "inside");
      }
    });
    this.rows = this.rows + 1;
    return this;
  }
}
const isPrimative = (myVar) => {
  if (typeof myVar === "object")
    return false;
  if (typeof myVar === "function")
    return false;
  return true;
};
const isDate = (maybeDate) => {
  if (isPrimative(maybeDate))
    return false;
  return Object.prototype.toString.call(maybeDate) === "[object Date]";
};
const isArrayOfPrimatives = (val) => {
  if (!Array.isArray(val))
    return false;
  if (val.some((v) => !isPrimative(v)))
    return false;
  return true;
};
export { Binding, DynamicForm, LabeledInput, Observable, Observer, WrapGrid, WrappedInputLabelPair, Wrapper, isArrayOfPrimatives, isDate, isPrimative };
