import React from "react";
import { Paper, Stack, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/UploadFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";


const TableControlBar = () => {
  return (
    <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            New Website
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Import
          </Button>
          <Button variant="outlined" startIcon={<MoreVertIcon />}>
            Actions
          </Button>
        </Stack>

        <TextField
          size="small"
          placeholder="Search websites"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" aria-label="search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 320 } }}
        />
      </Stack>
    </Paper>
  );
};

export default TableControlBar;
