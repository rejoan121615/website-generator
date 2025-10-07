import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const SectionTitle = ({ title, description} : {title: string, description: string}) => {
  return (
    <Box sx={{ mb: 4}}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1" sx={{ mt: 1}}>{description}</Typography>
    </Box>
  )
}

export default SectionTitle;