import './style.css'
import { Observer, Wrapper, Observable, Binding } from '../lib/wrapper-lib'

const app = Wrapper.wrap(document.querySelector<HTMLDivElement>('#app')!);
app.newWrap('h1', { t: 'Wrapper Library Demo Page' });

//#region #### Simple Examples ####
let simpleSection = app.newWrap('section', { h: '<h1>Simple Examples</h1>' });
simpleSection.newWrap('div', { t: "Here is a Wrapper around a Paragraph, and a Wrapper around a button that performs an action", c: "explanatory" })
let myBody = simpleSection.newWrap('p', { i: 'my-paragraph-2', s: 'font-size:1.5em' })
  .text('Last time I checked, the time was: ' + new Date().toLocaleTimeString())
  .class('styled-text');
simpleSection.newWrap('button', { t: 'Check again' }).onEvent('click', () => {
  myBody.text(myBody.getText().substring(0, 35) + new Date().toLocaleTimeString()
  )
});
//#endregion
 
//#region #### Composite Examples ####
let compositeSection = app.newWrap('section', { h: "<h1>Composite Examples</h1>" });
compositeSection.newWrap('p', { t: "The library contains utilities to make composite Wrappers (i.e. Wrappers containing Wrappers) to cover common situations", c: 'explanatory' })
let compGrid = compositeSection.newWrap('div', { s: 'display: grid; grid-column-layout: 1fr 1fr' })
let features = ['Supports Chaining', 'Concise(er) syntax', 'Basic data binding', 'Component-ish things'];
compGrid.newWrap('div', { s: "grid-column-start:1" }).newWrap('h2', { t: "Create Lists from Arrays" }).newWrap('ul', undefined, 'after').listContent(features);
compGrid.newWrap('div', { s: "grid-column-start:2" }).newWrap('h2', { t: "Create Selects from Arrays" }).newWrap('select', undefined, 'after').selectContent(features);
compositeSection.newWrap('h2').text('Simple Text Input Example');
let inputPair = compositeSection.makeLabeledInput('text-input-example');
inputPair.input.setVal("⬅ this input is paired with").onEnterKey(() => { console.log('You pressed enter!') }); //example event binding
inputPair.label.style('margin-right: 0.5em').text("This Label is Paired with ➡"); //accessing inner member of the inputPair
compositeSection.newWrap('h2').text("Textarea Example")
let textareaPair = compositeSection.makeLabeledInput('textarea-example', 'textarea', 'inside', { stacked: true, lbl: "This is a text area:" });
textareaPair.label.style('margin-right: 0.5em');
textareaPair.input.setVal("Labels are properly associated with their inputs. Clicking the label will select the associated input.")
compositeSection.newWrap('h2').text("Other Types of Inputs")
let grid = compositeSection.newWrap('div').style('display: grid; grid-template-columns: 1fr 1fr');
let checkPair = grid.makeLabeledInput('check-input', 'input', 'inside', { inputType: 'checkbox', lbl: "Show Date Example, too?" });
(<HTMLInputElement>checkPair.input.element).checked = true;
let datePair = grid.makeLabeledInput('date-input', undefined, undefined, { inputType: 'date', lbl: "Date Input", lblStyle: "margin-right: 0.5em" });
(<HTMLInputElement>datePair.input.element).value = new Date().toISOString().substring(0,10);
datePair.bindTo(checkPair.input, 'value', (v) => { //neat binding example
  datePair.style(v ? 'display:flex' : 'display:none')
})
compositeSection.newWrap('h2').text("Multi-Wrap Grid");
compositeSection.newWrap('p').text("Each component within this grid is itself a Wrapper, passed to the containing wrapper via the '.addMultiWrap' method.").class('explanatory');
let w1 = new Wrapper('div').text("Hello").style('background-color: lightgreen');
let w2 = new Wrapper('div').text("From").style('background-color: cyan;');
let w3 = new Wrapper('div').text("The").style('background-color: magenta');
let w4 = new Wrapper('div').text("Grid").style('background-color: yellow');
compositeSection.newWrap('div').addMultiWrap([[w1,w2],[w3,w4]], "30%");
//#endregion

// //#region #### Dynamic Form Examples ####
// let formSection = app.newWrap('section',{h:"<h1>Form-Built-from-Object Example</h1>"});
// formSection.newWrap('p', { t: "Build forms dynamically based on objects.", c: 'explanatory' })

