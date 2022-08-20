
/**
 * The Observable class is built to enable {@link Observer | Observers} to
 * observe. This means that Observers can follow the {@link Observable.obsVal} of the
 * Observable they are bound to. See {@link Binding}. 
 */
export class Observable {
    private obsVal: any;
    public boundFrom: Binding[];
    /**
     * Observables hold a value and notify Observers when the value is set.
     * They do this by maintaining a list of Bindings in which they are the 'to'
     * object. Each time {@link Observable.setVal} is called they notify all subscribers in their 
     * boundFrom list. setVal can be of any type. If a 'changeKey' is provided to
     * setVal, the changeKey string will be treated as a path to a property in the
     * obsVal object. E.G. setVal('hello','message.toWorld') would set the 
     * 'toWorld' property within the 'message' property of the obsVal variable.
     * @param initVal the initial value of the Observables obsVal property.
     */
    constructor(initVal: any) {
        this.obsVal = initVal;
        this.boundFrom = [];
    }

    /**
     * Simple value getter
     * @param changeKey optional dot-separated path to property. 
     * Can reach nested properties by supplying a dot-delimited string of
     * property names. E.G. 'outer.inner'.
     * @returns the observed value
     */
    getVal(changeKey?: string) {
        if (changeKey == undefined) return this.obsVal;
        let pathParts = changeKey.split('.');
        let target = this.obsVal;
        while (pathParts.length > 1) {
            let part = pathParts.shift();
            target = target[part!];
        }
        return target[pathParts[0]];
    }

    /**
     * Value setter, notifies subscribers of change
     * @param newVal the new value for the observable
     * @param changeKey dot-separated path to nested property
     * Can reach nested properties by supplying a dot-delimited string of
     * property names. E.G. 'outer.inner'.
     * @returns the Observed value (obsVal) after the change
     */
    setVal(newVal: any, changeKey?: string) {
        if (changeKey) {
            let pathParts = changeKey.split('.');
            let target = this.obsVal;
            while (pathParts.length > 1) {
                let part = pathParts.shift();
                target = target[part!];
            }
            target[pathParts[0]] = newVal;
        } else {
            this.obsVal = newVal;
        }
        this.notifySubscribers(newVal, changeKey)//, this);
        return this.obsVal;
    }

    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @param newVal 
     * @param changeKey 
     */
    notifySubscribers(newVal: any, changeKey?: string) {
        this.boundFrom.forEach(b => {
            if (b.to == this) {
                b.handleChange(newVal, changeKey)
            }
        })
    }
}

export class Observer {
    public boundVal?: any;
    public boundTo: Binding[]
    /**
     * Observers watch Observables and react to changes to their Observed Value.
     * Observers themselves have a boundVal that will relate to the Observed Value
     * according ot the xferFunction. If not supplied, the xferFunction by default
     * will simply set boundVal equal to the observedVal. 
     * @param initVal optional, the initial value for the Observer's boundVal property
     */
    constructor(initVal?: any) {
        this.boundVal = initVal;
        this.boundTo = [];
    }

    /**
     * The main method for Observers, binds their boundVal to the Observable's
     * obsVal using a xferFunction. By default the xferFunction 
     * @param target the Observable to watch
     * @param changeKey optional, if specified, only changes made to the 
     * observable that include the same changeKey will result in changes
     * to this.boundVal. This can make the Observer only watch for changes
     * to specific parts of the Observable.
     * @param xferFunc custom logic to apply when transferring the obsVal
     * into the new value for boundVal. If this function returns a value, that
     * is what boundVal will be set to.
     * @returns this, for chaining
     */
    bindTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        let binding = new Binding(this, target, changeKey, xferFunc);
        target.boundFrom.push(binding);
        this.boundTo.push(binding);
        return this;
    }

    /**
     * Grab all the Bindings that are assocaited with this Observer
     * @returns array of Bindings where this == binding.from
     */
    getBindings() {
        return this.boundTo;
    }

    /**
     * Breaks all existing bindings between this and the target Observer.
     * If a changeKey is supplied, it will break only all Bindings wth that 
     * changeKey.
     * @param target 
     * @param changeKey 
     * @returns this, for chaining
     */
    breakBinding(target: Observable, changeKey?: string): Observer {
        this.boundTo.forEach(b => {
            if (b.to == target && b.changeKey == changeKey) {
                b.break();
            }
        })
        return this;
    }
}

export class Binding {
    public from: Observer;
    public to: Observable;
    public changeKey?: string;
    public xferFunc: Function
    /**
     * Bindings represent a connection between an {@link Observable} and an {@link Observer}.
     * They hold the xferFunction that changes the observable.obsVal into the 
     * observer.boundVal. If they contain a changeKey, then only changes to
     * the Observable with that key will cause the Observer to update.
     * @param observer the Observer to bind
     * @param boundTo the Observable to bind it to
     * @param changeKey if !undefined, only changes with this key will 
     * propagate to the Observer.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's {@link Observable.obsVal} to turn it into the new
     * value of the Observer's {@link Observer.boundVal}. 
     * If no xferFunc is supplied, by default the boundVal will be set equal to obsVal.
     * If this function returns a non-null, non-undefined value, 
     * that is the value that will be set. 
     * You may also choose to **not** include a return and instead 
     * handle the update logic entirely within your custom xferFunc.
     */
    constructor(observer: Observer, boundTo: Observable, changeKey?: string, xferFunc?: Function) {
        this.from = observer;
        this.to = boundTo;
        this.changeKey = changeKey;
        if (xferFunc) {
            this.xferFunc = xferFunc;
        } else {
            if (changeKey) {
                this.xferFunc = () => {
                    let pathParts = changeKey.split('.');
                    let target = this.to.getVal();
                    // console.log(pathParts);
                    if (typeof target == 'object') { //added this if 2022/08/19 in troubleshooting effort
                        pathParts.forEach(p => {
                            if (target.hasOwnProperty(p)) {
                                target = target[p]
                            } else {
                                console.warn(`
                                Attempting to traverse bound path '${changeKey}' 
                                failed at '${p}'`)
                            }
                        })
                    }
                    this.from.boundVal = target;
                };
            } else {
                this.xferFunc = () => {
                    this.from.boundVal = this.to.getVal();
                }
            }
        }
    }

