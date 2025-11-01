const { put, del } = require("@vercel/blob")
const fs = require("fs").promises

/**
 * Upload a file to Vercel Blob storage
 * @param {Object} file - The multer file object (with buffer or path)
 * @param {string} folder - The folder to store the file in (products, categories, ads)
 * @returns {Promise<string>} - The URL of the uploaded file
 */
async function uploadToBlob(file, folder = "products") {
  try {
    console.log("[v0] Uploading to Blob:", {
      filename: file.originalname,
      folder,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path,
    })

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN environment variable is not set. Please add it to your Vercel project settings.",
      )
    }

    let fileBuffer
    if (file.buffer) {
      // Memory storage (Vercel)
      fileBuffer = file.buffer
      console.log("[v0] Using file buffer, size:", fileBuffer.length)
    } else if (file.path) {
      // Disk storage (local development)
      fileBuffer = await fs.readFile(file.path)
      console.log("[v0] Read file from disk, size:", fileBuffer.length)
    } else {
      throw new Error("File has no buffer or path")
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty")
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const randomNum = Math.round(Math.random() * 1e9)
    const ext = file.originalname.split(".").pop()
    const filename = `${folder}-${timestamp}-${randomNum}.${ext}`

    const blob = await put(`${folder}/${filename}`, fileBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("[v0] Successfully uploaded to Blob:", blob.url)

    if (file.path) {
      try {
        await fs.unlink(file.path)
        console.log("[v0] Cleaned up local file:", file.path)
      } catch (err) {
        console.error("[v0] Failed to clean up local file:", err)
      }
    }

    return blob.url
  } catch (error) {
    console.error("[v0] Error uploading to Blob:", error)
    throw new Error(`Failed to upload file to storage: ${error.message}`)
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param {string} url - The URL of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFromBlob(url) {
  if (!url || !url.includes("blob.vercel-storage.com")) {
    console.log("[v0] Skipping deletion - not a blob URL:", url)
    return // Not a blob URL, skip deletion
  }

  try {
    console.log("[v0] Deleting from Blob:", url)

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN not set, cannot delete")
      return
    }

    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("[v0] Successfully deleted from Blob:", url)
  } catch (error) {
    console.error("[v0] Error deleting from Blob:", error)
    // Don't throw error, just log it
  }
}

module.exports = {
  uploadToBlob,
  deleteFromBlob,
}
