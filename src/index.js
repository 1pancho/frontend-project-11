// @ts-check
import './styles.scss';
import 'bootstrap';

export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    this.element.textContent = '';
    console.log('');
  }
}
