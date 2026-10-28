const prisma = require("../config/database");
const AppError = require("../utils/AppError");

// ===============================
// CREATE PROJECT
// ===============================
module.exports.createProject = async (req, res) => {
  const {
    title,
    description,
    githubUrl,
    image,
    liveUrl,
    techStack,
  } = req.body;

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
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          designation: true,
        },
      },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    project: newProject,
  });
};

// ===============================
// GET MY PROJECTS
// ===============================
module.exports.myProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      ownerId: req.user.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          designation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    projects,
  });
};

// ===============================
// GET ALL / EXPLORE PROJECTS
// ===============================
module.exports.getAllProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          designation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    projects,
  });
};

// ===============================
// GET SINGLE PROJECT
// ===============================
module.exports.getProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          designation: true,
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

// ===============================
// UPDATE PROJECT
// ===============================
module.exports.updateProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.ownerId !== req.user.id) {
    throw new AppError("You are not authorized to update this project", 403);
  }

  const { title, description, image, githubUrl, liveUrl, techStack } = req.body;

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(image !== undefined ? { image: image?.trim() || null } : {}),
      ...(githubUrl !== undefined ? { githubUrl: githubUrl?.trim() || null } : {}),
      ...(liveUrl !== undefined ? { liveUrl: liveUrl?.trim() || null } : {}),
      ...(Array.isArray(techStack) ? { techStack } : {}),
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          designation: true,
        },
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project: updatedProject,
  });
};

// ===============================
// DELETE PROJECT
// ===============================
module.exports.deleteProject = async (req, res) => {
  const projectId = Number(req.params.id);

  if (Number.isNaN(projectId)) {
    throw new AppError("Invalid project ID", 400);
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.ownerId !== req.user.id) {
    throw new AppError("You are not authorized to delete this project", 403);
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
};