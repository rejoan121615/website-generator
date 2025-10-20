"use client"
import React, { useState, useEffect } from 'react'
import { Box, Button, Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import axios from 'axios'
import SectionTitle from '../../components/SectionTitle'
import ToolsTopBar from '../../components/ToolsTopBar'
import WebsiteDetailsModal from '../../components/WebsiteDetailsModal'
import { CsvRowDataType } from '@repo/shared-types'


const Tools = () => {
    const [search, setSearch] = useState("");
    const [websiteData, setWebsiteData] = useState<CsvRowDataType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<CsvRowDataType | null>(null);

    // Fetch data from API on component mount
    useEffect(() => {
      const fetchWebsites = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/websites');
          
          if (response.data.SUCCESS && response.data.DATA) {
            const formattedData: CsvRowDataType[] = response.data.DATA.map((website: any, index: number) => ({
              id: index + 1,
              domain: website.domain || '',
              name: website.name || '',
              service_name: website.service_name || '',
              address: website.address || '',
              phone: website.phone || '',
              email: website.email || '',
              site_title: website.site_title || '',
              meta_title: website.meta_title || '',
              meta_description: website.meta_description || '',
              logo_url: website.logo_url || ''
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
        
        const csvData: CsvRowDataType[] = rows.slice(1).map((row, index) => {
          const values = row.split(',').map(v => v.trim());
          return {
            id: websiteData.length + index + 1,
            domain: values[0] || '',
            name: values[1] || '',
            service_name: values[2] || '',
            address: values[3] || '',
            phone: values[4] || '',
            email: values[5] || '',
            site_title: values[6] || '',
            meta_title: values[7] || '',
            meta_description: values[8] || '',
            logo_url: values[9] || ''
          };
        });
        
        // Merge CSV data with existing API data
        setWebsiteData(prevData => [...prevData, ...csvData]);
      };
      reader.readAsText(file);
    };

    const columns: GridColDef<CsvRowDataType>[] = [
      {
        field: 'domain',
        headerName: 'Domain',
        flex: 2
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1
      },
      {
        field: 'address',
        headerName: 'Address',
        flex: 2,
        renderCell: (params) => {
          try {
            const addressData = JSON.parse(params.value);
            const { street, city, state, country } = addressData;
            return `${street || ''}, ${city || ''}, ${state || ''}, ${country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
          } catch (error) {
            // If it's not valid JSON, return the original value
            return params.value;
          }
        }
      },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1
      },
      {
        field: 'actions',
        headerName: 'Action',
        sortable: false,
        flex: 1,
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

    const handleShowAll = (row: CsvRowDataType) => {
      setSelectedRow(row);
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedRow(null);
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
      
      <Paper>
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
        />
      </Paper>
      
      <WebsiteDetailsModal 
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedRow}
      />
    </Box>
  )
}

export default Tools