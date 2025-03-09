const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
};

// Configure Cloudinary storage with dynamic folder selection
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = MIME_TYPE_MAP[file.mimetype];

    // Determine the folder based on request data
    // console.log(req.body, 67);
    // const folderType = req.body.folderType || "others"; // Default folder if not specified
    // const folder =
    //   folderType === "profile"
    //     ? "FoodHub/ProfileImages"
    //     : "FoodHub/ProductImages";

    return {
      folder: "FoodHub",
      allowed_formats: ["jpg", "jpeg", "png", "svg"],
      public_id: `${uuidv4()}-${Date.now()}.${ext}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (MIME_TYPE_MAP[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPG, JPEG, and SVG files are allowed."
      ),
      false
    );
  }
};

// Export the configured multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
