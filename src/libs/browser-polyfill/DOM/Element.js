import Node from './Node';

class Element extends Node {
  constructor(tagName) {
    return super(tagName.toUpperCase());

    this.doc = {
      body: {
        innerHTML: '',
      },
    };
  }

  get tagName() {
    return this.nodeName;
  }

  setAttributeNS() {}

  get clientWidth() {
    return this.innerWidth;
  }
  get clientHeight() {
    return this.innerHeight;
  }

  get offsetWidth() {
    return this.innerWidth;
  }
  get offsetHeight() {
    return this.innerHeight;
  }

  get innerWidth() {
    return window.innerWidth;
  }
  get innerHeight() {
    return window.innerHeight;
  }

  get ontouchstart() {
    return {};
  }
}

export default Element;
