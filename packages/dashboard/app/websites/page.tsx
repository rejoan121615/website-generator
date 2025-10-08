"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionTitle from "@/components/SectionTitle";
import TableControlBar from "@/components/TableControlBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import {
  CsvRowDataType,
  WebsitesResTYPE,
  WebsiteRowTYPE,
  GetApiResTYPE,
} from "@/types/websiteApi.type";
import { ButtonGroup, Chip } from "@mui/material";

const columns: GridColDef<WebsiteRowTYPE>[] = [
  {
    field: "name",
    headerName: "Name",
    width: 250,
  },
  {
    field: "domain",
    headerName: "Domain",
    width: 250
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
    width: 175,
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
          <Button variant="contained" color="primary" size="small">
            Build
          </Button>
          <Button variant="contained" color="error" size="small">
            Remove
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button variant="contained" color="success" size="small">
            Deploy
          </Button>
          <Button variant="contained" color="warning" size="small">
            Undeploy
          </Button>
        </ButtonGroup>
      </Box>
    ),
  },
];

export default function BasicTable() {
  const [websitesList, setWebsitesList] = useState<WebsiteRowTYPE[]>([]);

  useEffect(() => {
    console.log("Fetching websites...");
    axios
      .get<GetApiResTYPE>("/api/websites")
      .then((res) => {
        console.log("your api response ", res);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* section title  */}
      <SectionTitle title="Websites" description="Manage your websites here." />
      {/* control bar  */}
      <TableControlBar />
      {/* table  */}
      <DataGrid
        rows={websitesList}
        columns={columns}
        getRowId={(row) => row.domain}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
