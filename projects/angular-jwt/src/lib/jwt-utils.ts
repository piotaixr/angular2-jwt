export function getTokenExpirationDate(decoded: any): Date | null {
  if (!decoded || !decoded.hasOwnProperty('exp')) {
    return null;
  }

  const date = new Date(0);
  date.setUTCSeconds(decoded.exp);

  return date;
}

export function decodeToken(tokenValue: string) {
  const parts = tokenValue.split('.');

  if (parts.length !== 3) {
    throw new Error(
      'The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.'
    );
  }

  const decoded = urlBase64Decode(parts[1]);
  if (!decoded) {
    throw new Error('Cannot decode the token.');
  }

  return JSON.parse(decoded);
}

export function isTokenExpired(token: string, offsetSeconds: number = 0): boolean {
  const date = getTokenExpirationDate(token);

  if (date === null) {
    return false;
  }

  return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
}


// tslint:disable:no-bitwise

// credits for decoder goes to https://github.com/atk
function b64decode(str: string): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  str = String(str).replace(/=+$/, '');

  if (str.length % 4 === 1) {
    throw new Error(
      '\'atob\' failed: The string to be decoded is not correctly encoded.'
    );
  }

  for (
    // initialize result and counters
    let bc = 0, bs: any, buffer: any, idx = 0;
    // get next character
    (buffer = str.charAt(idx++));
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer &&
    ((bs = bc % 4 ? bs * 64 + buffer : buffer),
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
    bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}

function b64DecodeUnicode(str: any) {
  return decodeURIComponent(
    Array.prototype.map
         .call(b64decode(str), (c: any) => {
           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
         })
         .join('')
  );
}

function urlBase64Decode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0: {
      break;
    }
    case 2: {
      output += '==';
      break;
    }
    case 3: {
      output += '=';
      break;
    }
    default: {
      throw new Error('Illegal base64url string!');
    }
  }
  return b64DecodeUnicode(output);
}
