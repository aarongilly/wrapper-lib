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
    bind?: WrapperObservableListMember;
    inputType?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
}
export interface WrapperObservableListMember {
    bindFeature: ObservableFeature;
    toFeature: ObservableFeature;
    ofWrapper: Wrapper;
    xferFunc?: Function;
}
export interface WrapperlessObservableListMember {
    xferFunc: Function;
    sub: WrapperlessObserver;
}
export interface WrapperlessObserver {
    handleChange: Function;
}
export interface WrappedInputLabelPairOptions {
    lbl?: string;
    default?: string;
    placehold?: string;
    inputType?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
    contStyle?: string;
    lblStyle?: string;
    inputStyle?: string;
    stacked?: boolean;
}
export declare type ObservableFeature = "text" | "value" | "style";
export declare type WrapperPosition = "inside" | "before" | "after";
export declare class Wrapper {
    element: HTMLElement;
    subscribers: WrapperObservableListMember[];
    constructor(tag?: keyof HTMLElementTagNameMap, existingElement?: HTMLElement, intializers?: WrapperOptions);
    /**
     * Wraps an existing HTML Element with a Wrapper
     * @param element the element to wrap
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
     * Binds the Wrapper to a WrapperlessObservable instance. If you want to bind between
     * wrappers, use the bindToWrapper method.
     * @param target observerable to bind to
     * @param boundFeature feature on this Wrapper to change, not used if xferFunc is supplied
     * @param xferFunc optional, what to do with the new value. If this function returns a value,
     * it will be applied to the `boundFeature`.
     */
    bindTo(target: WrapperlessObservable, boundFeature?: ObservableFeature, xferFunc?: Function): void;
    /**
     * Bind this wrapper's text/style/value to the text/style/value of the targetWrapper
     * @param targetWrapper Wrapper to bind to
     * @param targetFeature The feature you care about on the Wrapper you're subscribing
     * @param thisFeature Which part of this Wrapper should be updated
     * @param using optional transfer function, default: text for non-inputs, otherwise value
     * @returns this, for chaining
     */
    bindToWrapper(targetWrapper: Wrapper, targetFeature: ObservableFeature, thisFeature: ObservableFeature, using?: Function): Wrapper;
    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @returns this, for chaining
     */
    notifySubscribers(): Wrapper;
    /**
     * Updates this wrapper with the new value from the WrapperObservable that called it,
     * in accordance with the terms of the subscription.
     * @param newValue the new value from the thing
     * @param subscription the subscription itself, or the function to run
     */
    handleChange(newValue: string, subscription: WrapperObservableListMember | Function): void;
    /**
     * Adds a new subscriber, which contains a subscribing wrapper and
     * details about how it should be updated on changes to this.
     * @param newSub subscribing wrapper to add
     * @returns this, for chaining
     */
    addSubscriber(newSub: WrapperObservableListMember): Wrapper;
    removeSubscriber(subbedWrapper: Wrapper): Wrapper;
    /**
     * Removes all subscribers from the list.
     * @returns this, for chaining
     */
    purgeSubscribers(): this;
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
    getStyle(): string | null;
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
     * For use with <ol> or <ul> elements
     * Creates a series of <li> elements for elements in an array
     * @param textList the visible text to create each element for
     * @param idList optional IDs to include
     * @returns this, for chaining
     */
    listContent(textList: string[], idList?: string[]): this;
    /**
     * For use with <select> elements
     * Creates a list of <option> elements inside the <select>
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
export declare class WrapperlessObservable {
    private value;
    subscribers: WrapperlessObservableListMember[];
    constructor(initVal: string | number | boolean);
    /**
     * Simple value getter
     * @returns the observed value
     */
    getVal(): string | number | boolean;
    /**
     * Value setter, notifies subscribers of change
     * @param newValue the new value for the observable
     */
    setVal(newValue: string | number | boolean): void;
    addSubscriber(newSub: WrapperlessObserver, xferFunc: Function): void;
    /**
     * Propogate out a request to handle change to every entry in the subscriber list
     * @returns this, for chaining
     */
    notifySubscribers(): void;
}
export declare class Observer implements WrapperlessObserver {
    value: string | number | boolean;
    constructor(init: string | number | boolean);
    /**
        * Binds the Wrapper to a WrapperlessObservable instance. If you want to bind between
        * wrappers, use the bindToWrapper method.
        * @param target observerable to bind to
        * @param boundFeature feature on this Wrapper to change, not used if xferFunc is supplied
        * @param xferFunc optional, what to do with the new value, overrides boundFeature
        * @returns this, for chaining
        */
    bindTo(target: WrapperlessObservable, xferFunc?: Function): this;
    /**
     * Bind this wrapper's text/style/value to the text/style/value of the targetWrapper
     * @param targetWrapper Wrapper to bind to
     * @param targetFeature The feature you care about on the Wrapper you're subscribing
     * @param thisFeature Which part of this Wrapper should be updated
     * @param using optional transfer function, default: text for non-inputs, otherwise value
     * @returns this, for chaining
     */
    bindToWrapper(targetWrapper: Wrapper, targetFeature: ObservableFeature, using?: Function): Observer;
    /**
     * Called by Observables when they are triggered by changes
     * @param newVal the value to set
     */
    handleChange(newVal: string | number | boolean, doFun: Function): void;
}
export declare class WrappedInputLabelPair extends Wrapper {
    container: HTMLElement;
    label: Wrapper;
    input: Wrapper;
    constructor(container: HTMLElement, inputId: string, inputTag?: "input" | "textarea", options?: WrappedInputLabelPairOptions);
}
