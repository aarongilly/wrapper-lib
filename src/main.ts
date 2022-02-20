import './style.css'
import { Wrapper } from './wrapper'

const app = Wrapper.wrap(document.querySelector<HTMLDivElement>('#app')!);

app.newWrap('h1',{text: 'Wrapper Library Test Page'});

let features = ['Chaining', 'Concise(er) syntax', 'Event binding', 'Component-ish things'];

let featureList = app.newWrap('ul',{style: 'list-style-type: upper-roman'},'after').listContent(features);

let cont = document.createElement('section'); 
document.body.appendChild(cont); //to host example
//using a few Wrappers
let myWrap = Wrapper.wrap(cont);
myWrap.newWrap('h1', {text: "Hello Wrapper!"});
let myBody = myWrap.newWrap('p',{id:'my-paragraph-2',style:'font-size:1.5em'})
.text('Last time I checked, the time was: ' + new Date().toLocaleTimeString());
myWrap.newWrap('button',{text: 'Check again'}).onEvent('click',()=>{
  myBody.text(myBody.getText().substring(0, 35) + new Date().toLocaleTimeString()
)});
