"use client"
import React, { useState, useEffect } from 'react'
import SectionTitle from '@/components/SectionTitle'
import TableControlBar from '@/components/TableControlBar'
import { Box, Button, Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import ToolsTopBar from '@/components/ToolsTopBar'
import axios from 'axios'

interface WebsiteRowData {
  id: number;
  domain: string;
  name: string;
  address: string;
  phone: string;
}

const Tools = () => {
    const [search, setSearch] = useState("");
    const [websiteData, setWebsiteData] = useState<WebsiteRowData[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from API on component mount
    useEffect(() => {
      const fetchWebsites = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/websites');
          
          if (response.data.SUCCESS && response.data.DATA) {
            const formattedData: WebsiteRowData[] = response.data.DATA.map((website: any, index: number) => ({
              id: index + 1,
              domain: website.domain || '',
              name: website.name || '',
              address: website.address || '',
              phone: website.phone || ''
            }));
            setWebsiteData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching websites:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWebsites();
    }, []);

    const handleFileUpload = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim());
        
        const csvData: WebsiteRowData[] = rows.slice(1).map((row, index) => {
          const values = row.split(',').map(v => v.trim());
          return {
            id: websiteData.length + index + 1,
            domain: values[0] || '',
            name: values[1] || '',
            address: values[2] || '',
            phone: values[3] || ''
          };
        });
        
        // Merge CSV data with existing API data
        setWebsiteData(prevData => [...prevData, ...csvData]);
      };
      reader.readAsText(file);
    };

    const columns: GridColDef<WebsiteRowData>[] = [
      {
        field: 'domain',
        headerName: 'Domain',
        width: 200,
        flex: 2
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        flex: 1
      },
      {
        field: 'address',
        headerName: 'Address',
        width: 200,
        flex: 2
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 150,
        flex: 1
      },
      {
        field: 'actions',
        headerName: 'Action',
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleShowAll(params.row)}
          >
            Show All
          </Button>
        )
      }
    ];

    const handleShowAll = (row: WebsiteRowData) => {
      console.log('Show all data for:', row);
      // Add your logic here to show all data for this row
    };

    // Filter data based on search
    const filteredData = search.trim()
      ? websiteData.filter((row) => {
          const searchLower = search.toLowerCase();
          return (
            row.domain.toLowerCase().includes(searchLower) ||
            row.name.toLowerCase().includes(searchLower) ||
            row.address.toLowerCase().includes(searchLower) ||
            row.phone.toLowerCase().includes(searchLower)
          );
        })
      : websiteData;

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle
        title="CSV"
        description="Manage your CSV files data here."
      />
      <ToolsTopBar 
        search={search} 
        onSearchChange={setSearch}
        onFileUpload={handleFileUpload}
      />
      
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none',
            },
          }}
        />
      </Paper>
    </Box>
  )
}

export default Tools