    /**
     * This is typically only called by an Observable's 'setVal' function.
     * Maybe there's a use for calling it yourself outside of that context.
     * @param newVal the new value to send to the Observer
     * @param changeKey when supplied, this argument must match the value of
     * this's changeKey value in order to propagate the change.
     */
    public handleChange(newVal: any, changeKey?: string) {
        // console.log(this, newVal, changeKey);

        if (changeKey == this.changeKey) {
            let xferResult = this.xferFunc(newVal, changeKey)!;
            if (xferResult != null && xferResult != undefined) {
                if (this.from.constructor.name == "Wrapper") {
                    (<Wrapper>this.from).text(xferResult);
                } else {
                    this.from.boundVal = xferResult
                }
            }
        }
    }

    /**
     * Breaks the Binding and removes it from both the Observable and Observers
     * respective lists of active bindings.
     */
    public break() {
        this.from.boundTo = this.from.boundTo.filter(b => b != this);
        this.to.boundFrom = this.to.boundFrom.filter(b => b != this);
    }
}

/**
 * Options that Wrappers can be initialized with.
 */
export interface WrapperOptions {
    i?: string; //id
    n?: string; //name attribute
    v?: string; //value
    t?: string; //innerText
    c?: string //class
    h?: string; //innerHTML
    s?: string; //style attribute
    b?: Observable; //bind (text) to
    iT?: InputType;
}

export type ObservableFeature = "text" | "value" | "style"
export type WrapperPosition = "inside" | "before" | "after"
export type InputType = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"

type HTMLElementsWithValue = HTMLButtonElement | HTMLInputElement | HTMLMeterElement | HTMLLIElement | HTMLOptionElement | HTMLProgressElement | HTMLParamElement;

export class Wrapper extends Observable implements Observer { //implements Observable, Observer {
    /**
     * The HTML Element the Wrapper is wrapping. The thing it's adding value to.
     */
    public element: HTMLElement;
    /**
     * The Wrapper whose wrapped HTML Element contains this.element.
     */
    public parent: Wrapper | undefined;
    /**
     * All the Wrappers whose wrapped HTML Element is contained in this.element
     */
    public children: Wrapper[];
    /**
     * List of Observers who are watching this Wrapper.
     */
    public boundFrom: Binding[];
    /**
     * The Observable(s) whom this Wrapper is watching in some manner.
     */
    public boundTo: Binding[];
    /**
     * Holds the value the Wrapper sees in its Observable
     */
    public boundVal: any;
    /**
     * Wrappers 'wrap' HTMLElements and are utilized to make changes to them.
     * Wrappers function as both Observables and Observers. They can be bound to 
     * Observables or other Wrappers or bound from Observers or other Wrappers.
     * @param tag the tag of the element to create (if existingElement == undefined)
     * @param existingElement the element to wrap. If undefined, an element will be 
     * create on the document object, BUT WILL NOT BE VISIBLE UNTIL YOU APPEND IT TO SOMETHING
     * @param intializers a map of {@link WrapperOptions} to initialize the Wrapper with, 
     * a shorthand for many methods
     */
    constructor(tag?: keyof HTMLElementTagNameMap, existingElement?: HTMLElement, intializers?: WrapperOptions) {
        super("");
        this.boundFrom = [];
        this.boundTo = [];
        this.children = [];
        if (existingElement) {
            this.element = existingElement;
        } else {
            this.element = document.createElement(tag!)
        }
        //auto-call notify subscribers if inputs change
        if (this.element.tagName === "INPUT") this.onEvent('input', () => { this.notifySubscribers.bind(this)(this.getVal(), 'value') });
        if (this.element.tagName === "SELECT") this.onEvent('change', () => { this.notifySubscribers.bind(this)(this.getVal(), 'value') });
        if (this.element.tagName === "TEXTAREA") this.onEvent('input', () => { this.notifySubscribers.bind(this)(this.getVal(), 'value') });
        if (intializers) {
            if (intializers.i) this.element.id = intializers.i!;
            if (intializers.n) this.element.setAttribute('name', intializers.n!);
            if (intializers.v) {
                if (this.element.hasOwnProperty('value')) {
                    (<HTMLElementsWithValue>this.element).value = intializers.v!;
                } else {
                    throw new Error("attempted to set value on a tag that doesn't support that")
                }
            }
            if (intializers.t != undefined) this.element.innerText = intializers.t!;
            if (intializers.h != undefined) this.element.innerHTML = intializers.h!;
            if (intializers.c != undefined) this.class(intializers.c!);
            if (intializers.s) this.element.setAttribute('style', intializers.s!);
            if (intializers.iT) this.element.setAttribute('type', intializers.iT);
            if (intializers.b) {
                this.bindTo(intializers.b, undefined, (nv: string) => {
                    this.text(nv);
                })
            }
        }
    }

