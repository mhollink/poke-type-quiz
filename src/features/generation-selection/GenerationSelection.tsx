import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import {getPokemonSpriteUrl} from "../../utils";
import {useState} from "react";
import {blue} from '@mui/material/colors';
import {Tooltip} from "@mui/material";
import {localGenerationSelectionRepository} from "./storage/localGenerationSelectionRepository.ts";

const GENERATIONS = [
    {gen: 1, avatar: 1},
    {gen: 2, avatar: 152},
    {gen: 3, avatar: 252},
    {gen: 4, avatar: 387},
    {gen: 5, avatar: 495},
    {gen: 6, avatar: 650},
    {gen: 7, avatar: 722},
    {gen: 8, avatar: 810},
    {gen: 9, avatar: 906},
]

export function GenerationSelection() {
    const storedSelection = localGenerationSelectionRepository.findEnabledGenerations();
    const [generations, setGenerations] = useState(GENERATIONS.map(({gen, avatar}) => ({
        gen,
        avatar,
        enabled: storedSelection.has(gen)
    })));

    function toggleGeneration(gen: number, value: boolean) {
        const newState = generations.map(candidate => {
            if (candidate.gen === gen) {
                return {...candidate, enabled: value}
            } else {
                return candidate;
            }
        })
        setGenerations(newState);

        const enabledGens = newState
            .filter(gen => gen.enabled)
            .map(gen => gen.gen);
        localGenerationSelectionRepository.store(enabledGens)
    }

    return (
        <Stack direction="row"
               spacing={1}
               useFlexGap
               sx={{justifyContent: "center", flexWrap: "wrap"}}
               tabIndex={0}
        >

            {generations.map((gen) => (
                <GenSelector gen={gen.gen} dexNr={gen.avatar} enabled={gen.enabled}
                             setEnabled={(value) => toggleGeneration(gen.gen, value)}/>
            ))}

        </Stack>
    )
}

interface GenSelectorProps {
    gen: number;
    dexNr: number,
    enabled: boolean,
    setEnabled: (value: boolean) => void;
}

function GenSelector({gen, dexNr, enabled, setEnabled}: GenSelectorProps) {
    const sprite = getPokemonSpriteUrl(dexNr);
    return (
        <Tooltip title={`Enable or disable Generation ${gen}`}>
            <Avatar
                sx={{
                    width: 56,
                    height: 56,
                    filter: enabled ? "" : "opacity(0.8) grayscale(1)",
                    bgcolor: blue[200],
                    border: 1,
                    color: blue[400],
                    "& .MuiAvatar-img": {
                        scale: 1.5
                    },
                    cursor: "pointer",
                    "&:focus-visible": {
                        outline: (theme) => `3px solid ${theme.palette.primary.main}`,
                        outlineOffset: 3,
                    },
                }}
                alt={`Gen ${gen}. ${enabled ? "Enabled" : "Disabled"}`}
                src={sprite}
                onClick={() => setEnabled(!enabled)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        setEnabled(!enabled)
                    }
                }}
                tabIndex={0}
            >
                {gen}
            </Avatar>
        </Tooltip>
    )
}