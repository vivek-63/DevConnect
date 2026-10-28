const express = require("express");
const { isAuthmiddleware } = require("../middleware/auth");
const router = express.Router();
const projectController = require("../controllers/project");
const wrapAsync = require("../utils/wrapAsync");
const validate = require("../middleware/validate");
const { createProjectSchema, updateProjectSchema } = require("../validators/projectValidator");

router.post("/projects", isAuthmiddleware, validate(createProjectSchema), wrapAsync(projectController.createProject));
router.post("/user/projects", isAuthmiddleware, validate(createProjectSchema), wrapAsync(projectController.createProject));
router.get("/my-projects", isAuthmiddleware, wrapAsync(projectController.myProjects));
router.get("/user/my-projects", isAuthmiddleware, wrapAsync(projectController.myProjects));
router.get("/projects/all", wrapAsync(projectController.getAllProjects));
router.get("/projects/explore", wrapAsync(projectController.getAllProjects));

// Singular and plural paths
router.get("/project/:id", wrapAsync(projectController.getProject));
router.get("/user/project/:id", wrapAsync(projectController.getProject));
router.get("/projects/:id", wrapAsync(projectController.getProject));

router.put("/project/:id", isAuthmiddleware, validate(updateProjectSchema), wrapAsync(projectController.updateProject));
router.put("/user/project/:id", isAuthmiddleware, validate(updateProjectSchema), wrapAsync(projectController.updateProject));
router.put("/projects/:id", isAuthmiddleware, validate(updateProjectSchema), wrapAsync(projectController.updateProject));

router.delete("/project/:id", isAuthmiddleware, wrapAsync(projectController.deleteProject));
router.delete("/user/project/:id", isAuthmiddleware, wrapAsync(projectController.deleteProject));
router.delete("/projects/:id", isAuthmiddleware, wrapAsync(projectController.deleteProject));

module.exports = router;