    /**
     * Notifies the subscribers in the Wrappers boundFrom list of changes.
     * Typically only called internally by setter methods in Wrapper.
     * @param newVal the new value to notify the Observers about
     * @param changeKey a key for the change describing what part 
     * of the Wrapper changed.
     */
    notifySubscribers(newVal: any, changeKey?: string): void {
        this.boundFrom.forEach(b => {
            if (b.to == this) {
                b.handleChange(newVal, changeKey)
            }
        })
    }

    /**
     * Binds the innerText of the Wrapper to the target.
     * @param target the Observable to bind to
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's obsVal to turn it into the new
     * value of the Observer's boundVal. 
     * If no xferFunc is supplied, by default the boundVal will be set equal to obsVal.
     * If this function returns a non-null, non-undefined value, 
     * that is the value that will be set. 
     * You may also choose to **not** include a return and instead 
     * handle the update logic entirely within your custom xferFunc.
     * @returns this, for chaining
     */
    bindTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        if (!xferFunc) xferFunc = (nv: any) => { this.text(nv) }
        if (!changeKey && target.constructor.name == "Wrapper") changeKey = 'value'; //default
        let binding = new Binding(this, target, changeKey, xferFunc);
        target.boundFrom.push(binding);
        this.boundTo.push(binding);
        return this;
    }

    /**
     * Simple alias for for bindTo'.
     * Binds the innerText of the Wrapper to the target.
     * @param target the Observable to bind to
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's obsVal to turn it into the new
     * value of the Observer's boundVal. 
     * If no xferFunc is supplied, by default the boundVal will be set equal to obsVal.
     * If this function returns a non-null, non-undefined value, 
     * that is the value that will be set. 
     * You may also choose to **not** include a return and instead 
     * handle the update logic entirely within your custom xferFunc.
     * @returns this, for chaining
     */
    bindTextTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        this.text(JSON.stringify(target.getVal())); //seems to work?
        if (typeof target.getVal() == 'string') this.text(target.getVal()); //prevents quotes
        if (target.constructor.name == "Wrapper" && changeKey == 'text') this.text((<Wrapper>target).getText())
        if (target.constructor.name == "Wrapper" && changeKey == 'style') this.text((<Wrapper>target).getStyle())
        return this.bindTo(target, changeKey, xferFunc);
    }

    /**
     * Binds the styleAttribute of the Wrapper to the target.
     * @param target the Observable to bind to
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's obsVal to turn it into the new
     * value of the Observer's boundVal. 
     * If no xferFunc is supplied, by default the boundVal will be set equal to obsVal.
     * If this function returns a non-null, non-undefined value, 
     * that is the value that will be set. 
     * You may also choose to **not** include a return and instead 
     * handle the update logic entirely within your custom xferFunc.
     * @returns this, for chaining
     */
    bindStyleTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        if (!xferFunc) xferFunc = (nv: any) => { this.style(nv) }
        return this.bindTo(target, changeKey, xferFunc);
    }

    /**
     * Binds the value attribute of the Wrapper to the target.
     * @param target the Observable to bind to
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's obsVal to turn it into the new
     * value of the Observer's boundVal. 
     * If no xferFunc is supplied, by default the boundVal will be set equal to obsVal.
     * If this function returns a non-null, non-undefined value, 
     * that is the value that will be set. 
     * You may also choose to **not** include a return and instead 
     * handle the update logic entirely within your custom xferFunc.
     * @returns this, for chaining
     */
    bindValueTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        if (!xferFunc) xferFunc = (nv: any) => { this.setVal(nv) }
        return this.bindTo(target, changeKey, xferFunc);
    }

    /**
     * Create a set of 'li' Wrappers for each element in the target's 
     * obsVal (if the obsVal is an array). Should be called on a Wrapper
     * that's wrapping a 'ul' or 'li' element.
     * @param target Observable with an obsVal that's an array.
     * Works best if it's an array of Strings or numbers.
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     */
    bindListTo(target: Observable, changeKey?: string) {
        this.bindTo(target, changeKey, (nv: Array<string>) => {
            this.html(''); //nuke old array
            this.listContent(nv);
        }).listContent(target.getVal()); //bindTo array doesn't support grabbing intial value
    }

    /**
     * Create a set of 'option'>' Wrappers for each element in the target's 
     * obsVal (if the obsVal is an array). Should be called on a Wrapper 
     * that is wrapping a 'select' element.
     * @param target Observable with an obsVal that's an array.
     * Works best if it's an array of Strings or numbers.
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     */
    bindSelectTo(target: Observable, changeKey?: string) {
        this.bindTo(target, changeKey, (nv: Array<string>) => {
            this.html(''); //nuke old array
            this.selectContent(nv);
        }).selectContent(target.getVal()); //bindTo array doesn't support grabbing intial value
    }

    /**
    * Grab all the Bindings that are assocaited with this Observer
    * @returns array of Bindings where this == binding.from
    */
    getBindings() {
        return this.boundTo;
    }

    /**
     * Breaks all existing bindings between this and the target Observer.
     * If a changeKey is supplied, it will break only all Bindings wth that 
     * changeKey.
     * @param target 
     * @param changeKey 
     * @returns this, for chaining
     */
    breakBinding(target: Observable, changeKey?: string): Observer {
        this.boundTo.forEach(b => {
            if (b.to == target && b.changeKey == changeKey) {
                b.break();
            }
        })
        return this;
    }

    /**
     * Wraps an existing HTML Element with a Wrapper
     * @param element the element to wrap
     * @param initializers a map of {@link WrapperOptions} to initialize the Wrapper with.
     * @returns the new wrapper, for chaining
     */
    static wrap(element: HTMLElement, initializers?: WrapperOptions): Wrapper {
        return new Wrapper((<keyof HTMLElementTagNameMap>element.tagName), element, initializers);
    }

    /**
     * Creates a new Wrapper instance inside, before, or after the one it was called against.
     * Returns the newly created wrapper.
     * @param tag tag of the HTML Element to create
     * @param initializers an object with optional keys to initialize the element with
     * @param location inside appendChild(), before before(), after after()
     * @returns the new wrapper, for chaining
     */
    newWrap(tag: keyof HTMLElementTagNameMap, initializers?: WrapperOptions, location: WrapperPosition = 'inside'): Wrapper {
        let nW = new Wrapper(tag, undefined, initializers);
        if (location === 'inside') {
            this.element.appendChild(nW.element);
            this.children.push(nW);
            nW.parent = this;
        }
        if (location === 'after') this.element.after(nW.element);
        if (location === 'before') this.element.before(nW.element);
        return nW;
    }

    /**
     * Sets the innerText of the wrapped element.
     * @param text the text to set
     * @returns this, for chaining
     */
    text(text: string): Wrapper {
        this.element.innerText = text;
        this.notifySubscribers(text, 'text');
        return this
    }

    /**
     * Chainable horthand for this.element.setAttribute(attribute, value)
     * @param attribute attribute to set
     * @param value value to set it to
     * @returns this, for chaining
     */
    attr(attribute: string, value: string): Wrapper {
        this.element.setAttribute(attribute, value);
        return this;
    }

    /**
     * Sets the innerHTML of the wrapped element.
     * @param html the text to set
     * @returns this, for chaining
     */
    html(html: string): Wrapper {
        this.element.innerHTML = html;
        return this
    }

    /**
     * Sets the `style` attribute of the wrapped element
     * @param styleString string literal for css styles
     * @param append true = append to the existing styles; false =  replace it
     * @returns this, for chaining
     */
    style(styleString: string, append?: boolean): Wrapper {
        let style = "";
        if (append && this.element.getAttribute('style') != null) {
            style = this.element.getAttribute('style')!.trim();
            if (style.charAt(style.length - 1) != ";") style = style + "; "
        }
        this.element.setAttribute('style', style + styleString);
        this.notifySubscribers(this.getStyle(), 'style');
        return this
    }

    /**
     * Sets the classList of the Wrapped Element
     * @param classText a single class name or array of class names to apply
     * @returns this, for chaining
     */
    class(classText: string | string[]) {
        if (typeof classText === "string") classText = [classText];
        let classes = this.element.classList;
        classes.add(classText.join(" "));
        return this;
    }

    /**
     * Sets the name of the wrapped element.
     * @param name the text to set
     * @returns this, for chaining
     */
    name(name: string): Wrapper {
        this.element.setAttribute('name', name);
        return this
    }

    /**
     * Sets the placeholder of the wrapped element.
     * @param placeholder the text to set
     * @returns this, for chaining
     */
    placehold(placeholder: string): Wrapper {
        this.element.setAttribute('placeholder', placeholder);
        return this
    }

    /**
     * Sets the input "type" attribute on the wrapped Element
     * @param inputType a valid input type string to apply to the input element
     * @returns this, for chaining
     */
    inputType(inputType: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"): Wrapper {
        this.element.setAttribute('type', inputType);
        return this
    }

    /**
     * Removes the element associated with the wrapper from the page
     */
    kill() {
        this.element.remove();
    }

    /**
     * Removes any child wrappers from the parent wrapper
     */
    killChildren() {
        this.children.forEach((child) => {
            child.kill();
        })
    }

    /**
     * Calls "remove" on the classList of the wrapped element
     * @param className class to remove from the element
     * @returns this, for chaining
     */
    removeClass(className: string): Wrapper {
        let classes = this.element.classList;
        classes.remove(className);
        return this;
    }

    /**
     * Moves an existing Wrapper to a new location on the page. The existing wrapper
     * need not already be on the page.
     * @param relativeTo a Wrapper instance to move near
     * @param location where to put this wrapper relative to the other
     * @returns this, for chaining
     */
    relocate(relativeTo: Wrapper, location: "inside" | "after" | "before") {
        if (location === 'inside') relativeTo.element.appendChild(this.element);
        if (location === 'before') relativeTo.element.before(this.element);
        if (location === 'after') relativeTo.element.after(this.element);
        return this;
    }

    /**
     * Returns the value of a given attribute on the wrapped element
     * @returns the value of attribute on the element, or null if no attribute exists
     */
    getAttr(attribute: string): string | null {
        return this.element.getAttribute(attribute);
    }

    /**
     * Simple alias for {@link attr}.
     * @param attribute attribute name to set
     * @param value the value to set
     * @returns this, for chaining
     */
    setAttr(attribute: string, value: string): Wrapper {
        return this.attr(attribute, value);
    }

    /**
     * Returns the style string of a given attribute on the wrapped element
     * @returns the style string of attribute on the element, or null if no attribute exists
     */
    getStyle(): string {
        let style = this.element.getAttribute('style');
        if (style == null) style = ''
        return style
    }

    /**
     * Simple alias for {@link style}.
     * @param styleString the value to set
     * @returns this, for chaining
     */
    setStyle(styleString: string): Wrapper {
        return this.style(styleString);
    }

    /**
     * Returns the innerText of the wrapped element
     * @returns the innerText of the wrapped element
     */
    getText(): string {
        return this.element.innerText;
    }

    /**
     * Simple alias for {@link text}.
     * @param text string to set
     * @returns this, for chaining
     */
    setText(text: string): Wrapper {
        return this.text(text);
    }


    /**
     * Gets the value of Wrapped things like inputs, textareas
     * @returns the value of the wrapped element
     */
    getVal() {
        if (this.element.tagName == 'INPUT' && this.getAttr('type') == "checkbox") return (<HTMLInputElement>this.element).checked;
        return (<HTMLInputElement>this.element).value //inline type assertion IS possible
    }

    /**
     * Sets the value of Wrapped things like inputs, textareas
     * @returns this, for chaining
     */
    setVal(val: string) {
        (<HTMLInputElement | HTMLParamElement | HTMLButtonElement |
            HTMLOptionElement | HTMLLIElement>this.element).value = val;
        this.notifySubscribers(val, 'value');
        return this;
    }

    /**
     * Grabs data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @returns the value of the keyed data
     */
    getData(key: string) {
        return this.element.dataset[key];
    }

    /**
     * Sets data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @param val the string to be stored
     * @returns this, for chaining
     */
    setData(key: string, val: string) {
        this.element.setAttribute('data-' + key, val);
        return this;
    }

    /**
     * Adds an existing Wrapper inisde this Wrapper's wrapped 
     * element. Useful for adding wrappers functions returned
     * by functions into the page.
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addChild(child: Wrapper) {
        child.relocate(this, 'inside');
        this.children.push(child);
        child.parent = this;
        return child;
    }

    /**
     * Adds an existing Wrapper before this Wrapper's position
     * in the DOM. Useful for adding wrappers functions returned
     * by functions into the page.
     * 
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addBefore(child: Wrapper) {
        return child.relocate(this, 'before');
    }

    /**
     * Adds an existing Wrapper after this Wrapper's position
     * in the DOM. Useful for adding wrappers functions returned
     * by functions into the page.
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addAfter(child: Wrapper) {
        return child.relocate(this, 'after');
    }

    /**
     * Adds a 2-D array of children into the container Wrapper
     * in accordance with where they are positioned in the array.
     * It will space them using the CSS String provided
     * @param children2dArray 2d Array of Wrappers to insert
     * @param gapSizeCSS the space between them, e.g. '10px' or '1em' or '10%'. Defaults to '0.5em'
     * @returns this, for chaining
     */
    addMultiWrap(children2dArray: (Wrapper | 'merge')[][], gapSizeCSS: string = "0.5em", containerType?: keyof HTMLElementTagNameMap) {
        return new WrapGrid(children2dArray, this.element, gapSizeCSS, containerType);
    }

    /**
     * Creates a new event listener of the given type on the Wrapped element
     * @param eventType type of event to bind the function to
     * @param fun the function to run when the event occurs
     * @returns this, for chaining
     */
    onEvent(eventType: keyof HTMLElementEventMap, fun: Function): Wrapper {
        this.element.addEventListener(eventType, (e) => fun(e));
        return this;
    }

    /**
     * Creates a new click event listener on the wrapped element
     * @param fun the function to run on click;
     * @returns this, for chaining
     */
    onClick(fun: Function): Wrapper {
        this.onEvent('click', fun);
        return this;
    }

    /**
    * Creates a new input event listener on the wrapped element
    * @param fun the function to run on input;
    * @returns this, for chaining
    */
    onInput(fun: Function): Wrapper {
        this.onEvent('input', fun);
        return this;
    }

    /**
     * Creates a new change event listener on the wrapped element
     * @param fun the function to run on changes;
     * @returns this, for chaining
     */
    onChange(fun: Function): Wrapper {
        this.onEvent('change', fun);
        return this;
    }

    /**
     * Creates a new change event listener on the wrapped element
     * @param fun the function to run on changes;
     * @returns this, for chaining
     */
    onEnterKey(fun: Function): Wrapper {
        this.element.addEventListener("keyup", function (event: KeyboardEvent) {
            if (event.code === "Enter") {
                event.preventDefault();
                fun(event);
            }
        });
        return this;
    }


    ///#region #### Composite Wrappers ####
    /**
     * For use with ordered list or unordered list elements. EXPECTS TO BE PUT INSIDE 
     * AN EXISTING LIST ELEMENT.
     *  Creates a series of LI elements for elements in an List
     * @param textList the visible text to create each element for
     * @param idList optional IDs to include
     * @returns this, for chaining
     */
    listContent(textList: string[], idList?: string[]) {
        if (this.element.tagName != 'UL' && this.element.tagName != 'OL') {
            console.error(`The Wrapper instance from which listContent was called is not 
            wrapped around a 'ul' or 'ol' element. It's a ${this.element}`);
            throw new Error('List Content must be appended to a "ul" or "ol"');
        }
        this.killChildren();
        if (idList) {
            if (textList.length != idList.length) {
                console.error({ 'not the same length': textList, 'as': idList });
                throw new Error('textList and idList not the same length');
            }
            textList.forEach((text, ind) => {
                this.newWrap('li', { 'i': idList[ind] }).text(text);
            })
        } else {
            textList.forEach((text) => {
                this.newWrap('li').text(text);
            })
        }
        return this;
    }

    /**
     * For use with select elements. EXPECTS TO BE PUT INSIDE
     * AN EXISTING SELECT ELEMENT.
     * Creates a list of Option elements inside the Select
     * with the given display text and value text
     * @param textList 
     * @param valList 
     * @param idList 
     * @returns this, for chaining
     */
    selectContent(textList: string[], valList?: string[], idList?: string[]) {
        if (!valList) valList = textList;
        if (textList.length != valList.length) {
            console.error({ 'not the same length': textList, 'as': valList });
            throw new Error('textList and idList not the same length');
        }
        if (idList) {
            if (textList.length != idList.length) {
                console.error({ 'not the same length': textList, 'as': idList });
                throw new Error('textList and idList not the same length');
            }
            textList.forEach((text, ind) => {
                this.newWrap('option', { i: idList[ind] }).text(text).setVal(valList![ind]);
            })
        } else {
            textList.forEach((text, ind) => {
                this.newWrap('option').text(text).setVal(valList![ind]);
            })
        }
        return this;
    }

    /**
     * Creates a flexbox-wrapped label & input pair based on the single-keyed object passed in.
     * Will attempt to parse the type of the value and return the correct input type.
     * @param singleKeyObj object for which the form should be made
     * @param label override the label text
     * @param forceTextarea if set, forces a textarea (true) or text input (false)
     * @param location where to put the the top-level wrapper in relation to this
     * @returns array of [topWrapper, lblWrapper, inputWrapper, observer]
     */
    makeInputFor(singleKeyObj: { [key: string]: any }, label?: string, forceTextarea?: boolean, location: WrapperPosition = 'inside') {
        let container = this.newWrap('div', undefined, location).style('display: flex;')
        let inputPair = new WrappedInputLabelPair(singleKeyObj, label, forceTextarea, container.element);
        container.addChild(inputPair.label);
        container.addChild(inputPair.input);
        return inputPair
    }

    /**
     * Creates a {@link DynamicForm} from an Object with multiple keys.
     * @param obj the object to create the DynamicForm against
     * @param gridStyle the css styles to apply to the grid
     * @param lblStyle the css styles to apply to the label
     * @param inputStyle the css styles to apply to the input
     * @returns the created {@link DynamicForm}
     */
    makeFormFor(obj: Record<string, any>, gridStyle?: string, lblStyle?: string, inputStyle?: string): DynamicForm {
        let dynoForm = new DynamicForm(obj, gridStyle, lblStyle, inputStyle)
        dynoForm.form.relocate(this, 'inside')
        return dynoForm
    }
}


