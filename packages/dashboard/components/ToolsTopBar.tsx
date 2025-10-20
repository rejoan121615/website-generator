import React, { useRef } from "react";
import {
  Paper,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";

interface TableControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onFileUpload: (file: File) => void;
}

const ToolsTopBar = ({
  search,
  onSearchChange,
  onFileUpload,
}: TableControlBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      onFileUpload(file);
    } else if (file) {
      alert("Please select a valid CSV file");
    }
    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={handleFileSelect}
            sx={{ minWidth: 160 }}
          >
            Import CSV
          </Button>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <TextField
          size="small"
          placeholder="Search websites"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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

export default ToolsTopBar;
