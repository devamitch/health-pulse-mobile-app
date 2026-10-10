import { createContext, useContext, useState } from "react";

type ColorThemeType = 'light' | 'dark'
type ElevationThemeType = 'plain' | '3d' | 'ultra_3d';

interface ThemeContextType{
    ColorTheme: ColorThemeType;
    Elevation: ElevationThemeType;
    changeColorTheme: (theme: ColorThemeType) => void;
    changeElevationTheme: (theme: ElevationThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children} : {children: React.ReactNode}) => {
    const [ ColorTheme, changeColorTheme ] = useState<ColorThemeType>('light');
    const [ Elevation, changeElevationTheme ] = useState<ElevationThemeType>('3d');

    return(
        <ThemeContext.Provider value={{ColorTheme, Elevation, changeColorTheme, changeElevationTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if(!context){
        throw new Error('useTheme must be used within a ThemeProvider');
    };
    
    return context;
}