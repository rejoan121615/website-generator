"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionTitle from "@/components/SectionTitle";
import TableControlBar from "@/components/TableControlBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import {
  DomainTableDataTYPE,
  WebsitesResTYPE,
} from "@/types/dashboard.type";
import { ButtonGroup, Chip } from "@mui/material";
import { VariantType, useSnackbar, SnackbarProvider } from "notistack";
import {
  ProjectDataTYPE,
  DomainDataTYPE,
  ProjectsResTYPE,
  DomainResTYPE,
  ConnectDomainResTYPE,
} from "@repo/cf";

import { GetProjectName } from "../../utilities/GetProjectName";
import { ReadyToConnectStatus } from "@/utilities/ReadyToConnectStatus";
import { CheckDomainStatus } from "@/utilities/CheckDomainStatus";
import { WebsiteRowTYPE } from "@repo/shared-types";

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


  function domainTableStateUpdater({ domain, status }: { domain: string, status: "Processing" | "Deploy First" | "Ready" | "Connected" | "Failed" }) {
    setDomainTableData((prevData) =>
      prevData.map((item) =>
        item.domain === domain ? { ...item, readyToConnect: status } : item
      )
    ); 
  }

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
            axios.get<WebsitesResTYPE>("/api/websites"),
            axios.get<DomainResTYPE>("/api/domains"),
            axios.get<ProjectsResTYPE>("/api/projects"),
          ]);

        // Process websites data
        if (websitesResponse.data.SUCCESS) {
          setWebsites(websitesResponse.data.DATA as WebsiteRowTYPE[]);
        }

        // Process domains data
        if (
          domainsResponse.data.SUCCESS &&
          websitesResponse.data.SUCCESS &&
          websitesResponse.data.DATA
        ) {
          setDomains(domainsResponse.data.DATA || []);

          const nameListFromProjects: string[] = (
            (projectsResponse.data.DATA as ProjectDataTYPE[]) || []
          )
            .map((projectData: ProjectDataTYPE) => projectData.name)
            .filter((n): n is string => n !== undefined);

          // process table data
          setDomainTableData(() => {
            // cast DATA to the expected WebsiteRowTYPE[] so .map is safe
            const websitesData = websitesResponse.data.DATA as
              | WebsiteRowTYPE[]
              | undefined;
            const newDomainTableData: DomainTableDataTYPE[] = (
              websitesData ?? []
            ).map((website) => {
              const { projectName, rootDomain } = GetProjectName(
                website.domain
              );
              const isReadyToConnect =
                nameListFromProjects.includes(projectName);

              return {
                domain: website.domain,
                domainStatus: CheckDomainStatus({
                  domainsList: domainsResponse.data.DATA || [],
                  rootDomain,
                }),
                readyToConnect: ReadyToConnectStatus({
                  projectsList: projectsResponse.data.DATA || [],
                  domain: website.domain,
                }),
              };
            });
            return newDomainTableData;
          });
        }

        // Process projects data
        if (projectsResponse.data.SUCCESS) {
          setProjectList(projectsResponse.data.DATA || []);
        }
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
      flex: 2,
    },
    {
      field: "domainStatus",
      headerName: "Domain Status",
      width: 120,
      flex: 1,
      renderCell: (params) => (
        <Chip sx={{ textTransform: 'capitalize' }} label={params.value} color={params.value === "active" ? "success" : "error"} />
      ),
    },
    {
      field: "readyToConnect",
      headerName: "Ready to Connect",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <Chip
          sx={{ textTransform: 'capitalize'}}
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
              onClick={() => ConnectDomainHandler(params.row.domain)}
              variant="contained"
              size="small"
              disabled={(params.row.readyToConnect === "Processing") || (params.row.readyToConnect === "Deploy First")}
            >
              Connect
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  const ConnectDomainHandler = async (domain: string) => {

    domainTableStateUpdater({ domain, status: "Processing" });

    try {
      const response = await axios.post<ConnectDomainResTYPE>(
        "/api/domains/connect",
        {
          domain,
        }
      );

      const { SUCCESS, MESSAGE, ERROR } = response.data;

      if (SUCCESS) {
        snackbarClickVariant(
          MESSAGE || "Domain connection started",
          "success"
        )();
        domainTableStateUpdater({ domain, status: "Connected"  });
      } else if (ERROR?.errors.length) {
        const isNotFound = ERROR.errors[0]?.code === 8000007;
        snackbarClickVariant(
          isNotFound
            ? "Please deploy your project first"
            : response.data.MESSAGE || "Domain connection failed",
          "error"
        )();
        domainTableStateUpdater({ domain, status: "Failed"  });
      }
    } catch (error) {
      console.error("Error deploying domain:", error);
      snackbarClickVariant("Error deploying domain", "error")();
      domainTableStateUpdater({ domain, status: "Failed"  });
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