/**
 * LabeledInput is a class meant to make it easier to create individual HTML Inputs,
 * labels that are associated with them, and an Observer to watch the value of the input. 
 */
export class LabeledInput {
    public label: Wrapper;
    public input: Wrapper;
    public observer: Observer

    /**
     * Creates a label, an input, and an Observer, all wired together.
     * Will interpret the type of variable and return an appropriate input flavor.
     * Text strings of 100 or more characters will default as textareas.
     * @param singleKeyObj an object with a single key & value, the value is of type primative | date | (string|number)[]
     * @param label the label to apply to the input, defaults to the key of the object
     * @param forceTextarea if specified, will force inputs to be either textareas (if true) or regular text inputs (if false)
     */
    constructor(singleKeyObj: { [key: string]: any }, label?: string, forceTextarea?: boolean) {
        if (typeof singleKeyObj != 'object') throw new Error("Primatives cannot be used to create LabeledInput instances.");
        if (Object.keys(singleKeyObj).length > 1) console.warn("More than one key was passed into makeInputFor. Other keys were ignored");

        const key = Object.keys(singleKeyObj)[0]
        const val = singleKeyObj[key];
        const lbl = label ? label : key;

        let inputId = Math.random().toString(36).slice(7); //make random id
        this.label = new Wrapper('label').attr('for', inputId).text(lbl);

        //infer type
        let type: InputType | 'select' | 'textarea' = 'text';
        if (typeof val === 'number') type = "number";
        if (typeof val === 'boolean') type = "checkbox";
        if (typeof val === 'string' && val.length > 99) type = 'textarea';
        if (Array.isArray(val)) {
            if (isArrayOfPrimatives(val)) {
                type = 'select';
            } else {
                console.warn("An array of Objects is not supported by LabeledInput");
            }
        } else if (typeof val === "object") {
            if (Object.prototype.toString.call(val) === "[object Date]") {
                type = 'date';
            } else {
                console.warn("Create a DynamicForm instance instead of a LabeledInput. (i.e. New DyanmicForm or wrapper.makeFormFor(...)");
                //this.makeFormSectionFor(key, val)
            }
        }
        let inputTag: keyof HTMLElementTagNameMap = 'input';
        if (forceTextarea != undefined) {
            if (forceTextarea) {
                type = 'textarea'
            } else {
                type = 'text'
            }
        }

        //use type to build input & set it's value
        if (type === 'textarea' || type === 'select') {
            this.input = new Wrapper(type, undefined, { i: inputId });
            if (type === 'select') {
                this.input.selectContent(val);
            }
        } else {
            this.input = new Wrapper(inputTag, undefined, { i: inputId, iT: type });
        }
        this.observer = new Observer();
        this.observer.bindTo(this.input, 'value');

        if (type == 'date') {
            this.input.setVal(val.toISOString().substr(0, 10))
        } else if (type === 'checkbox') {
            this.observer.boundVal = val; //not sure why I have to do this
            if (val === true) this.input.setAttr('checked', '')
        } else {
            this.input.setVal(val)
        }
    }
}

