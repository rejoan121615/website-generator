import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MergeIcon from '@mui/icons-material/Merge';
import ReplaceIcon from '@mui/icons-material/SwapHoriz';
import axios from 'axios';
import { CsvParseApiResponse } from '@/types/websiteApi.type';

interface CSVUploadData {
  fileName: string;
  totalRows: number;
  headers: string[];
  sampleData?: any[];
  parsedData?: any[];
}

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  csvFile: File | null;
  existingData: any[];
  onReplace: (newData: any[]) => void;
  onMerge: (newData: any[]) => void;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  open,
  onClose,
  csvFile,
  existingData,
  onReplace,
  onMerge
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [csvData, setCsvData] = useState<CSVUploadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Parse CSV when file is provided
  useEffect(() => {
    if (csvFile && open) {
      parseCSVFile();
    }
  }, [csvFile, open]);

  const parseCSVFile = async () => {
    if (!csvFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const response = await axios.post<CsvParseApiResponse>('/api/csv/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      if (result.SUCCESS && result.DATA) {
        console.log(`✅ CSV file parsed successfully:`, result);
        setCsvData({
          fileName: csvFile.name,
          totalRows: result.DATA.length,
          headers: Object.keys(result.DATA[0] || {}),
          parsedData: result.DATA
        });
      } else {
        setError(result.MESSAGE || 'Failed to parse CSV file');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.MESSAGE || err.message || 'Failed to parse CSV file';
        setError(errorMessage);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = () => {
    if (csvData?.parsedData) {
      onReplace(csvData.parsedData);
    }
  };

  const handleMerge = () => {
    if (csvData?.parsedData) {
      onMerge(csvData.parsedData);
    }
  };

  if (!csvFile) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileUploadIcon color="primary" />
          <Typography variant="h5" component="div" fontWeight="bold">
            CSV File Upload Details
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 0 }}>
        <Box>
          {/* Success/Error/Loading Alert */}
          {loading && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                Processing CSV file...
              </Typography>
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                Error: {error}
              </Typography>
            </Alert>
          )}
          
          {csvData && !loading && !error && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                CSV file successfully processed!
              </Typography>
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="CSV upload tabs">
              <Tab label="Info" />
              <Tab label="Preview Data" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {tabValue === 0 && csvData && (
            <Box>
              {/* File Information */}
              <Typography variant="h6" gutterBottom color="primary">
                File Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      File Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {csvData.fileName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Rows
                    </Typography>
                    <Chip label={`${csvData.totalRows} rows`} size="small" color="info" />
                  </Box>
                </Box>
              </Box>
              
              {/* Data Summary */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Data Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Current Data Count
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {existingData.length} records
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      New Data Count
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {csvData.totalRows} records
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    After Merge Total
                  </Typography>
                  <Chip 
                    label={`${existingData.length + csvData.totalRows} total records`} 
                    size="small" 
                    color="secondary" 
                  />
                </Box>
              </Box>
              {/* Action Options */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Import Options
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper' }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Replace Existing Data"
                    secondary="This will remove all current data and replace it with the new CSV data"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Merge with Existing Data"
                    secondary="This will add the new CSV data to your existing records"
                  />
                </ListItem>
              </List>
            </Box>
          )}

          {tabValue === 1 && csvData && (
            <Box>
              {/* Data Preview */}
              {csvData.parsedData && csvData.parsedData.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom color="primary">
                    All CSV Data ({csvData.totalRows} rows)
                  </Typography>
                  
                  <Paper sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                      rows={csvData.parsedData}
                      getRowId={(row) => row.domain}
                      columns={[
                        {
                          field: 'domain',
                          headerName: 'Domain',
                          flex: 2,
                          minWidth: 150
                        },
                        {
                          field: 'name',
                          headerName: 'Name',
                          flex: 1.5,
                          minWidth: 120
                        },
                        {
                          field: 'service_name',
                          headerName: 'Service',
                          flex: 1,
                          minWidth: 100
                        },
                        {
                          field: 'address',
                          headerName: 'Address',
                          flex: 2,
                          minWidth: 200,
                          renderCell: (params) => {
                            try {
                              const addressData = JSON.parse(params.value);
                              const { street, city, state, country } = addressData;
                              return `${street || ''}, ${city || ''}, ${state || ''}, ${country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
                            } catch (error) {
                              return params.value;
                            }
                          }
                        },
                        {
                          field: 'phone',
                          headerName: 'Phone',
                          flex: 1,
                          minWidth: 120
                        },
                        {
                          field: 'email',
                          headerName: 'Email',
                          flex: 1.5,
                          minWidth: 150
                        },
                        {
                          field: 'site_title',
                          headerName: 'Site Title',
                          flex: 1.5,
                          minWidth: 150
                        },
                        {
                          field: 'meta_title',
                          headerName: 'Meta Title',
                          flex: 1.5,
                          minWidth: 150
                        }
                      ] as GridColDef[]}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 10 },
                        },
                      }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      disableRowSelectionOnClick
                      sx={{
                        '& .MuiDataGrid-root': {
                          border: 'none',
                        },
                      }}
                    />
                  </Paper>
                </>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleReplace} 
          variant="contained" 
          color="warning"
          startIcon={<ReplaceIcon />}
          disabled={!csvData || loading}
        >
          Replace Data
        </Button>
        <Button 
          onClick={handleMerge} 
          variant="contained" 
          color="primary"
          startIcon={<MergeIcon />}
          disabled={!csvData || loading}
        >
          Merge Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVUploadModal;