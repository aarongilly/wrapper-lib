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
}

type HTMLElementsWithValue = HTMLButtonElement | HTMLInputElement | HTMLMeterElement | HTMLLIElement | HTMLOptionElement | HTMLProgressElement | HTMLParamElement;

export class Wrapper {
    public element: HTMLElement;
    constructor(tag?: keyof HTMLElementTagNameMap, existingElement?: HTMLElement, intializers?: WrapperOptions) {
        if (existingElement) {
            this.element = existingElement;
        } else {
            this.element = document.createElement(tag!)
        }
        if (intializers) {
            if (intializers.hasOwnProperty('id')) this.element.id = intializers.id!;
            if (intializers.hasOwnProperty('name')) this.element.setAttribute('name', intializers.name!);
            if (intializers.hasOwnProperty('value')){
                if(this.element.hasOwnProperty('value')){
                    (<HTMLElementsWithValue>this.element).value = intializers.value!;
                }else{
                    throw new Error("attempted to set value on a tag that doesn't support that")
                }
            } 
            if (intializers.hasOwnProperty('text')) this.element.innerText = intializers.text!;
            if (intializers.hasOwnProperty('html')) this.element.innerHTML = intializers.html!;
            if (intializers.hasOwnProperty('style')) this.element.setAttribute('style', intializers.style!);
        }
    }

    /**
     * Wraps an existing HTML Element with a Wrapper
     * @param element the element to wrap
     * @returns the new wrapper, for chaining
     */
    static wrap = (element: HTMLElement, initializers?: WrapperOptions): Wrapper => {
        return new Wrapper((<keyof HTMLElementTagNameMap>element.tagName), element, initializers);
    }

    /**
     * Creates a new Wrapper instance inside, before, or after the one it was called against.
     * Returns the newly created wrapper.
     * @param tag tag of the HTML Element to create
     * @param initializers an object with optional keys to initialize the element with
     * @param locaitn inside appendChild(), before before(), after after()
     * @returns the new wrapper, for chaining
     */
    newWrap = (tag: keyof HTMLElementTagNameMap, initializers?: WrapperOptions, location: "inside" | "before" | "after" = 'inside'): Wrapper => {
        let nW = new Wrapper(tag, undefined, initializers);
        if (location === 'inside') this.element.appendChild(nW.element);
        if (location === 'after') this.element.after(nW.element);
        if (location === 'before') this.element.before(nW.element);
        return nW;
    }

    /**
     * Sets the innerText of the wrapped element.
     * @param text the text to set
     * @returns the Wrapper, for chaining
     */
    text = (text: string): Wrapper => {
        this.element.innerText = text;
        return this
    }

    /**
     * Chainable horthand for this.element.setAttribute(attribute, value)
     * @param attribute attribute to set
     * @param value value to set it to
     * @returns the Wrapper, for chaining
     */
    attr = (attribute: string, value: string): Wrapper =>{
        this.element.setAttribute(attribute,value)
        return this;
    }

    /**
     * Sets the innerHTML of the wrapped element.
     * @param html the text to set
     * @returns the Wrapper, for chaining
     */
    html = (html: string): Wrapper => {
        this.element.innerHTML = html;
        return this
    }

    /**
     * Sets the `style` attribute of the wrapped element
     * @param styleString string literal for css styles
     * @returns the Wrapper, for chaining
     */
    style = (styleString: string): Wrapper =>{
        this.element.setAttribute('style',styleString);
        return this
    }

    /**
     * Sets the name of the wrapped element.
     * @param name the text to set
     * @returns the Wrapper, for chaining
     */
    name = (name: string): Wrapper => {
        this.element.setAttribute('name', name);
        return this
    }

    /**
     * Sets the placeholder of the wrapped element.
     * @param placeholder the text to set
     * @returns the Wrapper, for chaining
     */
    placehold = (placeholder: string): Wrapper => {
        this.element.setAttribute('placeholder', placeholder);
        return this
    }

    /**
     * Gets the value of Wrapped things like inputs, textareas
     * @returns the value of the wrapped element
     */
    getVal = () => {
        return (<HTMLInputElement>this.element).value //inline type assertion IS possible
    }

    /**
     * Sets the value of Wrapped things like inputs, textareas
     * @returns the Wrapper, for chaining
     */
    setVal = (val: string) =>{
        (<HTMLInputElement | HTMLParamElement | HTMLButtonElement |
             HTMLOptionElement | HTMLLIElement>this.element).value = val;
        return this;
    }

    /**
     * Grabs data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @returns the value of the keyed data
     */
    getData = (key: string) => {
        return this.element.dataset[key];
    }

    /**
     * Sets data stored in an element's dataset. The 'data-' part
     * of the dataset is not necessary to include.
     * @param key the data- set element name
     * @param val the string to be stored
     * @returns the Wrapper, for chaining
     */
    setData(key: string, val: string) {
        this.element.setAttribute('data-' + key, val);
        return this;
    }

    /**
     * Creates a new event listener of the given type on the Wrapped element
     * @param eventType type of event to bind the function to
     * @param fun the function to run when the event occurs
     * @returns the Wrapper, for chaining
     */
    onEvent(eventType: keyof HTMLElementEventMap, fun: Function) {
        this.element.addEventListener(eventType, (e) => fun(e));
        return this;
    }

    ///#region #### Composite Wrappers ####

    /**
     * For use with <ol> or <ul> elements
     * Creates a series of <li> elements for elements in an array
     * @param textList the visible text to create each element for
     * @param idList optional IDs to include
     * @returns the Wrapper, for chaining
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
                this.newWrap('li',{'id': idList[ind]}).text(text);
            })
        } else {
            textList.forEach((text, ind) => {
                this.newWrap('li').text(text);
            })
        }
        return this;
    }

    /**
     * For use with <select> elements
     * Creates a list of <option> elements inside the <select>
     * with the given display text and value text
     * @param textList 
     * @param valList 
     * @param idList 
     * @returns the Wrapper, for chaining
     */
    selectContent(textList: string[], valList: string[], idList?: string[]) {
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
                this.newWrap('option', {id:idList[ind]}).text(text).setVal(valList[ind]);
            })
        } else {
            textList.forEach((text, ind) => {
                this.newWrap('option').text(text).setVal(valList[ind]);
            })
        }
        return this;
    }

    /**
     * Creates a flexbox-wrapped label & input pair
     * @param labelText what the label should say
     * @param inputType e.g. 'text', 'date', 'number'
     * @param id the id to use for the input element
     * @returns the Wrapper (for the outer div)
     */
    labeledInput(labelText: string, inputType: string, id: string, location: "inside" | "before" | "after"): WrappedInputLabelPair{
        //TODO - pick up here after
    }
}

class WrappedInputLabelPair extends Wrapper{
    public containerElement: HTMLDivElement;
    public labelElement: HTMLLabelElement;
    public inputElement: HTMLInputElement | HTMLTextAreaElement; 
    constructor(inputId: string, labelText: string, inputDefault: string) {
        //TODO - pick up here first
        

    }
}