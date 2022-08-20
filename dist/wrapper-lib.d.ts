/**
 * The Observable class is built to enable {@link Observer | Observers} to
 * observe. This means that Observers can follow the {@link Observable.obsVal} of the
 * Observable they are bound to. See {@link Binding}.
 */
export declare class Observable {
    private obsVal;
    boundFrom: Binding[];
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
export declare type ObservableFeature = "text" | "value" | "style";
export declare type WrapperPosition = "inside" | "before" | "after";
export declare type InputType = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
export declare class Wrapper extends Observable implements Observer {
    /**
     * The HTML Element the Wrapper is wrapping. The thing it's adding value to.
     */
    element: HTMLElement;
    /**
     * The Wrapper whose wrapped HTML Element contains this.element.
     */
    parent: Wrapper | undefined;
    /**
     * All the Wrappers whose wrapped HTML Element is contained in this.element
     */
    children: Wrapper[];
    /**
     * List of Observers who are watching this Wrapper.
     */
    boundFrom: Binding[];
    /**
     * The Observable(s) whom this Wrapper is watching in some manner.
     */
    boundTo: Binding[];
    /**
     * Holds the value the Wrapper sees in its Observable
     */
    boundVal: any;
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
     * Create a set of 'li' Wrappers for each element in the target's
     * obsVal (if the obsVal is an array). Should be called on a Wrapper
     * that's wrapping a 'ul' or 'li' element.
     * @param target Observable with an obsVal that's an array.
     * Works best if it's an array of Strings or numbers.
     * @param changeKey optional, a key for the change to the Observable
     * that this Wrapper should be notified about. If supplied, changes to
     * the Observable with different changeKeys will not notify this Wrapper.
     */
    bindListTo(target: Observable, changeKey?: string): void;
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
     * Adds an existing Wrapper inisde this Wrapper's wrapped
     * element. Useful for adding wrappers functions returned
     * by functions into the page.
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addChild(child: Wrapper): Wrapper;
    /**
     * Adds an existing Wrapper before this Wrapper's position
     * in the DOM. Useful for adding wrappers functions returned
     * by functions into the page.
     *
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addBefore(child: Wrapper): Wrapper;
    /**
     * Adds an existing Wrapper after this Wrapper's position
     * in the DOM. Useful for adding wrappers functions returned
     * by functions into the page.
     * @param child an existing Wrapper to insert to this one
     * @returns the CHILD that was added
     */
    addAfter(child: Wrapper): Wrapper;
    /**
     * Adds a 2-D array of children into the container Wrapper
     * in accordance with where they are positioned in the array.
     * It will space them using the CSS String provided
     * @param children2dArray 2d Array of Wrappers to insert
     * @param gapSizeCSS the space between them, e.g. '10px' or '1em' or '10%'. Defaults to '0.5em'
     * @returns this, for chaining
     */
    addMultiWrap(children2dArray: (Wrapper | 'merge')[][], gapSizeCSS?: string, containerType?: keyof HTMLElementTagNameMap): WrapGrid;
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
     * Creates a flexbox-wrapped label & input pair based on the single-keyed object passed in.
     * Will attempt to parse the type of the value and return the correct input type.
     * @param singleKeyObj object for which the form should be made
     * @param label override the label text
     * @param forceTextarea if set, forces a textarea (true) or text input (false)
     * @param location where to put the the top-level wrapper in relation to this
     * @returns array of [topWrapper, lblWrapper, inputWrapper, observer]
     */
    makeInputFor(singleKeyObj: {
        [key: string]: any;
    }, label?: string, forceTextarea?: boolean, location?: WrapperPosition): WrappedInputLabelPair;
    /**
     * Creates a {@link DynamicForm} from an Object with multiple keys.
     * @param obj the object to create the DynamicForm against
     * @param gridStyle the css styles to apply to the grid
     * @param lblStyle the css styles to apply to the label
     * @param inputStyle the css styles to apply to the input
     * @returns the created {@link DynamicForm}
     */
    makeFormFor(obj: Record<string, any>, gridStyle?: string, lblStyle?: string, inputStyle?: string): DynamicForm;
}
/**
 * LabeledInput is a class meant to make it easier to create individual HTML Inputs,
 * labels that are associated with them, and an Observer to watch the value of the input.
 */
export declare class LabeledInput {
    label: Wrapper;
    input: Wrapper;
    observer: Observer;
    /**
     * Creates a label, an input, and an Observer, all wired together.
     * Will interpret the type of variable and return an appropriate input flavor.
     * Text strings of 100 or more characters will default as textareas.
     * @param singleKeyObj an object with a single key & value, the value is of type primative | date | (string|number)[]
     * @param label the label to apply to the input, defaults to the key of the object
     * @param forceTextarea if specified, will force inputs to be either textareas (if true) or regular text inputs (if false)
     */
    constructor(singleKeyObj: {
        [key: string]: any;
    }, label?: string, forceTextarea?: boolean);
}
/**
 * This class is a Wrapper-bound {@link LabeledInput}.
 */
export declare class WrappedInputLabelPair extends Wrapper {
    container: HTMLElement;
    label: Wrapper;
    input: Wrapper;
    observer: Observer;
    /**
     * Creates 3 Wrappers and an Observer. An outer, containing Wrapper (div) with an input Wrapper
     * and a label Wrapper inside it. The input is bound to the container by the inputId.
     * By default the container style is set to 'display: flex; gap: 0.5em'
     * @param existingContainer Where to put the WrappedInputLabelPair
     * @param label text to use for the label (defaults to the object's key)
     * @param forceTextarea if set, will force input to be text area (if true) or to be regular text input (if false), defaults false for strings of <100 chars
     * @param existingContainer optional, the HTML Element to use to host the Wrapper
     */
    constructor(singleKeyObj: {
        [key: string]: any;
    }, label?: string, forceTextarea?: boolean, existingContainer?: HTMLElement);
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
export declare class DynamicForm {
    form: WrapGrid;
    parentBreadcrumb?: string | number;
    gridStyle?: string;
    lblStyle?: string;
    inputStyle?: string;
    private lines;
    private values;
    /**
     * Creates a new {@link DynamicForm} instance.
     * @param obj the object the form should be based on
     * @param gridStyle the css styles to apply to the grid
     * @param lblStyle the css styles to apply to the label
     * @param inputStyle the css styles to apply to the input
     * @param parentBreadCrumb probably don't set this manually, it's used when creating subforms via {@link DynamicForm.addFormSection}
     */
    constructor(obj: Record<string, any>, gridStyle?: string, lblStyle?: string, inputStyle?: string, parentBreadCrumb?: string | number);
    /**
     * Get Form Data allows you to construct a single, possibly nested object
     * representing the current state of the form.
     * @returns a NEW object shaped like the object the DynamicForm was built from, with its current contents
     */
    getFormData(): any;
    /**
     * Adds a new section to the form containing inputs for the passed in object.
     * The new section will be included when calling {@link getFormData} on the DynamicForm.
     * @param obj an object to create a section for
     * @param mapKey the header for this section & the key for the object upon getFormData
     * @returns this, for chaining.
     */
    addFormSection(obj: Record<string, any>, mapKey: string): this;
    /**
     * Append new row to the bottom of the form based on the passed-in object.
     * The new row will be included when calling {@link getFormData} on the DynamicForm
     * @param singleKeyObj an object with one key and a primative (or date, or array of strings) value
     * @param label the text to set for the input label, defaults to the object key
     * @param forceTextarea if set, will force the input to be a text area (if true) or a regular text input (if false)
     * @returns this, for chaining.
     */
    addInputToForm(singleKeyObj: {
        [key: string]: any;
    }, label?: string, forceTextarea?: boolean): this;
}
/**
 * WrapGrid is a class to create css grid layouts using 2D arrays of wrappers.
 */
export declare class WrapGrid extends Wrapper {
    private rows;
    private cols;
    /**
     * Creates a new WrapGrid, a css Grid of {@link Wrapper} instances in a 2d Array.
     * Grid cells can be merged by inserting 'merge' strings in the place of Wrappers in the array.
     * @param children2dArray a 2D array of Wrappers and the string 'merge'.
     * @param existingContainer Optional, if specified, the WrapGrid will fill in the provided Element
     * @param gapSizeCSS the gap size between items on the grid, defaults to '0.5em'
     * @param containerType the HTML Tag for the container, defaults to 'div'
     */
    constructor(children2dArray: (Wrapper | "merge")[][], existingContainer?: HTMLElement, gapSizeCSS?: string, containerType?: keyof HTMLElementTagNameMap);
    /**
     * Adds a row to the bottom of the WrapGrid.
     * Works best if the row contains the same number of
     * array elements as the grid is wide.
     * @param row array of Wrappers or the string 'merge'
     * @returns this, for chaining
     */
    addRow(row: (Wrapper | 'merge')[]): WrapGrid;
}
/**
 * Checks whether the given input is a primative value.
 * @param myVar variable to check
 * @returns true if variable is primative, false if an object or a function
 */
export declare const isPrimative: (myVar: any) => boolean;
/**
 * Checks whether the given input is a Date object
 * @param maybeDate variable to check
 * @returns true if variable is a Date object
 */
export declare const isDate: (maybeDate: any) => boolean;
/**
 * Checks whether the given input is an array of primatives
 * @param val variable to check
 * @returns true if is an array of primatives (or an empty array)
 */
export declare const isArrayOfPrimatives: (val: any) => boolean;
