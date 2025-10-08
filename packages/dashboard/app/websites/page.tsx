"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionTitle from "@/components/SectionTitle";
import TableControlBar from "@/components/TableControlBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { CsvRowDataType, WebsitesResTYPE } from "@/types/api.type";

type RowType = {
  name: string;
  domain: string;
  buildStatus: string;
  deployed: string;
};

// const rows = [
//   {
//     name: "Rejoan",
//     domain: "rejoan.com",
//     buildStatus: "ready",
//     deployed: "un-available",
//   },
//   {
//     name: "Paul",
//     domain: "paulsite.net",
//     buildStatus: "building",
//     deployed: "available",
//   },
//   {
//     name: "Daniel",
//     domain: "danielweb.org",
//     buildStatus: "failed",
//     deployed: "un-available",
//   },
//   {
//     name: "Edwards",
//     domain: "edwards.io",
//     buildStatus: "ready",
//     deployed: "available",
//   },
//   {
//     name: "Alice",
//     domain: "alice.dev",
//     buildStatus: "building",
//     deployed: "un-available",
//   },
// ];

const columns: GridColDef<RowType>[] = [
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
    field: "buildStatus",
    headerName: "Build Status",
    width: 150,
  },
  {
    field: "deployed",
    headerName: "Deployed",
    width: 175,
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
          onClick={() => alert(`Edit ${params.row.name}`)}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => alert(`Delete ${params.row.name}`)}
        >
          Delete
        </Button>
      </Box>
    ),
  },
];

export default function BasicTable() {
  const [websitesList, setWebsitesList] = useState<RowType[]>([]);

  // useEffect(() => {
  //   const fetchWebsites = async () => {
  //     try {
  //       const response = await axios.get("/api/websites");
  //       if (response.data.SUCCESS) {
  //         setWebsitesList(response.data.DATA || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching websites:", error);
  //     }
  //   };

  //   fetchWebsites();
  // }, []);

  useEffect(() => {
    axios
      .get<WebsitesResTYPE>("/api/websites")
      .then((res) => {
        const { data } = res;
        if (data.SUCCESS) {
          const websitesList = data.DATA?.map((item) => {
            return {
              name: item.name,
              domain: item.domain,
              buildStatus: "un-available",
              deployed: "un-available",
            };
          });

          setWebsitesList(websitesList || [])
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
