"use client"
import React, { useState, useEffect } from 'react'
import SectionTitle from '@/components/SectionTitle'
import TableControlBar from '@/components/TableControlBar'
import { Box, Button, Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import ToolsTopBar from '@/components/ToolsTopBar'
import WebsiteDetailsModal from '@/components/WebsiteDetailsModal'
import CSVUploadModal from '@/components/CSVUploadModal'
import axios from 'axios'
import { WebsitesResTYPE, WebsiteRowTYPE } from '@repo/cf'
import { CsvReplaceApiResponse, CsvMergeApiResponse } from '@/types/dashboard.type'


const Tools = () => {
    const [search, setSearch] = useState("");
    const [websiteData, setWebsiteData] = useState<WebsiteRowTYPE[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<WebsiteRowTYPE | null>(null);
    const [csvUploadModalOpen, setCsvUploadModalOpen] = useState(false);
    const [pendingCsvFile, setPendingCsvFile] = useState<File | null>(null);

    // Fetch data from API on component mount
    useEffect(() => {
      const fetchWebsites = async () => {
        try {
          setLoading(true);
          const response = await axios.get<WebsitesResTYPE>('/api/websites');
          
          if (response.data.SUCCESS && response.data.DATA) {
            // Ensure items conform to WebsiteRowTYPE by adding missing fields with sensible defaults
            const formattedData = response.data.DATA.map((item, index) => ({
              ...item,
              id: (item as any).id ?? index + 1,
              build: (item as any).build ?? 'unavailable',
              deployed: (item as any).deployed ?? 'unavailable',
              log: (item as any).log ?? ''
            })) as WebsiteRowTYPE[];
            
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
      // Store the file and open modal - let modal handle parsing via API
      setPendingCsvFile(file);
      setCsvUploadModalOpen(true);
    };

    const columns: GridColDef<WebsiteRowTYPE>[] = [
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

    const handleShowAll = (row: WebsiteRowTYPE) => {
      setSelectedRow(row);
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedRow(null);
    };

    const handleCSVReplace = async (newData: WebsiteRowTYPE[]) => {
      try {
        console.log('🔄 Starting CSV replace operation...', newData);
        
        // Call replace API
        const response = await axios.post<CsvReplaceApiResponse>('/api/csv/replace', {
          newData: newData
        });

        if (response.data.SUCCESS) {
          console.log('✅ CSV replace successful:', response.data);
          
          // Update local state with new data
          const formattedData = newData.map((item, index) => ({
            ...item,
            id: index + 1,
            build: item.build ?? 'unavailable',
            deployed: item.deployed ?? 'unavailable',
            log: item.log ?? ''
          }));
          
          setWebsiteData(formattedData);
          
          // Show success message (you can add a toast notification here)
          console.log(`Successfully replaced data with ${response.data.DATA?.totalRecords} records`);
          
        } else {
          console.error('❌ CSV replace failed:', response.data.MESSAGE);
          // Handle error (show error message to user)
        }
        
      } catch (error) {
        console.error('💥 Error during CSV replace:', error);
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.MESSAGE || error.message;
          console.error('API Error:', errorMessage);
          // Show error message to user
        }
      } finally {
        setCsvUploadModalOpen(false);
        setPendingCsvFile(null);
      }
    };    const handleCSVMerge = async (newData: WebsiteRowTYPE[]) => {
      try {
        console.log('🔄 Starting CSV merge operation...', newData);
        
        // Call merge API
        const response = await axios.post<CsvMergeApiResponse>('/api/csv/merge', {
          newData: newData
        });

        if (response.data.SUCCESS) {
          console.log('✅ CSV merge successful:', response.data);
          
          // Refresh data from API to get the merged result
          const refreshResponse = await axios.get<WebsitesResTYPE>('/api/websites');
          
          if (refreshResponse.data.SUCCESS && refreshResponse.data.DATA) {
            const formattedData = refreshResponse.data.DATA.map((item, index) => ({
              ...item,
              id: (item as any).id ?? index + 1,
              build: (item as any).build ?? 'unavailable',
              deployed: (item as any).deployed ?? 'unavailable',
              log: (item as any).log ?? ''
            })) as WebsiteRowTYPE[];
            
            setWebsiteData(formattedData);
          }
          
          // Show success message
          console.log(`Successfully merged ${response.data.DATA?.newRecords} new records with ${response.data.DATA?.existingRecords} existing records`);
          
        } else {
          console.error('❌ CSV merge failed:', response.data.MESSAGE);
          // Handle error (show error message to user)
        }
        
      } catch (error) {
        console.error('💥 Error during CSV merge:', error);
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.MESSAGE || error.message;
          console.error('API Error:', errorMessage);
          // Show error message to user
        }
      } finally {
        setCsvUploadModalOpen(false);
        setPendingCsvFile(null);
      }
    };

    const handleCSVModalClose = () => {
      setCsvUploadModalOpen(false);
      setPendingCsvFile(null);
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
      
      <CSVUploadModal 
        open={csvUploadModalOpen}
        onClose={handleCSVModalClose}
        csvFile={pendingCsvFile}
        existingData={websiteData}
        onReplace={handleCSVReplace}
        onMerge={handleCSVMerge}
      />
    </Box>
  )
}

export default Tools