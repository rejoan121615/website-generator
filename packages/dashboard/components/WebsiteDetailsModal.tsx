"use client";
import React, { useEffect } from "react";
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
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { WebsiteRowTYPE } from "@repo/shared-types";
import { CsvAddressType } from "@repo/shared-types";

interface WebsiteDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: WebsiteRowTYPE | null;
}

const WebsiteDetailsModal: React.FC<WebsiteDetailsModalProps> = ({
  open,
  onClose,
  data,
}) => {
  // Don't render anything if modal is not open or no data
  if (!open || !data) return null;

  const formatAddress = (address: string) => {
    try {
      const addressData = JSON.parse(address);
      const { street, city, state, country } = addressData as CsvAddressType;
      return {
        formatted:
          `${street || ""}, ${city || ""}, ${state || ""}, ${country || ""}`
            .replace(/^,\s*|,\s*$/g, "")
            .replace(/,\s*,/g, ","),
        street: street || "",
        city: city || "",
        state: state || "",
        country: country || "",
      };
    } catch (error) {
      return {
        formatted: address,
        street: "",
        city: "",
        state: "",
        country: "",
      };
    }
  };

  const addressInfo = formatAddress(data.address);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "complete":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "error";
      case "unavailable":
      default:
        return "default";
    }
  };

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
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h5" component="div" fontWeight="bold">
          Website Details
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box>
          {/* Build Status Section */}
          <Typography variant="h6" gutterBottom color="primary">
            Build Status
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Status
                </Typography>
                <Chip
                  label={data.build || "unavailable"}
                  color={getStatusColor(data.build)}
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Log Folder
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.build === "complete" ? (
                    <Link>{`logs/${data.domain}`}</Link>
                  ) : (
                    <span style={{ color: "#999" }}>Not available</span>
                  )}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  App Src Code
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.build === "complete" ? (
                    <Link>{`apps/${data.domain}`}</Link>
                  ) : (
                    <Chip
                      label={data.build || "unavailable"}
                      color={getStatusColor(data.build)}
                      sx={{ textTransform: "capitalize" }}
                    />
                  )}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Static website Files
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.build === "complete" ? (
                    <Link>{`apps/${data.domain}/dist`}</Link>
                  ) : (
                    <Chip
                      label={data.build || "unavailable"}
                      color={getStatusColor(data.build)}
                      sx={{ textTransform: "capitalize" }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Deploy Status Section */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary">
            Deploy Status
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Status
                </Typography>
                <Chip
                  label={data.deployed || "unavailable"}
                  color={getStatusColor(data.deployed)}
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                Current Live Url
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.liveUrl ? (
                    <Link target="_blank" href={`https://${data.liveUrl}`}>{`https://${data.liveUrl}`|| "Not available"}</Link>
                  ) : (
                    <Chip
                      label={data.build || "unavailable"}
                      color={getStatusColor(data.build)}
                      sx={{ textTransform: "capitalize" }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Domain
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.domain}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Report Folder
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.liveUrl ? (
                    <Link >{`reports${data.domain}/deploy`|| "Not available"}</Link>
                  ) : (
                    <span style={{ color: "#999" }}>Not deployed</span>
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Basic Information */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary">
            Basic Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Business Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.name}
                </Typography>
              </Box>

              {data.template && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Template
                  </Typography>
                  <Chip label={data.template} size="small" color="info" />
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              {data.service_name && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Service Type
                  </Typography>
                  <Chip
                    label={data.service_name}
                    size="small"
                    color="secondary"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Contact Information */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary">
            Contact Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.phone}
                </Typography>
              </Box>

              {data.email && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {data.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Address Information */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary">
            Address Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Full Address
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {addressInfo.formatted}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              {addressInfo.street && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Street
                  </Typography>
                  <Typography variant="body1">{addressInfo.street}</Typography>
                </Box>
              )}

              {addressInfo.city && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    City
                  </Typography>
                  <Typography variant="body1">{addressInfo.city}</Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              {addressInfo.state && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    State
                  </Typography>
                  <Typography variant="body1">{addressInfo.state}</Typography>
                </Box>
              )}

              {addressInfo.country && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Country
                  </Typography>
                  <Typography variant="body1">{addressInfo.country}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Website & SEO Information */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary">
            Website & SEO Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            {data.site_title && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Site Title
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.site_title}
                </Typography>
              </Box>
            )}

            {data.meta_title && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Meta Title
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.meta_title}
                </Typography>
              </Box>
            )}

            {data.meta_description && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Meta Description
                </Typography>
                <Typography variant="body1">{data.meta_description}</Typography>
              </Box>
            )}

            {data.logo_url && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Logo URL
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {data.logo_url}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebsiteDetailsModal;
