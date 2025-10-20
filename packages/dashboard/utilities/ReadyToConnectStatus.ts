import { ProjectDataTYPE, ProjectsResTYPE } from "@repo/cf";
import { GetProjectName } from "./GetProjectName";

export function ReadyToConnectStatus({
  projectsList,
  domain,
}: {
  projectsList: ProjectDataTYPE[];
  domain: string;
}): "Deploy First" | "Ready" | "Processing" | "Connected" {
  const { projectName } = GetProjectName(domain);

  // Find the matching project by name
  const matchingProject = projectsList?.find(
    (project) => project.name === projectName
  );

  if (matchingProject) {
    // Check if this domain is already connected to the project
    const isDomainConnected = matchingProject.domains?.some(
      (projectDomain) => projectDomain === domain
    );

    if (isDomainConnected) {
      return "Connected";
    } else {
      return "Ready";
    }
  } else {
    return "Deploy First";
  }
}
