export class Logger {
  events = [];
  addEvent(str) {
    this.events.push(str);
  }
  getEvents() {
    return this.events;
  }
}
