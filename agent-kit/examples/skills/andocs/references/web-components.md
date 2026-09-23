# Web Components in prototypes

Custom Elements and Shadow DOM work without a build step. Define them in a plain `<script>` block or in the nearest prototype root's `shared.js`; sandboxed prototype pages cannot rely on module imports or relative script URLs.

```html
<title>Status badges</title>
<script>
  class StatusBadge extends HTMLElement {
    static observedAttributes = ["status"];
    #shadow;

    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }
    attributeChangedCallback() {
      this.render();
    }

    render() {
      this.#shadow.textContent = this.getAttribute("status") ?? "unknown";
    }
  }
  customElements.define("status-badge", StatusBadge);
</script>
<status-badge status="active"></status-badge>
```

For a component with transitions, create its DOM once and change classes or attributes when state changes. Replacing `innerHTML` destroys the elements that CSS would animate. If a component does replace its children, delegate events from the shadow root so listeners survive replacement.

Declare each `#privateField` in the class body; an undeclared private field is a syntax error for the whole script. When a JavaScript string inside an HTML `<script>` contains `</script>`, escape the slash as `<\/script>` so HTML parsing does not close the block early.
