import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { darkTheme, ElevationStyle, lightTheme, thereD } from "../../../constants/theme";
import { ThemeType } from ".";

const initialState : ThemeType = {
    colorScheme: 'light',
    elevationScheme: '3d',
    colors: lightTheme,
    elevation: thereD
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setColorScheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.colorScheme = action.payload;
            if (action.payload === 'system') {
                // Use system theme - you can implement logic to detect system theme here
                // For now, default to light for system
                state.colors = lightTheme;
            } else {
                state.colors = action.payload === 'dark' ? darkTheme : lightTheme;
            }
        },
        setElevationScheme: (state, action: PayloadAction<'plain' | '3d' | 'ultra_3d'>) => {
            state.elevationScheme = action.payload;
            state.elevation = ElevationStyle[action.payload]
        }
    }
})

export const { setColorScheme, setElevationScheme } = themeSlice.actions;
export default themeSlice.reducer;