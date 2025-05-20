const { resource } = require("../models");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../services/supabaseClient");

const createMaterial = async (req, res) => {
  try {
    const { description, classroom_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const uploader_id = req.user.id;
    const originalName = req.file.originalname;
    const uniqueFileName = `${Date.now()}-${uuidv4()}-${originalName}`;
    const bucketName = "materials";

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
    const _material = await resource.create({
      name: originalName,
      size: req.file.size,
      path: publicUrl,
      description,
      classroom_id,
      uploader_id,
    });

    res.status(201).json(_material);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all resources
const getAllMaterials = async (req, res) => {
  try {
    const { classroomId } = req.query;
    const _materials = await resource.findAll({
      where: {
        classroom_id: classroomId,
      },
    });
    res.json(_materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const _material = await resource.findByPk(req.params.id);
    if (!_material) return res.status(404).json({ message: "Not found" });

    // const filePath = path.join(__dirname, "../public/", resource.file_path);
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const publicUrl = _material.path.split("/").pop();
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
  createMaterial,
  getAllMaterials,
  deleteMaterial,
};