// const myDate = new Date();
// formSection.newWrap('h2', { t: "Single-Keyed Object ➡ Single Labeled Input" });
// formSection.makeInputFor({myDate: myDate }).newWrap('span',{s: 'margin-left: 1em;', c:'explanatory',t:"⬅ for: {myDate: dateObj}"});
// formSection.makeInputFor({myString: "String val" }).newWrap('span',{s: 'margin-left: 1em', c:'explanatory',t:"⬅ for: {myString: 'String val'}"});
// formSection.makeInputFor({myNumber: 5 }).newWrap('span',{s: 'margin-left: 1em', c:'explanatory',t:"⬅ for: {myNumber: 5}"});
// formSection.makeInputFor({myBool: true }).newWrap('span',{s: 'margin-left: 1em', c:'explanatory',t:"⬅ for: {myBool: true}"});
// formSection.newWrap('h2',{t:"Simple Form"});
// const myObject = {name: "Jim Panzee", status: "grumpy", age: 4}
// formSection.makeFormFor(myObject);
// formSection.newWrap('h2',{t:"Complicated Form"});
// formSection.newWrap('p',{t:'#TODOAFTER'});
// //and remember the ultimate concept was a form with data binding, too.

//#region #### Binding with Variables Section ####
let bSect = app.newWrap('section', { h: '<h1>Binding with Observables</h1>' });
bSect.newWrap('p', {
  t: `In this library there are Observables, Observers, and Wrappers (which functions as both Obserables and Observers)`,
  c: 'explanatory'
})
bSect.newWrap('h2', { t: "Observers Bound to Observables" });
bSect.newWrap('p', { c: 'explanatory' }).text(`This section contains 3 different Observers bound to 3 different Observables
  - one with a primative value, illustrating the simplest case
  - one with a simple object property, illustrating the use of changeKey ('boundProperty') to select a property to observe
  - one with a nested property, illustrating the use of changeKey ('outer.inner') to identify the nested propety`)
let primativeObs = new Observable(0);
let pWatcher = new Observer().bindTo(primativeObs);
let objectObs = new Observable({ boundProperty: 0 });
let oWatcher = new Observer().bindTo(objectObs, 'boundProperty');
let nestedObs = new Observable({ outer: { inner: 0 } });
let nWatcher = new Observer().bindTo(nestedObs, 'outer.inner');
let incBtn = bSect.newWrap('button').text("Increment & Log Observables");
incBtn.onClick(() => {
  primativeObs.setVal(primativeObs.getVal() + 1);
  objectObs.setVal(objectObs.getVal('boundProperty') + 1, 'boundProperty');
  nestedObs.setVal(nestedObs.getVal('outer.inner') + 1, 'outer.inner');
  console.table({
    "primative-watcher": pWatcher.boundVal,
    "object-watcher": oWatcher.boundVal,
    "nested-object-watcher": nWatcher.boundVal
  });
  alert(`Variable Values:
  Primative value: ${primativeObs.getVal()}
  ----------
  Object: ${JSON.stringify(objectObs.getVal(), null, 2)}
  ----------
  Nested: ${JSON.stringify(nestedObs.getVal(), null, 2)}`)
})

bSect.newWrap('h2', { t: "Wrappers Bound to Observerables" });
let flexCont = bSect.newWrap('div', { s: "display:flex; justify-content: space-evenly" })
//experimenting with alternate ways to build up composites
flexCont.newWrap('div', { s: 'display:flex' })
  .newWrap('div', { s: "border:solid; padding:0.5em" })
  .newWrap('div', { t: "Primative", s: "margin-top:0.25em" }).parent!
  .newWrap('p', { s: "text-align: center; margin: 0.25em; font-size: 1.5em" }).bindTextTo(primativeObs).parent!
  .newWrap('button', { s: "width: 100%", t: "Increment Primative" }).onClick(() => primativeObs.setVal(primativeObs.getVal() + 1));

flexCont.newWrap('div', { s: 'display:flex' })
  .newWrap('div', { s: "border:solid; padding:0.5em" })
  .newWrap('div', { t: "Object Property", s: "margin-top:0.25em" }).parent!
  .newWrap('p', { s: "margin: 0.25em; font-size: 1.5em" })
  .bindTextTo(objectObs, 'boundProperty', () => JSON.stringify(objectObs.getVal())).parent!
  .newWrap('button', { s: "width: 100%", t: "Increment Bound Property" }).onClick(() => objectObs.setVal(objectObs.getVal('boundProperty') + 1, 'boundProperty')).parent!
  .newWrap('button', {
    s: "width: 100%; margin-top:0.25em",
    t: "Set a Different Property"
  }).onClick(() =>
    objectObs.setVal(`Setting this won't trigger the observable`, 'unboundProperty'));

