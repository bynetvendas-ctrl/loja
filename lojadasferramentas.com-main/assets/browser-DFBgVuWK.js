export async function toDataURL(text, options) {
  const size = (options && options.width) || 320;
  return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(text);
}

export default {
  toDataURL,
};
