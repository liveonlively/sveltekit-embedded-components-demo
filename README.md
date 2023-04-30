# sveltekit-embedded-components-demo

A demo of the technique used at Lively to reuse components from our SvelteKit app within other applications.

To try it out, open a terminal and navigate to the other-app folder and run `npm start` to start a basic nodejs static server that simulates another application that wants to load some components from our sveltekit app.

That should start up a server listening on port 3000.

Then open another terminal and navigate to the app folder and run `npm run dev`.

For the sveltekit app, we scaffolded an demo app and updated the vite.config.js
to proxy the homepage and /js path to the app running on localhost:3000.

In production, we implement this using a reverse proxy server that takes requests and then
routes to the appropriate app based on the incoming url.

We also made a route group named (app) and placed all of the demo code inside that.
We made another route group (components) to hold our component loaders.
We don't want those routes to include any layout html which is why we had to
move the scaffolded root +layout.svelte file into the (app) route group.

Here's what happens when you hit the homepage at http://localhost:5173/:

1. Vite proxies the request to http://localhost:3000
2. The static node server sends down the other-app/static/index.html to the browser
3. That html gets the browser to load other-app/static/js/components.js and initialize
   a SvelteKitComponents object. That object has a load method which creates an iframe
   that points to http://localhost:5173/components/common.
4. The browser then loads /components/common in the iframe and the svelte code
   for that route will make the components available on the global window.
5. The script in other-app/static/index.html that created the SvelteKitComponents object
   waits for the components to be initialized. The SvelteKitComponents has code for watching
   items that are modified on the `<head>` of the iframe and replaying those changes on
   the top window frame.

The main issue with this setup happens when the components bind something to the
global window, window.document or body because they will be targeting the
iframe rather than the top window.

To work around this, we pass the window and body element as props to our components
when instantiating them. This limited our ability to use certain 3rd party libraries.

We've considered that it might be possible to create a vite or svelte compiler plugin
to allow us to inject an alternate window/global object before the components and
their dependencies are loaded.

