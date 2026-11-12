import QRCode from 'qrcode';

export const qrDataUrl = async (text: string, size = 256): Promise<string> => {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'low',
    color: {
      dark: '#000000ff',
      light: '#ffffffff',
    },
  });
};
