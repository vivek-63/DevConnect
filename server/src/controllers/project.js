const prisma = require("../config/database");
const AppError = require("../utils/AppError");

// Owner fields we send with every project
const ownerFields = {
  id: true,
  username: true,
  avatar: true,
  designation: true,
};

// Create a new project
module.exports.createProject = async (req, res) => {
  const { title, description, githubUrl, image, liveUrl, techStack } = req.body;

  if (!title || !title.trim()) {
    throw new AppError("Project title is required", 400);
  }

  if (!description || !description.trim()) {
    throw new AppError("Project description is required", 400);
  }

  const newProject = await prisma.project.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      image: image?.trim() || null,
      githubUrl: githubUrl?.trim() || null,
      liveUrl: liveUrl?.trim() || null,
      techStack: Array.isArray(techStack) ? techStack : [],
      ownerId: req.user.id,
    },
    include: {
      owner: { select: ownerFields },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    project: newProject,
  });
};

// Get the logged in user's projects
module.exports.myProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { ownerId: req.user.id },
    include: {
      owner: { select: ownerFields },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    projects,
  });
};

// Get all projects (explore page)
module.exports.getAllProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      owner: { select: ownerFields },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    projects,
  });
};

// Get a single project (with a few extra owner details)
module.exports.getProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          ...ownerFields,
          bio: true,
          github: true,
          linkedin: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return res.status(200).json({
    success: true,
    project,
  });
};

// Update a project (only the owner can do this)
module.exports.updateProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.ownerId !== req.user.id) {
    throw new AppError("You are not authorized to update this project", 403);
  }

  const { title, description, image, githubUrl, liveUrl, techStack } = req.body;

  // Only update the fields that were sent
  const dataToUpdate = {};

  if (title !== undefined) {
    dataToUpdate.title = title.trim();
  }

  if (description !== undefined) {
    dataToUpdate.description = description.trim();
  }

  if (image !== undefined) {
    dataToUpdate.image = image?.trim() || null;
  }

  if (githubUrl !== undefined) {
    dataToUpdate.githubUrl = githubUrl?.trim() || null;
  }

  if (liveUrl !== undefined) {
    dataToUpdate.liveUrl = liveUrl?.trim() || null;
  }

  if (Array.isArray(techStack)) {
    dataToUpdate.techStack = techStack;
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: dataToUpdate,
    include: {
      owner: { select: ownerFields },
    },
  });

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project: updatedProject,
  });
};

// Delete a project (only the owner can do this)
module.exports.deleteProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.ownerId !== req.user.id) {
    throw new AppError("You are not authorized to delete this project", 403);
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
};
