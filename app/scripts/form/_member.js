import EventEmitter from 'eventemitter3';

class MemberForm extends EventEmitter{

  static get CHANGE () {
    return '@@MemberForm/change'
  }

  constructor(container, id) {
    super();
    this._container = container;
    this._id = id;
    this._status = false;
    this._state = {};

    this._maxStatus = 0;
    this._timer = -1;
  }


}

export default MemberForm;
