/**
 * Options that Wrappers can be initialized with.
 */
export interface WrapperOptions {
    id?: string;
    name?: string;
    value?: string;
    text?: string;
    html?: string;
    style?: string;
    // bind?: WrapperObservableListMember;
    inputType?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"
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

export class Wrapper {
    public element: HTMLElement;
    public subscribers: Observer[];
    public subscriptions: Subscription[];
    public parent: Wrapper | undefined;
    public children: Wrapper[];
    constructor(tag?: keyof HTMLElementTagNameMap, existingElement?: HTMLElement, intializers?: WrapperOptions) {
        this.subscribers = [];
        this.subscriptions = [];
        this.children = [];
        if (existingElement) {
            this.element = existingElement;
        } else {
            this.element = document.createElement(tag!)
        }
        //auto-call notify subscribers if inputs change
        if (this.element.tagName === "INPUT") this.onEvent('input', this.notifySubscribers.bind(this));
        if (this.element.tagName === "SELECT") this.onEvent('change', this.notifySubscribers.bind(this));
        if (this.element.tagName === "TEXTAREA") this.onEvent('input', this.notifySubscribers.bind(this));
        if (intializers) {
            if (intializers.id) this.element.id = intializers.id!;
            if (intializers.name) this.element.setAttribute('name', intializers.name!);
            if (intializers.value) {
                if (this.element.hasOwnProperty('value')) {
                    (<HTMLElementsWithValue>this.element).value = intializers.value!;
                } else {
                    throw new Error("attempted to set value on a tag that doesn't support that")
                }
            }
            if (intializers.text != undefined) this.element.innerText = intializers.text!;
            if (intializers.html != undefined) this.element.innerHTML = intializers.html!;
            if (intializers.style) this.element.setAttribute('style', intializers.style!);
            if (intializers.inputType) this.element.setAttribute('type', intializers.inputType);
            // if (intializers.bind) {
            //     let sub: WrapperObservableListMember = {
            //         bindFeature: intializers.bind.bindFeature,
            //         toFeature: intializers.bind.toFeature,
            //         ofWrapper: this,
            //         xferFunc: intializers.bind.xferFunc
            //     }
            //     intializers.bind.ofWrapper.addSubscriber(sub);//this feels wrong
            // }
        }
    }

    /**
     * Wraps an existing HTML Element with a Wrapper
     * @param element the element to wrap
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
        if (location === 'inside') this.element.appendChild(nW.element);
        if (location === 'after') this.element.after(nW.element);
        if (location === 'before') this.element.before(nW.element);
        return nW;
    }

    /**
     * Binds the Wrapper to a WrapperlessObservable instance. If you want to bind between
     * wrappers, use the bindToWrapper method.
     * @param target observerable to bind to
     * @param boundFeature feature on this Wrapper to change, not used if xferFunc is supplied
     * @param xferFunc optional, what to do with the new value. If this function returns a value,
     * it will be applied to the `boundFeature`.
     * @returns this, for chaining
     */
    bindTo(target: Observable, boundFeature?: ObservableFeature, xferFunc?: Function): Wrapper {
       return this 
    }

    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @param bindingKey //TODO - this
     * @returns this, for chaining
     */
    notifySubscribers(bindingKey: string): Wrapper {
        // console.warn
        this.subscribers.forEach(sub => {

        })
        return this;
    }

    /**
     * Updates this wrapper with the new value from the WrapperObservable that called it,
     * in accordance with the terms of the subscription.
     * @param newValue the new value from the thing
     * @param subscription the subscription itself, or the function to run
     */
    handleChange(newValue: string, subscription: Subscription | Function): void {
        //todo
    }

    /**
     * Adds a new subscriber, which contains a subscribing wrapper and
     * details about how it should be updated on changes to this.
     * @param newSub subscribing wrapper to add
     * @returns this, for chaining
     */
    addSubscriber(newSub: Observer): Wrapper {
        //todo
        return this;
    }

    removeSubscriber(subbedWrapper: Wrapper): Wrapper {
        //todo
        return this;
    }

    /**
     * Removes all subscribers from the list.
     * @returns this, for chaining
     */
    purgeSubscribers() {
        this.subscribers = [];
        return this
    }

    /**
     * Sets the innerText of the wrapped element.
     * @param text the text to set
     * @returns this, for chaining
     */
    text(text: string): Wrapper {
        this.element.innerText = text;
        this.subscribers.forEach(sub =>  {});//todo
        return this
    }

    /**
     * Chainable horthand for this.element.setAttribute(attribute, value)
     * @param attribute attribute to set
     * @param value value to set it to
     * @returns this, for chaining
     */
    attr(attribute: string, value: string): Wrapper {
        this.element.setAttribute(attribute, value)
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
        this.subscribers.forEach(sub => { });//todo
        return this
    }

    /**
     * Sets the classList of the Wrapped Element
     * @param classText a single class name or array of class names to apply
     * @returns this, for chaining
     */
    class(classText: string | string[]){
        if(typeof classText === "string") classText = [classText];
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
    removeClass(className: string): Wrapper{
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
    getStyle(): string | null {
        return this.element.getAttribute('style');
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
        this.subscribers.forEach(sub => { }); //todo
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
                this.newWrap('li', { 'id': idList[ind] }).text(text);
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
                this.newWrap('option', { id: idList[ind] }).text(text).setVal(valList![ind]);
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

export class Observable {
    private value: any;
    subscribers: Observer[]
    constructor(initVal: any) {
        this.value = initVal;
        this.subscribers = [];
    }

    /**
     * Simple value getter
     * @param pathToProp dot-separated path to nested property
     * @returns the observed value
     */
    getVal(pathToProp?: string) {
        if(pathToProp == undefined) return this.value;
        //todo - other paths
    }

    /**
     * Value setter, notifies subscribers of change
     * @param newValue the new value for the observable
     * @param pathToProp dot-separated path to nested property
     */
    setVal(newValue: any, pathToProp?: string) {
        this.value = newValue;
        this.notifySubscribers();
    }

    addSubscriber(newSub: Observer, xferFunc: Function) {
        // this.subscribers.push({ sub: newSub, xferFunc: xferFunc })
    }

    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @returns this, for chaining
     */
    notifySubscribers(changeKey?: string) {
        this.subscribers.forEach(m => {
            
        })
    }
}

export class Observer {
    value: any;
    subscriptions: Subscription[]
    constructor(initValue: any){
        this.value = initValue;
        this.subscriptions = [];
    }

    bindTo(target: Observable, changeKey?: string, xferFunc?: Function) {
        //todo
        return this;
    }

    /**
     * Called by Observables when they are triggered by changes
     * @param newVal the value to set
     */
    handleChange(newVal: any, doFun: Function) {
        this.value = doFun(newVal);
    }
}

export class Subscription{
    public owner: Observer;
    public boundTo: Observable;
    public boundPath?: string;
    constructor(owner: Observer, boundTo: Observable, boundPath?: string, xfer?: Function){
        this.owner = owner;
        this.boundTo = boundTo;
        this.boundPath = boundPath;
    }
}

export class WrappedInputLabelPair extends Wrapper {
    public container: HTMLElement;
    public label: Wrapper;
    public input: Wrapper;
    constructor(container: HTMLElement, inputId: string, inputTag: "input" | "textarea" = 'input', options?: WrappedInputLabelPairOptions) {
        super('div', container);
        this.container = this.element;
        this.style('display:flex');
        this.label = this.newWrap('label').attr('for', inputId).text('Input');
        this.input = this.newWrap(inputTag, { id: inputId });
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