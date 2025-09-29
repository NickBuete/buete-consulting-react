import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

interface BedrockClaudeConfig {
  region: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
}

const config: BedrockClaudeConfig = {
  region: process.env.BEDROCK_REGION ?? 'us-east-1',
  modelId: process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-sonnet-20240229-v1:0',
  maxTokens: Number(process.env.BEDROCK_MAX_TOKENS ?? 2000),
  temperature: Number(process.env.BEDROCK_TEMPERATURE ?? 0.3),
};

const client = new BedrockRuntimeClient({ region: config.region });

export interface ClaudeRequest {
  systemPrompt: string;
  userPrompt: string;
}

export interface ClaudeResponse {
  completion: string;
}

export const invokeClaude = async ({ systemPrompt, userPrompt }: ClaudeRequest): Promise<ClaudeResponse> => {
  const command = new InvokeModelCommand({
    modelId: config.modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }],
        },
      ],
    }),
  });

  const response = await client.send(command);
  const payload = JSON.parse(Buffer.from(response.body ?? []).toString('utf-8'));

  const completion = Array.isArray(payload.content)
    ? payload.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n')
    : '';

  return { completion };
};
