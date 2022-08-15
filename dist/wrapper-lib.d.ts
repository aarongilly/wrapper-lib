export declare class Observable {
    private obsVal;
    boundFrom: Binding[];
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
    constructor(initVal: any);
    /**
     * Simple value getter
     * @param changeKey optional dot-separated path to property.
     * Can reach nested properties by supplying a dot-delimited string of
     * property names. E.G. 'outer.inner'.
     * @returns the observed value
     */
    getVal(changeKey?: string): any;
    /**
     * Value setter, notifies subscribers of change
     * @param newVal the new value for the observable
     * @param changeKey dot-separated path to nested property
     * Can reach nested properties by supplying a dot-delimited string of
     * property names. E.G. 'outer.inner'.
     * @returns the Observed value (obsVal) after the change
     */
    setVal(newVal: any, changeKey?: string): any;
    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @param newVal
     * @param changeKey
     */
    notifySubscribers(newVal: any, changeKey?: string): void;
}
export declare class Observer {
    boundVal?: any;
    boundTo: Binding[];
    /**
     * Observers watch Observables and react to changes to their Observed Value.
     * Observers themselves have a boundVal that will relate to the Observed Value
     * according ot the xferFunction. If not supplied, the xferFunction by default
     * will simply set boundVal equal to the observedVal.
     * @param initVal optional, the initial value for the Observer's boundVal property
     */
    constructor(initVal?: any);
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
    bindTo(target: Observable, changeKey?: string, xferFunc?: Function): this;
    /**
     * Grab all the Bindings that are assocaited with this Observer
     * @returns array of Bindings where this == binding.from
     */
    getBindings(): Binding[];
    /**
     * Breaks all existing bindings between this and the target Observer.
     * If a changeKey is supplied, it will break only all Bindings wth that
     * changeKey.
     * @param target
     * @param changeKey
     * @returns this, for chaining
     */
    breakBinding(target: Observable, changeKey?: string): Observer;
}
export declare class Binding {
    from: Observer;
    to: Observable;
    changeKey?: string;
    xferFunc: Function;
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
    constructor(observer: Observer, boundTo: Observable, changeKey?: string, xferFunc?: Function);
    /**
     * This is typically only called by an Observable's 'setVal' function.
     * Maybe there's a use for calling it yourself outside of that context.
     * @param newVal the new value to send to the Observer
     * @param changeKey when supplied, this argument must match the value of
     * this's changeKey value in order to propagate the change.
     */
    handleChange(newVal: any, changeKey?: string): void;
    /**
     * Breaks the Binding and removes it from both the Observable and Observers
     * respective lists of active bindings.
     */
    break(): void;
}
/**
 * Options that Wrappers can be initialized with.
 */
