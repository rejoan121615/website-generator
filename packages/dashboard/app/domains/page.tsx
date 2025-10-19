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

function DomainsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [websites, setWebsites] = useState<WebsiteRowTYPE[]>([]);
  const [search, setSearch] = useState("");
  const [projectList, setProjectList] = useState<ProjectDataTYPE[]>([]);
  const [domains, setDomains] = useState<DomainDataTYPE[]>([]);
  const [domainTableData, setDomainTableData] = useState<DomainTableDataTYPE[]>(
    []
  );

  const snackbarClickVariant =
    (message: string, variant: VariantType) => () => {
      enqueueSnackbar(message, { variant });
    };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
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
          // process table data
          setDomainTableData(() => {
            // cast DATA to the expected WebsiteRowTYPE[] so .map is safe
            const websitesData = websitesResponse.data.DATA as WebsiteRowTYPE[] | undefined;
            const newDomainTableData: DomainTableDataTYPE[] = (websitesData ?? []).map((website) => {
              return {
                domain: website.domain,
                domainStatus: 'active',
                readyToConnect: 'Unavailable'
              };
            });

            console.log('new domain table data ', newDomainTableData);

            return newDomainTableData;
            // const updatedDomainData: DomainTableDataTYPE[] = (
            //   domainsResponse.data.DATA ?? []
            // ).map((domain) => {
            //   const status = generateStatus(domain.name);

            //   return { ...domain, readyToConnect: status };
            // });

            // return updatedDomainData;
          });

          function generateStatus(
            domainName: string
          ): DomainTableDataTYPE["readyToConnect"] {
            const convertedDomainName = domainName.replace(/\./g, "-");

            const selectedProject = (projectsResponse.data.DATA ?? []).find(
              (proItem) => {
                return proItem.name === convertedDomainName;
              }
            );

            if (!selectedProject) {
              return "Unavailable";
            } else if (
              selectedProject.domains?.find((item) => item === domainName)
            ) {
              return "Connected";
            } else {
              return "Available";
            }
          }
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
      }
    };

    fetchAllData();
  }, []);

  const columns: GridColDef<DomainTableDataTYPE>[] = [
    {
      field: "domain",
      headerName: "Domain Name",
      width: 275,
    },
    {
      field: "status",
      headerName: "Domain Status",
      width: 120,
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
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Connected"
              ? "success"
              : params.value === "Unavailable"
                ? "warning"
                : params.value === "Available"
                  ? "primary"
                : "default"
          }
          size="small"
        />
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 250,
      renderCell: (params) => {
        return (
          <ButtonGroup variant="text" aria-label="text button group">
            <Button
              onClick={() => DeployDomainHandler(params.row.domain)}
              variant="contained"
              size="small"
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
