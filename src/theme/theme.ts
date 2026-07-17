import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "light",
		background: {
			default: "#f6f7fb",
		},
	},
	shape: {
		borderRadius: 4,
	},
	typography: {
		fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
	},
	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 700,
				},
			},
		},
	},
});
