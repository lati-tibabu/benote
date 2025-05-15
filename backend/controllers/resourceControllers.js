const path = require("path");
const fs = require("fs");
const { resource } = require("../models");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../services/supabaseClient");
const { upload } = require("../middlewares/supabaseUpload");
const multer = require("multer");

// Static uploads directory (e.g., /public/uploads)
const uploadDir = path.join(__dirname, "../public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });
// const uploadFile = upload.single("file");

// Create resource
const createResource = async (req, res) => {
  try {
    const { description, team_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const uploader_id = req.user.id;
    const originalName = req.file.originalname;
    const uniqueFileName = `${Date.now()}-${uuidv4()}-${originalName}`;
    const bucketName = "resources";

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    const publicUrl = publicUrlData.publicUrl;

    // Save file info to DB
    const _resource = await resource.create({
      name: originalName,
      size: req.file.size,
      path: publicUrl,
      description,
      team_id,
      uploader_id,
    });

    res.status(201).json(_resource);
  } catch (err) {
    console.error("Upload error:", err);
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

// generate signed URL
const generateSignedUrl = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { data, error } = await supabase.storage
      .from("sph-team-resource")
      .createSignedUrl(fileName, 60 * 60); // URL valid for 1 hour

    if (error) throw error;

    res.json(data);
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

    // const filePath = path.join(__dirname, "../public/", resource.file_path);
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const publicUrl = _resource.path.split("/").pop();
    const { error: deleteError } = await supabase.storage
      .from("resources")
      .remove([publicUrl]);
    if (deleteError) throw deleteError;

    await resource.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  // uploadFile,
  createResource,
  getAllResources,
  getResource,
  updateResource,
  deleteResource,
  generateSignedUrl,
};
