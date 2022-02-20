import './style.css'
import { Wrapper, WrappedInputLabelPair} from './wrapper'

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
let compositeSection = app.newWrap('section')
let features = ['Supports Chaining', 'Concise(er) syntax', 'Data binding (soon)', 'Component-ish things'];
compositeSection.newWrap('h1',{text: "Composite Example"}).newWrap('ul',{style: 'list-style-type: upper-roman'},'after').listContent(features);
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
let checkPair = grid.makeLabeledInput('check-input','input','inside',{inputType:'checkbox', label: "Show Date Example, too?"});
(<HTMLInputElement>checkPair.input.element).checked = true;
checkPair.input.onEvent('click',()=>{
  if(checkPair.input.getVal()){
    datePair.style('display:flex')
  }else{
    datePair.style('display:none')
  }
})
let datePair = grid.makeLabeledInput('date-input',undefined,undefined,{inputType:'date',lblStyle: "margin-right: 0.5em"});
//#endregion

//todo - databinding
let bindingSection = app.newWrap('section',{html:"<h1>Data Binding Example</h1>"});
let bindingSelect = bindingSection.newWrap('select').selectContent(['Option 1', "Option 2", "Option 3"])
let boundParagraph = bindingSection.newWrap('p',{text: "Coming soon..."}).style('color: red');