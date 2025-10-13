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
} from "@/types/websiteApi.type";
import { ButtonGroup, Chip } from "@mui/material";
import { VariantType, useSnackbar, SnackbarProvider } from "notistack";

function DomainsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [websitesList, setWebsitesList] = useState<WebsiteRowTYPE[]>([]);
  const [search, setSearch] = useState("");

  const snackbarClickVariant =
    (message: string, variant: VariantType) => () => {
      enqueueSnackbar(message, { variant });
    };

  useEffect(() => {
    // Fetch initial data
    axios
      .get<GetApiResTYPE>("/api/domains")
      .then((response) => {
        console.log("Fetched websites:", response);
        const { SUCCESS, MESSAGE, DATA } = response.data as GetApiResTYPE;

        if (SUCCESS && DATA) {
          snackbarClickVariant(
            MESSAGE || "Websites fetched successfully",
            "success"
          )();
          setWebsitesList(DATA as WebsiteRowTYPE[]);
        } else {
          snackbarClickVariant(
            MESSAGE || "Failed to fetch websites",
            "error"
          )();
          setWebsitesList([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching websites:", error);
      });
  }, []);

  const columns: GridColDef<WebsiteRowTYPE>[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "domain",
      headerName: "Main Domain",
      width: 200,
    },
    {
      field: "liveUrl",
      headerName: "Live URL",
      width: 200,
      renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          {params.value}
        </a>
      ),
    },
    {
      field: "log",
      headerName: "Log",
      width: 75,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            // disabled={params.row.build === "complete"}
          >
            Deploy Domain
          </Button>
        </Box>
      ),
    },
  ];

  // Filter websites by search
  const filteredWebsites = search.trim()
    ? websitesList.filter((row) => {
        const q = search.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.domain.toLowerCase().includes(q)
        );
      })
    : websitesList;

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
