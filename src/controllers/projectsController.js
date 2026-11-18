import { db } from '../db/database.js';

export function getAllProjects(req, res) {
  try {
    const { category, search } = req.query;
    const projects = db.projects.getAll({ category, search });
    
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error('[PROJECTS CONTROLLER ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch projects list.'
    });
  }
}

export function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = db.projects.getById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error('[PROJECT BY ID ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch project details.'
    });
  }
}

export function getAllSkills(req, res) {
  try {
    const skills = db.skills.getAll();
    return res.status(200).json({
      success: true,
      data: skills
    });
  } catch (err) {
    console.error('[SKILLS ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve skills taxonomy.'
    });
  }
}

