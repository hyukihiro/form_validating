import EventEmitter from 'eventemitter3';
import { makeArray } from '../libs/make-array';
import {
  hasNumberChar,
  isEmail,
  isKatakana,
  isSingleByteNumber
} from '../libs/validate';
import { addClass, hasClass, removeClass, removeClasses } from '../libs/helper';
import { isNull } from '../libs/get-type-of';

const TYPE_ERROR = 'is-error-type';
const REQUIRED_ERROR = 'is-error-required';
const DIFFERENT_ERROR = 'is-error-different';

class MemberForm extends EventEmitter {
  constructor(container, id) {
    super();
    this._container = container;
    this._id = id;
    this._status = false;
    this._state = {};

    this._maxStatus = 0;
    this._timer = -1;

    this.init();

    this._validate = this._validate.bind(this);
    // this._onBlur = this._onBlur.bind(this);
    // this._onKeydown = this._onKeydown.bind(this);
    // this._onKeypress = this._onKeypress.bind(this);
  }

  static get CHANGE() {
    return '@@MemberForm/change';
  }

  init() {
    this._handleEvents();
    this._setItems();
  }

  _handleEvents() {
    const items = makeArray(this._container.querySelectorAll('.form-item'));
    // console.log(items);
    items.forEach(item => {
      const tagName = item.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        item.addEventListener('blur', this._onBlur.bind(this));
        item.addEventListener('keydown', this._onKeydown.bind(this));
        item.addEventListener('keypress', this._onKeypress.bind(this));
      }
    });
  }

  _validate(target) {
    console.log('validate');
    const data = target.myValidateData;
    const type = data['validate-type'];
    const isRequired = JSON.parse(data['validate-required']);
    const key = data['data-name'];

    if (type) {
      switch (type) {
        case 'katakana':
          this._validateKatakana(target, key, isRequired);
          break;

        case 'email-extra':
          this._validateExtraEmail(target, key, isRequired);
          break;

        case 'num':
          this._validateNumber(target, key, isRequired);
          break;

        default:
          console.log('in default');
      }
    } else {
      this._validateRequired(target, key, isRequired);
    }
  }

  _setItems() {
    console.log('_setItems');
    const items = this._container.querySelectorAll('.form-item');
    this._maxStatus = items.length;
    items.forEach(item => {
      let obj = {};
      // もし'data-json'というデータ属性があれば
      if (item.hasAttribute('data-json')) {
        obj = JSON.parse(item.dataset.json);
      }

      item.myValidateData = obj;

      // 項目の識別値
      const key = obj['data-name'];
      let isRequired = false;

      // もしvalidate-required属性があり、かつその値がtrueなら
      // つまり必須項目なら
      if (
        !isNull(obj['validate-required']) &&
        obj['validate-required'] === 'true'
      ) {
        isRequired = true;
      }
      // ステートに状態をいれる
      // 必須項目でないものはtrueをいれる。（必須項目でないものはもう入力済み状態にする）
      this._state[key] = !isRequired;

      // switch (key) {
      //   case 'name_sei':
      //     this._lastName = item;
      //     break;
      //   case 'name_mei':
      //     this._firstName = item;
      //     break;
      //   case 'kana_sei':
      //     this._lastNameKana = item;
      //     break;
      //   case 'kana_mei':
      //     this._firstNameKana = item;
      //     break;
      // }
    });
  }

  _onBlur(event) {
    console.log('onblur');
    const target = event.target;
    const name = target.myValidateData['data-name'];

    if (name === 'zip1') {
      this._postcode0 = target.value;
      this._checkZipCode();
    } else if (name === 'zip2') {
      this._postcode1 = target.value;
      this._checkZipCode();
    }

    // バリデーションの実行
    this._validate(target);
  }

  _onKeydown(event) {
    console.log('_onKeydown');
    const target = event.target;

    if (this._timer !== -1) {
      window.clearTimeout(this._timer);
    }

    this._timer = setTimeout(() => {
      this._validate(target);
    }, 300);
  }

  _onKeypress(event) {
    console.log('_onKeypress');
    if (
      (event.which && event.which === 13) ||
      (event.keyCode && event.keyCode === 13)
    ) {
      event.preventDefault();
      return false;
    }
  }

  _validateExtraEmail(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode;

    if (isRequired) {
      if (value.length <= 0) {
        this._showError(parent, REQUIRED_ERROR);
        this._hideError(parent, TYPE_ERROR);
        this._state[key] = false;
      } else if (value.length <= 0 || !isEmail(value)) {
        this._showError(parent, TYPE_ERROR);
        this._hideError(parent, REQUIRED_ERROR);
        this._state[key] = false;
      } else {
        // OK
        removeClasses(parent, [TYPE_ERROR, REQUIRED_ERROR]);
        this._state[key] = true;
      }
    } else {
      // メール形式に沿っている、もしくは何も入力されていない。
      this._state[key] = !!(value.length === 0 || isEmail(value));
    }
    this._checkAll();
  }

  _validateNumber(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode;

    if (isRequired) {
      if (value.length <= 0) {
        this._showError(parent, REQUIRED_ERROR);
        this._hideError(parent, TYPE_ERROR);
        this._state[key] = false;
      } else if (value.length <= 0 || !isSingleByteNumber(value)) {
        this._showError(parent, TYPE_ERROR);
        this._hideError(parent, REQUIRED_ERROR);
        this._state[key] = false;
      } else {
        removeClasses(parent, [TYPE_ERROR, REQUIRED_ERROR]);
        this._state[key] = true;
      }
    } else {
      this._state[key] = !!(value.length <= 0 || hasNumberChar(value));
    }

    this._checkAll();
  }

  _validateKatakana(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode;

    if (isRequired) {
      if (value <= 0) {
        this._showError(parent, REQUIRED_ERROR);
        this._hideError(parent, TYPE_ERROR);

        this._state[key] = false;
      } else if (value <= 0 || !isKatakana(value)) {
        this._showError(parent, TYPE_ERROR);
        this._hideError(parent, REQUIRED_ERROR);

        this._state[key] = false;
      } else {
        removeClasses(parent, [TYPE_ERROR, REQUIRED_ERROR]);

        this._state[key] = true;
      }
    } else {
      this._state[key] = !!(value <= 0 || isKatakana(value));
    }
    this._checkAll();
  }

  _validateRequired(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode;
    if (isRequired) {
      if (value <= 0) {
        this._showError(parent, REQUIRED_ERROR);
      } else {
        this._hideError(parent, REQUIRED_ERROR);
      }
      this._state[key] = !(target.value >= 0);
    } else {
      this._state[key] = true;
    }

    this._checkAll();
  }

  /**
   * エラーメッセージを出すクラスを付与
   * @param parent
   * @param name
   * @private
   */
  _showError(parent, name) {
    if (!hasClass(parent, name)) {
      addClass(parent, name);
    }
  }

  /**
   * エラーメッセージを出すクラスを除去
   * @param parent
   * @param name
   * @private
   */
  _hideError(parent, name) {
    if (hasClass(parent, name)) {
      removeClass(parent, name);
    }
  }

  /**
   * すべての入力項目が記入されたかチェック
   * @return {Promise<void>}
   * @private
   */
  _checkAll() {
    this._maxStatus = Object.keys(this._state).length;
    let counter = 0;
    Object.keys(this._state).forEach(key => {
      if (this._state[key]) {
        counter++;
      }
    });
    this._changeSubmitState(!!(counter === this._maxStatus));
  }

  /**
   * 各アイテムが正常に記入されていれば送信ボタンをクリッカブルに
   * @param enabled
   * @private
   */
  _changeSubmitState(enabled) {
    // console.table(this._state);
    if (enabled) {
      this._status = true;
    } else {
      this._status = true;
    }
    this.emit(MemberForm.CHANGE, this._status);
  }

  // _show() {
  //   this._container.style.display = 'block';
  // }
  //
  // _hide() {
  //   this._container.style.display = 'block';
  // }
}

export default MemberForm;
