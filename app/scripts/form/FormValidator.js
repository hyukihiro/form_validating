import axios from 'axios';
import { isJPZipCode, isKatakana, isSingleByteNumber, isEmail } from '../libs/validate';

class FormValidator {
  constructor() {
    this._requires = document.querySelectorAll('[data-validate-required="true"]');
    this._types = document.querySelectorAll('[data-validate-type]');
    this._postcodeTrigger = document.querySelector('.js-postcode-trigger');
    this._postcodeItems = document.querySelectorAll('.js-postcode-item');
    this._postcodeTarget = document.querySelectorAll('.js-postcode-target');
    this._noPastes = document.querySelectorAll('[data-validate-disable-paste]');
    this._submit = document.querySelector('.js-submit');
    this._requiredState = {};

    this._onBlur = this._onBlur.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onCheckPostcode = this._onCheckPostcode.bind(this);
    this._init();
    this.handleEvents();
  }

  /**
   * 初期化関数
   * @private
   */
  _init() {
    // 必須項目が全部入力されているか
    for (let i = 0, num = this._requires.length; i < num; i++) {
      const target = this._requires[i];
      this._requiredState[target.name] = target.getAttribute('data-validate-required') ? false : true;
    }

    // ペースト禁止
    for (let i = 0, length = this._noPastes.length; i < length; i++) {
      this._noPastes[i].onpaste = () => false;
    }
  }

  /**
   * 各インプット要素などのイベントハンドラを指定
   */
  handleEvents() {
    for (const item of this._requires) {
      item.addEventListener('blur', this._onBlur);
    }
    for (const item of this._types) {
      item.addEventListener('input', this._onInput);
    }

    this._postcodeTrigger.addEventListener('click', this._onCheckPostcode);
  }

  /**
   * inputイベント時に入力項目を判定する
   * @param e
   * @private
   */
  _onInput(e) {
    const str = e.target.value;
    const parent = e.target.closest('.form-module');
    const errorMsg = parent.querySelector('.is-error-type');
    const type = e.target.dataset.validateType;

    switch (type) {
      case 'num':
        const boolNum = isSingleByteNumber(str);
        if (!boolNum) {
          errorMsg.classList.add('is-show');
        } else {
          errorMsg.classList.remove('is-show');
        }
        break;
      case 'katakana':
        const boolKana = isKatakana(str);
        if (!boolKana) {
          errorMsg.classList.add('is-show');
        } else {
          errorMsg.classList.remove('is-show');
        }
        break;
      case 'email':
        const boolEmail = isEmail(str);
        if (!boolEmail) {
          errorMsg.classList.add('is-show');
        } else {
          errorMsg.classList.remove('is-show');
        }
        break;
    }
  }

  /**
   * blurイベントのときに文字数を判定してエラーメッセージを出し分け
   * @param e
   * @return {FormValidator}
   * @private
   */
  _onBlur(e) {
    const target = e.target;
    const length = e.target.value.length;
    const parent = e.target.closest('.form-module');
    const errorMsg = parent.querySelector('.is-error-required');
    const name = e.target.name;
    if (length <= 0) {
      target.classList.add('is-danger');
      errorMsg.classList.add('is-show');
      this._requiredState[name] = false;
    } else {
      this._requiredState[name] = true;
      target.classList.remove('is-danger');
      errorMsg.classList.remove('is-show');
      const result = this._checkRequireState(parent);
      if (result) {
        errorMsg.classList.add('is-show');
      }
    }

    this._checkStatus();

    return this;
  }

  /**
   * 郵便番号APIを叩いて当該箇所に吐き出す
   * @return {boolean}
   * @private
   */
  _onCheckPostcode() {
    const items = this._postcodeItems;
    let inputted = '';
    let res = {};
    const base = 'http://zipcloud.ibsnet.co.jp/api/search?zipcode=';

    for (const value of items) {
      inputted += value.value;
    }

    if (!isJPZipCode(inputted, false)) return false;
    const url = `${base}${inputted}`;
    res = axios
      .get(url)
      .then(res => `${res.data.results.address1}${res.data.results.address2}${res.data.results.address3}`);
    this._postcodeTarget.appendChild(res);
  }

  /**
   * 各ブロックごとに必須項目が入力されているか確認して状態を返す
   * @param parent
   * @return {boolean}
   */
  _checkRequireState(parent) {
    const inputs = Array.from(parent.querySelectorAll('[data-validate-required="true"]'));
    let result = false;
    for (const input of inputs) {
      if (input.classList.contains('is-danger')) {
        result = true;
      }
    }

    return result;
  }

  /**
   * 必須項目の入力を判定し、送信ボタンの状態を渡す。
   * @private
   */
  _checkStatus() {
    const length = this._requires.length;
    const states = Object.values(this._requiredState).filter(value => value === true);
    if (length <= states.length) {
      this._submit.classList.add('is-btn-enable');
    } else {
      this._submit.classList.remove('is-btn-enable');
    }
  }

  /**
   * TODO
   * ・入力された内容がタイプに沿っていない場合はエラー
   *    ・複数項目がある際にエラーメッセージが消えてしまう（まだエラー残っているのに）
   * ・CORS これでないのおかしい
   * ・郵便番号空欄の時のエラー
   * ・質問集
   *   　・赤文字のちぇっくを走らせるのこんなんでいいんですか？
   *    ・removeClass、要素があるときだけ走らせたい
   *    ・入力している途中にエラーメッセージが出るのでうざい
   *    ・Uglifyのエラー
   *    ・使いまわすクラス　インスタンスメンバとして管理しますか？
   */
}

export default FormValidator;
