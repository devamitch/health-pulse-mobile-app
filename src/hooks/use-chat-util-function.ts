import { generateClaudeResponseText } from "@/services/api/claude_client";
import { useAppDispatch, useAppSelector } from "@/services/mmkv-redux/hooks"
import { addPreference, removePreference } from "@/services/mmkv-redux/slices";
import { preferencePrompt } from "@/utils/llm_utils";
import { useCallback } from "react";

export const usePreferenceManager = () => {
    const dispatch = useAppDispatch();
    const { preferences } = useAppSelector(state => state.message);
    
    const preferenceManager = useCallback(
        async ({userInput}: {userInput: string}) => {
            try {
                const preference_prompt = `Existing preferences: ${JSON.stringify(
                    preferences,
                )}, Message: ${userInput}`;
                
                const response = await generateClaudeResponseText(
                    preference_prompt,
                    preferencePrompt,
                    [],
                    'claude-3-5-haiku-20241022',
                );
        
                const newPreferences = JSON.parse((response.content[0] as any).text);

                console.log(newPreferences);                
                
                if (newPreferences.success) {
                    dispatch(addPreference(newPreferences));
                
                if (newPreferences.remove?.length > 0) {
                    newPreferences.remove.forEach((item: string) => {
                        dispatch(removePreference(item));
                    });
                }
                }
            } catch (error) {
                console.error('Error managing preferences:', error);
            }
        },
        [preferences, dispatch],
    );

    return({
        preferenceManager,
    });
}