flexCont.newWrap('div', { s: 'display:flex' })
  .newWrap('div', { s: "border:solid; padding:0.5em" })
  .newWrap('div', { t: "Object Nested Property", s: "margin-top:0.25em" }).parent!
  .newWrap('p', { s: "text-align: center; margin: 0.25em; font-size: 1.5em" })
  .bindTextTo(nestedObs, 'outer.inner', () => JSON.stringify(nestedObs.getVal())).parent!
  .newWrap('button', { s: "width: 100%", t: "Increment Nested Object Property" }).onClick(() => nestedObs.setVal(nestedObs.getVal('outer.inner') + 1, 'outer.inner'));

bSect.newWrap('h2').text("Wrapper Observing an Array");
let obsList = new Observable(['1']);
bSect.newWrap('ul').bindListTo(obsList, undefined);
bSect.newWrap('button', { t: "Add Element to Array" }).onClick(() => obsList.setVal([...obsList.getVal(), obsList.getVal().length + 1]));

// This didnt' really work. Ran into a binding infinite loop. If you're going to do this, it will take more thinking
// bSect.newWrap('h2',{t:"Wrapper Form Bound to Complex Object"});
// let complexObj = new Observable({
//   "topNumber": 0,
//   "topString": "hello",
//   "nestedObj": {
//     "nestedBool" : true,
//     "nestedArray" : ["Jimmy", "Cracked", "Corn"]
//   }
// })
// let state = bSect.newWrap('div').text(JSON.stringify(complexObj.getVal()));//binding to top-level object isn't supported
// bSect.makeLabeledInput('Top Number','input','inside',{inputType: 'number', lbl: "Top Level Number", lblStyle: "margin-right: 0.5em"}).input
//   .bindValueTo(complexObj,'topNumber');
// bSect.newWrap('button').text('Increment').onClick(()=>{
//   complexObj.setVal(complexObj.getVal('topNumber')+1, 'topNumber');
//   // state.text(JSON.stringify(complexObj.getVal()))
//   console.log(complexObj)
// })
//#endregion

//#region #### Inter-Wrapper Binding ####
let newBindSect = app.newWrap('section', { h: "<h1>Binding Between Wrappers</h1>" });
newBindSect.newWrap('p', { c: "explanatory", t: "Wrappers function as Observables and Observers - thus they can be bound directly to one-another" })
let newInput = newBindSect.makeLabeledInput('binding-example', 'input', 'inside', { lbl: "Binding Target ➡", lblStyle: "margin-right:0.5em" });
newInput.input.placehold("Type here!");
let targetInput = newInput.input; //better name for below
newBindSect.newWrap('h2', { t: "Default (text) Binding" })
newBindSect.newWrap("p", { t: "Type above and watch me change"}).bindTo(targetInput);
newBindSect.newWrap('h2', { t: "Style Binding" });
newBindSect.newWrap('p')
  .text("I'll set my style attribute to whatever you enter above (e.g. try 'font-family: courier; color: red')")
  .bindStyleTo(targetInput);
newBindSect.newWrap('h2', { t: 'Value Binding' });
(<HTMLInputElement>newBindSect.newWrap('input').bindValueTo(targetInput).element).disabled = true;
newBindSect.newWrap('h2', { t: "Binding with Xfer Function" });
let op = newBindSect.newWrap("p", { t: "I will be uppercase"});
op.bindTo(targetInput, 'value', (nv) => {
  op.text(`In uppercase: ${nv.toUpperCase()}`)
})
newBindSect.newWrap('h2', { t: 'Binding Breaking & Rebinding' });
let breakable = newBindSect.newWrap('p').bindTextTo(targetInput);
let breaker = newBindSect.newWrap('button', { t: "Break binding" });
let rebinder = newBindSect.newWrap('button', { t: "Re-bind" });
(<HTMLButtonElement>rebinder.element).disabled = true;
breaker.onClick(() => {
  breakable.getBindings().forEach(b => b.break());
  (<HTMLButtonElement>rebinder.element).disabled = false;
  (<HTMLButtonElement>breaker.element).disabled = true;
});
rebinder.onClick(() => {
  breakable.bindTextTo(targetInput);
  (<HTMLButtonElement>rebinder.element).disabled = true;
  (<HTMLButtonElement>breaker.element).disabled = false;
});
let chainGang = newBindSect.newWrap('h2', { t: "Wrapper Binding Chain" })
  .newWrap('div', undefined, 'after');
chainGang.newWrap('p', { t: "(bound to target above)" });
let one = chainGang.newWrap('p').bindTextTo(targetInput)
chainGang.newWrap('p', { t: "(👇 bound to 👆)" });
let two = chainGang.newWrap('p').bindTextTo(one, 'text');
chainGang.newWrap('p', { t: "(👇 bound to 👆)" });
chainGang.newWrap('p').bindTextTo(two, 'text');
//#endregion