export interface WrapperOptions {
    i?: string;
    n?: string;
    v?: string;
    t?: string;
    c?: string;
    h?: string;
    s?: string;
    b?: Observable;
    iT?: InputType;
}
export interface WrappedInputLabelPairOptions {
    lbl?: string;
    default?: string;
    placehold?: string;
    inputType?: InputType;
    contStyle?: string;
    lblStyle?: string;
    inputStyle?: string;
    stacked?: boolean;
}
export interface FormInputSchema {
    label: string;
    inputType: InputType | 'object' | 'array';
    required?: boolean;
    placehold?: string;
    default?: any;
}
export declare type ObservableFeature = "text" | "value" | "style";
export declare type WrapperPosition = "inside" | "before" | "after";
export declare type InputType = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
export declare class Wrapper extends Observable implements Observer {
    element: HTMLElement;
    parent: Wrapper | undefined;
    children: Wrapper[];
    boundFrom: Binding[];
    boundTo: Binding[];
    boundVal: any;
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
    constructor(tag?: keyof HTMLElementTagNameMap, existingElement?: HTMLElement, intializers?: WrapperOptions);
    /**
     * Notifies the subscribers in the Wrappers boundFrom list of changes.
     * Typically only called internally by setter methods in Wrapper.
     * @param newVal the new value to notify the Observers about
     * @param changeKey a key for the change describing what part
     * of the Wrapper changed.
     */
    notifySubscribers(newVal: any, changeKey?: string): void;
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
    bindTo(target: Observable, changeKey?: string, xferFunc?: Function): this;
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
    bindTextTo(target: Observable, changeKey?: string, xferFunc?: Function): this;
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
    bindStyleTo(target: Observable, changeKey?: string, xferFunc?: Function): this;
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
    bindValueTo(target: Observable, changeKey?: string, xferFunc?: Function): this;
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
    bindListTo(target: Observable, changeKey?: string): void;
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
    bindSelectTo(target: Observable, changeKey?: string): void;
    /**
    * Grab all the Bindings that are assocaited with this Observer
    * @returns array of Bindings where this == binding.from
    */
    getBindings(): Binding[];
    /**
     * Breaks all existing bindings between this and the target Observer.
     * If a changeKey is supplied, it will break only all Bindings wth that
     * changeKey.
     * @param target
     * @param changeKey
     * @returns this, for chaining
     */
    breakBinding(target: Observable, changeKey?: string): Observer;
    /**
     * Wraps an existing HTML Element with a Wrapper
     * @param element the element to wrap
     * @param initializers a map of {@link WrapperOptions} to initialize the Wrapper with.
     * @returns the new wrapper, for chaining
     */
    static wrap(element: HTMLElement, initializers?: WrapperOptions): Wrapper;
    /**
     * Creates a new Wrapper instance inside, before, or after the one it was called against.
     * Returns the newly created wrapper.
     * @param tag tag of the HTML Element to create
     * @param initializers an object with optional keys to initialize the element with
     * @param location inside appendChild(), before before(), after after()
     * @returns the new wrapper, for chaining
     */
    newWrap(tag: keyof HTMLElementTagNameMap, initializers?: WrapperOptions, location?: WrapperPosition): Wrapper;
    /**
     * Sets the innerText of the wrapped element.
     * @param text the text to set
     * @returns this, for chaining
     */
    text(text: string): Wrapper;
    /**
     * Chainable horthand for this.element.setAttribute(attribute, value)
     * @param attribute attribute to set
     * @param value value to set it to
     * @returns this, for chaining
     */
    attr(attribute: string, value: string): Wrapper;
    /**
     * Sets the innerHTML of the wrapped element.
     * @param html the text to set
     * @returns this, for chaining
     */
    html(html: string): Wrapper;
    /**
     * Sets the `style` attribute of the wrapped element
     * @param styleString string literal for css styles
     * @param append true = append to the existing styles; false =  replace it
     * @returns this, for chaining
     */
    style(styleString: string, append?: boolean): Wrapper;
    /**
     * Sets the classList of the Wrapped Element
     * @param classText a single class name or array of class names to apply
     * @returns this, for chaining
     */
    class(classText: string | string[]): this;
    /**
     * Sets the name of the wrapped element.
     * @param name the text to set
     * @returns this, for chaining
     */
    name(name: string): Wrapper;
    /**
     * Sets the placeholder of the wrapped element.
     * @param placeholder the text to set
     * @returns this, for chaining
     */
    placehold(placeholder: string): Wrapper;
    /**
     * Sets the input "type" attribute on the wrapped Element
     * @param inputType a valid input type string to apply to the input element
     * @returns this, for chaining
     */
    inputType(inputType: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"): Wrapper;
    /**
     * Removes the element associated with the wrapper from the page
     */
    kill(): void;
    /**
     * Removes any child wrappers from the parent wrapper
     */
    killChildren(): void;
    /**
     * Calls "remove" on the classList of the wrapped element
     * @param className class to remove from the element
     * @returns this, for chaining
     */
    removeClass(className: string): Wrapper;
    /**
     * Moves an existing Wrapper to a new location on the page. The existing wrapper
     * need not already be on the page.
     * @param relativeTo a Wrapper instance to move near
     * @param location where to put this wrapper relative to the other
     * @returns this, for chaining
     */
    relocate(relativeTo: Wrapper, location: "inside" | "after" | "before"): this;
    /**
     * Returns the value of a given attribute on the wrapped element
     * @returns the value of attribute on the element, or null if no attribute exists
     */
    getAttr(attribute: string): string | null;
    /**
     * Simple alias for {@link attr}.
     * @param attribute attribute name to set
     * @param value the value to set
     * @returns this, for chaining
     */
    setAttr(attribute: string, value: string): Wrapper;
    /**
     * Returns the style string of a given attribute on the wrapped element
     * @returns the style string of attribute on the element, or null if no attribute exists
     */
    getStyle(): string;
    /**
     * Simple alias for {@link style}.
     * @param styleString the value to set
     * @returns this, for chaining
     */
    setStyle(styleString: string): Wrapper;
    /**
     * Returns the innerText of the wrapped element
     * @returns the innerText of the wrapped element
     */
    getText(): string;
    /**
     * Simple alias for {@link text}.
     * @param text string to set
     * @returns this, for chaining
     */
    setText(text: string): Wrapper;
    /**
     * Gets the value of Wrapped things like inputs, textareas
     * @returns the value of the wrapped element
     */
    getVal(): string | boolean;
    /**
     * Sets the value of Wrapped things like inputs, textareas
     * @returns this, for chaining
     */
    setVal(val: string): this;
    /**
     * Grabs data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @returns the value of the keyed data
     */
    getData(key: string): string | undefined;
    /**
     * Sets data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @param val the string to be stored
     * @returns this, for chaining
     */
    setData(key: string, val: string): this;
    /**
     * Creates a new event listener of the given type on the Wrapped element
     * @param eventType type of event to bind the function to
     * @param fun the function to run when the event occurs
     * @returns this, for chaining
     */
    onEvent(eventType: keyof HTMLElementEventMap, fun: Function): Wrapper;
    /**
     * Creates a new click event listener on the wrapped element
     * @param fun the function to run on click;
     * @returns this, for chaining
     */
    onClick(fun: Function): Wrapper;
    /**
    * Creates a new input event listener on the wrapped element
    * @param fun the function to run on input;
    * @returns this, for chaining
    */
    onInput(fun: Function): Wrapper;
    /**
     * Creates a new change event listener on the wrapped element
     * @param fun the function to run on changes;
     * @returns this, for chaining
     */
    onChange(fun: Function): Wrapper;
    /**
     * Creates a new change event listener on the wrapped element
     * @param fun the function to run on changes;
     * @returns this, for chaining
     */
    onEnterKey(fun: Function): Wrapper;
    /**
     * For use with ordered list or unordered list elements. EXPECTS TO BE PUT INSIDE
     * AN EXISTING LIST ELEMENT.
     *  Creates a series of LI elements for elements in an List
     * @param textList the visible text to create each element for
     * @param idList optional IDs to include
     * @returns this, for chaining
     */
    listContent(textList: string[], idList?: string[]): this;
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
    selectContent(textList: string[], valList?: string[], idList?: string[]): this;
    /**
     * Creates a flexbox-wrapped label & input pair
     * @param inputTag input or textarea
     * @param id the id to use for the input element
     * @param location where the labeled input should be in relation to its caller
     * @returns the Wrapper (for the outer div)
     */
    makeLabeledInput(id: string, inputTag?: 'input' | 'textarea', location?: WrapperPosition, options?: WrappedInputLabelPairOptions): WrappedInputLabelPair;
}
export declare class WrappedInputLabelPair extends Wrapper {
    container: HTMLElement;
    label: Wrapper;
    input: Wrapper;
    /**
     * Creates 3 Wrappers. An outer, containing Wrapper (div) with an input Wrapper
     * and a label Wrapper inside it. The input is bound to the container by the inputId
     * @param existingContainer Where to put the WrappedInputLabelPair
     * @param inputId the id of the input element, used in the 'for' property of the label
     * @param inputTag the type of input
     * @param options a map of {@link WrappedInputLabelPairOptions}
     */
    constructor(existingContainer?: HTMLElement, inputId?: string, inputTag?: "input" | "textarea" | "select", options?: WrappedInputLabelPairOptions);
}
