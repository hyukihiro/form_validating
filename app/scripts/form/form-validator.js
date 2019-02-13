import axios from 'axios';
import {
  isKatakana,
  hasNumberChar,
  isEmail,
  isJPZipCode,
  isSingleByteNumber,
  isTelephoneNumber
} from '../libs/validate';
import { addClass, hasClass, removeClass, removeClasses } from '../libs/helper';
import { isNull } from '../libs/get-type-of';
import * as APIAction from '../actions/api-action';
import { apiRequest } from '../api/api';

const TYPE_ERROR = 'is-error-type';
const REQUIRED_ERROR = 'is-error-required';
const DIFFERENT_ERROR = 'is-error-different';

class FormValidator {
  constructor(container) {
    this._container = container;
    this._state = {};
    this._maxStatus = 0;
    this._timer = -1;

    this._items = null;
    this._postcode0 = null;
    this._postcode1 = null;
    this._addresField = null;
    this._firstName = null;
    this._lastName = null;
    this._email0 = null;
    this._email1 = null;
    this._firstNameKana = null;
    this._lastNameKana = null;
    this._extraItems = null;

    this._submitBtn = null;
    this._famiyContents = null;

    this._validate = this._validate.bind(this);
    this._validateEmail = this._validateEmail.bind(this);
    this._validateKatakana = this._validateKatakana.bind(this);
    this._validateNumber = this._validateNumber.bind(this);
    this._validateRequired = this._validateRequired.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onSelectChange = this._onSelectChange.bind(this);

    this._classStates = {
      danger: 'is-danger',
      success: 'is-success',
      btnEnable: 'is-btn-enable'
    };
  }

  /**
   * 初期化
   * エラーステートを管理するオブジェクトの初期値を指定
   * @private
   */
  init() {
    this._addresField = document.querySelector('.js-postcode-target');
    this._submitBtn = document.getElementById('js-submit');
    this._selectbox = document.getElementById('m_tomo_type_id');
    this._famiyContents = document.getElementById('js-family-wrap');
    this._extraItems = document.querySelectorAll('.family-member');
    this._selectbox.addEventListener('change', this._onSelectChange);
    this._setItems();
  }

  /**
   * バリデーションする要素を取得
   * @private
   */
  async _setItems() {
    console.log('_setItems');
    this._items = this._container.querySelectorAll('.form-item:not(.is-hide)');
    this._maxStatus = this._items.length;
    this._items.forEach(item => {
      let obj = {};
      // もし'data-json'というデータ属性があれば
      if (item.hasAttribute('data-json')) {
        obj = JSON.parse(item.dataset.json);
      }

      item.myValidateData = obj;

      // 項目の識別値
      const key = obj['data-name'];
      const tagName = item.tagName.toLowerCase();

      let isRequired = false;

      // もしvalidate-required属性があり、かつその値がtrueなら
      // つまり必須項目なら
      if (!isNull(obj['validate-required']) && obj['validate-required'] === 'true') {
        isRequired = true;
      }
      // ステートに状態をいれる
      // 必須項目でないものはtrueをいれる。（必須項目でないものはもう入力済み状態にする）
      this._state[key] = !isRequired;

      // イベント登録
      if (tagName === 'input' || tagName === 'textarea') {
        item.addEventListener('blur', this._onBlur);
        item.addEventListener('keydown', this._onKeydown);
        item.addEventListener('keypress', this._onKeypress);
      }

      switch (key) {
        case 'name_sei':
          this._lastName = item;
          break;
        case 'name_mei':
          this._firstName = item;
          break;
        case 'kana_sei':
          this._lastNameKana = item;
          break;
        case 'kana_mei':
          this._firstNameKana = item;
          break;
      }
    });
  }

