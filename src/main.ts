import './style.css'
import { Wrapper } from './wrapper'

const app = Wrapper.wrap(document.querySelector<HTMLDivElement>('#app')!);

app.newWrap('h1',{text: 'Wrapper Library Test Page'});

let features = ['Chaining', 'Concise(er) syntax', 'Event binding', 'Component-ish things'];

let featureList = app.newWrap('ul',{style: 'list-style-type: upper-roman'},'after').listContent(features);
