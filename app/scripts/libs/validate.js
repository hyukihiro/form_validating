import { isString } from './get-type-of';

/**
 * ひらがなかどうか
 * @param str     { string }
 * @returns {boolean}
 * @usage
 * import { isHiragana } from '';
 * isHiragana('あいうえお'); // true
 */
export const isHiragana = (str = '') => {
  return isString(str) ? /^[ぁ-ん|ー]+$/.test(str) : false;
};

/**
 * カタカナかどうか
 * @param str       { string }
 * @returns {boolean}
 * @usage
 * import { isKatakana } from '';
 * isKatakana('あいうえお'); // false
 */
export const isKatakana = (str = '') => {
  return isString(str) ? /^[ァ-ロワヲンー ｧ-ﾝﾞﾟ|^　|]*$/.test(str) : false;
};

/**
 * 日本の郵便番号チェック
 * @param str     { string }    郵便番号
 * @param hasHyphen { boolean } ハイフンありなし。true: ハイフン有り & 無し。false：ハイフンなしのみ
 * @returns {boolean}
 * @usage
 * import { isJPZipCode } from '';
 * isJPZipCode('123-4567', false); // false
 */
export const isJPZipCode = (str, _hasHyphen = true) => {
  if (!isString(str)) {
    return false;
  }
  return _hasHyphen ? /^\d{3}-|−?\d{4}$/.test(str) : /^\d{3}\d{4}$/.test(str);
};

/**
 * 日本の携帯番号かどうか
 * ハイフンがあり、なしどちらでも可です。
 * @param str       { string } 携帯番号
 * @param hasHyphen { boolean }
 * @returns {boolean}
 * @usage
 * import { isCellPhoneNumber } from '';
 * isCellPhoneNumber('090-1234-5678'); // true
 */
export const isCellPhoneNumber = (str, _hasHyphen) => {
  if (_hasHyphen) {
    return isString(str) ? /^\d{3}-?\d{4}-?\d{4}$/.test(str) : false;
  } else {
    return isString(str) ? /^\d{3}?\d{4}?\d{4}$/.test(str) : false;
  }
};