  /**
   * blur時の処理
   * イベント発火でバリデーション開始
   * @param event
   * @private
   */
  _onBlur(event) {
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

  /**
   * keydown時の処理
   * イベント発火時に処理を停止し、再度タイマーを設定。
   * @param event
   * @private
   */
  _onKeydown(event) {
    const target = event.target;

    if (this._timer !== -1) {
      window.clearTimeout(this._timer);
    }

    this._timer = setTimeout(() => {
      this._validate(target);
    }, 300);
  }

  /**
   * エンターキーでのご送信を防止
   * @param event
   * @return {boolean}
   * @private
   */
  _onKeypress(event) {
    if ((event.which && event.which === 13) || (event.keyCode && event.keyCode === 13)) {
      event.preventDefault();
      return false;
    }
  }

  /**
   * セレクトボックスが変更されたときに走る処理
   * @param e
   * @private
   */
  async _onSelectChange(e) {
    console.log('_onSelectChange');
    const value = e.target.value;
    const num = value.slice(-1);

    await this._resetState();
    await this._hideExtraElem();
    await this._deleteExtraElemValues();
    await this._removeClasses(this._extraItems);
    await this._openExtraElem(num);
    await this._setItems();
    await this._validateAll();
    await this._checkAll();
  }

  /**
   * stateを一旦削除する
   * @return {Promise<void>}
   * @private
   */
  async _resetState() {
    console.log('_resetState');
    for (const key in this._state) {
      delete this._state[key];
    }
  }

  /**
   * セレクトボックスの値に応じて表示した要素を非表示にする
   * 非表示にする要素のフォーム要素に付属したquerySelectorAllの識別クラスを付与
   * して、バリデーションの対象から外す
   * @return {Promise<void>}
   * @private
   */
  async _hideExtraElem() {
    console.log('_hideExtraElem');
    this._extraItems.forEach(i => {
      const item = i;
      i.style.display = 'none';
      const formItems = item.querySelectorAll('.form-item');
      formItems.forEach(f => {
        f.classList.add('is-hide');
      });
    });
    console.log('_hideExtraElem done');
  }

  /**
   * セレクトボックスで選択された要素分展開させる
   * 表示にする要素のフォーム要素に付属したquerySelectorAllの識別クラスを削除
   * してバリデーションの対象として取得させる
   * @param index
   * @return {Promise<void>}
   * @private
   */
  async _openExtraElem(index) {
    console.log('_openExtraElem');
    // ラッパーの開閉
    this._famiyContents.style.display = index >= 2 ? 'block' : 'none';

    // 引数に応じて要素を出す。
    for (let i = 0, length = index - 1; i < length; i++) {
      this._extraItems[i].style.display = 'block';
      const classes = this._extraItems[i].querySelectorAll('.form-item');
      for (let i = 0; i < classes.length; i++) {
        classes[i].classList.remove('is-hide');
      }
    }
  }

  /**
   * 入力された要素の値を削除する
   * @return {Promise<void>}
   * @private
   */
  async _deleteExtraElemValues() {
    console.log('_deleteExtraElemValues');
    this._extraItems.forEach(e => {
      const wrap = e.querySelectorAll('.form-item.is-text');
      wrap.forEach(w => {
        w.value = '';
      });
    });
  }

  async _removeClasses(elems) {
    console.log('_removeClasses');
    elems.forEach(e => {
      const wrap = e.querySelectorAll('.form-module');
      wrap.forEach(w => {
        removeClasses(w, [TYPE_ERROR, REQUIRED_ERROR]);
      });
    });
  }

  /**
   * 対象の要素のvalueが入力されていればバリデーションを走らせる
   * @return {Promise<void>}
   * @private
   */
  async _validateAll() {
    console.log('_validateAll');
    const targets = document.querySelectorAll('.form-item:not(.is-extra)');
    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      const itemValue = item.value;
      if (itemValue <= 0) {
        return;
      }
      this._validate(item);
    }
  }

  /**
   * バリデーションのタイプに応じて振り分け
   * @param target
   * @private
   */
  _validate(target) {
    const data = target.myValidateData;
    const type = data['validate-type'];
    const isRequired = JSON.parse(data['validate-required']);
    const key = data['data-name'];

    if (type) {
      switch (type) {
        case 'katakana':
          this._validateKatakana(target, key, isRequired);
          break;

        case 'email':
          this._validateEmail(target, key, isRequired);
          break;

        case 'email-confirm':
          this._validateEmailConfirm(target, key, isRequired);
          break;

        case 'email-extra':
          this._validateExtraEmail(target, key, isRequired);
          break;

        case 'num':
          this._validateNumber(target, key, isRequired);
          break;

        case 'tel':
          this._validateTel(target, key, isRequired);
          break;

        default:
          console.log('in default');
      }
    } else {
      this._validateRequired(target, key, isRequired);
    }
  }

  /**
   * Eメールバリデーション
   * Eメール形式かつ、必須項目のエラーがなければthis._errorStateをtrueに
   * @param event
   * @private
   */
  _validateEmail(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;
    this._email0 = value;

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

    this._checkEqualEmail(target);

    this._checkAll();
  }

  /**
   * メールアドレス確認
   * @param target
   * @param key
   * @param isRequired
   * @private
   */
  _validateEmailConfirm(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;
    this._email1 = value;

    if (isRequired) {
      if (value.length <= 0) {
        this._showError(parent, REQUIRED_ERROR);
        this._hideError(parent, TYPE_ERROR);
        this._hideError(parent, DIFFERENT_ERROR);
        this._state[key] = false;
      } else if (value.length <= 0 || !isEmail(value)) {
        this._showError(parent, TYPE_ERROR);
        this._hideError(parent, REQUIRED_ERROR);
        this._hideError(parent, DIFFERENT_ERROR);
        this._state[key] = false;
      } else {
        // OK
        removeClasses(parent, [TYPE_ERROR, REQUIRED_ERROR, DIFFERENT_ERROR]);
        this._state[key] = true;
      }
    } else {
      // メール形式に沿っている、もしくは何も入力されていない。
      this._state[key] = !!(value.length === 0 || isEmail(value));
    }

    this._checkEqualEmail(target);

    this._checkAll();
  }

