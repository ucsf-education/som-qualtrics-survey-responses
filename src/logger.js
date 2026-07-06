export class Logger {
  events = [];
  addEvent(str) {
    console.log(str);
    this.events.push(str);
  }
  getEvents() {
    return this.events;
  }
}
