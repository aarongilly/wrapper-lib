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
     * @param append true = append to the existing styles; false =  replace it
     * @returns the Wrapper, for chaining
     */
    style = (styleString: string, append?: boolean): Wrapper =>{
        let style = "";
        if(append && this.element.getAttribute('style')!=null){
            style = this.element.getAttribute('style')!.trim();
            if(style.charAt(style.length-1)!=";") style = style + "; "
        }
        this.element.setAttribute('style',style + styleString);
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
     * Returns the value of a given attribute on the wrapped element
     * @returns the value of attribute on the element, or null if no attribute exists
     */
     getAttr = (attribute: string): string | null =>{
        return this.element.getAttribute(attribute);
    }

    /**
     * Simple alias for {@link attr}.
     * @param attribute attribute name to set
     * @param value the value to set
     * @returns the Wrapper, for chaining
     */
    setAttr = (attribute: string, value: string): Wrapper =>{
        return this.attr(attribute, value);
    }

    /**
     * Returns the innerText of the wrapped element
     * @returns the innerText of the wrapped element
     */
     getText= (): string =>{
        return this.element.innerText;
    }

    /**
     * Simple alias for {@link text}.
     * @param text string to set
     * @returns the Wrapper, for chaining
     */
    setText = (text: string): Wrapper =>{
        return this.text(text);
    }


    /**
     * Gets the value of Wrapped things like inputs, textareas
     * @returns the value of the wrapped element
     */
    getVal = () => {
        if(this.element.tagName == 'INPUT' && this.getAttr('type') == "checkbox") return (<HTMLInputElement>this.element).checked;        
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
    selectContent(textList: string[], valList?: string[], idList?: string[]) {
        if(!valList) valList = textList;
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
                this.newWrap('option', {id:idList[ind]}).text(text).setVal(valList![ind]);
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
    makeLabeledInput(id: string, inputTag?: 'input'|'textarea', location?: "inside" | "before" | "after", options?: WrappedInputLabelPairOptions): WrappedInputLabelPair{
        let container = this.newWrap('div',undefined,location)
        inputTag = (inputTag === undefined)? 'input' : inputTag; 
        location = (location === undefined)? 'inside' : location;
        let lbldInpt = new WrappedInputLabelPair(container.element,id,(<'input'|'textarea'>inputTag), options);
        return lbldInpt;
    }
}

export interface WrappedInputLabelPairOptions {
    label?: string, 
    default?: string,
    placehold?: string,
    inputType?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week",
    contStyle?: string,
    lblStyle?: string,
    inputStyle?: string,
    stacked?: boolean
}

export class WrappedInputLabelPair extends Wrapper{
    public container: HTMLElement;
    public label: Wrapper;
    public input: Wrapper; 
    constructor(container: HTMLElement, inputId: string, inputTag: "input" | "textarea" = 'input', options?: WrappedInputLabelPairOptions){
        super('div',container);
        this.container = this.element;
        this.style('display:flex');
        this.label = this.newWrap('label').attr('for',inputId).text('Input');
        this.input = this.newWrap(inputTag,{id:inputId});
        if(options){
            if(options.contStyle) this.style(options.contStyle!);
            if(options.inputStyle) this.input.style(options.inputStyle);
            if(options.lblStyle) this.label.style(options.lblStyle);
            if(options.label) this.label.text(options.label);
            if(options.placehold) this.input.placehold(options.placehold);
            if(options.default) this.input.setVal(options.default);
            if(options.inputType) this.input.attr('type',options.inputType);
            if(options.stacked && !options.contStyle && !options.inputStyle){
                this.style('display:block');
                this.input.style('width: 100%; display: block')
            }
        } 
    }
}