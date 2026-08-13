import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {SvgIconComponent} from "@mui/icons-material";

export interface GameHeaderProps {
    title: string;
    description: string;
    icon: SvgIconComponent
}

export function GameHeader({title, description, icon: IconComponent}: GameHeaderProps) {
    return (
        <Stack spacing={1} sx={{textAlign: "center",}}>
            <Stack
                direction="row"
                spacing={1}
                sx={{justifyContent: "center", alignItems: "center"}}
            >
                <IconComponent color="action" fontSize="small"/>
                <Typography component="h1" variant="h5" sx={{fontWeight: 700}}>
                    {title}
                </Typography>
            </Stack>

            <Typography variant="body2" color="textSecondary">{description}</Typography>
        </Stack>
    )
}