/**
 * This class is a Wrapper-bound {@link LabeledInput}.
 */
export class WrappedInputLabelPair extends Wrapper {
    public container: HTMLElement;
    public label: Wrapper;
    public input: Wrapper;
    public observer: Observer
    /**
     * Creates 3 Wrappers and an Observer. An outer, containing Wrapper (div) with an input Wrapper
     * and a label Wrapper inside it. The input is bound to the container by the inputId.
     * By default the container style is set to 'display: flex; gap: 0.5em'
     * @param existingContainer Where to put the WrappedInputLabelPair
     * @param label text to use for the label (defaults to the object's key)
     * @param forceTextarea if set, will force input to be text area (if true) or to be regular text input (if false), defaults false for strings of <100 chars
     * @param existingContainer optional, the HTML Element to use to host the Wrapper
     */
    constructor(singleKeyObj: { [key: string]: any }, label?: string, forceTextarea?: boolean, existingContainer?: HTMLElement,) {
        super('div', existingContainer);
        this.container = this.element;
        this.style('display:flex; gap: 0.5em;');
        let lbledInput = new LabeledInput(singleKeyObj, label, forceTextarea)
        this.label = lbledInput.label;
        this.input = lbledInput.input;//.style('flex-grow: 1');
        this.observer = lbledInput.observer;
    }
}

