import Event from '../events/event';
import EventDispatcher from '../events/event-dispatcher';
import { assign } from './assign';
import { isHiraganaByCode, convertToOneByteKana } from '../libs/validate';

const CHECK_TIME = 30;
const KANA_EXTRACT_PTRN = new RegExp('[^ 　ぁあ-んー]', 'g');
const KANA_COMPACT_PTRN = new RegExp('[ぁぃぅぇぉっゃゅょ]', 'g');

class AutoKana extends EventDispatcher {
  constructor(base, kana, opt) {
    super();
    this._base = base;
    this._kana = kana;
    const settings = assign({ isOneByte: false }, opt);
    this._isOneByte = settings.isOneByte;
    this._timer = null;
    this._keyTimer = -1;
    this._active = false;
    this._isConvert = true;
    this._input = null;
    this._values = null;
    this._ignoreString = '';
    this._baseKana = '';
    this._isFocusIn = false;

    this._reset = this._reset.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._clearTimer = this._clearTimer.bind(this);
    this._stateInput = this._stateInput.bind(this);
    this._setTimer = this._setTimer.bind(this);
    this._checkValue = this._checkValue.bind(this);
    this._setKana = this._setKana.bind(this);
    this._checkConvert = this._checkConvert.bind(this);
    this._stateConvert = this._stateConvert.bind(this);
    this._toKatakana = this._toKatakana.bind(this);
  }

  init() {
    this._reset();
    this._active = true;
    this._base.addEventListener('blur', this._onBlur);
    this._base.addEventListener('focus', this._onFocus);
    this._base.addEventListener('keydown', this._onKeyDown);
  }

  _onBlur() {
    this._isFocusIn = false;
    this._clearTimer();
  }

  _onFocus() {
    this._isFocusIn = true;
    this._kana.value = '';
    this._stateInput();
    this._setTimer();
  }

  _onKeyDown() {
    window.clearTimeout(this._keyTimer);
    if (this._isConvert) {
      this._stateInput();
    }
    this._timer = window.setTimeout(() => {
      super.fire(
        new Event('change', {
          target: this._kana,
          value: this._kana.value
        })
      );
    }, 500);
  }

  _clearTimer() {
    window.clearTimeout(this._timer);
    this._timer = null;
  }

  _stateInput() {
    this._baseKana = this._kana.value;
    this._isConvert = false;
    this._ignoreString = this._base.value;
  }

  _setTimer() {
    if (!this._isFocusIn) {
      return;
    }
    window.setTimeout(this._checkValue, CHECK_TIME);
  }

  _checkValue() {
    const newInput = this._base.value;
    let newValues = '';
    if (newInput === '') {
      this._reset();
      this._setKana();
    } else {
      this._input = newInput;
      if (!this._isConvert) {
        newValues = newInput.replace(KANA_EXTRACT_PTRN, '').split('');
        this._checkConvert(newValues);
        this._setKana(newValues);
      }
    }
    this._setTimer();
  }

  _setKana(newValues = '') {
    if (!this._isConvert) {
      if (newValues) {
        this._values = newValues;
      }
      if (this._active) {
        const value = this._toKatakana(`${this._baseKana}${this._values.join('')}`);
        this._kana.value = this._isOneByte ? convertToOneByteKana(value) : value;
      }
    }
  }

  _checkConvert(newValues) {
    const valuesNum = this._values.length;
    const newValueNum = newValues.length;
    if (!this._isConvert) {
      if (Math.abs(valuesNum - newValueNum) > 1) {
        const tmpValues = newValues
          .join('')
          .replace(KANA_COMPACT_PTRN, '')
          .split('');
        if (Math.abs(valuesNum - tmpValues.length) > 1) {
          this._stateConvert();
        }
      } else if (valuesNum === this._input.length && this._values.join('') !== this._input) {
        if (this._input.match(KANA_EXTRACT_PTRN)) {
          this._stateConvert();
        }
      }
    }
  }

  _toKatakana(src) {
    let c = 0;
    let str = '';
    for (let i = 0, num = src.length; i < num; i++) {
      c = src.charCodeAt(i);
      if (isHiraganaByCode(c)) {
        str += String.fromCharCode(c + 96);
      } else {
        str += src.charAt(i);
      }
    }
    return str;
  }

  _stateConvert() {
    this._baseKana = `${this._baseKana}${this._values.join('')}`;
    this._isConvert = true;
    this._values = [];
  }

  _reset() {
    this._baseKana = '';
    this._isConvert = false;
    this._ignoreString = '';
    this._input = '';
    this._values = [];
  }
}

export default AutoKana;
