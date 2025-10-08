"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionTitle from "@/components/SectionTitle";
import TableControlBar from "@/components/TableControlBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { WebsiteRowTYPE, GetApiResTYPE } from "@/types/websiteApi.type";
import { ButtonGroup, Chip } from "@mui/material";

export default function BasicTable() {
  const [websitesList, setWebsitesList] = useState<WebsiteRowTYPE[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get<GetApiResTYPE>("/api/websites")
      .then((res) => {
        const { data } = res;
        if (data.SUCCESS) {
          setWebsitesList(data.DATA || []);
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
    return () => {
      setWebsitesList([]);
    };
  }, []);

  // Inside BasicTable component

  const handleBuild = (row: WebsiteRowTYPE) => {
    // Your build logic here
    console.log("Build clicked for", row.domain);
  };

  const handleRemove = (row: WebsiteRowTYPE) => {
    // Your remove logic here
    console.log("Remove clicked for", row.domain);
  };

  const handleDeploy = (row: WebsiteRowTYPE) => {
    // Your deploy logic here
    console.log("Deploy clicked for", row.domain);
  };

  const handleUndeploy = (row: WebsiteRowTYPE) => {
    // Your undeploy logic here
    console.log("Undeploy clicked for", row.domain);
  };

  const columns: GridColDef<WebsiteRowTYPE>[] = [
    {
      field: "name",
      headerName: "Name",
      width: 250,
    },
    {
      field: "domain",
      headerName: "Domain",
      width: 250,
    },
    {
      field: "build",
      headerName: "Build",
      width: 150,
      renderCell: (params) => (
        <Chip
          sx={{ textTransform: "capitalize" }}
          label={params.row.build}
          color={params.row.build === "complete" ? "success" : "default"}
        />
      ),
    },
    {
      field: "deployed",
      headerName: "Deployed",
      width: 150,
      renderCell: (params) => (
        <Chip
          sx={{ textTransform: "capitalize" }}
          label={params.row.deployed}
          color={params.row.deployed === "complete" ? "success" : "default"}
        />
      ),
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
          <ButtonGroup>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={params.row.build === "complete"}
              onClick={() => handleBuild(params.row)}
            >
              Build
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={params.row.build !== "complete"}
              onClick={() => handleRemove(params.row)}
            >
              Remove
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={params.row.build !== "complete"}
              onClick={() => handleDeploy(params.row)}
            >
              Deploy
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="small"
              disabled={params.row.deployed !== "complete"}
              onClick={() => handleUndeploy(params.row)}
            >
              Undeploy
            </Button>
          </ButtonGroup>
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
      <SectionTitle title="Websites" description="Manage your websites here." />
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
