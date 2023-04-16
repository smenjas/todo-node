# todo-node

This is a to-do app built with [Node.js](https://nodejs.org/). It's an exercise
to learn web development fundamentals, using only HTML, CSS, JavaScript, &
the Node.js runtime.

## Exercise Constraints
- No libraries, frameworks, templates, or preprocessors outside Node.js
- Limited dev tools:
  - [ESLint](https://www.npmjs.com/package/eslint)
  - [nodemon](https://www.npmjs.com/package/nodemon)

## Goals
- [x] [As simple as possible, but not simpler](https://quoteinvestigator.com/2011/05/13/einstein-simple/)
- [x] Create, read, update, and delete tasks
- [x] Store tasks on the server
- [x] Provide secure authentication

![ToDo app screenshot - light mode](screenshots/todo-light.png)
![ToDo app screenshot - dark mode](screenshots/todo-dark.png)

## Setup
To run this yourself, you will need to install Node.js on your operating
system. Then, install `nodemon` globally, with:
```sh
npm install -g nodemon
```
Finally, run the Node server with:
```sh
cd src
nodemon .
```
`nodemon` is an alternative to the `node` command that automatically restarts
the server when you make changes to the source code, so you don't have to
restart the server manually.

## Development
You can run the automated test suite with:
```sh
npm run test
```
You can identify syntax and style issues with:
```sh
npm run lint
```

favicon by [Twemoji](https://twemoji.twitter.com/), licensed as [CC-BY
4.0](https://creativecommons.org/licenses/by/4.0/).
