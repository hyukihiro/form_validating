import { isUndefined } from '../libs/get-type-of';

class EventDispatcher {
  constructor(context) {
    this._events = [];
    this._context = context;
  }

  one(type, callback, context, priority) {
    const handler = function() {
      this.off(type, handler);
      callback.apply(this, arguments);
    }.bind(this);
    this.on(type, handler, context, priority);
  }

  addEventListener(type, callback, context, priority = 0) {
    this._events[type] = this._events.hasOwnProperty(type) ? this._events[type] : {};
    const listenerToInsert = {
      context,
      callback,
      priority
    };
    if (this._events[type].listeners) {
      const listeners = this._events[type].listeners;
      let inserted = false;
      for (let i = 0, length = listeners.length; i < length; i++) {
        const listener = listeners[i];
        const eventPriority = listener.priority;
        if (priority < eventPriority) {
          listeners.splice(i, 0, listenerToInsert);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        listeners.push(listenerToInsert);
      }
    } else {
      this._events[type].listeners = [listenerToInsert];
    }
  }

  on(type, callback, context, priority) {
    this.addEventListener(type, callback, context, priority);
  }

  bind(type, callback, context, priority) {
    this.addEventListener(type, callback, context, priority);
  }

  removeEventListener(type, callback) {
    const listeners = this._events[type] ? this._events[type].listeners : null;
    if (!listeners || listeners.length < 1) {
      return false;
    }
    if (!callback) {
      this._events[type].listeners = [];
      return true;
    }
    for (let i = 0, length = listeners.length; i < length; i++) {
      const listener = listeners[i];
      if (listener.callback === callback) {
        listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  off(type, callback) {
    this.removeEventListener(type, callback);
  }

  unbind(type, callback) {
    this.removeEventListener(type, callback);
  }

  removeAllEventListener() {
    for (const key in this._events) {
      if (this._events.hasOwnProperty(key)) {
        this._events[key].listeners.length = 0;
        delete this._events[key];
      }
    }
    this._events = [];
  }

  unbindAll() {
    this.removeAllEventListener();
  }

  offAll() {
    this.removeAllEventListener();
  }

  hasEventListener(type, callback) {
    const listeners = this._events[type] ? this._events[type].listeners : null;
    if (!listeners) {
      return false;
    }
    if (!callback) {
      return listeners.length > 0;
    }
    for (let i = 0, length = listeners.length; i < length; i++) {
      const listener = listeners[i];
      if (listener.callback === callback) {
        return true;
      }
    }
    return false;
  }

  dispatchEvent(event) {
    const type = event.type;
    const _eventType = this._events[type];
    const listeners = _eventType !== null && typeof _eventType !== 'undefined' ? _eventType.listeners : null;
    if (!listeners || listeners.length < 1) {
      return;
    }
    for (let i = listeners.length - 1; i >= 0; i--) {
      const listener = listeners[i];
      const callback = listener.callback;
      const callbackContext = listener.context ? listener.context : this._context;
      if (!('target' in event)) {
        event.target = this;
      }
      event.currentTarget = this;
      event.context = callbackContext;
      const result = callback.call(this, event);
      if (!isUndefined(result) && !result) {
        break;
      }
    }
  }

  trigger(event) {
    this.dispatchEvent(event);
  }

  fire(event) {
    this.dispatchEvent(event);
  }
}
export default EventDispatcher;