/**
 * Dynamic Form instances allow you to build a simple input UI seeded from an arbirarily complex Object
 * (the Object cannot have self-referential pointers, but most don't).
 * It allows the user to update the form, and for you to quickly pull a new Object that reflects the
 * user's updates.
 * 
 * Currently Forms are limited to 2 columns.
 * 
 * Wow I can't believe I got this working so quickly.
 */
export class DynamicForm {
    public form: WrapGrid;
    public parentBreadcrumb?: string | number;
    public gridStyle?: string;
    public lblStyle?: string;
    public inputStyle?: string;
    private lines: (Wrapper | 'merge')[][];
    private values: Record<string, any>;
    // private cols: number;
    /**
     * Creates a new {@link DynamicForm} instance. 
     * @param obj the object the form should be based on
     * @param gridStyle the css styles to apply to the grid
     * @param lblStyle the css styles to apply to the label
     * @param inputStyle the css styles to apply to the input
     * @param parentBreadCrumb probably don't set this manually, it's used when creating subforms via {@link DynamicForm.addFormSection}
     */
    constructor(obj: Record<string, any>, gridStyle?: string, lblStyle?: string, inputStyle?: string, parentBreadCrumb?: string | number) {
        if (typeof obj != 'object') throw new Error("Primatives cannot be used to create DynamicForm instances.");
        let items = Object.keys(obj);
        this.lines = [[]]
        this.inputStyle = inputStyle;
        this.gridStyle = gridStyle;
        this.lblStyle = lblStyle;
        this.values = {};
        this.parentBreadcrumb = parentBreadCrumb;

        items.forEach(key => {
            let val = obj[key];
            if (isPrimative(val) || isDate(val) || isArrayOfPrimatives(val)) {
                let line = new LabeledInput({ [key]: obj[key] });
                //make a simple input
                if (lblStyle) line.label.style(lblStyle);
                if (inputStyle) line.input.style(inputStyle);
                this.values[key] = line.observer;
                this.lines.push([line.label, line.input]);
            } else {
                //make a form section
                if (Array.isArray(val)) {
                    this.lines.push([new Wrapper('h4', undefined, { s: "margin-bottom: 0.25em", t: key })]);
                    val.forEach((i, j) => {
                        let subform = new DynamicForm(i, gridStyle, lblStyle, inputStyle, j) //RECURSION
                        if (this.values[key] == undefined) this.values[key] = [];
                        this.values[key].push(subform);// = subform;
                        this.lines.push([subform.form, 'merge']);
                    })
                } else {
                    let subform = new DynamicForm(val, gridStyle, lblStyle, inputStyle, key) //RECURSION
                    this.values[key] = subform;
                    this.lines.push([subform.form, 'merge']);
                }
            }
        })
        let containerType: keyof HTMLElementTagNameMap = 'form';
        if (parentBreadCrumb) containerType = 'fieldset'
        this.form = new Wrapper(containerType).addMultiWrap(this.lines);
        if (parentBreadCrumb) this.form.newWrap('legend').text(parentBreadCrumb.toString())
        if (gridStyle) this.form.style(this.form.getStyle() + "; " + gridStyle)
    }

