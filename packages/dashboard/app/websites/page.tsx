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

function BasicTableInner() {
  const { enqueueSnackbar } = useSnackbar();
  const [websitesList, setWebsitesList] = useState<WebsiteRowTYPE[]>([]);
  const [search, setSearch] = useState("");

  const snackbarClickVariant =
    (message: string, variant: VariantType) => () => {
      enqueueSnackbar(message, { variant });
    };

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
        // handle error
      });
    return () => {
      setWebsitesList([]);
    };
  }, []);

  const handleBuild = async (row: WebsiteRowTYPE) => {
    try {
      const response = await fetch("/api/websites/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: row }),
      });


      if (!response.ok) throw new Error(`Sending http request failed: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";
          for (const msg of messages) {
            const dataLine = msg
              .split("\n")
              .find((line) => line.startsWith("data: "));
            if (dataLine) {
              const jsonStr = dataLine.replace(/^data:\s*/, "");
              try {
                const event = JSON.parse(jsonStr) as ServerEventResTYPE;
                const { MESSAGE, CSV_DATA } = event;
                snackbarClickVariant(
                  MESSAGE,
                  CSV_DATA.build === "complete"
                    ? "success"
                    : CSV_DATA.build === "failed"
                      ? "error"
                      : "info"
                )();
                setWebsitesList((prevState) => {
                  return prevState.map((item) =>
                    item.domain === CSV_DATA.domain ? CSV_DATA : item
                  );
                });
              } catch (e) {
                // handle parse error
              }
            }
          }
        }
      }
    } catch (error) {
      snackbarClickVariant("Sending request failed", "error")();
      console.log('error', error);
      // handle error
    }
  };

  const handleRemove = async (row: WebsiteRowTYPE) => {

    snackbarClickVariant(`Removing project: ${row.name}`, "info")();

    try {
      const response = await fetch("/api/websites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: row }),
      });

      if (!response.ok) throw new Error(`Sending http request failed: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const result = await response.json();
      if (result.SUCCESS) {
        snackbarClickVariant(result.MESSAGE, "success")();
        setWebsitesList((prevState) => {
         return prevState.map((item) =>
            item.domain === row.domain
              ? { ...item, build: "unavailable", deployed: "unavailable" }
              : item
          );
        });
        // remove from list if needed
        if (row.build === "complete") {
          setWebsitesList((prevState) =>
            prevState.filter((item) => item.domain !== row.domain)
          );
        }
      } else {
        snackbarClickVariant(result.MESSAGE, "error")();
      }
    } catch (error) {
      snackbarClickVariant("Failed to remove project", "error")();
      console.log("error", error);
    }
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
      width: 200,
    },
    {
      field: "domain",
      headerName: "Domain",
      width: 200,
    },
    {
      field: "log",
      headerName: "Log",
      width: 75,
    },
    {
      field: "build",
      headerName: "Build",
      width: 150,
      renderCell: (params) => (
        <Chip
          sx={{ textTransform: "capitalize" }}
          label={params.row.build}
          color={
            params.row.build === "complete"
              ? "success"
              : params.row.build === "processing"
                ? "warning"
              : params.row.build === "failed"
                ? "error"
                : "default"
          }
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
              // disabled={params.row.build === "complete"}
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
      <SectionTitle
        title="Websites"
        description="Manage your websites here."
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
      <BasicTableInner />
    </SnackbarProvider>
  );
}
