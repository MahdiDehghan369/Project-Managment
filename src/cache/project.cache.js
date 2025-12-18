const projectRepo = require("./../modules/project/project.repo");
const { cacheService } = require("./../services/redis");

const getProjectById = async (projectId) => {
  const key = `projets:${projectId}`;
  const projectRedis = await cacheService.get(key);
  if (projectRedis) return projectRedis;
  const project = await projectRepo.getById(projectId);
  if (!project) return null;
  await cacheService.set(key, project, 60 * 60 * 24);
  return project;
};

module.exports = {
  getProjectById,
};
