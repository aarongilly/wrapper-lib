
export class Observable {
    private obsVal: any;
    public boundFrom: Binding[];
    /**
     * Observables hold a value and notify Observers when the value is set.
     * They do this by maintaining a list of Bindings in which they are the 'to'
     * object. Each time setVal is called they notify all subscribers in their 
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
     * Bindings represent a connection between an Observable and an Observer.
     * They hold the xferFunction that changes the observable.obsVal into the 
     * observer.boundVal. If they contain a changeKey, then only changes to
     * the Observable with that key will cause the Observer to update.
     * @param observer the Observer to bind
     * @param boundTo the Observable to bind it to
     * @param changeKey if !undefined, only changes with this key will 
     * propagate to the Observer.
     * @param xferFunc if !undefined, the xferFunction that will be applied
     * to the new value of the Observable's obsVal to turn it into the new
     * value of the Observer's boundVal. 
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
                    pathParts.forEach(p => {
                        if (target.hasOwnProperty(p)) {
                            target = target[p]
                        } else {
                            console.warn(`
                            Attempting to traverse bound path '${changeKey}' 
                            failed at '${p}'`)
                        }
                    })
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
    public handleChange(newVal: any, changeKey?: string){
        if (changeKey == this.changeKey) {
            let xferResult = this.xferFunc(newVal, changeKey)!;
            if (xferResult != null && xferResult != undefined) {if (this.from.constructor.name == "Wrapper") {
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
    iT?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" //input type
}

export interface WrappedInputLabelPairOptions {
    lbl?: string,
    default?: string,
    placehold?: string,
    inputType?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week",
    contStyle?: string,
    lblStyle?: string,
    inputStyle?: string,
    stacked?: boolean
}

export type ObservableFeature = "text" | "value" | "style"
export type WrapperPosition = "inside" | "before" | "after"

type HTMLElementsWithValue = HTMLButtonElement | HTMLInputElement | HTMLMeterElement | HTMLLIElement | HTMLOptionElement | HTMLProgressElement | HTMLParamElement;

export class Wrapper extends Observable implements Observer { //implements Observable, Observer {
    public element: HTMLElement;
    public parent: Wrapper | undefined;
    public children: Wrapper[];
    public boundFrom: Binding[];
    public boundTo: Binding[];
    public boundVal: any;
    /**
     * Wrappers 'wrap' HTMLElements and are utilized to make changes to them.
     * Wrappers function as both Observables and Observers. They can be bound to 
     * Observables or other Wrappers or bound from Observers or other Wrappers.
     * @param tag the tag of the element to create (if existingElement == undefined)
     * @param existingElement the element to wrap. If undefined, an element will be 
     * create on the document object, BUT WILL NOT BE VISIBLE UNTIL YOU APPEND IT TO SOMETHING
     * @param intializers a map of {@link WrapperOptions} to initialize the Wrapper
     * with. Can do things like setting the Wrapper's innerText with {'t':'my text'}
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
        if(target.constructor.name == "Wrapper" && changeKey == 'text') this.text((<Wrapper> target).getText())
        if(target.constructor.name == "Wrapper" && changeKey == 'style') this.text((<Wrapper> target).getStyle())
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
     * Create a set of <li> Wrappers for each element in the target's 
     * obsVal (if the obsVal is an array). Should be called on a Wrapper
     * that's wrapping a <ul> or <li> element.
     * @param target Observable with an obsVal that's an array.
     * Works best if it's an array of Strings or numbers.
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     */
    bindListTo(target: Observable, changeKey?: string) {
        this.bindTo(target,changeKey,(nv:Array<string>)=>{
            this.html(''); //nuke old array
            this.listContent(nv);
          }).listContent(target.getVal()); //bindTo array doesn't support grabbing intial value
    }

    /**
     * Create a set of <option> Wrappers for each element in the target's 
     * obsVal (if the obsVal is an array). Should be called on a Wrapper 
     * that is wrapping a <select> element.
     * @param target Observable with an obsVal that's an array.
     * Works best if it's an array of Strings or numbers.
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to 
     * the Observable with different changeKeys will not notify this Wrapper.
     */
     bindSelectTo(target: Observable, changeKey?: string) {
        this.bindTo(target,changeKey,(nv:Array<string>)=>{
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
        this.notifySubscribers(text,'text');
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
        this.notifySubscribers(this.getStyle(),'style');
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
        if(style == null) style = ''
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
        this.notifySubscribers(val,'value');
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
     * For use with <ol> or <ul> elements. EXPECTS TO BE PUT INSIDE 
     * AN EXISTING <ol> OR <uL> ELEMENT.
     *  Creates a series of <li> elements for elements in an array
     * @param textList the visible text to create each element for
     * @param idList optional IDs to include
     * @returns this, for chaining
     */
    listContent(textList: string[], idList?: string[]) {
        if (this.element.tagName != 'UL' && this.element.tagName != 'OL') {
            console.error({ 'Not a list container->:': this.element });
            throw new Error('List Content must be appended to a "ul" or "ol"');
        }
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
     * For use with <select> elements. EXPECTS TO BE PUT INSIDE
     * AN EXISTING <select> ELEMENT.
     * Creates a list of <option> elements inside the <select>
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
     * Creates a flexbox-wrapped label & input pair
     * @param inputTag input or textarea
     * @param id the id to use for the input element
     * @param location where the labeled input should be in relation to its caller
     * @returns the Wrapper (for the outer div)
     */
    makeLabeledInput(id: string, inputTag?: 'input' | 'textarea', location?: WrapperPosition, options?: WrappedInputLabelPairOptions): WrappedInputLabelPair {
        let container = this.newWrap('div', undefined, location)
        inputTag = (inputTag === undefined) ? 'input' : inputTag;
        location = (location === undefined) ? 'inside' : location;
        let lbldInpt = new WrappedInputLabelPair(container.element, id, (<'input' | 'textarea'>inputTag), options);
        return lbldInpt;
    }
}

export class WrappedInputLabelPair extends Wrapper {
    public container: HTMLElement;
    public label: Wrapper;
    public input: Wrapper;
    /**
     * Creates 3 Wrappers. An outer, containing Wrapper (div) with an input Wrapper
     * and a label Wrapper inside it. The input is bound to the container by the inputId
     * @param container Where to put the WrappedInputLabelPair
     * @param inputId the id of the input element, used in the 'for' property of the label
     * @param inputTag the type of input
     * @param options a map of {@link WrappedInputLabelPairOptions}
     */
    constructor(container: HTMLElement, inputId: string, inputTag: "input" | "textarea" = 'input', options?: WrappedInputLabelPairOptions) {
        super('div', container);
        this.container = this.element;
        this.style('display:flex');
        this.label = this.newWrap('label').attr('for', inputId).text('Input');
        this.input = this.newWrap(inputTag, { i: inputId });
        if (options) {
            if (options.contStyle) this.style(options.contStyle!);
            if (options.inputStyle) this.input.style(options.inputStyle);
            if (options.lblStyle) this.label.style(options.lblStyle);
            if (options.lbl) this.label.text(options.lbl);
            if (options.placehold) this.input.placehold(options.placehold);
            if (options.default) this.input.setVal(options.default);
            if (options.inputType) this.input.attr('type', options.inputType);
            if (options.stacked && !options.contStyle && !options.inputStyle) {
                this.style('display:block');
                this.input.style('width: 100%; display: block')
            }
        }
    }
}

/*
export class WrappedModal extends Wrapper{
    ... modals? Very very useful.
    https://www.w3schools.com/howto/howto_css_modals.asp
}
*/
//TODO - any other composites?