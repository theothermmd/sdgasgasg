// src/utils/uploadManager.js
import { toast } from 'react-hot-toast';

class UploadManager {
  uploads = new Map();

  uploadFile({ file, apiURL, onProgress }) {
    const id = file.uid || file.name + Date.now();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const base64Encoded = e.target.result.split(',')[1];
        const xhr = new XMLHttpRequest();

        xhr.open('POST', apiURL, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

        // نگهداری xhr تا بتوانیم وضعیت‌ها را بررسی کنیم
        this.uploads.set(id, xhr);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          this.uploads.delete(id);
          if (xhr.status === 200) {
            toast.success(`فایل ${file.name} با موفقیت آپلود شد ✅`);
            resolve(xhr.responseText);
          } else {
            toast.error(`آپلود فایل ${file.name} با خطا مواجه شد ❌`);
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => {
          this.uploads.delete(id);
          toast.error(`آپلود فایل ${file.name} با خطا مواجه شد ❌`);
          reject(new Error('Upload failed'));
        };

        xhr.send(JSON.stringify({ fileContent: base64Encoded, fileName: file.name }));
      };

      reader.readAsDataURL(file);
    });
  }

  hasActiveUploads() {
    return this.uploads.size > 0;
  }
}

const uploadManager = new UploadManager();
export default uploadManager;
