# Wrapper Library

This library is the result of me wanting to better learn TypeScript, and to build something with *some* of the features of jQuery that I used to use, but without the dependency, and enable basic databinding.

I'm **100% Sure** there are plenty of other libraries out there that do what this does (and more), but better. This was me seeing what I could build to make working without external dependencies a bit easier.

## What It Is

Wrapper is a class that *wraps* an HTML Element, allowing you to do things to that element using a (slightly) more concise syntax than plain vanilla JS would get you. Wrappers can function as both Observable and Obervers. The library also contains Observable and Observer base classes for use outside of the Wrapper context.

## What You Can Do With It

I've wrapped in (pun so intended it hurts) a number of use cases into this library.

1. Chain build HTML Elements
2. Create Obserables & Observers
3. Link Observables & Observers to HTML Elements
4. Create Inputs from Objects
5. Create entire forms from Objects (including objects with nested objects)

[Check out the Demo Site + Example Source Code on Glitch](https://glitch.com/~wrapper-lib-demo)

[...or just the Demo Site](https://wrapper-lib-demo.glitch.me/)