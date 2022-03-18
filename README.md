# Wrapper Library

This library is the result of me wanting to better learn TypeScript, and to build something with *some* of the features of jQuery that I used to use, but without the dependency, and to enable basic databinding.

I'm **100% Sure** there are plenty of other libraries out there that do what this does (and more), but better. This was me seeing what I could build to make working without external dependencies a bit easier.

## What It Is

Wrapper is a class that *wraps* an HTML Element, allowing you to do things to that element using a (slightly) more concise syntax than plain vanilla JS would get you. Wrappers can function as both Observable and Obervers. The library also contains Observable and Observer base classes for use outside of the Wrapper context.

It's primary purpose is for building out a UI in JavaScript without writing so much code. Compare these blocks of code that do the same thing.

### Basic 3 Part Example
```
//using vanilla browser apis
let cont = document.createElement('section');
document.body.appendChild(cont); //to host example
let myHeader = document.createElement('h1');
myHeader.innerText = "Hello Vanilla!";
let myBody = document.createElement('p');
myBody.id = 'my-paragragph';
myBody.setAttribute('style','font-size:1.5em');
myBody.innerText = 'Last time I checked, the time was: ' + new Date().toLocaleTimeString();
let myButton = document.createElement('button');
myButton.innerText = 'Check again';
myButton.onclick = ()=>{
  myBody.innerText = myBody.innerText.substring(0, 35) + new Date().toLocaleTimeString()
}
cont.appendChild(myHeader);
cont.appendChild(myBody);
cont.appendChild(myButton);
```

```
let cont = document.createElement('section'); 
document.body.appendChild(cont); //to host example
//using a few Wrappers
let myWrap = Wrapper.wrap(cont);
myWrap.newWrap('h1', {t: "Hello Wrapper!"});
let myBody = myWrap.newWrap('p',{id:'my-paragraph-2',style:'font-size:1.5em'})
.text('Last time I checked, the time was: ' + new Date().toLocaleTimeString());
myWrap.newWrap('button',{t: 'Check again'}).onClick(()=>{
  myBody.text(myBody.getText().substring(0, 35) + new Date().toLocaleTimeString()
)});
```

