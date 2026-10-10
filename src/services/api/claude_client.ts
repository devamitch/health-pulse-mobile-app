import Anthropic from "@anthropic-ai/sdk";
import {
    gaurdRailingPrompt,
    generalPrompt,
    imageAnalysisPrompt,
} from "../../utils/llm_utils";
import {
    smart_activity_planner,
    smart_personalized_meal_planner,
    smart_personalized_supplement_planner,
} from "@/utils/json-prompts";
import { RoutineRecord } from "../mmkv-redux/slices";

import {CLAUDE_API as API_KEY} from '@env';

export interface PlanChatFuntionProps {
    plan: 'superfood' | 'supplement' | 'activity';
    chatMemory: Anthropic.Messages.MessageParam[];
    userInput: string | Record<string, any>;
    userInformation: Record<string, any>;
    preferences: string[];
    records: RoutineRecord[];
    model?: Anthropic.Messages.Model;
    isChat?: boolean;
};

type PromptType = 
    | typeof smart_activity_planner 
    | typeof smart_personalized_meal_planner
    | typeof smart_personalized_supplement_planner;

const planSystemPrompt: Record<PlanChatFuntionProps['plan'], PromptType> = {
    superfood: smart_personalized_meal_planner,
    supplement: smart_personalized_supplement_planner,
    activity: smart_activity_planner,
};

export const claudeClient = new Anthropic({
    apiKey: API_KEY,
})

const generateClaudeResponseImgInp = async (imgB64: string, imgType : 'image/png' | 'image/jpeg' | 'image/webp', prompt: string, systemPrompt?: string) => {
    let request : Anthropic.Messages.MessageCreateParamsNonStreaming = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: prompt }, 
                { type: 'image', source: { type: 'base64', media_type: imgType, data: imgB64 } }
            ]
        }]
    };
    if(systemPrompt !== undefined)
        request['system'] = systemPrompt;
    const response = await claudeClient.messages.create(request);

    return response
}


export async function claudeVisionHelper(imgB64 : string, imgType : 'image/png' | 'image/jpeg' | 'image/webp'){
    const prompt = `What are the health metrics in the image?. If it is blood pressure data, let the type be "Blood Pressure" and the metrics be "SYS", "DIA" and "Pulse". Give metrics and make summary whether the reading are normal, high or low less than 50 words in the format as follows. {"description" : "summary", "success" : true, "type" : type, "metrics" : [{"metric" : metric, "value" : value, "unit" : unit} , {"metric" : metric, "value" : value, "unit" : unit} , ...]}. If the image has no health metrics, reply as {"success" : false, "message" : "I'm sorry I could not find any health metrics in the image."}. Don't include markdown language and escape characters.`
    const msg = await generateClaudeResponseImgInp(imgB64, imgType, prompt)

    return JSON.parse((msg.content[0] as any).text)
}

export async function claudeCheckItemHelper(imgB64 : string, imgType : 'image/png' | 'image/jpeg' | 'image/webp', itemList : string [], type: string){
    const prompt = `type: ${type}, item list: ${itemList}`;
    const msg = await generateClaudeResponseImgInp(imgB64, imgType, prompt, imageAnalysisPrompt)

    console.log(msg);

    return JSON.parse((msg.content[0] as any).text)
}

export const generateClaudeResponseText = async ( userInput: string, systemPrompt = generalPrompt, chatMemory: { role: 'user' | 'assistant'; content: string }[] = [], model : Anthropic.Messages.Model = 'claude-3-5-haiku-latest', gaurdrail = true) => {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
        ...chatMemory,
        {
            role: 'user',
            content: userInput
        }
    ];

    if(gaurdrail){
        const generatedResponse = await claudeClient.messages.create({
            model: model,
            max_tokens: 4096,
            system: `${systemPrompt}.\n${gaurdRailingPrompt}`,
            messages: messages
        });
        return generatedResponse
    }
    const generatedResponse = await claudeClient.messages.create({
        model: model,
        max_tokens: 4096,
        system: `${systemPrompt}`,
        messages: messages
    });
    return generatedResponse
    
};

export const generatePlanResponseClaude = async ({
    plan,
    chatMemory,
    userInput,
    userInformation,
    preferences,
    records,
    model = 'claude-3-5-haiku-latest',
    isChat = false,
}: PlanChatFuntionProps) => {
    const system = isChat 
        ? `${JSON.stringify({
            ...planSystemPrompt[plan],
            userInformation,
        })}\n\n${gaurdRailingPrompt}\n${JSON.stringify({
            'General Preference': preferences,
            'Prevoius Routine': records,
        })}`
        : `${JSON.stringify({
            ...planSystemPrompt[plan],
            userInformation,
        })}\n\n${gaurdRailingPrompt}`;

    const content = isChat 
        ? typeof(userInput) === 'string'
        ? userInput
        : JSON.stringify(userInput) 
        : JSON.stringify({
            'Todays Preference': userInput,
            'General Preference': preferences,
            'Prevoius Routine': records,
        });

    const messages: Anthropic.Messages.MessageParam[] = [
        ...chatMemory,
        {
            role: 'user',
            content,
        }
    ];

    const response = await claudeClient.messages.create({
        model,
        max_tokens: 4096,
        system,
        messages,
    });

    return response;
}
