// const sharp = require("sharp")
// const path = require("path")
// const fs = require("fs").promises

// /**
//  * Middleware to compress uploaded images
//  * Reduces file size while maintaining good quality
//  */
// const compressImage = async (req, res, next) => {
//   // Skip if no file was uploaded
//   if (!req.file) {
//     return next()
//   }

//   try {
//     console.log("[v0] Starting image compression for:", req.file.filename)

//     const originalPath = req.file.path
//     const ext = path.extname(req.file.filename).toLowerCase()

//     // Only compress image files
//     const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"]
//     if (!imageExtensions.includes(ext)) {
//       console.log("[v0] Skipping compression for non-image file")
//       return next()
//     }

//     // Create compressed filename
//     const compressedFilename = req.file.filename.replace(ext, "-compressed" + ext)
//     const compressedPath = path.join(path.dirname(originalPath), compressedFilename)

//     // Compress image based on format
//     let sharpInstance = sharp(originalPath)

//     // Get image metadata
//     const metadata = await sharpInstance.metadata()
//     console.log("[v0] Original image size:", metadata.width, "x", metadata.height)

//     // Resize if image is too large (max 1920px width)
//     if (metadata.width > 1920) {
//       sharpInstance = sharpInstance.resize(1920, null, {
//         fit: "inside",
//         withoutEnlargement: true,
//       })
//     }

//     // Compress based on format
//     if (ext === ".png") {
//       await sharpInstance.png({ quality: 80, compressionLevel: 9 }).toFile(compressedPath)
//     } else if (ext === ".webp") {
//       await sharpInstance.webp({ quality: 80 }).toFile(compressedPath)
//     } else {
//       // JPEG/JPG
//       await sharpInstance.jpeg({ quality: 80, progressive: true }).toFile(compressedPath)
//     }

//     // Get file sizes for comparison
//     const originalStats = await fs.stat(originalPath)
//     const compressedStats = await fs.stat(compressedPath)
//     const savedPercentage = (((originalStats.size - compressedStats.size) / originalStats.size) * 100).toFixed(2)

//     console.log("[v0] Compression complete:")
//     console.log("[v0] Original size:", (originalStats.size / 1024).toFixed(2), "KB")
//     console.log("[v0] Compressed size:", (compressedStats.size / 1024).toFixed(2), "KB")
//     console.log("[v0] Saved:", savedPercentage, "%")

//     // Delete original file
//     await fs.unlink(originalPath)

//     // Update req.file with compressed file info
//     req.file.filename = compressedFilename
//     req.file.path = compressedPath
//     req.file.size = compressedStats.size

//     next()
//   } catch (error) {
//     console.error("[v0] Image compression error:", error)
//     // Continue without compression if error occurs
//     next()
//   }
// }

// module.exports = { compressImage }




const sharp = require("sharp")
const path = require("path")
const fs = require("fs").promises

/**
 * Middleware to compress uploaded images
 * Handles both disk storage (local) and memory storage (Vercel)
 */
const compressImage = async (req, res, next) => {
  // Skip if no file was uploaded
  if (!req.file) {
    return next()
  }

  try {
    console.log("[v0] Starting image compression for:", req.file.originalname)

    const ext = path.extname(req.file.originalname).toLowerCase()

    // Only compress image files
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"]
    if (!imageExtensions.includes(ext)) {
      console.log("[v0] Skipping compression for non-image file")
      return next()
    }

    const isMemoryStorage = !!req.file.buffer
    let sharpInstance

    if (isMemoryStorage) {
      // Memory storage - work with buffer
      console.log("[v0] Using memory storage (buffer)")
      sharpInstance = sharp(req.file.buffer)
    } else {
      // Disk storage - work with file path
      console.log("[v0] Using disk storage (file path)")
      sharpInstance = sharp(req.file.path)
    }

    // Get image metadata
    const metadata = await sharpInstance.metadata()
    console.log("[v0] Original image size:", metadata.width, "x", metadata.height)

    // Resize if image is too large (max 1920px width)
    if (metadata.width > 1920) {
      sharpInstance = sharpInstance.resize(1920, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
    }

    // Compress based on format
    let compressedBuffer
    if (ext === ".png") {
      compressedBuffer = await sharpInstance.png({ quality: 80, compressionLevel: 9 }).toBuffer()
    } else if (ext === ".webp") {
      compressedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer()
    } else {
      // JPEG/JPG
      compressedBuffer = await sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer()
    }

    // Calculate compression stats
    const originalSize = isMemoryStorage ? req.file.buffer.length : req.file.size
    const compressedSize = compressedBuffer.length
    const savedPercentage = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)

    console.log("[v0] Compression complete:")
    console.log("[v0] Original size:", (originalSize / 1024).toFixed(2), "KB")
    console.log("[v0] Compressed size:", (compressedSize / 1024).toFixed(2), "KB")
    console.log("[v0] Saved:", savedPercentage, "%")

    if (isMemoryStorage) {
      // For memory storage, replace the buffer
      req.file.buffer = compressedBuffer
      req.file.size = compressedSize
    } else {
      // For disk storage, write compressed file and update path
      const originalPath = req.file.path
      const compressedFilename = req.file.filename.replace(ext, "-compressed" + ext)
      const compressedPath = path.join(path.dirname(originalPath), compressedFilename)

      // Write compressed buffer to disk
      await fs.writeFile(compressedPath, compressedBuffer)

      // Delete original file
      await fs.unlink(originalPath)

      // Update req.file with compressed file info
      req.file.filename = compressedFilename
      req.file.path = compressedPath
      req.file.size = compressedSize
    }

    next()
  } catch (error) {
    console.error("[v0] Image compression error:", error)
    // Continue without compression if error occurs
    next()
  }
}

module.exports = { compressImage }