export const isTelephoneNumber = str => {
  return isString(str)
    ? /^((0(\d{1}[-(]?\d{4}|\d{2}[-(]?\d{3}|\d{3}[-(]?\d{2}|\d{4}[-(]?\d{1}|[5789]0[-(]?\d{4})[-)]?)|\d{1,4}\-?)\d{4}$/.test(
        str
      )
    : false;
  // return isString(str) ? /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/.test(str) : false;
};

/**
 * 半角数字であるか
 * @param str       { string } 半角数字
 * @param hasHyphen { boolean }
 * @returns {boolean}
 * @usage
 * import { isCellPhoneNumber } from '';
 */
export const isSingleByteNumber = str => {
  return isString(str) ? /^[0-9]*$/.test(str) : false;
};

/**
 * 数字であるか
 * ハイフンがあり、なしどちらでも可です。
 * @param str       { string } 半角数字
 * @param hasHyphen { boolean }
 * @returns {boolean}
 * @usage
 * import { isCellPhoneNumber } from '';
 * isCellPhoneNumber('090-1234-5678'); // true
 */
export const isNumber = str => {
  return isString(str) ? /^[0-9０-９]*$/.test(str) : false;
};

/**
 * e-mailかどうか
 * @param str     { string } メールアドレス
 * @returns {boolean}
 * @usage
 * import { isEmail } from '';
 * isEmail('abc@team-lab.com'); // true;
 */
export const isEmail = str => {
  return isString(str)
    ? /^[a-zA-Z0-9!$&*.=^`|~#%'+\/?_{}-]+@([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,4}$/.test(
        str
      )
    : false;
};

/**
 * 全角かどうか（全一致）
 * @param str     { string }
 * @returns {boolean}
 */
export const isMultiByte = str => {
  // return /^[^\x01-\x7e]+$/.test(str);
  return /[^\x00-\x7E]+/g.test(str);
};

/**
 * 文字列（第一引数）にハイフンが含まれてるか
 * @param str     { string }    何かしらの文字列
 * @returns {boolean}
 * @usage
 * import { hasHyphen } from '';
 * hasHyphen('hoge-hoge'); // true
 *
 */
export const hasHyphen = str => {
  return isString(str) ? /-|−|ー/.test(str) : false;
};

/**
 * 文字列に全角が入ってるかどうか
 * @param str     { string } 何かしらの文字列
 * @returns {boolean}
 * @usage
 * import { hasMultiByteString } from '';
 * hasMultiByteString('aiueお'); // true
 */
export const hasMultiByteString = str => {
  if (!isString(str)) {
    return false;
  }
  let chara = 0;
  let has = false;
  for (let i = 0, num = str.length; i < num; i++) {
    chara = str.charCodeAt(i);
    if (
      (chara >= 0x0 && chara < 0x81) ||
      chara === 0xf8f0 ||
      (chara >= 0xff61 && chara < 0xffa0) ||
      (chara >= 0xf8f1 && chara < 0xf8f4)
    ) {
      has = false;
    } else {
      has = true;
      break;
    }
  }
  return has;
};

/**
 * 文字列に半角 or 全角の数字をふくんでるかどうか
 * @param str   { string } 何かしらの文字列
 * @returns {boolean}
 * @usage
 * import { hasNumberChar } from '';
 * hasNumberChar('あいうえ09e'); // true
 */
export const hasNumberChar = str => {
  return isString(str) ? /[0-9０-９]/.test(str) : false;
};

/**
 * 閏年かどうか
 * @param year  { number }
 * @returns {boolean}
 * @usage
 * import { isLeapYear } from '';
 * isLeapYear(2000); // true
 */
export const isLeapYear = year => {
  return new Date(year, 1, 29).getMonth() === 1;
};

/**
 * 文字が空かどうか
 * @param str     { string }
 */
export const isEmpty = str => {
  return str.length <= 0 ? true : false;
};

/**
 * 全角の英数を半角にする
 * @param str     { string }
 * @returns       { boolean }
 * @usage
 * import { convertToSingleChar } from '';
 * convertToSingleChar('AｂC'); // 'AbC';
 */
export const convertToSingleChar = str => {
  if (!isString(str)) {
    throw new Error('文字列以外が指定されてます。');
  }
  // そもそも全角がふくまれてないのでそのまま返す
  if (!hasMultiByteString(str)) {
    return str;
  }

  const _str = str.replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, s => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });

  return _str;
};

/**
 * 文字列の先頭 or 末尾に空のスペースがある場合はトルツメして返す
 * @param str     { string }
 * @returns { string }
 * @usage
 * import { trimSpaceAtFirstEnd } from '';
 * trimSpaceAtFirstEnd(' hoge '); // 'hoge';
 */
export const trimSpaceAtFirstEnd = str => {
  if (!isString(str)) {
    return str;
  }
  return /^\s+|\s+$/g.test(str);
};

/**
 * スペースが入ってるかどうか
 * @param str { string }
 * @returns {boolean}
 * @usage
 * import { isSpace } from '';
 * isSpace('ho ge'); // true
 */
export const isSpace = str => {
  return str.match(/[\s　]/) !== null;
};

/**
 * 第二引数に指定された数以下ならtrue、以上ならfalse
 * @param str     { string }  何かしらの文字列
 * @param min     { number }  最低文字数
 * @returns {boolean}
 */
export const isMin = (str = '', min = 1) => {
  return str.length > min;
};

const createKanaMap = (props, values) => {
  const map = {};
  // 念のため文字数が同じかどうかをチェックする(ちゃんとマッピングできるか)
  if (props.length === values.length) {
    for (let i = 0, num = props.length; i < num; i++) {
      const prop = props.charCodeAt(i);
      const value = values.charCodeAt(i);
      map[prop] = value;
    }
  }
  return map;
};

export const convertToOneByteKana = str => {
  if (str.length === 0) {
    return str;
  }
  const g = createKanaMap(
    'ガギグゲゴザジズゼゾダヂヅデドバビブベボ',
    'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ'
  );

  const p = createKanaMap('パピプペポ', 'ﾊﾋﾌﾍﾎ');

  const m = createKanaMap(
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ',
    'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ'
  );

  const gMark = 'ﾞ'.charCodeAt(0);
  const pMark = 'ﾟ'.charCodeAt(0);

  for (let i = 0, num = str.length; i < num; i++) {
    const codeAt = str.charCodeAt(i);
    const char = str[i];
    // 濁音もしくは半濁音文字
    if (g.hasOwnProperty(codeAt) || p.hasOwnProperty(codeAt)) {
      if (g[codeAt]) {
        str = str.replace(
          char,
          String.fromCharCode(g[codeAt]) + String.fromCharCode(gMark)
        );
      } else if (p[str.charCodeAt(i)]) {
        str = str.replace(
          char,
          String.fromCharCode(p[codeAt]) + String.fromCharCode(pMark)
        );
      } else {
        break;
      }
      i++;
      num = str.length;
    } else if (m[codeAt]) {
      str = str.replace(char, String.fromCharCode(m[codeAt]));
    }
  }
  return str;
};

/**
 * ひらがなかどうかをCharCodeで判別
 * @param char
 * @returns {boolean}
 */
export const isHiraganaByCode = char => {
  return (char >= 12353 && char <= 12435) || char === 12445 || char === 12446;
};

/**
 * 文字列が半角英数かどうか
 * @param str     { string }
 */
export const hasHalfWidthAlphaNumeric = str => {
  return str.match(/[^A-Za-z0-9]+/) ? false : true;
};
