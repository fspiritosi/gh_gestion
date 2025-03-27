import { toPng } from 'html-to-image';
import { ChangeEvent, RefObject } from 'react';

export const handleImageChange = (
  event: ChangeEvent<HTMLInputElement>,
  setImageFile: (file: File | null) => void,
  setBase64Image: (image: string) => void
) => {
  const file = event.target.files?.[0];

  if (file) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setBase64Image(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }
};

export const downloadQR = async (qrCodeRef: RefObject<HTMLDivElement>, fileName: string) => {
  if (!qrCodeRef.current) return;

  try {
    const dataUrl = await toPng(qrCodeRef.current);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-code${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al generar la imagen:', error);
  }
};

export const printQR = (qrCodeRef: RefObject<HTMLDivElement>) => {
  if (!qrCodeRef.current) return;

  const qrCodeElement = qrCodeRef.current;
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.write('<html><head><title>Imprimir QR</title></head><body>');
    iframeDoc.write(qrCodeElement.innerHTML);
    iframeDoc.write('</body></html>');
    iframeDoc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }

  document.body.removeChild(iframe);
};