    /**
     * Get Form Data allows you to construct a single, possibly nested object
     * representing the current state of the form. 
     * @returns a NEW object shaped like the object the DynamicForm was built from, with its current contents
     */
    getFormData() {
        let returnObj: any = {};
        Object.keys(this.values).forEach(key => {
            if (this.values[key].constructor.name == 'DynamicForm') {
                returnObj[key] = this.values[key].getFormData(); //RECURSION         
            } else if (Array.isArray(this.values[key])) {
                let inside: DynamicForm[] = []
                this.values[key].forEach((subform: DynamicForm) => {
                    inside.push(subform.getFormData()); //RESCURSION
                })
                returnObj[key] = inside
            } else {
                returnObj[key] = this.values[key].boundVal
            }
        })
        return returnObj
    }

    /**
     * Adds a new section to the form containing inputs for the passed in object.
     * The new section will be included when calling {@link getFormData} on the DynamicForm.
     * @param obj an object to create a section for
     * @param mapKey the header for this section & the key for the object upon getFormData
     * @returns this, for chaining.
     */
    addFormSection(obj: Record<string, any>, mapKey: string) {
        let subform = new DynamicForm(obj, this.gridStyle, this.lblStyle, this.inputStyle, mapKey)
        this.form.addRow([subform.form, 'merge']);
        this.values[mapKey] = subform;
        return this;
    }

