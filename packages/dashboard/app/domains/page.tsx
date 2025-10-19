"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionTitle from "@/components/SectionTitle";
import TableControlBar from "@/components/TableControlBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import {
  WebsiteRowTYPE,
  GetApiResTYPE,
  ServerEventResTYPE,
  DomainTableDataTYPE,
} from "@/types/websiteApi.type";
import { ButtonGroup, Chip } from "@mui/material";
import { VariantType, useSnackbar, SnackbarProvider } from "notistack";
import {
  ProjectDataTYPE,
  DomainDataTYPE,
  ProjectsResTYPE,
  DomainResTYPE,
  ConnectDomainResTYPE
} from "@repo/cf";

import { GetProjectName } from '../../utilities/GetProjectName';


function DomainsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [websites, setWebsites] = useState<WebsiteRowTYPE[]>([]);
  const [search, setSearch] = useState("");
  const [projectList, setProjectList] = useState<ProjectDataTYPE[]>([]);
  const [domains, setDomains] = useState<DomainDataTYPE[]>([]);
  const [domainTableData, setDomainTableData] = useState<DomainTableDataTYPE[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const snackbarClickVariant =
    (message: string, variant: VariantType) => () => {
      enqueueSnackbar(message, { variant });
    };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Execute all requests in parallel
        const [websitesResponse, domainsResponse, projectsResponse] =
          await Promise.all([
            axios.get<GetApiResTYPE>("/api/websites"),
            axios.get<DomainResTYPE>("/api/domains"),
            axios.get<ProjectsResTYPE>("/api/projects"),
          ]);

        console.log("All data fetched:", {
          websites: websitesResponse,
          domains: domainsResponse,
          projects: projectsResponse,
        });

        // Process websites data
        if (websitesResponse.data.SUCCESS) {
          setWebsites(websitesResponse.data.DATA as WebsiteRowTYPE[]);
        }

        // Process domains data
        if (domainsResponse.data.SUCCESS && websitesResponse.data.SUCCESS && websitesResponse.data.DATA) {
          setDomains(domainsResponse.data.DATA || []);

          console.log('your website data ', websites);
          // const domainListFromWebsite: string[] = ((websitesResponse.data.DATA as WebsiteRowTYPE[]) || []).map((websiteData: WebsiteRowTYPE) => {
          //   return websiteData.domain;
          // });

          const nameListFromProjects: string[] = ((projectsResponse.data.DATA as ProjectDataTYPE[]) || [])
            .map((projectData: ProjectDataTYPE) => projectData.name)
            .filter((n): n is string => n !== undefined);



            function ReadyToConnectStatus (domain: string) : "Deploy First" | "Ready" | "Processing" | "Connected" {
              const { projectName } = GetProjectName(domain);

              // Find the matching project by name
              const matchingProject = (projectsResponse.data.DATA as ProjectDataTYPE[])?.find(
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


        
          // process table data
          setDomainTableData(() => {
            // cast DATA to the expected WebsiteRowTYPE[] so .map is safe
            const websitesData = websitesResponse.data.DATA as WebsiteRowTYPE[] | undefined;
            const newDomainTableData: DomainTableDataTYPE[] = (websitesData ?? []).map((website) => {

              const { projectName } = GetProjectName(website.domain);

              const isReadyToConnect = nameListFromProjects.includes(projectName);

              return {
                domain: website.domain,
                domainStatus: 'active',
                readyToConnect: ReadyToConnectStatus(website.domain)
              };
            });

            console.log('new domain table data ', newDomainTableData);

            return newDomainTableData;
          });
        }

        // Process projects data
        if (projectsResponse.data.SUCCESS) {
          setProjectList(projectsResponse.data.DATA || []);
        }

        // Show success message after all data is loaded
        snackbarClickVariant("All data fetched successfully", "success")();
      } catch (error) {
        console.error("Error fetching data:", error);
        snackbarClickVariant("Error fetching data", "error")();
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const columns: GridColDef<DomainTableDataTYPE>[] = [
    {
      field: "domain",
      headerName: "Domain Name",
      width: 275,
      flex: 2
    },
    {
      field: "status",
      headerName: "Domain Status",
      width: 120,
      flex: 1,
      renderCell: (params) =>
        params.value === "active" ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip label="Inactive" color="default" size="small" />
        ),
    },
    {
      field: "readyToConnect",
      headerName: "Ready to Connect",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Deploy First"
              ? "warning"
              : params.value === "Ready"
                ? "secondary"
                : params.value === "Processing"
                  ? "warning"
                : params.value === "Connected"
                  ? "success"
                : "error"
          }
          size="small"
        />
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 250,
      flex: 2,
      renderCell: (params) => {
        return (
          <ButtonGroup variant="text" aria-label="text button group">
            <Button
              onClick={() => DeployDomainHandler(params.row.domain)}
              variant="contained"
              size="small"
              disabled={ params.row.readyToConnect !== "Ready" ? true : false }
            >
              Connect
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  const DeployDomainHandler = async (domain: string) => {
    try {
      const response = await axios.post<ConnectDomainResTYPE>(
        "/api/domains/deploy",
        {
          domain,
        }
      );

      const { SUCCESS, MESSAGE, ERROR } = response.data;

      // domains deploy response 
      console.log('domain deploy response ', response.data);

      if (SUCCESS) {
        snackbarClickVariant(MESSAGE || "Domain deployment started", "success")();
      } else if (ERROR?.errors.length) {
        const isNotFound = ERROR.errors[0]?.code === 8000007;
        snackbarClickVariant(isNotFound ? "Please deploy your project first" : "Domain deployment failed", "error")();
      }
    } catch (error) {
      console.error("Error deploying domain:", error);
      snackbarClickVariant("Error deploying domain", "error")();
    }
  };

  // Filter websites by search
  const filteredWebsites = search.trim()
    ? domainTableData.filter((row) => {
        const q = search.toLowerCase();
        return (
          row.domain.toLowerCase().includes(q) ||
          row.domain.toLowerCase().includes(q)
        );
      })
    : domainTableData;

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle
        title="Domains"
        description="Project list ready to connect to a domain"
      />
      <TableControlBar search={search} onSearchChange={setSearch} />
      <DataGrid
        rows={filteredWebsites}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.domain}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnMenu
      />
    </Box>
  );
}

export default function BasicTable() {
  return (
    <SnackbarProvider>
      <DomainsPage />
    </SnackbarProvider>
  );
}
