// TODO: This entire thing might be able to be replaced with Repository.ts
import Result, { ok, err } from 'true-myth/result';
import { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';

export type ProjectUpdate = {
  id: UUID;
  title?: string;
  rate?: number;
};
export type NewProject = Omit<ProjectUpdate, 'id'>;

type AddProjectOutput = { projects: Project[]; project: Project };
type UpdateProjectOutput = { projects: Project[]; project: Project };

export const isUpdate = (newproject?: NewProject | ProjectUpdate): newproject is ProjectUpdate => {
  return newproject !== undefined && 'id' in newproject;
};

const hasId = (projectId: string) => (project: Project) => project.id === projectId;

export function init(_crypto: ICrypto) {
  const hasProject = (projects: Project[], projectId: string) => projects.some(hasId(projectId));

  const getProject = (projects: Project[], projectId: string) => {
    const project = projects.find(hasId(projectId));
    if (project) {
      return just(project);
    }

    return nothing();
  };

  const addProject = (projects: Project[], project?: NewProject): Result<AddProjectOutput, string> => {
    const newId = _crypto.randomUUID();
    // Ensure a new id
    const _project: Project = project
      ? ({ ...project, createdAt: new Date(), id: newId } as Project)
      : {
          id: newId,
          title: '',
          createdAt: new Date(),
        };

    const _projects = [...projects, _project];

    return ok({
      projects: _projects,
      project: _project,
    });
  };

  const updateProject = (projects: Project[], projectUpdate: ProjectUpdate): Result<UpdateProjectOutput, string> => {
    const project = getProject(projects, projectUpdate.id);
    if (project.isNothing) {
      return err(`project with id ${projectUpdate.id} does not exist`);
    }

    const newproject = { ...replaceProps(project.value, projectUpdate), updatedAt: new Date() };
    const index = projects.findIndex((e) => e.id === project.value.id);

    projects[index] = newproject;

    return ok({ projects, project: newproject } as UpdateProjectOutput);
  };

  const deleteProject = (projects: Project[], id: UUID) => {
    const project = getProject(projects, id);
    if (project.isNothing) {
      return projects;
    }

    return projects.filter((e) => e.id !== id);
  };

  const addOrUpdate = (projects: Project[], newProject: NewProject | ProjectUpdate) => {
    const id = isUpdate(newProject) ? newProject.id : undefined;

    return id ? updateProject(projects, { id, ...newProject }) : addProject(projects, newProject ?? undefined);
  };

  return {
    getProject,
    hasProject,
    addProject,
    updateProject,
    addOrUpdate,
    deleteProject,
  };
}

export default init(crypto);
