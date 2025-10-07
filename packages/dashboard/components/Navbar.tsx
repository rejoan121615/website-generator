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
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ConstructionIcon from '@mui/icons-material/Construction';
import Link from "next/link";


const NavbarData = [
  {
    title: "Dashboard",
    icon: <SpaceDashboardIcon />,
    link: "/",
  },
  {
    title: "Websites",
    icon: <ViewStreamIcon />,
    link: "/websites",
  },
  {
    title: "Publish",
    icon: <CloudUploadIcon />,
    link: "/publish",
  },
  {
    title: "Tools",
    icon: <ConstructionIcon />,
    link: "/tools",
  },
];

const drawerWidth = 240;

export default function Home({ children }: { children: React.ReactNode }) {
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
              return (
                <ListItem key={NavItem.title} disablePadding>
                  {/* <Link href={NavItem.link}> */}
                    <ListItemButton component={Link} href={NavItem.link}>
                      <ListItemIcon>{NavItem.icon}</ListItemIcon>
                      <ListItemText primary={NavItem.title} />
                    </ListItemButton>
                  {/* </Link> */}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
