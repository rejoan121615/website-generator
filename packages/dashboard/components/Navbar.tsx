"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ConstructionIcon from '@mui/icons-material/Construction';
import Link from "next/link";
import { usePathname } from "next/navigation";


const NavbarData = [
  {
    title: "Websites",
    icon: <ViewStreamIcon />,
    link: "/websites",
  },
  {
    title: "Domains",
    icon: <CloudUploadIcon />,
    link: "/domains",
  },
  {
    title: "CSV Data",
    icon: <ConstructionIcon />,
    link: "/csv-data",
  },
];

const drawerWidth = 240;

export default function Home({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar />
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {NavbarData.map((NavItem) => {
              const isActive = pathname === NavItem.link;
              return (
                <ListItem key={NavItem.title} disablePadding>
                  <ListItemButton 
                    component={Link} 
                    href={NavItem.link}
                    sx={{
                      backgroundColor: isActive ? '#9a9a9a' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'inherit',
                      '&:hover': {
                        backgroundColor: isActive ? '#9a9a9a' : 'action.hover',
                      },
                      '& .MuiListItemIcon-root': {
                        color: isActive ? 'primary.contrastText' : 'inherit',
                      }
                    }}
                  >
                    <ListItemIcon>{NavItem.icon}</ListItemIcon>
                    <ListItemText primary={NavItem.title} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1}}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
