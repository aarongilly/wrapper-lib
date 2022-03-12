import './style.css'
import { Observer, Wrapper, Observable } from '../lib/wrapper-lib'

const app = Wrapper.wrap(document.querySelector<HTMLDivElement>('#app')!);
app.newWrap('h1',{text: 'Wrapper Library Test Page'});

//#region #### New Binding Test ####
let newBindingSection = app.newWrap('section',{html: "<h1>New Binding Method Tester</h1>"});
let newInput = newBindingSection.newWrap('input')
newInput.placehold("Test new binding");
let boundP = newBindingSection.newWrap("p").text("Bind me");
// boundP.bindTo(newInput)

//#region #### Simple Examples ####
let simpleSection = app.newWrap('section',{html:'<h1>Simple Examples</h1>'}); 
let myBody = simpleSection.newWrap('p',{id:'my-paragraph-2',style:'font-size:1.5em'})
.text('Last time I checked, the time was: ' + new Date().toLocaleTimeString())
.class('styled-text');
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
inputPair.input.onEnterKey(()=>{console.log('You pressed enter!')});
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

/*
//#region #### Binding to Variables ####
let genericBindingSection = app.newWrap('section',{html:"<h1>Generic Data Binding</h1>"});
genericBindingSection.newWrap('h2').text('Bound Wrapper to WrapperlessObservable')
let boundToVar = new Observable(5);
genericBindingSection.newWrap('p').text(boundToVar.getVal().toString()).bindTo(boundToVar,"text");
genericBindingSection.newWrap('button').text("Increment").onClick(()=>{ boundToVar.setVal(<number>boundToVar.getVal()+1)});
genericBindingSection.newWrap('h2').text('Observer Watching the Observable From Above');
let boundVarView = genericBindingSection.newWrap('p').text('Double the number above: 10')
new Observer(boundToVar.getVal()).bindTo(boundToVar,(nv: number)=> {
  boundVarView.text('Double the number above: ' + nv*2) //for illustration only
  return nv*2
});
genericBindingSection.newWrap('h2').text("Observer of Wrappers");
let inputToBindAgainst = genericBindingSection.newWrap('input').placehold('Enter some text')
let wrapperBondVarView = genericBindingSection.newWrap('p').text("Input value: ");
new Observer('whatever').bindToWrapper(inputToBindAgainst,'value',(nv: string)=>{
  wrapperBondVarView.text("Input value: " + nv)
  return nv;
})
//#endregion

//#region #### Inter-Wrappter Data Binding Region ####
let wrapperBindingSection = app.newWrap('section',{html:"<h1>Inter-Wrapper Binding Example</h1>"});
wrapperBindingSection.newWrap('h2').text('Bound Select, with Binding Breaker Demo')
let bindingSelect = wrapperBindingSection.newWrap('select').selectContent(['1', "2", "3"],["You picked one", "You picked two", "You picked three"]);
let boundToSelect = wrapperBindingSection.newWrap('p').bindToWrapper(bindingSelect,'value','text');
wrapperBindingSection.newWrap('button',{text:'Break Binding'}).onEvent('click',()=>{
  bindingSelect.removeSubscriber(boundToSelect);
  boundToSelect.text('Binding broken, this will no longer update.');
}).style('margin-right: 0.5em')
wrapperBindingSection.newWrap('button',{text: 'Re-bind'}).onEvent('click',()=>boundToSelect.bindToWrapper(bindingSelect,'value','text'));
wrapperBindingSection.newWrap('h2',{text:"Binding Text & Style (via xferFunc)"})
let boundText = wrapperBindingSection.newWrap('p',{text: "Enter some text below and watch me change..."});
let bindingInput = wrapperBindingSection.newWrap('input').setVal('Enter a Color name!').placehold('Type a color name...');
boundText.bindToWrapper(bindingInput,'value','text')
  .bindToWrapper(bindingInput,'value','style',(newVal: string)=>{boundText.style('color:' + newVal)});
//#endregion
*/