import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLevel: 'safe', // 'safe' | 'warning' | 'danger'
    probability: 0,
    message: '',
    detectedWords: [],
    // 통계
    stats: {
        totalChecks: 0,
        warningCount: 0,
        dangerCount: 0,
        blockedCount: 0,
    },
};

const nudgeSlice = createSlice({
    name: 'nudge',
    initialState,
    reducers: {
        setNudgeResult: (state, action) => {
            const { probability, nudgeLevel, nudgeMessage, detectedWords } = action.payload;
            state.probability = probability;
            state.currentLevel = nudgeLevel;
            state.message = nudgeMessage;
            state.detectedWords = detectedWords || [];
            state.stats.totalChecks += 1;
            if (nudgeLevel === 'warning') state.stats.warningCount += 1;
            if (nudgeLevel === 'danger') state.stats.dangerCount += 1;
        },
        clearNudge: (state) => {
            state.currentLevel = 'safe';
            state.probability = 0;
            state.message = '';
            state.detectedWords = [];
        },
        incrementBlocked: (state) => {
            state.stats.blockedCount += 1;
        },
    },
});

export const { setNudgeResult, clearNudge, incrementBlocked } = nudgeSlice.actions;
export default nudgeSlice.reducer;
