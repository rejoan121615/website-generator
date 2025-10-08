import React from "react";
import { Paper, Stack, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/UploadFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";



interface TableControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const TableControlBar = ({ search, onSearchChange }: TableControlBarProps) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >

        <TextField
          size="small"
          placeholder="Search websites"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
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