    /**
     * Append new row to the bottom of the form based on the passed-in object.
     * The new row will be included when calling {@link getFormData} on the DynamicForm
     * @param singleKeyObj an object with one key and a primative (or date, or array of strings) value
     * @param label the text to set for the input label, defaults to the object key
     * @param forceTextarea if set, will force the input to be a text area (if true) or a regular text input (if false)
     * @returns this, for chaining.
     */
    addInputToForm(singleKeyObj: { [key: string]: any }, label?: string, forceTextarea?: boolean) {
        let key = Object.keys(singleKeyObj)[0];
        if (Object.keys(this.getFormData()).some(existingKey => existingKey === key)) console.warn("duplicate key detected: " + key)
        let inputPair = new WrappedInputLabelPair(singleKeyObj, label, forceTextarea);
        this.values[key] = inputPair.observer;
        this.form.addRow([inputPair.label, inputPair.input]);
        return this;
    }
}

/**
 * WrapGrid is a class to create css grid layouts using 2D arrays of wrappers.
 */
export class WrapGrid extends Wrapper {
    private rows: number;
    private cols: number;

    /**
     * Creates a new WrapGrid, a css Grid of {@link Wrapper} instances in a 2d Array.
     * Grid cells can be merged by inserting 'merge' strings in the place of Wrappers in the array.
     * @param children2dArray a 2D array of Wrappers and the string 'merge'.
     * @param existingContainer Optional, if specified, the WrapGrid will fill in the provided Element
     * @param gapSizeCSS the gap size between items on the grid, defaults to '0.5em'
     * @param containerType the HTML Tag for the container, defaults to 'div'
     */
    constructor(children2dArray: (Wrapper | "merge")[][], existingContainer?: HTMLElement, gapSizeCSS: string = '0.5em', containerType: keyof HTMLElementTagNameMap = 'div') {
        super(containerType, existingContainer);
        this.style('display: grid; gap:' + gapSizeCSS);
        this.rows = children2dArray.length;
        this.cols = 0;
        children2dArray.forEach((row) => { if (row.length > this.cols) this.cols = row.length });
        children2dArray.forEach((row, i) => {
            row.forEach((child, col) => {
                if (child != 'merge') {
                    let k = col + 1
                    while (row[k] == 'merge') k++; //TIL you can do this
                    child.style(`
                            ${child.getStyle()};
                            grid-row: ${i + 1};
                            grid-column: ${col + 1} / ${k + 1}
                        `)
                    child.relocate(this, 'inside')
                }
            })
        })
    }

    /**
     * Adds a row to the bottom of the WrapGrid.
     * Works best if the row contains the same number of 
     * array elements as the grid is wide.
     * @param row array of Wrappers or the string 'merge'
     * @returns this, for chaining
     */
    addRow(row: (Wrapper | 'merge')[]): WrapGrid {
        row.forEach((child, col) => {
            if (child != 'merge') {
                let k = col + 1
                while (row[k] == 'merge') k++; //TIL you can do this
                child.style(`
                        ${child.getStyle()};
                        grid-row: ${this.rows + 1};
                        grid-column: ${col + 1} / ${k + 1}
                    `)
                child.relocate(this, 'inside')
            }
        })
        this.rows = this.rows + 1;
        return this;
    }
}

/**
 * Checks whether the given input is a primative value.
 * @param myVar variable to check
 * @returns true if variable is primative, false if an object or a function
 */
export const isPrimative = (myVar: any): boolean => {
    if (typeof myVar === 'object') return false;
    if (typeof myVar === 'function') return false;
    return true;
}

/**
 * Checks whether the given input is a Date object
 * @param maybeDate variable to check
 * @returns true if variable is a Date object
 */
export const isDate = (maybeDate: any): boolean => {
    if (isPrimative(maybeDate)) return false;
    return Object.prototype.toString.call(maybeDate) === "[object Date]";
}

/**
 * Checks whether the given input is an array of primatives
 * @param val variable to check
 * @returns true if is an array of primatives (or an empty array)
 */
export const isArrayOfPrimatives = (val: any): boolean => {
    if (!Array.isArray(val)) return false;
    if (val.some(v => !isPrimative(v))) return false;
    return true;
}

// Other things I might do...

/*
//len is any number between 0 and 10
export const newTinyId = function(len=4){ return new Date().getTime().toString(36)+"."+Math.random().toString(36).slice(13-len).padStart(len,"0") }

//this will pull the date portion of the mkId and will parse the mkTt
export const parseTidyIdDate = function(tinyId:string){new Date(parseInt(tinyId.split(".")[0],36))}

*/

/*
export function debounce(this: any, func: Function, timeout = 300){ //special fake 'this' param
    let timer: NodeJS.Timer;
    return (...args: any) =>{
        clearTimeout(timer);
        timer = setTimeout(()=> { func.apply(this, args); }, timeout);
    };
}
*/

/*
export class WrappedModal extends Wrapper{
    ... modals? Very very useful.
    https://www.w3schools.com/howto/howto_css_modals.asp
}
*/
//TODO - any other composites?