const { put, del } = require("@vercel/blob")

/**
 * Upload a file to Vercel Blob storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} filename - The original filename
 * @param {string} folder - The folder to store the file in (products, categories, ads)
 * @returns {Promise<string>} - The URL of the uploaded file
 */
async function uploadToBlob(fileBuffer, filename, folder = "products") {
  try {
    const blob = await put(`${folder}/${filename}`, fileBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading to Blob:", error)
    throw new Error("Failed to upload file to storage")
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param {string} url - The URL of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFromBlob(url) {
  if (!url || !url.includes("blob.vercel-storage.com")) {
    return // Not a blob URL, skip deletion
  }

  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    console.error("Error deleting from Blob:", error)
    // Don't throw error, just log it
  }
}

module.exports = {
  uploadToBlob,
  deleteFromBlob,
}