  /**
   * ファミリーメンバー用のメールバリデーション
   * @param target
   * @param key
   * @param isRequired
   * @private
   */
  _validateExtraEmail(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;

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

  /**
   * 数字かどうか判定
   * @param target
   * @param key
   * @param isRequired
   * @private
   */
  _validateNumber(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;

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

  /**
   * カタカナかどうかチェック
   * @param target
   * @param key
   * @param isRequired
   * @private
   */
  _validateKatakana(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;

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

  _validateTel(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;

    if (isRequired) {
      if (value.length <= 0) {
        this._showError(parent, REQUIRED_ERROR);
        this._hideError(parent, TYPE_ERROR);
        this._state[key] = false;
      } else if (value.length <= 0 || !isTelephoneNumber(value)) {
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

  /**
   * タイプチェックなしかつ、入力必須項目のバリデーション
   * @param target
   * @param key
   * @param isRequired
   * @private
   */
  _validateRequired(target, key, isRequired) {
    const value = target.value;
    const parent = target.parentNode.parentNode;
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
   * すべての入力項目が記入されたかチェック
   * @return {Promise<void>}
   * @private
   */
  async _checkAll() {
    this._maxStatus = Object.keys(this._state).length;
    let counter = 0;

    Object.values(this._state).forEach(state => {
      if (state) {
        counter++;
      }
    });

    this._changeSubmitState(!!(counter === this._maxStatus));
  }

  /**
   * メールアドレスが同じかどうかチェックする
   * @param target
   * @private
   */
  _checkEqualEmail(target) {
    const parent = target.parentNode.parentNode;
    if (!this._email1 || !isEmail(this._email1)) {
      return;
    }
    if (this._email0 !== this._email1) {
      this._state.email = false;
      this._state.email2 = false;
      this._showError(parent, DIFFERENT_ERROR);
      this._hideError(parent, TYPE_ERROR);
      this._hideError(parent, REQUIRED_ERROR);
    } else {
      this._state.email = true;
      this._state.email2 = true;
      removeClasses(parent, [TYPE_ERROR, REQUIRED_ERROR, DIFFERENT_ERROR]);
    }
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
   * 各アイテムが正常に記入されていれば送信ボタンをクリッカブルに
   * @param enabled
   * @private
   */
  _changeSubmitState(enabled) {
    console.table(this._state);
    if (enabled) {
      addClass(this._submitBtn, this._classStates.btnEnable);
    } else {
      removeClass(this._submitBtn, this._classStates.btnEnable);
    }
  }

  /**
   * 郵便番号を結合して郵便番号の形式にあっているか確認
   * 問題なければ郵便番号を元に住所を取得
   * @private
   */
  _checkZipCode() {
    const zipcode = `${this._postcode0}${this._postcode1}`;

    if (isJPZipCode(zipcode)) {
      this._fetchAddress(zipcode);
    }
  }

  /**
   * 入力された郵便番号を元に外部API叩く
   * @param zipcode
   * @private
   */
  _fetchAddress(zipcode) {
    const action = APIAction.loadAddressByZip({
      zipcode: zipcode
    }).action;
    apiRequest(action, payload => {
      const { data } = payload;
      const { response } = data;
      const { status } = response;
      const { results } = response;
      if (status === 200 && !isNull(results)) {
        this._updateAddressByZipCode(results[0]);
      } else {
        console.log('log');
      }
    });
  }

  /**
   * 住所のエリアに郵便番号から調べた住所を入れる。
   * @param result
   * @private
   */
  _updateAddressByZipCode(result) {
    const value = `${result.address1}${result.address2}${result.address3}`;
    this._addresField.value = value;
    this._validateRequired(document.getElementById('address1'), 'address1', true);
  }
}

export default FormValidator;

/**
 * TODO
 * ・入力された内容がタイプに沿っていない場合はエラー
 *    ・複数項目がある際にエラーメッセージが消えてしまう（まだエラー残っているのに）
 * ・CORS これでないのおかしい
 * ・ボタン押下ではなく、ブラーのタイミングで自動発火
 * ・max-length必要なものは入れる
 * ・オートかなライブラリ
 * ・プレースホルダー
 * ・メールあドレス比較　→　グローバルで持たせる？
 * ・生年月日の入力値のレンジ
 * ・// data属性をjson的に書き直す
 * ・// pug的に分けて書く
 * ・// FormValidator1とかダサいからリネーム
 * ・// inputをkeydown, keyupに変える
 * ・// nameでkeyにしているけどdata属性にする
 * ・// setTimeoutの処理を足す



 * ・errorsクラスの名前変更
 *
 * ■質問
 * ・インスタンスメンバとconstの使い分け　→　errorクラスの管理
 * ・電話番号どこまで　hasNumberChar, isNumber, ハイフンあり？
 * ・生年月日どこまで　うるう年、30日31日
 *
 * ■確認事項
 *・会員区分、必須項目にするか
 */
