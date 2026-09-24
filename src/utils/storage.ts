import { Project } from '../types';
import { MARS_ROVER_PROJECT, PRESET_PROJECTS } from '../data/presetProjects';

const STORAGE_KEY_PROJECTS = 'experience_v1_projects';
const STORAGE_KEY_ACTIVE_ID = 'experience_v1_active_id';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      // First time initialization: seed with default Mars Rover project
      saveProjects(PRESET_PROJECTS);
      return PRESET_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
  }
  return PRESET_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function getActiveProjectId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || MARS_ROVER_PROJECT.id;
  } catch {
    return MARS_ROVER_PROJECT.id;
  }
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to save active project id:', err);
  }
}
