import './style.css'
import { Wrapper, WrapperlessObservable } from './wrapper'

const app = Wrapper.wrap(document.querySelector<HTMLDivElement>('#app')!);
app.newWrap('h1',{text: 'Wrapper Library Test Page'});

//#region #### Simple Examples ####
let simpleSection = app.newWrap('section',{html:'<h1>Simple Examples</h1>'}); 
let myBody = simpleSection.newWrap('p',{id:'my-paragraph-2',style:'font-size:1.5em'})
.text('Last time I checked, the time was: ' + new Date().toLocaleTimeString());
simpleSection.newWrap('button',{text: 'Check again'}).onEvent('click',()=>{
  myBody.text(myBody.getText().substring(0, 35) + new Date().toLocaleTimeString()
)});
//#endregion

//#region #### Composite Example ####
let compositeSection = app.newWrap('section').newWrap('h1',{text: "Composite Examples"}).newWrap('div',{style: 'display: grid; grid-column-layout: 1fr 1fr'},'after')
let features = ['Supports Chaining', 'Concise(er) syntax', 'Basic data binding', 'Component-ish things'];
compositeSection.newWrap('div',{style:"grid-column-start:1"}).newWrap('h2',{text: "Create Lists from Arrays"}).newWrap('ul',undefined,'after').listContent(features);
compositeSection.newWrap('div',{style:"grid-column-start:2"}).newWrap('h2',{text: "Create Selects from Arrays"}).newWrap('select',undefined,'after').selectContent(features);
//#endregion

//#region #### Labeled Input Examples ####
let lbldInptSection = app.newWrap('section',{html:'<h1>Label-Input Pairs</h1>'});
lbldInptSection.newWrap('h2').text('Simple Text Input Example');
let inputPair = lbldInptSection.makeLabeledInput('text-input-example');
inputPair.label.style('margin-right: 0.5em'); //accessing inner member of the inputPair
lbldInptSection.newWrap('h2').text("Textarea Example")
let textareaPair = lbldInptSection.makeLabeledInput('textarea-example','textarea','inside',{stacked:true});
textareaPair.label.style('margin-right: 0.5em');
lbldInptSection.newWrap('h2').text("Other Types of Inputs")
let grid = lbldInptSection.newWrap('div').style('display: grid; grid-template-columns: 1fr 1fr');
let checkPair = grid.makeLabeledInput('check-input','input','inside',{inputType:'checkbox', lbl: "Show Date Example, too?"});
(<HTMLInputElement>checkPair.input.element).checked = true;
checkPair.input.onEvent('click',()=>{
  if(checkPair.input.getVal()){
    datePair.style('display:flex')
  }else{
    datePair.style('display:none')
  }
})
let datePair = grid.makeLabeledInput('date-input',undefined,undefined,{inputType:'date',lbl: "Date Input",lblStyle: "margin-right: 0.5em"});
//#endregion

//#region #### Inter-Wrappter Data Binding Region ####
let bindingSection = app.newWrap('section',{html:"<h1>Inter-Wrapper Binding Example</h1>"});
bindingSection.newWrap('h2').text('Bound Select, with Binding Breaker Demo')
let bindingSelect = bindingSection.newWrap('select').selectContent(['1', "2", "3"],["You picked one", "You picked two", "You picked three"]);
let boundToSelect = bindingSection.newWrap('p').bindToWrapper(bindingSelect,'value','text');
bindingSection.newWrap('button',{text:'Break Binding'}).onEvent('click',()=>{
  bindingSelect.removeSubscriber(boundToSelect);
  boundToSelect.text('Binding broken, this will no longer update.');
}).style('margin-right: 0.5em')
bindingSection.newWrap('button',{text: 'Re-bind'}).onEvent('click',()=>boundToSelect.bindToWrapper(bindingSelect,'value','text'));
bindingSection.newWrap('h2',{text:"Binding Text & Style (via xferFunc)"})
let boundText = bindingSection.newWrap('p',{text: "Enter some text below and watch me change..."});
let bindingInput = bindingSection.newWrap('input').setVal('Enter a Color name!').placehold('Type a color name...');
boundText.bindToWrapper(bindingInput,'value','text')
  .bindToWrapper(bindingInput,'value','style',(newVal: string)=>{boundText.style('color:' + newVal)});
//#endregion

//#region #### Binding to Variables ####
// let altBinding = app.newWrap('section',{html:"<h1>Generic Data Binding</h1>"});
// let test = new WrapperlessObservable(5);
// altBinding.newWrap('p').text(test.getVal().toString())//.//bindTo()