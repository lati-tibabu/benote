const path = require("path");
const fs = require("fs");
const { resource } = require("../models");
const multer = require("multer");

// Static uploads directory (e.g., /public/uploads)
const uploadDir = path.join(__dirname, "../public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });
const uploadFile = upload.single("file");

// Create resource
const createResource = async (req, res) => {
  try {
    const { description, team_id } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const uploader_id = req.user.id;

    const publicFilePath = `uploads/${req.file.filename}`; // this is the static URL path

    const _resource = await resource.create({
      name: req.file.originalname,
      size: req.file.size,
      path: publicFilePath,
      description,
      team_id,
      uploader_id,
    });

    res.status(201).json(_resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all resources
const getAllResources = async (req, res) => {
  try {
    const { teamId } = req.query;
    const _resources = await resource.findAll({
      where: {
        team_id: teamId,
      },
    });
    res.json(_resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one resource
const getResource = async (req, res) => {
  try {
    const _resource = await resource.findByPk(req.params.id);
    if (!_resourceresource)
      return res.status(404).json({ message: "Not found" });
    res.json(_resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update metadata
const updateResource = async (req, res) => {
  try {
    const { description, team_id } = req.body;
    const _resource = await resource.findByPk(req.params.id);
    if (!_resource) return res.status(404).json({ message: "Not found" });

    await resource.update({ description, team_id });
    res.json(_resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete file and metadata
const deleteResource = async (req, res) => {
  try {
    const _resource = await resource.findByPk(req.params.id);
    if (!_resource) return res.status(404).json({ message: "Not found" });

    const filePath = path.join(__dirname, "../public/", resource.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await resource.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadFile,
  createResource,
  getAllResources,
  getResource,
  updateResource,
  deleteResource,
};
