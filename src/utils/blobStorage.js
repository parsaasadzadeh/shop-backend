// utils/blobStorage.js
const { put, del } = require("@vercel/blob");

const uploadFileToBlob = async (file) => {
  const blob = await put(`products/${Date.now()}-${file.originalname}`, file.buffer, {
    access: "public",
    contentType: file.mimetype,
  });
  return blob.url; // یک URL کامل و دائمی از Vercel Blob
};

const uploadFilesToBlob = async (files = []) => {
  return Promise.all(files.map((file) => uploadFileToBlob(file)));
};

const deleteFileFromBlob = async (url) => {
  if (!url) return;
  try {
    await del(url);
  } catch (err) {
    console.error("Blob delete error:", err.message);
  }
};

module.exports = { uploadFileToBlob, uploadFilesToBlob, deleteFileFromBlob };