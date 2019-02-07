class Event {
  constructor(type, params = {}) {
    this.type = type;
    this.params = params;
    this.target = null;
  }
}
export default Event;
