import type {Move, Pokemon} from "../../../types";
import {type DailyMoveOption, type DailyMoveRound, MOVE_TIERS, type MoveTierDefinition} from "../model/Round.ts";
import {calculateMoveScore} from "../scoring/calculateMoveScore.ts";
import type {TypeEffectivenessLookup} from "../utils/effectiveness.ts";
import {createScopedRandom, randomIntegerInclusive, type RandomSource} from "../utils/random.ts";

export function createDailyMoveRound(
    dateKey: string,
    index: number,
    pokemon: Pokemon,
    eligibleMoves: readonly Move[],
    getEffectiveness: TypeEffectivenessLookup,
): DailyMoveRound {
    const options = selectDailyMoveOptions(
        dateKey,
        index,
        pokemon,
        eligibleMoves,
        getEffectiveness,
    );

    return {
        index,
        pokemon,
        options,
        maxScore: Math.max(
            ...options.map(
                (option) => option.score.score,
            ),
        ),
    };
}

function createMoveCandidate(
    dateKey: string,
    roundIndex: number,
    pokemon: Pokemon,
    move: Move,
    getEffectiveness: TypeEffectivenessLookup,
): DailyMoveOption {
    const hitRandom = createScopedRandom(
        dateKey,
        [
            "round",
            roundIndex,
            "pokemon",
            pokemon.nr,
            "move",
            move.nr,
            "hits",
        ].join(":"),
    );

    const hitCount = randomIntegerInclusive(
        move.minHits,
        move.maxHits,
        hitRandom,
    );

    return {
        move,
        hitCount,
        score: calculateMoveScore(
            move,
            pokemon.types,
            hitCount,
            getEffectiveness,
        ),
    };
}

function createRankedMoveCandidates(
    dateKey: string,
    roundIndex: number,
    pokemon: Pokemon,
    moves: readonly Move[],
    getEffectiveness: TypeEffectivenessLookup,
): DailyMoveOption[] {
    return moves
        .map((move) =>
            createMoveCandidate(
                dateKey,
                roundIndex,
                pokemon,
                move,
                getEffectiveness,
            ),
        )
        .toSorted(
            (left, right) =>
                right.score.score - left.score.score ||
                left.move.nr - right.move.nr,
        );
}

const MINIMUM_SCORE_GAP_RATIO = 0.1;
const TIER_SHORTLIST_SIZE = 5;

function pickTierMove(
    candidates: readonly DailyMoveOption[],
    tier: MoveTierDefinition,
    maximumScore: number,
    selected: readonly DailyMoveOption[],
    random: RandomSource,
): DailyMoveOption {
    const selectedMoveIds = new Set(
        selected.map((option) => option.move.id),
    );

    const selectedTypes = new Set(
        selected.map((option) => option.move.type),
    );

    const available = candidates.filter(
        (option) => !selectedMoveIds.has(option.move.id),
    );

    const scoreRatio = (option: DailyMoveOption): number =>
        maximumScore === 0
            ? 0
            : option.score.score / maximumScore;

    const belongsToTier = (
        option: DailyMoveOption,
    ): boolean => {
        const ratio = scoreRatio(option);

        if (tier.id === "best") {
            return option.score.score === maximumScore;
        }

        return (
            ratio >= tier.minRatio &&
            ratio < tier.maxRatio
        );
    };

    const hasDifferentType = (
        option: DailyMoveOption,
    ): boolean => !selectedTypes.has(option.move.type);

    const hasDistinctScore = (
        option: DailyMoveOption,
    ): boolean =>
        selected.every((selectedOption) => {
            const difference = Math.abs(
                option.score.score -
                selectedOption.score.score,
            );

            return (
                difference / maximumScore >=
                MINIMUM_SCORE_GAP_RATIO
            );
        });

    const tierCandidates = available.filter(belongsToTier);

    const candidatePools = [
        tierCandidates.filter(
            (option) =>
                hasDifferentType(option) &&
                hasDistinctScore(option),
        ),
        tierCandidates.filter(hasDifferentType),
        tierCandidates.filter(hasDistinctScore),
        tierCandidates,
        available.filter(
            (option) =>
                hasDifferentType(option) &&
                hasDistinctScore(option),
        ),
        available.filter(hasDifferentType),
        available,
    ];

    const pool = candidatePools.find(
        (candidatePool) => candidatePool.length > 0,
    );

    if (!pool) {
        throw new Error(
            `No move candidate available for tier ${tier.id}`,
        );
    }

    const rankedPool = pool.toSorted((left, right) => {
        const leftDistance = Math.abs(
            scoreRatio(left) - tier.targetRatio,
        );

        const rightDistance = Math.abs(
            scoreRatio(right) - tier.targetRatio,
        );

        return (
            leftDistance - rightDistance ||
            left.move.nr - right.move.nr
        );
    });

    const shortlist = rankedPool.slice(
        0,
        TIER_SHORTLIST_SIZE,
    );

    console.log({tierCandidates, candidatePools, pool, rankedPool});

    const selectedIndex = randomIntegerInclusive(
        0,
        shortlist.length - 1,
        random,
    );

    return shortlist[selectedIndex];
}

function selectDailyMoveOptions(
    dateKey: string,
    roundIndex: number,
    pokemon: Pokemon,
    moves: readonly Move[],
    getEffectiveness: TypeEffectivenessLookup,
): DailyMoveOption[] {
    const candidates = createRankedMoveCandidates(
        dateKey,
        roundIndex,
        pokemon,
        moves,
        getEffectiveness,
    );

    if (candidates.length < MOVE_TIERS.length) {
        throw new Error(
            `At least ${MOVE_TIERS.length} move candidates are required`,
        );
    }

    const maximumScore = candidates[0].score.score;

    if (maximumScore <= 0) {
        throw new Error(
            `No damaging moves available against ${pokemon.name}`,
        );
    }

    const selected: DailyMoveOption[] = [];

    for (const tier of MOVE_TIERS) {
        const option = pickTierMove(
            candidates,
            tier,
            maximumScore,
            selected,
            createScopedRandom(
                dateKey,
                `round:${roundIndex}:tier:${tier.id}`,
            ),
        );

        selected.push(option);
    }

    return shuffle(
        selected,
        createScopedRandom(
            dateKey,
            `round:${roundIndex}:option-order`,
        ),
    );
}


function shuffle<T>(
    items: readonly T[],
    random: RandomSource,
): T[] {
    const shuffled = [...items];

    for (
        let index = shuffled.length - 1;
        index > 0;
        index -= 1
    ) {
        const swapIndex = randomIntegerInclusive(
            0,
            index,
            random,
        );

        [shuffled[index], shuffled[swapIndex]] = [
            shuffled[swapIndex],
            shuffled[index],
        ];
    }

    return shuffled;
}